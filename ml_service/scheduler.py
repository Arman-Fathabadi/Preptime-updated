"""
Core scheduling logic for the intelligent scheduler.
"""

from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel
from shared.models import Event, Preferences, Task, ScheduledBlock


class Slot(BaseModel):
    """Represents a free time slot where tasks can be scheduled."""
    start: datetime
    end: datetime
    duration_min: int


def generate_free_slots(
    events: list[Event],
    preferences: Preferences,
    date_range: tuple[datetime, datetime]
) -> list[Slot]:
    """
    Generate all free slots between events.
    
    Algorithm:
    1. Sort events by start time
    2. Iterate through events, finding gaps
    3. Split gaps into slots at slotStepMin granularity
    4. Filter slots outside dayStartHour/dayEndHour
    5. Merge consecutive slots into larger slots for better scheduling
    6. Return list of Slot objects
    
    Args:
        events: List of fixed/blocked events
        preferences: User preferences including day boundaries and slot granularity
        date_range: Tuple of (start_datetime, end_datetime) for the scheduling period
    
    Returns:
        List of Slot objects representing available time slots
    """
    start_date, end_date = date_range
    slot_step_min = preferences.slot_step_min
    day_start_hour = preferences.day_start_hour
    day_end_hour = preferences.day_end_hour
    
    # Parse events and sort by start time
    parsed_events = []
    for event in events:
        event_start = datetime.fromisoformat(event.start.replace('Z', '+00:00'))
        event_end = datetime.fromisoformat(event.end.replace('Z', '+00:00'))
        parsed_events.append((event_start, event_end))
    
    # Sort events by start time
    parsed_events.sort(key=lambda x: x[0])
    
    slots = []
    
    # Iterate through each day in the date range
    current_day = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
    
    while current_day <= end_date:
        # Define day boundaries
        day_start = current_day.replace(hour=day_start_hour, minute=0, second=0, microsecond=0)
        day_end = current_day.replace(hour=day_end_hour, minute=0, second=0, microsecond=0)
        
        # Get events for this day
        day_events = [
            (max(e_start, day_start), min(e_end, day_end))
            for e_start, e_end in parsed_events
            if e_start < day_end and e_end > day_start
        ]
        
        # Sort day events by start time
        day_events.sort(key=lambda x: x[0])
        
        # Find gaps between events
        gaps = []
        current_time = day_start
        
        for event_start, event_end in day_events:
            if current_time < event_start:
                # There's a gap before this event
                gaps.append((current_time, event_start))
            # Move current_time to the end of this event
            current_time = max(current_time, event_end)
        
        # Check if there's a gap after the last event
        if current_time < day_end:
            gaps.append((current_time, day_end))
        
        # Create slots from gaps (merge consecutive time into single large slots)
        for gap_start, gap_end in gaps:
            # Create one large slot for the entire gap
            duration_min = int((gap_end - gap_start).total_seconds() / 60)
            if duration_min > 0:
                slots.append(Slot(
                    start=gap_start,
                    end=gap_end,
                    duration_min=duration_min
                ))
        
        # Move to next day
        current_day += timedelta(days=1)
    
    return slots


def validate_placement(
    task: Task,
    slot: Slot,
    scheduled_blocks: list[ScheduledBlock]
) -> tuple[bool, Optional[str]]:
    """
    Validate hard constraints for task placement in a slot.
    
    Checks:
    1. Slot duration >= task duration
    2. No overlap with existing scheduled blocks
    3. Slot within task time window (if specified)
    4. Slot end before task deadline (if specified)
    
    Args:
        task: The task to be placed
        slot: The slot where the task would be placed
        scheduled_blocks: List of already scheduled blocks
    
    Returns:
        Tuple of (is_valid, error_message)
        - is_valid: True if placement is valid, False otherwise
        - error_message: None if valid, descriptive error message if invalid
    """
    # Check 1: Slot duration >= task duration
    if slot.duration_min < task.duration_min:
        return (False, f"Slot duration ({slot.duration_min} min) is less than task duration ({task.duration_min} min)")
    
    # Check 2: No overlap with existing scheduled blocks
    for block in scheduled_blocks:
        block_start = datetime.fromisoformat(block.start.replace('Z', '+00:00'))
        block_end = datetime.fromisoformat(block.end.replace('Z', '+00:00'))
        
        # Check if slot overlaps with this block
        if slot.start < block_end and slot.end > block_start:
            return (False, f"Slot overlaps with existing scheduled block {block.id}")
    
    # Check 3: Slot within task time window (if specified)
    if task.window is not None:
        # Calculate where the task would actually be placed
        task_start_hour = slot.start.hour + slot.start.minute / 60.0
        task_end_hour = task_start_hour + (task.duration_min / 60.0)
        
        window_start = task.window.get('startHour', 0)
        window_end = task.window.get('endHour', 24)
        
        # Check if task placement fits within window
        if task_start_hour < window_start or task_end_hour > window_end:
            return (False, f"Task placement ({task_start_hour:.1f}-{task_end_hour:.1f}) is outside time window ({window_start}-{window_end})")
    
    # Check 4: Slot end before task deadline (if specified)
    if task.due_at is not None:
        deadline = datetime.fromisoformat(task.due_at.replace('Z', '+00:00'))
        
        if slot.end > deadline:
            return (False, f"Slot ends after task deadline ({task.due_at})")
    
    # All checks passed
    return (True, None)


