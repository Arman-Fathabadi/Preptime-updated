"""
Property-based tests for heuristic scoring.

Feature: intelligent-scheduler
Tests Property 16 from the design document.
"""

import pytest
import math
from datetime import datetime, timedelta
from hypothesis import given, strategies as st, settings
from hypothesis.strategies import composite

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from ml_service.scorer import SlotScorer, SchedulingContext
from ml_service.scheduler import Slot
from shared.models import Task


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
def task_strategy(draw):
    """Generate a random task."""
    task_id = draw(st.text(min_size=1, max_size=10, alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd'))))
    title = draw(st.text(min_size=1, max_size=20))
    duration = draw(st.integers(min_value=15, max_value=240))
    task_type = draw(st.sampled_from(["study", "deep", "admin", "relax"]))
    energy = draw(st.sampled_from(["low", "med", "high"]))
    priority = draw(st.sampled_from([1, 2, 3, 4, 5]))
    mode = draw(st.sampled_from(["study", "lockin", "relax", "balanced"]))
    
    # Optional deadline
    due_at = draw(st.one_of(
        st.none(),
        st.builds(lambda dt: dt.isoformat(), datetime_strategy())
    ))
    
    # Optional time window
    window = draw(st.one_of(
        st.none(),
        st.builds(
            lambda sh, eh: {"startHour": sh, "endHour": eh},
            st.integers(min_value=0, max_value=20),
            st.integers(min_value=1, max_value=23)
        )
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
def scheduling_context_strategy(draw):
    """Generate a random scheduling context."""
    minutes_since_last_meeting = draw(st.one_of(
        st.none(),
        st.integers(min_value=0, max_value=480)
    ))
    minutes_until_next_meeting = draw(st.one_of(
        st.none(),
        st.integers(min_value=0, max_value=480)
    ))
    heavy_tasks_scheduled_today = draw(st.integers(min_value=0, max_value=10))
    total_scheduled_duration_today = draw(st.integers(min_value=0, max_value=480))
    slot_utilization_ratio = draw(st.floats(min_value=0.0, max_value=1.0))
    
    return SchedulingContext(
        minutes_since_last_meeting=minutes_since_last_meeting,
        minutes_until_next_meeting=minutes_until_next_meeting,
        heavy_tasks_scheduled_today=heavy_tasks_scheduled_today,
        total_scheduled_duration_today=total_scheduled_duration_today,
        slot_utilization_ratio=slot_utilization_ratio
    )


# Property 16: Scoring produces numeric values
@settings(max_examples=100)
@given(
    task=task_strategy(),
    slot=slot_strategy(),
    context=scheduling_context_strategy()
)
def test_property_16_scoring_produces_numeric_values(task, slot, context):
    """
    Feature: intelligent-scheduler, Property 16: Scoring produces numeric values
    
    For any valid task-slot pair, the scorer should return a numeric score value
    that is reasonable (not NaN, not negative, between 0 and 1).
    
    Validates: Requirements 6.1
    """
    scorer = SlotScorer()
    
    # Score the task-slot pair
    score = scorer.score(task, slot, context)
    
    # Verify score is numeric
    assert isinstance(score, (int, float)), f"Score should be numeric, got {type(score)}"
    
    # Verify score is not NaN
    assert not math.isnan(score), "Score should not be NaN"
    
    # Verify score is not infinite
    assert not math.isinf(score), "Score should not be infinite"
    
    # Verify score is non-negative
    assert score >= 0, f"Score should be non-negative, got {score}"
    
    # Verify score is reasonable (between 0 and 1 for normalized scores)
    assert score <= 1.0, f"Score should be <= 1.0, got {score}"
    
    # Verify score is a valid float
    assert isinstance(score, float), f"Score should be a float, got {type(score)}"


# Additional test: Verify scoring is deterministic
@settings(max_examples=50)
@given(
    task=task_strategy(),
    slot=slot_strategy(),
    context=scheduling_context_strategy()
)
def test_scoring_is_deterministic(task, slot, context):
    """
    Verify that scoring the same task-slot pair twice produces the same result.
    """
    scorer = SlotScorer()
    
    score1 = scorer.score(task, slot, context)
    score2 = scorer.score(task, slot, context)
    
    assert score1 == score2, "Scoring should be deterministic"


# Additional test: Verify higher priority tasks get higher scores
@settings(max_examples=50)
@given(
    slot=slot_strategy(),
    context=scheduling_context_strategy()
)
def test_higher_priority_gets_higher_score(slot, context):
    """
    Verify that higher priority tasks receive higher scores (all else equal).
    """
    scorer = SlotScorer()
    
    # Create two identical tasks with different priorities
    base_task = Task(
        id="test",
        title="Test Task",
        durationMin=60,
        dueAt=None,
        type="study",
        energy="med",
        window=None,
        splittable=False,
        priority=1,
        mode="study"
    )
    
    high_priority_task = Task(
        id="test",
        title="Test Task",
        durationMin=60,
        dueAt=None,
        type="study",
        energy="med",
        window=None,
        splittable=False,
        priority=5,
        mode="study"
    )
    
    low_score = scorer.score(base_task, slot, context)
    high_score = scorer.score(high_priority_task, slot, context)
    
    # Higher priority should get higher score
    assert high_score >= low_score, f"Higher priority task should get higher score: {high_score} >= {low_score}"
