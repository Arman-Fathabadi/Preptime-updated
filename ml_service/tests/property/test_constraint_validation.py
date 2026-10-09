"""
Property-based tests for constraint validation.

Feature: intelligent-scheduler
Tests Properties 11, 12, 13, 14, 15 from the design document.
"""

import pytest
from datetime import datetime, timedelta
from hypothesis import given, strategies as st, settings
from hypothesis.strategies import composite

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from ml_service.scheduler import validate_placement, find_placement, Slot
from shared.models import Task, ScheduledBlock


# Custom strategies for generating test data

@composite
def datetime_strategy(draw, min_year=2024, max_year=2025):
    """Generate random datetime objects."""
    year = draw(st.integers(min_value=min_year, max_value=max_year))
    month = draw(st.integers(min_value=1, max_value=12))
    day = draw(st.integers(min_value=1, max_value=28))
    hour = draw(st.integers(min_value=0, max_value=23))
    minute = draw(st.integers(min_value=0, max_value=59))
    return datetime(year, month, day, hour, minute)


@composite
def slot_strategy(draw):
    """Generate a random slot."""
    start = draw(datetime_strategy())
    duration = draw(st.integers(min_value=15, max_value=240))
    end = start + timedelta(minutes=duration)
    
    return Slot(
        start=start,
        end=end,
        duration_min=duration
    )


