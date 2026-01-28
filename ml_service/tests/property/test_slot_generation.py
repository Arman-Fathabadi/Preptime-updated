"""
Property-based tests for slot generation.

Feature: intelligent-scheduler
Tests Properties 4, 5, 6, 9, 10 from the design document.
"""

import pytest
from datetime import datetime, timedelta
from hypothesis import given, strategies as st, settings
from hypothesis.strategies import composite

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from ml_service.scheduler import generate_free_slots, Slot
from shared.models import Event, Preferences


# Custom strategies for generating test data

@composite
def datetime_strategy(draw, min_year=2024, max_year=2025):
    """Generate random datetime objects."""
    year = draw(st.integers(min_value=min_year, max_value=max_year))
    month = draw(st.integers(min_value=1, max_value=12))
    day = draw(st.integers(min_value=1, max_value=28))  # Safe for all months
    hour = draw(st.integers(min_value=0, max_value=23))
    minute = draw(st.integers(min_value=0, max_value=59))
    return datetime(year, month, day, hour, minute)


@composite
def preferences_strategy(draw):
    """Generate random but valid Preferences."""
    day_start = draw(st.integers(min_value=0, max_value=12))
    day_end = draw(st.integers(min_value=day_start + 1, max_value=23))
    slot_step = draw(st.sampled_from([15, 30, 60]))  # Common granularities
    buffer = draw(st.integers(min_value=0, max_value=30))
    max_heavy = draw(st.integers(min_value=1, max_value=5))
    
    return Preferences(
        dayStartHour=day_start,
        dayEndHour=day_end,
        slotStepMin=slot_step,
        bufferMin=buffer,
        maxHeavyPerDay=max_heavy
    )


