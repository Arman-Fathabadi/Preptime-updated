"""
Manual test script for core scheduling functionality.

Tests a simple scenario: 3 tasks, 2 events, 1 day
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from datetime import datetime, timedelta
from ml_service.scheduler import generate_free_slots, greedy_schedule
from ml_service.scorer import SlotScorer
from shared.models import Task, Event, Preferences


def main():
    print("=" * 80)
    print("MANUAL TEST: Core Scheduling Functionality")
    print("=" * 80)
    print()
    
    # Define date range (1 day)
    start_date = datetime(2024, 1, 15, 0, 0)
    end_date = datetime(2024, 1, 15, 23, 59)
    
    # Define 2 events
    events = [
        Event(
            id="event1",
            title="Team Meeting",
            start="2024-01-15T10:00:00",
            end="2024-01-15T11:00:00",
            kind="fixed"
        ),
        Event(
            id="event2",
            title="Lunch Break",
            start="2024-01-15T12:00:00",
            end="2024-01-15T13:00:00",
            kind="blocked"
        ),
    ]
    
    # Define preferences
    preferences = Preferences(
        dayStartHour=9,
        dayEndHour=17,
        slotStepMin=30,
        bufferMin=0,
        maxHeavyPerDay=3
    )
    
    # Define 3 tasks (adjusted to fit in 30-minute slots)
    tasks = [
        Task(
            id="task1",
            title="Write Report",
            durationMin=30,
            dueAt="2024-01-15T16:00:00",
            type="deep",
            energy="high",
            window=None,
            splittable=False,
            priority=4,
            mode="lockin"
        ),
        Task(
            id="task2",
            title="Review Emails",
            durationMin=30,
            dueAt=None,
            type="admin",
            energy="low",
            window=None,
            splittable=False,
            priority=2,
            mode="balanced"
        ),
        Task(
            id="task3",
            title="Study for Exam",
            durationMin=30,
            dueAt="2024-01-15T17:00:00",
            type="study",
            energy="high",
            window=None,
            splittable=False,
            priority=5,
            mode="study"
        ),
    ]
    
    print("SCENARIO:")
    print(f"  Date: {start_date.date()}")
    print(f"  Work hours: {preferences.day_start_hour}:00 - {preferences.day_end_hour}:00")
    print()
    
    print("EVENTS:")
    for event in events:
        print(f"  - {event.title}: {event.start} to {event.end}")
    print()
    
    print("TASKS:")
    for task in tasks:
        deadline = f" (due: {task.due_at})" if task.due_at else ""
        print(f"  - {task.title}: {task.duration_min} min, priority {task.priority}{deadline}")
    print()
    
    # Step 1: Generate free slots
    print("STEP 1: Generating free slots...")
    slots = generate_free_slots(events, preferences, (start_date, end_date))
    print(f"  Generated {len(slots)} free slots")
    print()
    
    print("FREE SLOTS:")
    for i, slot in enumerate(slots, 1):
        print(f"  {i}. {slot.start.strftime('%H:%M')} - {slot.end.strftime('%H:%M')} ({slot.duration_min} min)")
    print()
    
    # Step 2: Create scorer
    print("STEP 2: Creating slot scorer...")
    scorer = SlotScorer()
    print("  Scorer created (using heuristic scoring)")
    print()
    
    # Step 3: Run greedy schedule
    print("STEP 3: Running greedy scheduling algorithm...")
    result = greedy_schedule(tasks, slots, scorer)
    print(f"  Scheduled {len(result['scheduledBlocks'])} tasks")
    print(f"  Unscheduled {len(result['unscheduledTasks'])} tasks")
    print()
    
    # Display results
    print("SCHEDULED BLOCKS:")
    if result['scheduledBlocks']:
        for block in result['scheduledBlocks']:
            # Find the task
            task = next(t for t in tasks if t.id == block.task_id)
            start_time = datetime.fromisoformat(block.start.replace('Z', '+00:00'))
            end_time = datetime.fromisoformat(block.end.replace('Z', '+00:00'))
            duration = (end_time - start_time).total_seconds() / 60
            
            print(f"  - {task.title}")
            print(f"    Time: {start_time.strftime('%H:%M')} - {end_time.strftime('%H:%M')} ({int(duration)} min)")
            print(f"    Priority: {task.priority}, Type: {task.type}")
            print()
    else:
        print("  (none)")
        print()
    
    print("UNSCHEDULED TASKS:")
    if result['unscheduledTasks']:
        for task_id in result['unscheduledTasks']:
            task = next(t for t in tasks if t.id == task_id)
            print(f"  - {task.title} ({task.duration_min} min)")
        print()
    else:
        print("  (none)")
        print()
    
    # Validation
    print("VALIDATION:")
    
    # Check that all tasks are accounted for
    total_accounted = len(result['scheduledBlocks']) + len(result['unscheduledTasks'])
    if total_accounted == len(tasks):
        print(f"  ✓ All {len(tasks)} tasks accounted for")
    else:
        print(f"  ✗ Task count mismatch: {total_accounted} != {len(tasks)}")
    
    # Check that scheduled blocks don't overlap with events
    overlaps = False
    for block in result['scheduledBlocks']:
        block_start = datetime.fromisoformat(block.start.replace('Z', '+00:00'))
        block_end = datetime.fromisoformat(block.end.replace('Z', '+00:00'))
        
        for event in events:
            event_start = datetime.fromisoformat(event.start.replace('Z', '+00:00'))
            event_end = datetime.fromisoformat(event.end.replace('Z', '+00:00'))
            
            if block_start < event_end and block_end > event_start:
                overlaps = True
                print(f"  ✗ Block {block.id} overlaps with event {event.title}")
    
    if not overlaps:
        print("  ✓ No overlaps with events")
    
    # Check that scheduled blocks are within work hours
    outside_hours = False
    for block in result['scheduledBlocks']:
        block_start = datetime.fromisoformat(block.start.replace('Z', '+00:00'))
        block_end = datetime.fromisoformat(block.end.replace('Z', '+00:00'))
        
        if block_start.hour < preferences.day_start_hour or block_end.hour > preferences.day_end_hour:
            outside_hours = True
            print(f"  ✗ Block {block.id} is outside work hours")
    
    if not outside_hours:
        print(f"  ✓ All blocks within work hours ({preferences.day_start_hour}:00 - {preferences.day_end_hour}:00)")
    
    print()
    print("=" * 80)
    print("TEST COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    main()