@composite
def task_strategy(draw, with_deadline=None, with_window=None):
    """Generate a random task."""
    task_id = draw(st.text(min_size=1, max_size=10, alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd'))))
    title = draw(st.text(min_size=1, max_size=20))
    duration = draw(st.integers(min_value=15, max_value=240))
    task_type = draw(st.sampled_from(["study", "deep", "admin", "relax"]))
    energy = draw(st.sampled_from(["low", "med", "high"]))
    priority = draw(st.sampled_from([1, 2, 3, 4, 5]))
    mode = draw(st.sampled_from(["study", "lockin", "relax", "balanced"]))
    
    # Deadline
    if with_deadline is True:
        deadline_dt = draw(datetime_strategy())
        due_at = deadline_dt.isoformat()
    elif with_deadline is False:
        due_at = None
    else:
        due_at = draw(st.one_of(st.none(), st.builds(lambda dt: dt.isoformat(), datetime_strategy())))
    
    # Time window
    if with_window is True:
        start_hour = draw(st.integers(min_value=0, max_value=20))
        end_hour = draw(st.integers(min_value=start_hour + 1, max_value=23))
        window = {"startHour": start_hour, "endHour": end_hour}
    elif with_window is False:
        window = None
    else:
        window = draw(st.one_of(
            st.none(),
            st.builds(lambda sh, eh: {"startHour": sh, "endHour": eh},
                     st.integers(min_value=0, max_value=20),
                     st.integers(min_value=1, max_value=23))
        ))
    
    return Task(
        id=task_id,
        title=title,
        durationMin=duration,
        dueAt=due_at,
        type=task_type,
        energy=energy,
        window=window,
        splittable=False,
        priority=priority,
        mode=mode
    )


@composite
def scheduled_block_strategy(draw):
    """Generate a random scheduled block."""
    block_id = draw(st.text(min_size=1, max_size=10, alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd'))))
    task_id = draw(st.text(min_size=1, max_size=10, alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd'))))
    start = draw(datetime_strategy())
    duration = draw(st.integers(min_value=15, max_value=240))
    end = start + timedelta(minutes=duration)
    
    return ScheduledBlock(
        id=block_id,
        taskId=task_id,
        start=start.isoformat(),
        end=end.isoformat()
    )


# Property 11: Duration constraint validation
@settings(max_examples=100)
@given(
    task=task_strategy(),
    slot=slot_strategy()
)
def test_property_11_duration_constraint_validation(task, slot):
    """
    Feature: intelligent-scheduler, Property 11: Duration constraint validation
    
    For any task-slot placement, if the slot duration is less than the task duration,
    the placement should be rejected.
    
    Validates: Requirements 5.1
    """
    is_valid, error_msg = validate_placement(task, slot, [])
    
    if slot.duration_min < task.duration_min:
        # Should be rejected
        assert not is_valid, f"Placement should be rejected when slot duration ({slot.duration_min}) < task duration ({task.duration_min})"
        assert error_msg is not None, "Error message should be provided for invalid placement"
        assert "duration" in error_msg.lower(), "Error message should mention duration"
    else:
        # Duration constraint is satisfied (other constraints might fail)
        if not is_valid:
            # If rejected, it should not be due to duration
            assert "duration" not in error_msg.lower() or "task duration" not in error_msg.lower()


# Property 12: No overlapping scheduled blocks
@settings(max_examples=100)
@given(
    task=task_strategy(),
    slot=slot_strategy(),
    scheduled_blocks=st.lists(scheduled_block_strategy(), min_size=0, max_size=5)
)
def test_property_12_no_overlapping_scheduled_blocks(task, slot, scheduled_blocks):
    """
    Feature: intelligent-scheduler, Property 12: No overlapping scheduled blocks
    
    For any valid schedule, no two scheduled blocks should have overlapping time periods.
    If a slot overlaps with any existing block, placement should be rejected.
    
    Validates: Requirements 5.2
    """
    is_valid, error_msg = validate_placement(task, slot, scheduled_blocks)
    
    # Check if slot overlaps with any block
    has_overlap = False
    for block in scheduled_blocks:
        block_start = datetime.fromisoformat(block.start.replace('Z', '+00:00'))
        block_end = datetime.fromisoformat(block.end.replace('Z', '+00:00'))
        
        if slot.start < block_end and slot.end > block_start:
            has_overlap = True
            break
    
    # Only check overlap constraint if duration constraint is satisfied
    duration_ok = slot.duration_min >= task.duration_min
    
    if has_overlap and duration_ok:
        # Should be rejected due to overlap
        assert not is_valid, "Placement should be rejected when slot overlaps with existing block"
        assert error_msg is not None, "Error message should be provided for overlapping placement"
        assert "overlap" in error_msg.lower(), "Error message should mention overlap"


# Property 13: Time window constraint validation
@settings(max_examples=100)
@given(
    task=task_strategy(with_window=True, with_deadline=False),
    slot=slot_strategy()
)
def test_property_13_time_window_constraint_validation(task, slot):
    """
    Feature: intelligent-scheduler, Property 13: Time window constraint validation

    For any task with a time window constraint, every accepted placement falls
    inside the window, and a slot with no room for the task inside the window is
    rejected. A slot that merely starts before the window opens is still usable:
    the task is placed at the window start.

    Validates: Requirements 5.3
    """
    is_valid, error_msg = validate_placement(task, slot, [])
    placement, _ = find_placement(task, slot)

    day = slot.start.replace(hour=0, minute=0, second=0, microsecond=0)
    window_start = day + timedelta(hours=task.window.get('startHour', 0))
    window_end = day + timedelta(hours=task.window.get('endHour', 24))
    lo = max(slot.start, window_start)
    hi = min(slot.end, window_end)
    fits = lo + timedelta(minutes=task.duration_min) <= hi
    duration_ok = slot.duration_min >= task.duration_min

    if duration_ok:
        assert is_valid == fits, f"window check disagrees with geometry: valid={is_valid}, fits={fits}"
    if is_valid:
        start, end = placement
        assert slot.start <= start and end <= slot.end
        assert start >= window_start and end <= window_end
    elif duration_ok:
        assert error_msg is not None and "window" in error_msg.lower()


# Property 14: Deadline constraint validation
@settings(max_examples=100)
@given(
    task=task_strategy(with_deadline=True, with_window=False),
    slot=slot_strategy()
)
def test_property_14_deadline_constraint_validation(task, slot):
    """
    Feature: intelligent-scheduler, Property 14: Deadline constraint validation

    For any task with a deadline, every accepted placement ends at or before the
    deadline. A slot that extends past the deadline is still usable when the task
    fits in the part of it before the deadline.

    Validates: Requirements 5.4
    """
    is_valid, error_msg = validate_placement(task, slot, [])
    deadline = datetime.fromisoformat(task.due_at.replace('Z', '+00:00'))

    duration_ok = slot.duration_min >= task.duration_min
    fits = slot.start + timedelta(minutes=task.duration_min) <= min(slot.end, deadline)

    if duration_ok:
        assert is_valid == fits, f"deadline check disagrees with geometry: valid={is_valid}, fits={fits}"
    if is_valid:
        placement, _ = find_placement(task, slot)
        assert placement[1] <= deadline
    elif duration_ok:
        assert error_msg is not None and "deadline" in error_msg.lower()


# Property 15: State preservation on invalid placement
@settings(max_examples=100)
@given(
    task=task_strategy(),
    slot=slot_strategy(),
    scheduled_blocks=st.lists(scheduled_block_strategy(), min_size=1, max_size=5)
)
def test_property_15_state_preservation_on_invalid_placement(task, slot, scheduled_blocks):
    """
    Feature: intelligent-scheduler, Property 15: State preservation on invalid placement
    
    For any schedule and invalid task placement attempt, the schedule should remain
    unchanged after the rejection.
    
    Validates: Requirements 5.5
    """
    # Make a copy of the original scheduled blocks
    original_blocks = [
        ScheduledBlock(
            id=block.id,
            taskId=block.task_id,
            start=block.start,
            end=block.end
        )
        for block in scheduled_blocks
    ]
    
    # Validate placement (this should not modify scheduled_blocks)
    is_valid, error_msg = validate_placement(task, slot, scheduled_blocks)
    
    # Verify scheduled_blocks is unchanged
    assert len(scheduled_blocks) == len(original_blocks), \
        "Number of scheduled blocks should not change after validation"
    
    for i, (original, current) in enumerate(zip(original_blocks, scheduled_blocks)):
        assert original.id == current.id, f"Block {i} id changed"
        assert original.task_id == current.task_id, f"Block {i} task_id changed"
        assert original.start == current.start, f"Block {i} start changed"
        assert original.end == current.end, f"Block {i} end changed"