def greedy_schedule(
    tasks: list[Task],
    slots: list[Slot],
    scorer
) -> dict:
    """
    Place tasks using greedy algorithm.
    
    Algorithm:
    1. For each task, score all valid slots
    2. Sort task-slot pairs by score (descending)
    3. Place highest scoring pair
    4. Update available slots (remove or split used slot)
    5. Repeat until all tasks placed or no valid slots
    6. Track unscheduled tasks
    
    Args:
        tasks: List of tasks to schedule
        slots: List of available time slots
        scorer: SlotScorer instance for scoring task-slot pairs
    
    Returns:
        Dictionary with:
        - scheduledBlocks: List of ScheduledBlock objects
        - unscheduledTasks: List of task IDs that couldn't be scheduled
    """
    from ml_service.scorer import SchedulingContext
    
    scheduled_blocks = []
    unscheduled_tasks = []
    available_slots = slots.copy()
    remaining_tasks = tasks.copy()
    
    # Create a simple context (can be enhanced later)
    context = SchedulingContext()
    
    while remaining_tasks and available_slots:
        # Score all valid task-slot pairs
        scored_pairs = []
        
        for task in remaining_tasks:
            for slot in available_slots:
                # Check if placement is valid
                is_valid, _ = validate_placement(task, slot, scheduled_blocks)
                
                if is_valid:
                    # Score this task-slot pair
                    score = scorer.score(task, slot, context)
                    scored_pairs.append((score, task, slot))
        
        # If no valid placements, break
        if not scored_pairs:
            break
        
        # Sort by score (descending)
        scored_pairs.sort(key=lambda x: x[0], reverse=True)
        
        # Place the highest scoring pair
        best_score, best_task, best_slot = scored_pairs[0]
        
        # Create scheduled block
        block_id = f"block_{len(scheduled_blocks) + 1}"
        scheduled_block = ScheduledBlock(
            id=block_id,
            taskId=best_task.id,
            start=best_slot.start.isoformat(),
            end=(best_slot.start + timedelta(minutes=best_task.duration_min)).isoformat()
        )
        
        scheduled_blocks.append(scheduled_block)
        
        # Remove task from remaining tasks
        remaining_tasks.remove(best_task)
        
        # Update available slots
        # Remove the used slot and potentially create new slots from remaining time
        available_slots.remove(best_slot)
        
        # If the task doesn't use the entire slot, create a new slot for the remaining time
        task_end = best_slot.start + timedelta(minutes=best_task.duration_min)
        if task_end < best_slot.end:
            remaining_duration = int((best_slot.end - task_end).total_seconds() / 60)
            if remaining_duration > 0:
                new_slot = Slot(
                    start=task_end,
                    end=best_slot.end,
                    duration_min=remaining_duration
                )
                available_slots.append(new_slot)
    
    # Track unscheduled tasks
    for task in remaining_tasks:
        unscheduled_tasks.append(task.id)
    
    return {
        "scheduledBlocks": scheduled_blocks,
        "unscheduledTasks": unscheduled_tasks
    }


def detect_conflicts(
    new_event: Event,
    scheduled_blocks: list[ScheduledBlock]
) -> list[ScheduledBlock]:
    """
    Detect overlapping scheduled blocks with a new event.
    
    Args:
        new_event: The new event being added
        scheduled_blocks: List of currently scheduled blocks
    
    Returns:
        List of blocks that overlap with the new event
    """
    event_start = datetime.fromisoformat(new_event.start.replace('Z', '+00:00'))
    event_end = datetime.fromisoformat(new_event.end.replace('Z', '+00:00'))
    
    conflicting_blocks = []
    
    for block in scheduled_blocks:
        block_start = datetime.fromisoformat(block.start.replace('Z', '+00:00'))
        block_end = datetime.fromisoformat(block.end.replace('Z', '+00:00'))
        
        # Check if block overlaps with event
        if block_start < event_end and block_end > event_start:
            conflicting_blocks.append(block)
    
    return conflicting_blocks


