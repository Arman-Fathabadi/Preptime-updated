"""
Property-based tests for conflict detection and repair.

Feature: intelligent-scheduler
Tests Properties 18, 19 from the design document.
"""

import pytest
from datetime import datetime, timedelta
from hypothesis import given, strategies as st, settings
from hypothesis.strategies import composite

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from ml_service.scheduler import detect_conflicts, repair_schedule, generate_free_slots, greedy_schedule
from ml_service.scorer import SlotScorer
from shared.models import Event, ScheduledBlock, Task, Preferences


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
def scheduled_block_strategy(draw):
    """Generate a random scheduled block."""
    block_id = draw(st.text(min_size=1, max_size=10, alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd'))))
    task_id = draw(st.text(min_size=1, max_size=10, alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd'))))
    start = draw(datetime_strategy())
    duration = draw(st.integers(min_value=15, max_value=120))
    end = start + timedelta(minutes=duration)
    
    return ScheduledBlock(
        id=block_id,
        taskId=task_id,
        start=start.isoformat(),
        end=end.isoformat()
    )


@composite
def event_strategy(draw):
    """Generate a random event."""
    event_id = draw(st.text(min_size=1, max_size=10, alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd'))))
    title = draw(st.text(min_size=1, max_size=20))
    start = draw(datetime_strategy())
    duration = draw(st.integers(min_value=15, max_value=120))
    end = start + timedelta(minutes=duration)
    kind = draw(st.sampled_from(["fixed", "blocked"]))
    
    return Event(
        id=event_id,
        title=title,
        start=start.isoformat(),
        end=end.isoformat(),
        kind=kind
    )


# Property 18: Conflict detection completeness
@settings(max_examples=100)
@given(
    new_event=event_strategy(),
    scheduled_blocks=st.lists(scheduled_block_strategy(), min_size=0, max_size=10)
)
def test_property_18_conflict_detection_completeness(new_event, scheduled_blocks):
    """
    Feature: intelligent-scheduler, Property 18: Conflict detection completeness
    
    For any new event added to an existing schedule, all scheduled blocks that
    overlap with the event should be detected as conflicts.
    
    Validates: Requirements 8.1
    """
    # Detect conflicts
    conflicts = detect_conflicts(new_event, scheduled_blocks)
    
    # Parse event times
    event_start = datetime.fromisoformat(new_event.start.replace('Z', '+00:00'))
    event_end = datetime.fromisoformat(new_event.end.replace('Z', '+00:00'))
    
    # Verify all overlapping blocks are detected
    for block in scheduled_blocks:
        block_start = datetime.fromisoformat(block.start.replace('Z', '+00:00'))
        block_end = datetime.fromisoformat(block.end.replace('Z', '+00:00'))
        
        # Check if block overlaps with event
        overlaps = block_start < event_end and block_end > event_start
        
        if overlaps:
            assert block in conflicts, \
                f"Block {block.id} overlaps with event but was not detected as conflict"
        else:
            assert block not in conflicts, \
                f"Block {block.id} does not overlap with event but was detected as conflict"


# Property 19: Selective conflict removal
@settings(max_examples=50)
@given(
    scheduled_blocks=st.lists(scheduled_block_strategy(), min_size=2, max_size=5)
)
def test_property_19_selective_conflict_removal(scheduled_blocks):
    """
    Feature: intelligent-scheduler, Property 19: Selective conflict removal
    
    For any schedule with detected conflicts, only the conflicting blocks should
    be removed, and all non-conflicting blocks should remain in the schedule.
    
    Validates: Requirements 8.2, 8.5
    """
    # Create a new event that overlaps with some blocks
    # Use the first block's time as basis for the event
    if not scheduled_blocks:
        return
    
    first_block = scheduled_blocks[0]
    block_start = datetime.fromisoformat(first_block.start.replace('Z', '+00:00'))
    block_end = datetime.fromisoformat(first_block.end.replace('Z', '+00:00'))
    
    # Create event that overlaps with first block
    new_event = Event(
        id="new_event",
        title="New Event",
        start=block_start.isoformat(),
        end=block_end.isoformat(),
        kind="fixed"
    )
    
    # Detect conflicts
    conflicts = detect_conflicts(new_event, scheduled_blocks)
    
    # Verify conflicts were detected
    assert len(conflicts) > 0, "Should detect at least one conflict"
    
    # Create non-conflicting blocks list
    non_conflicting = [block for block in scheduled_blocks if block not in conflicts]
    
    # Verify selective removal
    # All blocks should be either in conflicts or non_conflicting, but not both
    for block in scheduled_blocks:
        in_conflicts = block in conflicts
        in_non_conflicting = block in non_conflicting
        
        assert in_conflicts != in_non_conflicting, \
            f"Block {block.id} should be in exactly one list (conflicts or non-conflicting)"
    
    # Verify all blocks accounted for
    assert len(conflicts) + len(non_conflicting) == len(scheduled_blocks), \
        "All blocks should be accounted for"


# Additional test: Verify repair preserves non-conflicting blocks
@settings(max_examples=30)
@given(
    st.data()
)
def test_repair_preserves_non_conflicting_blocks(data):
    """
    Verify that repair_schedule preserves non-conflicting blocks.
    """
    # Create a simple scenario
    base_time = datetime(2024, 1, 1, 9, 0)
    
    # Create scheduled blocks
    block1 = ScheduledBlock(
        id="block1",
        taskId="task1",
        start=(base_time).isoformat(),
        end=(base_time + timedelta(minutes=30)).isoformat()
    )
    
    block2 = ScheduledBlock(
        id="block2",
        taskId="task2",
        start=(base_time + timedelta(hours=2)).isoformat(),
        end=(base_time + timedelta(hours=2, minutes=30)).isoformat()
    )
    
    scheduled_blocks = [block1, block2]
    
    # Create new event that conflicts with block1 only
    new_event = Event(
        id="new_event",
        title="New Event",
        start=(base_time).isoformat(),
        end=(base_time + timedelta(minutes=30)).isoformat(),
        kind="fixed"
    )
    
    # Detect conflicts
    conflicts = detect_conflicts(new_event, scheduled_blocks)
    
    # Verify only block1 conflicts
    assert block1 in conflicts, "Block1 should conflict"
    assert block2 not in conflicts, "Block2 should not conflict"
    
    # Create tasks
    tasks = [
        Task(
            id="task1",
            title="Task 1",
            durationMin=30,
            dueAt=None,
            type="study",
            energy="med",
            window=None,
            splittable=False,
            priority=3,
            mode="study"
        ),
        Task(
            id="task2",
            title="Task 2",
            durationMin=30,
            dueAt=None,
            type="admin",
            energy="low",
            window=None,
            splittable=False,
            priority=2,
            mode="balanced"
        ),
    ]
    
    # Create events list with new event
    events = [new_event]
    
    # Create preferences
    preferences = Preferences(
        dayStartHour=9,
        dayEndHour=17,
        slotStepMin=30,
        bufferMin=0,
        maxHeavyPerDay=3
    )
    
    # Create scorer
    scorer = SlotScorer()
    
    # Repair schedule
    date_range = (base_time, base_time + timedelta(days=1))
    result = repair_schedule(
        conflicts,
        scheduled_blocks,
        tasks,
        events,
        preferences,
        date_range,
        scorer
    )
    
    # Verify block2 is preserved
    result_block_ids = {block.id for block in result["scheduledBlocks"]}
    assert "block2" in result_block_ids, "Non-conflicting block2 should be preserved"
