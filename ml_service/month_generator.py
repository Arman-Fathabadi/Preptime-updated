"""
Month Schedule Generator
Generates Weeks 2-4 based on Week 1 patterns with productivity techniques
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import random
from shared.models import Task, Event, ScheduledBlock, Preferences
from ml_service.pattern_analyzer import SchedulePattern
from ml_service.scheduler import generate_free_slots, greedy_schedule, Slot
from ml_service.scorer import SlotScorer


class MonthGenerator:
    """Generates remaining weeks of the month based on Week 1 patterns"""
    
    def __init__(self, scorer: Optional[SlotScorer] = None):
        self.scorer = scorer or SlotScorer()
    
    def generate_month(
        self,
        pattern: SchedulePattern,
        week1_blocks: List[ScheduledBlock],
        week1_tasks: List[Task],
        existing_events: List[Event],
        start_date: datetime,
        preferences: Preferences
    ) -> Dict[str, Any]:
        """
        Generate Weeks 2-4 based on Week 1 patterns.
        
        Args:
            pattern: Extracted patterns from Week 1
            week1_blocks: Scheduled blocks from Week 1
            week1_tasks: Tasks from Week 1
            existing_events: Fixed events for the entire month
            start_date: Start date of Week 2
            preferences: User preferences
            
        Returns:
            Dictionary with generated tasks and scheduled blocks for Weeks 2-4
        """
        generated_tasks = []
        all_scheduled_blocks = []
        
        # Generate tasks for each week (Weeks 2-4)
        for week_num in range(2, 5):
            week_start = start_date + timedelta(weeks=week_num - 2)
            week_end = week_start + timedelta(days=7)
            
            # Generate tasks for this week based on patterns
            week_tasks = self._generate_week_tasks(
                pattern=pattern,
                week_num=week_num,
                week_start=week_start,
                week1_tasks=week1_tasks,
                week1_blocks=week1_blocks
            )
            
            # Filter events for this week
            week_events = self._filter_events_for_week(
                existing_events,
                week_start,
                week_end
            )
            
            # Generate schedule for this week
            week_schedule = self._schedule_week_with_techniques(
                tasks=week_tasks,
                events=week_events,
                pattern=pattern,
                preferences=preferences,
                week_start=week_start,
                week_end=week_end
            )
            
            generated_tasks.extend(week_tasks)
            all_scheduled_blocks.extend(week_schedule["scheduledBlocks"])
        
        return {
            "generatedTasks": generated_tasks,
            "scheduledBlocks": all_scheduled_blocks,
            "appliedTechniques": [
                "Pomodoro Technique (25min work + 5min break)",
                "Time Blocking (similar tasks grouped)",
                "Energy Management (hard tasks in peak hours)",
                "Break Optimization (regular intervals)",
                "Task Distribution (balanced across days)"
            ]
        }
    
    def _generate_week_tasks(
        self,
        pattern: SchedulePattern,
        week_num: int,
        week_start: datetime,
        week1_tasks: List[Task],
        week1_blocks: List[ScheduledBlock]
    ) -> List[Task]:
        """Generate tasks for a week based on patterns - matching day of week from Week 1"""
        tasks = []
        
        # Extract task templates from Week 1 (names, times, patterns)
        task_templates = self._extract_week1_task_templates(week1_tasks, week1_blocks)
        
        if not task_templates:
            return tasks
        
        print(f"[DEBUG] Week {week_num}: Found {len(task_templates)} templates from Week 1")
        
        # Group templates by day of week (0=Monday, 6=Sunday)
        templates_by_day = {}
        for template in task_templates:
            day = template['day_of_week']
            if day not in templates_by_day:
                templates_by_day[day] = []
            templates_by_day[day].append(template)
        
        print(f"[DEBUG] Templates grouped by day: {[(day, len(temps)) for day, temps in templates_by_day.items()]}")
        
        # For each day of the week, generate tasks matching that day from Week 1
        for day_offset in range(7):
            current_date = week_start + timedelta(days=day_offset)
            day_of_week = current_date.weekday()  # 0=Monday, 6=Sunday
            
            # Skip weekends if user doesn't work weekends
            if day_of_week >= 5 and not self._user_works_weekends(week1_blocks):
                continue
            
            # Get all templates that were on this day of week in Week 1
            day_templates = templates_by_day.get(day_of_week, [])
            
            print(f"[DEBUG] Day {day_offset} ({['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][day_of_week]}): {len(day_templates)} templates")
            
            # Generate all tasks for this day
            for template_idx, template in enumerate(day_templates):
                task = self._generate_task_from_template(
                    template=template,
                    pattern=pattern,
                    date=current_date,
                    task_idx=template_idx,
                    week_num=week_num,
                    day_offset=day_offset,
                    week1_durations={}
                )
                tasks.append(task)
        
        print(f"[DEBUG] Week {week_num}: Generated {len(tasks)} tasks total")
        return tasks
    
    def _generate_task_from_template(
        self,
        template: Dict[str, Any],
        pattern: SchedulePattern,
        date: datetime,
        task_idx: int,
        week_num: int,
        day_offset: int,
        week1_durations: Dict[str, List[int]]
    ) -> Task:
        """Generate a task using a Week 1 template"""
        
        if template is None:
            # Fallback to old method if no template
            return self._generate_task(
                pattern, date, task_idx, week_num, day_offset, week1_durations
            )
        
        # Use template values
        task_type = template['type']
        energy = template['energy']
        priority = template['priority']
        mode = template['mode']
        duration = template['duration_min']
        label = template.get('label')  # Get label from template
        color = template.get('color')  # Get color from template
        
        # Use actual task name from Week 1 (with week number for clarity)
        # Remove any existing week number first to avoid duplicates
        base_title = template['title']
        # Remove existing week number pattern like "(W1)", "(W2)", etc.
        import re
        base_title = re.sub(r'\s*\(W\d+\)\s*', '', base_title).strip()
        
        # Add current week number
        title = f"{base_title} (W{week_num})"
        
        # Set deadline (some tasks have deadlines)
        due_at = None
        if random.random() < 0.3:  # 30% of tasks have deadlines
            days_ahead = random.randint(1, 7)
            deadline = date + timedelta(days=days_ahead, hours=17)
            due_at = deadline.isoformat()
        
        # Create time window preference based on Week 1 timing
        # Use the actual preferred hour with a flexible window around it
        # BUT always constrain to 7 AM - 11 PM range
        window = None
        preferred_hour = template['preferred_hour']
        
        # Create a 6-hour window centered around the preferred time
        # This allows flexibility while keeping tasks near their Week 1 time
        window_start = max(7, preferred_hour - 3)   # Never before 7 AM
        window_end = min(23, preferred_hour + 3)    # Never after 11 PM
        
        # Ensure minimum 4-hour window
        if window_end - window_start < 4:
            if window_start == 7:
                window_end = min(23, window_start + 4)
            elif window_end == 23:
                window_start = max(7, window_end - 4)
        
        window = {'startHour': window_start, 'endHour': window_end}
        
        task_id = f"gen_w{week_num}_d{day_offset}_t{task_idx}_{random.randint(1000, 9999)}"
        
        return Task(
            id=task_id,
            title=title,
            durationMin=duration,
            dueAt=due_at,
            type=task_type,
            energy=energy,
            splittable=False,
            priority=priority,
            mode=mode,
            window=window,
            label=label,  # Preserve label from Week 1
            color=color   # Preserve color from Week 1
        )
    
    def _generate_task(
        self,
        pattern: SchedulePattern,
        date: datetime,
        task_idx: int,
        week_num: int,
        day_offset: int,
        week1_durations: Dict[str, List[int]] = None
    ) -> Task:
        """Generate a single task based on patterns"""
        # Select task type based on distribution
        task_type = self._select_task_type(pattern.task_type_distribution)
        
        # Determine energy level based on task type
        if task_type in ["deep", "study"]:
            energy = "high"
        elif task_type == "admin":
            energy = "med"
        else:
            energy = "low"
        
        # Determine duration - use actual durations from Week 1 if available
        if week1_durations and task_type in week1_durations and week1_durations[task_type]:
            # Use a random duration from Week 1 for this task type
            duration = random.choice(week1_durations[task_type])
        else:
            # Fallback to default durations
            if task_type in ["deep", "study"]:
                duration = random.choice([25, 50, 75])
            elif task_type == "admin":
                duration = random.choice([15, 30, 45])
            else:
                duration = random.choice([30, 60])
        
        # Generate task title
        title = self._generate_task_title(task_type, week_num, day_offset, task_idx)
        
        # Set priority (vary across week)
        priority = random.choice([3, 4, 5]) if task_type in ["deep", "study"] else random.choice([2, 3, 4])
        
        # Set deadline (some tasks have deadlines)
        due_at = None
        if random.random() < 0.3:  # 30% of tasks have deadlines
            days_ahead = random.randint(1, 7)
            deadline = date + timedelta(days=days_ahead, hours=17)
            due_at = deadline.isoformat()
        
        # Determine mode based on task type
        if task_type == "study":
            mode = "study"
        elif task_type == "deep":
            mode = "lockin"
        elif task_type == "relax":
            mode = "relax"
        else:
            mode = "balanced"
        
        task_id = f"gen_w{week_num}_d{day_offset}_t{task_idx}_{random.randint(1000, 9999)}"
        
        return Task(
            id=task_id,
            title=title,
            durationMin=duration,
            dueAt=due_at,
            type=task_type,
            energy=energy,
            splittable=False,
            priority=priority,
            mode=mode
        )
    
    def _select_task_type(self, distribution: Dict[str, float]) -> str:
        """Select task type based on distribution"""
        if not distribution:
            return random.choice(["deep", "study", "admin", "relax"])
        
        # Weighted random selection
        types = list(distribution.keys())
        weights = list(distribution.values())
        
        return random.choices(types, weights=weights)[0]
    
    def _generate_task_title(
        self,
        task_type: str,
        week_num: int,
        day_offset: int,
        task_idx: int
    ) -> str:
        """Generate realistic task title"""
        titles = {
            "deep": [
                "Deep Work Session",
                "Focus Block: Project Work",
                "Concentrated Development",
                "Complex Problem Solving",
                "Strategic Planning"
            ],
            "study": [
                "Study Session",
                "Learning Block",
                "Course Material Review",
                "Research & Reading",
                "Skill Development"
            ],
            "admin": [
                "Email & Messages",
                "Administrative Tasks",
                "Planning & Organization",
                "Quick Tasks",
                "Team Coordination"
            ],
            "relax": [
                "Break Time",
                "Relaxation",
                "Personal Time",
                "Recharge",
                "Mindfulness"
            ]
        }
        
        base_title = random.choice(titles.get(task_type, ["Task"]))
        return f"{base_title} (W{week_num})"
    
    def _schedule_week_with_techniques(
        self,
        tasks: List[Task],
        events: List[Event],
        pattern: SchedulePattern,
        preferences: Preferences,
        week_start: datetime,
        week_end: datetime
    ) -> Dict[str, Any]:
        """Schedule week with productivity techniques applied"""
        
        # Don't apply Pomodoro breaks for now - causes too many tasks
        # tasks_with_breaks = self._apply_pomodoro_breaks(tasks, pattern)
        tasks_with_breaks = tasks
        
        # Apply time blocking: sort tasks to cluster similar types
        if pattern.preferred_task_clustering:
            tasks_with_breaks = self._apply_time_blocking(tasks_with_breaks)
        
        # Apply energy management: adjust task priorities based on time
        tasks_with_breaks = self._apply_energy_management(
            tasks_with_breaks,
            pattern
        )
        
        # Generate free slots with proper granularity
        # Use smaller slot steps to allow more flexible scheduling
        original_slot_step = preferences.slot_step_min
        preferences.slot_step_min = 15  # 15-minute granularity for better scheduling
        
        slots = generate_free_slots(
            events=events,
            preferences=preferences,
            date_range=(week_start, week_end)
        )
        
        # Restore original slot step
        preferences.slot_step_min = original_slot_step
        
        # Schedule tasks using greedy algorithm
        schedule = greedy_schedule(
            tasks=tasks_with_breaks,
            slots=slots,
            scorer=self.scorer,
            max_heavy_per_day=preferences.max_heavy_per_day
        )
        
        print(f"[DEBUG] Scheduled {len(schedule['scheduledBlocks'])} out of {len(tasks_with_breaks)} tasks")
        if len(schedule['scheduledBlocks']) < len(tasks_with_breaks):
            print(f"[DEBUG] WARNING: Failed to schedule {len(tasks_with_breaks) - len(schedule['scheduledBlocks'])} tasks!")
        
        return schedule
    
    def _apply_pomodoro_breaks(
        self,
        tasks: List[Task],
        pattern: SchedulePattern
    ) -> List[Task]:
        """Insert break tasks between work sessions (Pomodoro technique)"""
        tasks_with_breaks = []
        
        for i, task in enumerate(tasks):
            tasks_with_breaks.append(task)
            
            # Add break after deep work or study tasks
            if task.type in ["deep", "study"] and i < len(tasks) - 1:
                # 5-minute break after each Pomodoro
                break_task = Task(
                    id=f"break_{task.id}",
                    title="Break (Pomodoro)",
                    durationMin=5,
                    type="relax",
                    energy="low",
                    splittable=False,
                    priority=2,
                    mode="relax"
                )
                tasks_with_breaks.append(break_task)
        
        return tasks_with_breaks
    
    def _apply_time_blocking(self, tasks: List[Task]) -> List[Task]:
        """Group similar tasks together (time blocking)"""
        # Sort tasks by type to cluster similar tasks
        return sorted(tasks, key=lambda t: (t.type, -t.priority))
    
    def _apply_energy_management(
        self,
        tasks: List[Task],
        pattern: SchedulePattern
    ) -> List[Task]:
        """Adjust task priorities to match energy patterns"""
        # Boost priority of high-energy tasks (they'll be scheduled in peak hours)
        for task in tasks:
            if task.energy == "high" and task.type in ["deep", "study"]:
                # Increase priority to ensure scheduling in peak hours
                task.priority = min(5, task.priority + 1)
        
        return tasks
    
    def _filter_events_for_week(
        self,
        events: List[Event],
        week_start: datetime,
        week_end: datetime
    ) -> List[Event]:
        """Filter events that fall within the week"""
        week_events = []
        
        for event in events:
            event_start = datetime.fromisoformat(event.start.replace('Z', '+00:00'))
            event_end = datetime.fromisoformat(event.end.replace('Z', '+00:00'))
            
            # Check if event overlaps with week
            if event_start < week_end and event_end > week_start:
                week_events.append(event)
        
        return week_events
    
    def _user_works_weekends(self, week1_blocks: List[ScheduledBlock]) -> bool:
        """Check if user scheduled tasks on weekends in Week 1"""
        # Check if any blocks are scheduled on Saturday (5) or Sunday (6)
        for block in week1_blocks:
            block_start = datetime.fromisoformat(block.start.replace('Z', '+00:00'))
            if block_start.weekday() >= 5:
                return True
        return False
    
    def _extract_week1_durations(
        self,
        week1_tasks: List[Task],
        week1_blocks: List[ScheduledBlock]
    ) -> Dict[str, List[int]]:
        """
        Extract actual task durations from Week 1 by task type.
        
        Returns a dictionary mapping task type to list of durations used in Week 1.
        """
        durations_by_type = {}
        
        # Create task lookup
        task_map = {task.id: task for task in week1_tasks}
        
        # Extract durations from scheduled blocks
        for block in week1_blocks:
            task_id = getattr(block, 'taskId', None) or block.task_id
            task = task_map.get(task_id)
            if task:
                # Calculate actual duration from block
                block_start = datetime.fromisoformat(block.start.replace('Z', '+00:00'))
                block_end = datetime.fromisoformat(block.end.replace('Z', '+00:00'))
                duration_min = int((block_end - block_start).total_seconds() / 60)
                
                # Store duration by task type
                if task.type not in durations_by_type:
                    durations_by_type[task.type] = []
                durations_by_type[task.type].append(duration_min)
        
        return durations_by_type
    
    def _extract_week1_task_templates(
        self,
        week1_tasks: List[Task],
        week1_blocks: List[ScheduledBlock]
    ) -> List[Dict[str, Any]]:
        """
        Extract task templates from Week 1 including names, times, colors, and patterns.
        
        Returns list of task templates with all metadata for replication.
        """
        templates = []
        
        print(f"[DEBUG] Extracting templates from {len(week1_blocks)} blocks and {len(week1_tasks)} tasks")
        
        # Create task map by ID
        task_map = {task.id: task for task in week1_tasks}
        
        # Also create a map by title for fallback matching
        task_by_title = {}
        for task in week1_tasks:
            if task.title not in task_by_title:
                task_by_title[task.title] = task
        
        for i, block in enumerate(week1_blocks):
            try:
                # Parse block times
                block_start = datetime.fromisoformat(block.start.replace('Z', '+00:00'))
                block_end = datetime.fromisoformat(block.end.replace('Z', '+00:00'))
                duration_min = int((block_end - block_start).total_seconds() / 60)
                
                # Try to get task ID - the frontend sets taskId = block.id
                task_id = getattr(block, 'taskId', None) or getattr(block, 'task_id', None) or block.id
                task = task_map.get(task_id)
                
                if not task:
                    # Frontend might be using block.id as taskId, so try that
                    task = task_map.get(block.id)
                
                if i < 3:
                    print(f"[DEBUG] Block {i}: task_id={task_id}, block.id={block.id}, task_found={task is not None}")
                    if task:
                        print(f"  -> Task title: {task.title}, color: {task.color}")
                
                if not task:
                    print(f"[DEBUG] WARNING: No task found for block {i} (task_id={task_id}, block.id={block.id})")
                    continue
                
                # Create template from task data
                templates.append({
                    'title': task.title,
                    'type': task.type,
                    'duration_min': duration_min,
                    'energy': task.energy,
                    'priority': task.priority,
                    'mode': task.mode,
                    'label': task.label,
                    'color': task.color,
                    'preferred_hour': block_start.hour,
                    'preferred_time_of_day': self._get_time_of_day(block_start.hour),
                    'day_of_week': block_start.weekday()  # 0=Monday, 6=Sunday
                })
            except Exception as e:
                print(f"[DEBUG] Error processing block {i}: {e}")
                import traceback
                traceback.print_exc()
                continue
        
        print(f"[DEBUG] Extracted {len(templates)} templates")
        if templates:
            print(f"[DEBUG] Sample template: {templates[0]['title']} at hour {templates[0]['preferred_hour']}, color={templates[0]['color']}")
        return templates
    
    def _get_time_of_day(self, hour: int) -> str:
        """Categorize hour into time of day"""
        if 6 <= hour < 12:
            return 'morning'
        elif 12 <= hour < 17:
            return 'afternoon'
        elif 17 <= hour < 21:
            return 'evening'
        else:
            return 'night'
