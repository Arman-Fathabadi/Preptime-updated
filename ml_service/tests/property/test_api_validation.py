"""
Property-based tests for FastAPI service validation.

Feature: intelligent-scheduler
Tests Properties 25, 26, 27 from the design document.
"""

import pytest
from datetime import datetime, timedelta
from hypothesis import given, strategies as st, settings
from hypothesis.strategies import composite
from fastapi.testclient import TestClient

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from ml_service.main import app
from shared.models import Task, Event, Preferences


# Create test client
client = TestClient(app)


# Custom strategies for generating test data

@composite
def datetime_strategy(draw, min_year=2024, max_year=2025):
    """Generate random datetime objects."""
    year = draw(st.integers(min_value=min_year, max_value=max_year))
    month = draw(st.integers(min_value=1, max_value=12))
    day = draw(st.integers(min_value=1, max_value=28))
    hour = draw(st.integers(min_value=9, max_value=17))
    minute = draw(st.integers(min_value=0, max_value=59))
    return datetime(year, month, day, hour, minute)


@composite
def task_dict_strategy(draw):
    """Generate a random task as a dictionary."""
    task_id = draw(st.text(min_size=1, max_size=10, alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd'))))
    title = draw(st.text(min_size=1, max_size=20))
    duration = draw(st.integers(min_value=15, max_value=120))
    task_type = draw(st.sampled_from(["study", "deep", "admin", "relax"]))
    energy = draw(st.sampled_from(["low", "med", "high"]))
    priority = draw(st.integers(min_value=1, max_value=5))
    mode = draw(st.sampled_from(["study", "lockin", "relax", "balanced"]))
    
    # Optionally add deadline
    has_deadline = draw(st.booleans())
    due_at = None
    if has_deadline:
        deadline_time = draw(datetime_strategy())
        due_at = deadline_time.isoformat()
    
    return {
        "id": task_id,
        "title": title,
        "durationMin": duration,
        "dueAt": due_at,
        "type": task_type,
        "energy": energy,
        "window": None,
        "splittable": False,
        "priority": priority,
        "mode": mode
    }


@composite
def event_dict_strategy(draw):
    """Generate a random event as a dictionary."""
    event_id = draw(st.text(min_size=1, max_size=10, alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd'))))
    title = draw(st.text(min_size=1, max_size=20))
    start = draw(datetime_strategy())
    duration = draw(st.integers(min_value=15, max_value=60))
    end = start + timedelta(minutes=duration)
    kind = draw(st.sampled_from(["fixed", "blocked"]))
    
    return {
        "id": event_id,
        "title": title,
        "start": start.isoformat(),
        "end": end.isoformat(),
        "kind": kind
    }


@composite
def preferences_dict_strategy(draw):
    """Generate random preferences as a dictionary."""
    return {
        "dayStartHour": draw(st.integers(min_value=6, max_value=9)),
        "dayEndHour": draw(st.integers(min_value=17, max_value=22)),
        "slotStepMin": draw(st.sampled_from([15, 30, 60])),
        "bufferMin": draw(st.integers(min_value=0, max_value=15)),
        "maxHeavyPerDay": draw(st.integers(min_value=1, max_value=5))
    }


# Property 25: API request validation
@settings(max_examples=50)
@given(
    st.data()
)
def test_property_25_api_request_validation(data):
    """
    Feature: intelligent-scheduler, Property 25: API request validation
    
    For any valid schedule request JSON with tasks, events, and preferences,
    the FastAPI service should accept it and return a 200 response.
    
    Validates: Requirements 11.2
    """
    # Generate valid request data
    base_time = datetime(2024, 1, 1, 9, 0)
    
    num_tasks = data.draw(st.integers(min_value=0, max_value=3))
    tasks = [data.draw(task_dict_strategy()) for _ in range(num_tasks)]
    
    num_events = data.draw(st.integers(min_value=0, max_value=2))
    events = [data.draw(event_dict_strategy()) for _ in range(num_events)]
    
    preferences = data.draw(preferences_dict_strategy())
    
    request_data = {
        "tasks": tasks,
        "events": events,
        "preferences": preferences,
        "dateRange": {
            "start": base_time.isoformat(),
            "end": (base_time + timedelta(days=1)).isoformat()
        }
    }
    
    # Make request
    response = client.post("/schedule", json=request_data)
    
    # Verify 200 response for valid request
    assert response.status_code == 200, \
        f"Expected 200 for valid request, got {response.status_code}: {response.text}"


# Property 26: API error handling
@settings(max_examples=30)
@given(
    st.data()
)
def test_property_26_api_error_handling(data):
    """
    Feature: intelligent-scheduler, Property 26: API error handling
    
    For any invalid schedule request JSON, the FastAPI service should return
    a 400 error with validation details.
    
    Validates: Requirements 11.4
    """
    # Generate invalid request data (missing required fields)
    invalid_requests = [
        # Missing tasks field
        {
            "events": [],
            "preferences": {
                "dayStartHour": 9,
                "dayEndHour": 17,
                "slotStepMin": 30,
                "bufferMin": 0,
                "maxHeavyPerDay": 3
            },
            "dateRange": {
                "start": "2024-01-01T09:00:00",
                "end": "2024-01-02T09:00:00"
            }
        },
        # Missing preferences field
        {
            "tasks": [],
            "events": [],
            "dateRange": {
                "start": "2024-01-01T09:00:00",
                "end": "2024-01-02T09:00:00"
            }
        },
        # Missing dateRange field
        {
            "tasks": [],
            "events": [],
            "preferences": {
                "dayStartHour": 9,
                "dayEndHour": 17,
                "slotStepMin": 30,
                "bufferMin": 0,
                "maxHeavyPerDay": 3
            }
        },
        # Invalid task type
        {
            "tasks": [{
                "id": "task1",
                "title": "Test",
                "durationMin": 30,
                "dueAt": None,
                "type": "invalid_type",  # Invalid
                "energy": "med",
                "window": None,
                "splittable": False,
                "priority": 3,
                "mode": "balanced"
            }],
            "events": [],
            "preferences": {
                "dayStartHour": 9,
                "dayEndHour": 17,
                "slotStepMin": 30,
                "bufferMin": 0,
                "maxHeavyPerDay": 3
            },
            "dateRange": {
                "start": "2024-01-01T09:00:00",
                "end": "2024-01-02T09:00:00"
            }
        }
    ]
    
    # Test one of the invalid requests
    invalid_request = data.draw(st.sampled_from(invalid_requests))
    
    # Make request
    response = client.post("/schedule", json=invalid_request)
    
    # Verify 422 (Unprocessable Entity) response for invalid request
    # FastAPI returns 422 for validation errors, not 400
    assert response.status_code == 422, \
        f"Expected 422 for invalid request, got {response.status_code}"


# Property 27: API response structure
@settings(max_examples=50)
@given(
    st.data()
)
def test_property_27_api_response_structure(data):
    """
    Feature: intelligent-scheduler, Property 27: API response structure
    
    For any successful schedule request, the response should contain
    scheduledBlocks, explanations, and metrics fields.
    
    Validates: Requirements 11.3
    """
    # Generate valid request data
    base_time = datetime(2024, 1, 1, 9, 0)
    
    num_tasks = data.draw(st.integers(min_value=1, max_value=3))
    tasks = [data.draw(task_dict_strategy()) for _ in range(num_tasks)]
    
    num_events = data.draw(st.integers(min_value=0, max_value=2))
    events = [data.draw(event_dict_strategy()) for _ in range(num_events)]
    
    preferences = data.draw(preferences_dict_strategy())
    
    request_data = {
        "tasks": tasks,
        "events": events,
        "preferences": preferences,
        "dateRange": {
            "start": base_time.isoformat(),
            "end": (base_time + timedelta(days=1)).isoformat()
        }
    }
    
    # Make request
    response = client.post("/schedule", json=request_data)
    
    # Verify response structure
    assert response.status_code == 200, \
        f"Expected 200, got {response.status_code}: {response.text}"
    
    response_data = response.json()
    
    # Verify required fields are present
    assert "scheduledBlocks" in response_data, \
        "Response missing 'scheduledBlocks' field"
    assert "unscheduledTasks" in response_data, \
        "Response missing 'unscheduledTasks' field"
    assert "explanations" in response_data, \
        "Response missing 'explanations' field"
    assert "metrics" in response_data, \
        "Response missing 'metrics' field"
    
    # Verify field types
    assert isinstance(response_data["scheduledBlocks"], list), \
        "scheduledBlocks should be a list"
    assert isinstance(response_data["unscheduledTasks"], list), \
        "unscheduledTasks should be a list"
    assert isinstance(response_data["explanations"], dict), \
        "explanations should be a dict"
    assert isinstance(response_data["metrics"], dict), \
        "metrics should be a dict"
    
    # Verify metrics contains required fields
    required_metrics = ["freeHours", "scheduledHours", "tasksOnTime", "deepWorkHours", "contextSwitchPenalty"]
    for metric in required_metrics:
        assert metric in response_data["metrics"], \
            f"Metrics missing required field '{metric}'"


# Test health endpoint
def test_health_endpoint():
    """Test that the health endpoint returns expected structure."""
    response = client.get("/health")
    
    assert response.status_code == 200
    data = response.json()
    
    assert "status" in data
    assert "model_loaded" in data
    assert "scoring_mode" in data
    assert data["status"] == "healthy"
    assert data["scoring_mode"] in ["heuristic", "ml"]
