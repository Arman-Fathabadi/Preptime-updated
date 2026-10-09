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
    slot_step_min = max(1, preferences.slot_step_min)
    buffer = timedelta(minutes=max(0, preferences.buffer_min))
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

    # Iterate through each day in the date range. The range is [start, end):
    # a day that begins at or after `end` is never visited.
    current_day = start_date.replace(hour=0, minute=0, second=0, microsecond=0)

    while current_day < end_date:
        # Define day boundaries, clamped to the requested date range so no slot
        # starts before `start` or runs past `end`.
        day_start = max(current_day.replace(hour=day_start_hour, minute=0, second=0, microsecond=0), start_date)
        day_end = min(current_day.replace(hour=day_end_hour, minute=0, second=0, microsecond=0), end_date)

        if day_start >= day_end:
            current_day += timedelta(days=1)
            continue

        # Events overlapping this window (merged so adjacent/overlapping ones act as one)
        day_events = sorted(
            (max(e_start, day_start), min(e_end, day_end))
            for e_start, e_end in parsed_events
            if e_start < day_end and e_end > day_start
        )

        # Find gaps between events, leaving `buffer` of breathing room on each
        # side of an event (but not against the day boundary itself).
        gaps = []
        current_time = day_start
        for event_start, event_end in day_events:
            gap_end = event_start - buffer
            if current_time < gap_end:
                gaps.append((current_time, gap_end))
            current_time = max(current_time, event_end + buffer)

        if current_time < day_end:
            gaps.append((current_time, day_end))

        midnight = current_day.replace(hour=0, minute=0, second=0, microsecond=0)
        step = timedelta(minutes=slot_step_min)
        for gap_start, gap_end in gaps:
            # Align the slot start up to the next slotStepMin boundary of the day.
            since_midnight = gap_start - midnight
            remainder = since_midnight % step
            if remainder:
                gap_start += step - remainder

            duration_min = int((gap_end - gap_start).total_seconds() / 60)
            if duration_min > 0:
                slots.append(Slot(
                    start=gap_start,
                    end=gap_end,
                    duration_min=duration_min
                ))

        current_day += timedelta(days=1)

    return slots


def find_placement(task: Task, slot: Slot):
    """Where inside `slot` could `task` actually run?

    Returns ((start, end), None) for the earliest feasible placement, or
    (None, reason) when none exists. The task's time window and deadline limit
    where within the slot it may sit - they do not disqualify a slot that merely
    starts before the window opens or extends past the deadline.
    """
    lo, hi = slot.start, slot.end
    duration = timedelta(minutes=task.duration_min)

    if task.window is not None:
        day = slot.start.replace(hour=0, minute=0, second=0, microsecond=0)
        window_start = task.window.get('startHour', 0)
        window_end = task.window.get('endHour', 24)
        lo = max(lo, day + timedelta(hours=window_start))
        hi = min(hi, day + timedelta(hours=window_end))
        if lo + duration > hi:
            return None, f"Task does not fit inside its time window ({window_start}-{window_end}) in this slot"

    if task.due_at is not None:
        deadline = datetime.fromisoformat(task.due_at.replace('Z', '+00:00'))
        hi = min(hi, deadline)
        if lo + duration > hi:
            return None, f"Task cannot finish before its deadline ({task.due_at}) in this slot"

    return (lo, lo + duration), None


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
    3. A placement inside the slot that respects the task's time window
    4. ...and finishes before the task's deadline
    
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
    
    # Checks 3 and 4: time window and deadline, evaluated on where the task
    # would actually be placed inside the slot (see find_placement).
    placement, reason = find_placement(task, slot)
    if placement is None:
        return (False, reason)

    # All checks passed
    return (True, None)


def greedy_schedule(
    tasks: list[Task],
    slots: list[Slot],
    scorer,
    max_heavy_per_day: Optional[int] = None,
) -> dict:
    """
    Place tasks using greedy algorithm.

    Algorithm:
    1. For each task, score all valid slots
    2. Sort task-slot pairs by score (descending)
    3. Place highest scoring pair, at the earliest start the task's window and
       deadline allow inside that slot
    4. Update available slots (remove the used slot, keep what is left before
       and after the placement)
    5. Repeat until all tasks placed or no valid slots
    6. Track unscheduled tasks

    Args:
        tasks: List of tasks to schedule
        slots: List of available time slots
        scorer: SlotScorer instance for scoring task-slot pairs
        max_heavy_per_day: If set (> 0), at most this many high-energy tasks
            are placed on any one calendar day. None / 0 means no cap.

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
    heavy_by_day: dict = {}
    heavy_cap = max_heavy_per_day if max_heavy_per_day and max_heavy_per_day > 0 else None

    # Create a simple context (can be enhanced later)
    context = SchedulingContext()

    while remaining_tasks and available_slots:
        # Score all valid task-slot pairs
        scored_pairs = []

        for task in remaining_tasks:
            is_heavy = task.energy == "high"
            for slot in available_slots:
                if heavy_cap is not None and is_heavy and heavy_by_day.get(slot.start.date(), 0) >= heavy_cap:
                    continue

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
        (task_start, task_end), _ = find_placement(best_task, best_slot)

        block_id = f"block_{len(scheduled_blocks) + 1}"
        scheduled_blocks.append(ScheduledBlock(
            id=block_id,
            taskId=best_task.id,
            start=task_start.isoformat(),
            end=task_end.isoformat()
        ))

        if best_task.energy == "high":
            day = best_slot.start.date()
            heavy_by_day[day] = heavy_by_day.get(day, 0) + 1

        remaining_tasks.remove(best_task)

        # Remove the used slot, keeping any free time before and after the task
        available_slots.remove(best_slot)
        for free_start, free_end in ((best_slot.start, task_start), (task_end, best_slot.end)):
            free_min = int((free_end - free_start).total_seconds() / 60)
            if free_min > 0:
                available_slots.append(Slot(start=free_start, end=free_end, duration_min=free_min))

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