def repair_schedule(
    conflicting_blocks: list[ScheduledBlock],
    all_scheduled_blocks: list[ScheduledBlock],
    tasks: list[Task],
    events: list[Event],
    preferences: Preferences,
    date_range: tuple[datetime, datetime],
    scorer
) -> dict:
    """
    Repair schedule by re-planning conflicting tasks.
    
    Algorithm:
    1. Extract task IDs from conflicting blocks
    2. Remove conflicting blocks from schedule
    3. Re-run greedy_schedule for affected tasks only
    4. Merge with non-conflicting blocks
    
    Args:
        conflicting_blocks: List of blocks that conflict with new event
        all_scheduled_blocks: Complete list of scheduled blocks
        tasks: Original list of all tasks
        events: Updated list of events (including new event)
        preferences: User preferences
        date_range: Scheduling date range
        scorer: SlotScorer instance
    
    Returns:
        Dictionary with updated scheduledBlocks and unscheduledTasks
    """
    # Extract task IDs from conflicting blocks
    affected_task_ids = {block.task_id for block in conflicting_blocks}
    
    # Get the affected tasks
    affected_tasks = [task for task in tasks if task.id in affected_task_ids]
    
    # Remove conflicting blocks from schedule
    non_conflicting_blocks = [
        block for block in all_scheduled_blocks 
        if block not in conflicting_blocks
    ]
    
    # Generate new free slots with updated events
    slots = generate_free_slots(events, preferences, date_range)
    
    # Re-run greedy_schedule for affected tasks only
    repair_result = greedy_schedule(affected_tasks, slots, scorer)
    
    # Merge repaired blocks with non-conflicting blocks
    updated_blocks = non_conflicting_blocks + repair_result["scheduledBlocks"]
    
    return {
        "scheduledBlocks": updated_blocks,
        "unscheduledTasks": repair_result["unscheduledTasks"]
    }


def generate_explanations(
    scheduled_blocks: list[ScheduledBlock],
    tasks: list[Task],
    events: list[Event],
    scorer
) -> dict[str, list[str]]:
    """
    Generate human-readable explanations for why each task was placed in its slot.
    
    For each scheduled block, identifies the top scoring factors and generates
    2-4 human-readable reason strings.
    
    Args:
        scheduled_blocks: List of scheduled blocks to explain
        tasks: List of all tasks
        events: List of all events (for context)
        scorer: SlotScorer instance used for scoring
    
    Returns:
        Dictionary mapping block ID to list of explanation strings
    """
    from ml_service.scorer import SchedulingContext
    
    explanations = {}
    
    # Create task lookup
    task_map = {task.id: task for task in tasks}
    
    for block in scheduled_blocks:
        task = task_map.get(block.task_id)
        if not task:
            continue
        
        # Reconstruct the slot from the block
        block_start = datetime.fromisoformat(block.start.replace('Z', '+00:00'))
        block_end = datetime.fromisoformat(block.end.replace('Z', '+00:00'))
        duration_min = int((block_end - block_start).total_seconds() / 60)
        
        slot = Slot(
            start=block_start,
            end=block_end,
            duration_min=duration_min
        )
        
        # Calculate scoring factors
        reasons = []
        
        # 1. Check deadline proximity
        if task.due_at:
            deadline = datetime.fromisoformat(task.due_at.replace('Z', '+00:00'))
            hours_until_deadline = (deadline - block_start).total_seconds() / 3600
            
            if hours_until_deadline < 24:
                reasons.append(f"Scheduled close to deadline ({int(hours_until_deadline)} hours remaining)")
            elif hours_until_deadline < 72:
                reasons.append(f"Placed within {int(hours_until_deadline / 24)} days of deadline")
        
        # 2. Check energy alignment
        slot_hour = block_start.hour
        if 6 <= slot_hour < 12:
            time_energy = "high"
            time_desc = "morning"
        elif 12 <= slot_hour < 18:
            time_energy = "med"
            time_desc = "afternoon"
        else:
            time_energy = "low"
            time_desc = "evening"
        
        if task.energy == time_energy:
            reasons.append(f"Energy level matches {time_desc} time ({task.energy} energy)")
        
        # 3. Check uninterrupted time for deep work
        if task.type in ["deep", "study"]:
            extra_time = duration_min - task.duration_min
            if extra_time >= 60:
                reasons.append(f"Provides {extra_time} minutes of uninterrupted time for focused work")
            elif extra_time >= 30:
                reasons.append(f"Allows buffer time for deep work ({extra_time} extra minutes)")
        
        # 4. Check post-meeting avoidance
        # Find if there's a meeting before this slot
        minutes_since_meeting = None
        for event in events:
            event_end = datetime.fromisoformat(event.end.replace('Z', '+00:00'))
            if event_end <= block_start:
                minutes_gap = (block_start - event_end).total_seconds() / 60
                if minutes_since_meeting is None or minutes_gap < minutes_since_meeting:
                    minutes_since_meeting = minutes_gap
        
        if minutes_since_meeting is not None and minutes_since_meeting >= 30:
            reasons.append(f"Scheduled with sufficient buffer after meetings ({int(minutes_since_meeting)} minutes)")
        
        # 5. Priority consideration
        if task.priority >= 4:
            reasons.append(f"High priority task (priority {task.priority})")
        
        # 6. Task type specific reasons
        if task.type == "relax":
            if time_desc == "evening":
                reasons.append("Relaxation task placed in evening hours")
        elif task.type == "admin":
            if time_desc == "afternoon":
                reasons.append("Administrative task scheduled for afternoon")
        
        # Ensure we have 2-4 reasons
        if len(reasons) < 2:
            # Add generic reasons if we don't have enough
            reasons.append(f"Fits task duration ({task.duration_min} minutes)")
            if len(reasons) < 2:
                reasons.append(f"Scheduled during available time slot")
        
        # Limit to 4 reasons
        reasons = reasons[:4]
        
        explanations[block.id] = reasons
    
    return explanations


