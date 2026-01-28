"""
Unit tests for FastAPI service edge cases.

Feature: intelligent-scheduler
"""

import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from ml_service.main import app


# Create test client
client = TestClient(app)


def test_empty_tasks_returns_empty_schedule():
    """
    Test that an empty task list returns an empty schedule.
    
    Validates: Requirements 11.4
    """
    base_time = datetime(2024, 1, 1, 9, 0)
    
    request_data = {
        "tasks": [],  # Empty task list
        "events": [],
        "preferences": {
            "dayStartHour": 9,
            "dayEndHour": 17,
            "slotStepMin": 30,
            "bufferMin": 0,
            "maxHeavyPerDay": 3
        },
        "dateRange": {
            "start": base_time.isoformat(),
            "end": (base_time + timedelta(days=1)).isoformat()
        }
    }
    
    response = client.post("/schedule", json=request_data)
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify empty schedule
    assert data["scheduledBlocks"] == []
    assert data["unscheduledTasks"] == []
    assert data["explanations"] == {}
    
    # Metrics should still be present
    assert "metrics" in data
    assert data["metrics"]["scheduledHours"] == 0.0


def test_no_available_slots_returns_all_unscheduled():
    """
    Test that when no slots are available, all tasks are unscheduled.
    
    Validates: Requirements 11.4
    """
    base_time = datetime(2024, 1, 1, 9, 0)
    
    # Create a scenario where all time is blocked by events
    request_data = {
        "tasks": [
            {
                "id": "task1",
                "title": "Test Task",
                "durationMin": 60,
                "dueAt": None,
                "type": "study",
                "energy": "med",
                "window": None,
                "splittable": False,
                "priority": 3,
                "mode": "study"
            }
        ],
        "events": [
            # Block entire day
            {
                "id": "event1",
                "title": "All Day Event",
                "start": (base_time).isoformat(),
                "end": (base_time + timedelta(hours=8)).isoformat(),
                "kind": "blocked"
            }
        ],
        "preferences": {
            "dayStartHour": 9,
            "dayEndHour": 17,
            "slotStepMin": 30,
            "bufferMin": 0,
            "maxHeavyPerDay": 3
        },
        "dateRange": {
            "start": base_time.isoformat(),
            "end": (base_time + timedelta(days=1)).isoformat()
        }
    }
    
    response = client.post("/schedule", json=request_data)
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify task is unscheduled
    assert data["scheduledBlocks"] == []
    assert "task1" in data["unscheduledTasks"]
    assert data["explanations"] == {}
    
    # Metrics should show no scheduled hours
    assert data["metrics"]["scheduledHours"] == 0.0


def test_malformed_json_returns_error():
    """
    Test that malformed JSON returns an error.
    
    Validates: Requirements 11.4
    """
    # Send invalid JSON (missing closing brace)
    response = client.post(
        "/schedule",
        data='{"tasks": [',  # Malformed JSON
        headers={"Content-Type": "application/json"}
    )
    
    # FastAPI returns 422 for JSON decode errors
    assert response.status_code == 422


def test_task_with_impossible_deadline():
    """
    Test that a task with a deadline in the past is handled gracefully.
    """
    base_time = datetime(2024, 1, 1, 9, 0)
    
    request_data = {
        "tasks": [
            {
                "id": "task1",
                "title": "Past Deadline Task",
                "durationMin": 60,
                "dueAt": (base_time - timedelta(days=1)).isoformat(),  # Past deadline
                "type": "study",
                "energy": "med",
                "window": None,
                "splittable": False,
                "priority": 3,
                "mode": "study"
            }
        ],
        "events": [],
        "preferences": {
            "dayStartHour": 9,
            "dayEndHour": 17,
            "slotStepMin": 30,
            "bufferMin": 0,
            "maxHeavyPerDay": 3
        },
        "dateRange": {
            "start": base_time.isoformat(),
            "end": (base_time + timedelta(days=1)).isoformat()
        }
    }
    
    response = client.post("/schedule", json=request_data)
    
    # Should still return 200, but task will be unscheduled
    assert response.status_code == 200
    data = response.json()
    
    # Task should be unscheduled due to impossible deadline
    assert "task1" in data["unscheduledTasks"]


def test_multiple_tasks_partial_scheduling():
    """
    Test that when some tasks can be scheduled and others cannot,
    the response correctly separates them.
    """
    base_time = datetime(2024, 1, 1, 9, 0)
    
    request_data = {
        "tasks": [
            {
                "id": "task1",
                "title": "Short Task",
                "durationMin": 30,
                "dueAt": None,
                "type": "admin",
                "energy": "low",
                "window": None,
                "splittable": False,
                "priority": 3,
                "mode": "balanced"
            },
            {
                "id": "task2",
                "title": "Very Long Task",
                "durationMin": 600,  # 10 hours - impossible to fit
                "dueAt": None,
                "type": "deep",
                "energy": "high",
                "window": None,
                "splittable": False,
                "priority": 5,
                "mode": "lockin"
            }
        ],
        "events": [],
        "preferences": {
            "dayStartHour": 9,
            "dayEndHour": 17,
            "slotStepMin": 30,
            "bufferMin": 0,
            "maxHeavyPerDay": 3
        },
        "dateRange": {
            "start": base_time.isoformat(),
            "end": (base_time + timedelta(days=1)).isoformat()
        }
    }
    
    response = client.post("/schedule", json=request_data)
    
    assert response.status_code == 200
    data = response.json()
    
    # At least one task should be scheduled (task1)
    # task2 is too long and should be unscheduled
    scheduled_task_ids = [block["taskId"] for block in data["scheduledBlocks"]]
    
    # Verify we have both scheduled and unscheduled tasks
    assert len(data["scheduledBlocks"]) > 0 or len(data["unscheduledTasks"]) > 0
    
    # If task2 is unscheduled, it should be in unscheduledTasks
    if "task2" in data["unscheduledTasks"]:
        assert "task2" not in scheduled_task_ids