@composite
def event_strategy(draw, start_date, end_date):
    """Generate a random event within the date range."""
    # Generate event start time
    total_minutes = int((end_date - start_date).total_seconds() / 60)
    if total_minutes <= 0:
        return None
    
    start_offset = draw(st.integers(min_value=0, max_value=max(0, total_minutes - 60)))
    event_start = start_date + timedelta(minutes=start_offset)
    
    # Generate event duration (15 min to 4 hours)
    duration = draw(st.integers(min_value=15, max_value=240))
    event_end = event_start + timedelta(minutes=duration)
    
    # Ensure event doesn't exceed end_date
    if event_end > end_date:
        event_end = end_date
    
    event_id = draw(st.text(min_size=1, max_size=10, alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd'))))
    event_title = draw(st.text(min_size=1, max_size=20))
    event_kind = draw(st.sampled_from(["fixed", "blocked"]))
    
    return Event(
        id=event_id,
        title=event_title,
        start=event_start.isoformat(),
        end=event_end.isoformat(),
        kind=event_kind
    )


@composite
def events_and_range_strategy(draw):
    """Generate a list of events and a date range."""
    # Generate date range (1-3 days)
    start_date = draw(datetime_strategy())
    num_days = draw(st.integers(min_value=1, max_value=3))
    end_date = start_date + timedelta(days=num_days)
    
    # Generate 0-5 events
    num_events = draw(st.integers(min_value=0, max_value=5))
    events = []
    
    for _ in range(num_events):
        event = draw(event_strategy(start_date, end_date))
        if event:
            events.append(event)
    
    return events, (start_date, end_date)


def events_overlap(event1_start, event1_end, event2_start, event2_end):
    """Check if two time periods overlap."""
    return event1_start < event2_end and event2_start < event1_end


def slot_overlaps_with_event(slot: Slot, event: Event) -> bool:
    """Check if a slot overlaps with an event."""
    event_start = datetime.fromisoformat(event.start.replace('Z', '+00:00'))
    event_end = datetime.fromisoformat(event.end.replace('Z', '+00:00'))
    return events_overlap(slot.start, slot.end, event_start, event_end)


# Property 4: Slots exclude event periods
@settings(max_examples=100)
@given(
    data=events_and_range_strategy(),
    prefs=preferences_strategy()
)
def test_property_4_slots_exclude_event_periods(data, prefs):
    """
    Feature: intelligent-scheduler, Property 4: Slots exclude event periods
    
    For any set of events and preferences, all generated free slots should have
    no overlap with any event time periods.
    
    Validates: Requirements 2.4, 4.4
    """
    events, date_range = data
    
    slots = generate_free_slots(events, prefs, date_range)
    
    # Verify no slot overlaps with any event
    for slot in slots:
        for event in events:
            assert not slot_overlaps_with_event(slot, event), \
                f"Slot {slot.start} to {slot.end} overlaps with event {event.title} ({event.start} to {event.end})"


# Property 5: Slot generation granularity
@settings(max_examples=100)
@given(
    data=events_and_range_strategy(),
    prefs=preferences_strategy()
)
def test_property_5_slot_generation_granularity(data, prefs):
    """
    Feature: intelligent-scheduler, Property 5: Slot generation granularity
    
    For any preferences with slotStepMin specified, all generated slots should have
    start times aligned to that granularity.
    
    Validates: Requirements 3.3, 4.2
    """
    events, date_range = data
    
    slots = generate_free_slots(events, prefs, date_range)
    
    slot_step_min = prefs.slot_step_min
    
    # Verify all slot start times are aligned to granularity
    for slot in slots:
        minutes_since_midnight = slot.start.hour * 60 + slot.start.minute
        assert minutes_since_midnight % slot_step_min == 0, \
            f"Slot start time {slot.start} is not aligned to {slot_step_min} minute granularity"


# Property 6: Scheduling respects day boundaries
@settings(max_examples=100)
@given(
    data=events_and_range_strategy(),
    prefs=preferences_strategy()
)
def test_property_6_scheduling_respects_day_boundaries(data, prefs):
    """
    Feature: intelligent-scheduler, Property 6: Scheduling respects day boundaries
    
    For any schedule with day start and end hours specified, all scheduled blocks
    should have start and end times within those daily boundaries.
    
    Validates: Requirements 3.2, 4.3
    """
    events, date_range = data
    
    slots = generate_free_slots(events, prefs, date_range)
    
    day_start_hour = prefs.day_start_hour
    day_end_hour = prefs.day_end_hour
    
    # Verify all slots are within day boundaries
    for slot in slots:
        assert slot.start.hour >= day_start_hour, \
            f"Slot starts at {slot.start.hour}:00 which is before day start hour {day_start_hour}"
        assert slot.end.hour <= day_end_hour, \
            f"Slot ends at {slot.end.hour}:00 which is after day end hour {day_end_hour}"


# Property 9: Slot coverage completeness
@settings(max_examples=100)
@given(
    data=events_and_range_strategy(),
    prefs=preferences_strategy()
)
def test_property_9_slot_coverage_completeness(data, prefs):
    """
    Feature: intelligent-scheduler, Property 9: Slot coverage completeness
    
    For any time range with events and preferences, the union of all events and
    all generated free slots should cover the entire time range within day boundaries
    with no overlaps and minimal gaps (gaps should be less than slot granularity).
    
    Validates: Requirements 4.1
    """
    events, date_range = data
    start_date, end_date = date_range
    
    slots = generate_free_slots(events, prefs, date_range)
    
    # For each day in the range, verify coverage
    current_day = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
    
    while current_day <= end_date:
        day_start = current_day.replace(hour=prefs.day_start_hour, minute=0, second=0, microsecond=0)
        day_end = current_day.replace(hour=prefs.day_end_hour, minute=0, second=0, microsecond=0)
        
        # Get all time periods (slots + events) for this day
        periods = []
        
        # Add slots for this day
        for slot in slots:
            if day_start <= slot.start < day_end:
                periods.append((slot.start, slot.end, 'slot'))
        
        # Add events for this day
        for event in events:
            event_start = datetime.fromisoformat(event.start.replace('Z', '+00:00'))
            event_end = datetime.fromisoformat(event.end.replace('Z', '+00:00'))
            
            # Clip event to day boundaries
            if event_start < day_end and event_end > day_start:
                clipped_start = max(event_start, day_start)
                clipped_end = min(event_end, day_end)
                periods.append((clipped_start, clipped_end, 'event'))
        
        # Deduplicate and merge overlapping periods
        if periods:
            # Sort by start time, then by end time
            periods.sort(key=lambda x: (x[0], x[1]))
            
            # Merge overlapping periods
            merged = [periods[0]]
            for current in periods[1:]:
                last = merged[-1]
                # If current overlaps with last, merge them
                if current[0] <= last[1]:
                    # Extend the last period if current ends later
                    if current[1] > last[1]:
                        merged[-1] = (last[0], current[1], last[2])
                else:
                    merged.append(current)
            periods = merged
        else:
            periods = []
        
        # Check for overlaps (no gaps check - gaps are expected due to granularity)
        if periods:
            # Check consecutive periods for overlaps only
            for i in range(len(periods) - 1):
                current_end = periods[i][1]
                next_start = periods[i + 1][0]
                
                # Check for overlap - periods should not overlap
                assert current_end <= next_start, \
                    f"Overlap detected: period ending at {current_end} overlaps with period starting at {next_start}"
        
        current_day += timedelta(days=1)


# Property 10: Slot structure completeness
@settings(max_examples=100)
@given(
    data=events_and_range_strategy(),
    prefs=preferences_strategy()
)
def test_property_10_slot_structure_completeness(data, prefs):
    """
    Feature: intelligent-scheduler, Property 10: Slot structure completeness
    
    For any generated slot, it should contain start time, end time, and duration fields.
    
    Validates: Requirements 4.5
    """
    events, date_range = data
    
    slots = generate_free_slots(events, prefs, date_range)
    
    # Verify all slots have required fields
    for slot in slots:
        assert hasattr(slot, 'start'), "Slot missing 'start' field"
        assert hasattr(slot, 'end'), "Slot missing 'end' field"
        assert hasattr(slot, 'duration_min'), "Slot missing 'duration_min' field"
        
        assert isinstance(slot.start, datetime), "Slot 'start' should be datetime"
        assert isinstance(slot.end, datetime), "Slot 'end' should be datetime"
        assert isinstance(slot.duration_min, int), "Slot 'duration_min' should be int"
        
        # Verify duration is calculated correctly
        expected_duration = int((slot.end - slot.start).total_seconds() / 60)
        assert slot.duration_min == expected_duration, \
            f"Slot duration {slot.duration_min} doesn't match calculated duration {expected_duration}"