def compute_metrics(
    scheduled_blocks: list[ScheduledBlock],
    tasks: list[Task],
    slots: list[Slot],
    date_range: tuple[datetime, datetime]
) -> dict:
    """
    Compute schedule metrics.
    
    Metrics:
    - freeHours: Total free time remaining (unscheduled slots)
    - scheduledHours: Sum of scheduled block durations
    - tasksOnTime: Count of tasks scheduled before their deadline
    - deepWorkHours: Sum of deep work task durations
    - contextSwitchPenalty: Score based on task type transitions
    
    Args:
        scheduled_blocks: List of scheduled blocks
        tasks: List of all tasks
        slots: List of all available slots (before scheduling)
        date_range: Tuple of (start_datetime, end_datetime)
    
    Returns:
        Dictionary with computed metrics
    """
    # Create task lookup
    task_map = {task.id: task for task in tasks}
    
    # 1. Compute scheduledHours: sum of scheduled block durations
    scheduled_hours = 0.0
    for block in scheduled_blocks:
        block_start = datetime.fromisoformat(block.start.replace('Z', '+00:00'))
        block_end = datetime.fromisoformat(block.end.replace('Z', '+00:00'))
        duration_hours = (block_end - block_start).total_seconds() / 3600
        scheduled_hours += duration_hours
    
    # 2. Compute freeHours: total slot time minus scheduled time
    total_slot_hours = sum(slot.duration_min / 60 for slot in slots)
    free_hours = total_slot_hours - scheduled_hours
    
    # 3. Compute tasksOnTime: count of tasks scheduled before deadline
    tasks_on_time = 0
    for block in scheduled_blocks:
        task = task_map.get(block.task_id)
        if task and task.due_at:
            block_end = datetime.fromisoformat(block.end.replace('Z', '+00:00'))
            deadline = datetime.fromisoformat(task.due_at.replace('Z', '+00:00'))
            if block_end <= deadline:
                tasks_on_time += 1
    
    # 4. Compute deepWorkHours: sum of deep work task durations
    deep_work_hours = 0.0
    for block in scheduled_blocks:
        task = task_map.get(block.task_id)
        if task and task.type in ["deep", "study"]:
            block_start = datetime.fromisoformat(block.start.replace('Z', '+00:00'))
            block_end = datetime.fromisoformat(block.end.replace('Z', '+00:00'))
            duration_hours = (block_end - block_start).total_seconds() / 3600
            deep_work_hours += duration_hours
    
    # 5. Compute contextSwitchPenalty: score based on task type transitions
    # Sort blocks by start time
    sorted_blocks = sorted(
        scheduled_blocks,
        key=lambda b: datetime.fromisoformat(b.start.replace('Z', '+00:00'))
    )
    
    context_switch_penalty = 0
    for i in range(len(sorted_blocks) - 1):
        current_task = task_map.get(sorted_blocks[i].task_id)
        next_task = task_map.get(sorted_blocks[i + 1].task_id)
        
        if current_task and next_task:
            # Penalize switches between different task types
            if current_task.type != next_task.type:
                # Higher penalty for switching from deep work
                if current_task.type in ["deep", "study"]:
                    context_switch_penalty += 2
                else:
                    context_switch_penalty += 1
    
    return {
        "freeHours": round(free_hours, 2),
        "scheduledHours": round(scheduled_hours, 2),
        "tasksOnTime": tasks_on_time,
        "deepWorkHours": round(deep_work_hours, 2),
        "contextSwitchPenalty": context_switch_penalty
    }
