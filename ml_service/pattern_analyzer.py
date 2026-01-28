"""
Pattern Analysis Module
Analyzes user's Week 1 schedule to extract behavioral patterns
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from collections import defaultdict, Counter
from shared.models import Task, Event, ScheduledBlock
import statistics


class SchedulePattern:
    """Represents extracted patterns from user's Week 1 schedule"""
    
    def __init__(self):
        self.work_hours_start: int = 9
        self.work_hours_end: int = 17
        self.preferred_break_duration: int = 15
        self.task_type_distribution: Dict[str, float] = {}
        self.energy_patterns: Dict[str, List[int]] = {}  # time_of_day -> [hours]
        self.avg_tasks_per_day: float = 0
        self.avg_deep_work_duration: int = 0
        self.preferred_task_clustering: bool = False
        self.break_frequency_minutes: int = 90
        self.task_categories: List[str] = []
        self.peak_productivity_hours: List[int] = []
        self.low_energy_hours: List[int] = []


class PatternAnalyzer:
    """Analyzes Week 1 schedule to extract user patterns"""
    
    def analyze_week(
        self,
        scheduled_blocks: List[ScheduledBlock],
        tasks: List[Task],
        events: List[Event]
    ) -> SchedulePattern:
        """
        Analyze Week 1 schedule to extract patterns.
        
        Args:
            scheduled_blocks: User's scheduled tasks for Week 1
            tasks: All tasks from Week 1
            events: All events from Week 1
            
        Returns:
            SchedulePattern object with extracted patterns
        """
        pattern = SchedulePattern()
        
        if not scheduled_blocks:
            return self._default_pattern()
        
        # Create task lookup
        task_map = {task.id: task for task in tasks}
        
        # Analyze work hours
        pattern.work_hours_start, pattern.work_hours_end = self._analyze_work_hours(
            scheduled_blocks
        )
        
        # Analyze task type distribution
        pattern.task_type_distribution = self._analyze_task_types(
            scheduled_blocks, task_map
        )
        
        # Analyze energy patterns (when user schedules high-energy tasks)
        pattern.energy_patterns = self._analyze_energy_patterns(
            scheduled_blocks, task_map
        )
        
        # Analyze tasks per day
        pattern.avg_tasks_per_day = self._analyze_tasks_per_day(scheduled_blocks)
        
        # Analyze deep work duration
        pattern.avg_deep_work_duration = self._analyze_deep_work_duration(
            scheduled_blocks, task_map
        )
        
        # Analyze break patterns
        pattern.break_frequency_minutes = self._analyze_break_frequency(
            scheduled_blocks, events
        )
        
        # Analyze task clustering (do tasks of same type cluster together?)
        pattern.preferred_task_clustering = self._analyze_task_clustering(
            scheduled_blocks, task_map
        )
        
        # Extract task categories
        pattern.task_categories = self._extract_categories(tasks)
        
        # Identify peak productivity hours
        pattern.peak_productivity_hours = self._identify_peak_hours(
            scheduled_blocks, task_map
        )
        
        # Identify low energy hours
        pattern.low_energy_hours = self._identify_low_energy_hours(
            scheduled_blocks, task_map
        )
        
        return pattern
    
    def _analyze_work_hours(self, blocks: List[ScheduledBlock]) -> tuple[int, int]:
        """Determine user's preferred work hours from scheduled blocks"""
        start_hours = []
        end_hours = []
        
        for block in blocks:
            start = datetime.fromisoformat(block.start.replace('Z', '+00:00'))
            end = datetime.fromisoformat(block.end.replace('Z', '+00:00'))
            start_hours.append(start.hour)
            end_hours.append(end.hour)
        
        # Use median to avoid outliers
        work_start = int(statistics.median(start_hours)) if start_hours else 9
        work_end = int(statistics.median(end_hours)) if end_hours else 17
        
        # Ensure reasonable bounds
        work_start = max(6, min(work_start, 10))
        work_end = max(17, min(work_end, 22))
        
        return work_start, work_end
    
    def _analyze_task_types(
        self,
        blocks: List[ScheduledBlock],
        task_map: Dict[str, Task]
    ) -> Dict[str, float]:
        """Calculate distribution of task types"""
        type_counts = Counter()
        
        for block in blocks:
            task_id = getattr(block, 'taskId', None) or block.task_id
            task = task_map.get(task_id)
            if task:
                type_counts[task.type] += 1
        
        total = sum(type_counts.values())
        if total == 0:
            return {"deep": 0.3, "study": 0.3, "admin": 0.2, "relax": 0.2}
        
        return {
            task_type: count / total
            for task_type, count in type_counts.items()
        }
    
    def _analyze_energy_patterns(
        self,
        blocks: List[ScheduledBlock],
        task_map: Dict[str, Task]
    ) -> Dict[str, List[int]]:
        """Identify when user schedules high/med/low energy tasks"""
        energy_hours = defaultdict(list)
        
        for block in blocks:
            task_id = getattr(block, 'taskId', None) or block.task_id
            task = task_map.get(task_id)
            if task:
                start = datetime.fromisoformat(block.start.replace('Z', '+00:00'))
                energy_hours[task.energy].append(start.hour)
        
        return dict(energy_hours)
    
    def _analyze_tasks_per_day(self, blocks: List[ScheduledBlock]) -> float:
        """Calculate average tasks per day"""
        days = defaultdict(int)
        
        for block in blocks:
            start = datetime.fromisoformat(block.start.replace('Z', '+00:00'))
            day_key = start.date()
            days[day_key] += 1
        
        if not days:
            return 5.0
        
        return statistics.mean(days.values())
    
    def _analyze_deep_work_duration(
        self,
        blocks: List[ScheduledBlock],
        task_map: Dict[str, Task]
    ) -> int:
        """Calculate average deep work session duration"""
        deep_work_durations = []
        
        for block in blocks:
            task_id = getattr(block, 'taskId', None) or block.task_id
            task = task_map.get(task_id)
            if task and task.type in ["deep", "study"]:
                deep_work_durations.append(task.duration_min)
        
        if not deep_work_durations:
            return 60  # Default 1 hour
        
        return int(statistics.mean(deep_work_durations))
    
    def _analyze_break_frequency(
        self,
        blocks: List[ScheduledBlock],
        events: List[Event]
    ) -> int:
        """Analyze how often user takes breaks"""
        # Sort blocks by start time
        sorted_blocks = sorted(
            blocks,
            key=lambda b: datetime.fromisoformat(b.start.replace('Z', '+00:00'))
        )
        
        gaps = []
        for i in range(len(sorted_blocks) - 1):
            end1 = datetime.fromisoformat(sorted_blocks[i].end.replace('Z', '+00:00'))
            start2 = datetime.fromisoformat(sorted_blocks[i + 1].start.replace('Z', '+00:00'))
            
            gap_minutes = (start2 - end1).total_seconds() / 60
            if 5 <= gap_minutes <= 60:  # Consider gaps between 5-60 min as breaks
                gaps.append(gap_minutes)
        
        if not gaps:
            return 90  # Default: break every 90 minutes (Pomodoro-ish)
        
        return int(statistics.mean(gaps))
    
    def _analyze_task_clustering(
        self,
        blocks: List[ScheduledBlock],
        task_map: Dict[str, Task]
    ) -> bool:
        """Check if user clusters similar tasks together"""
        sorted_blocks = sorted(
            blocks,
            key=lambda b: datetime.fromisoformat(b.start.replace('Z', '+00:00'))
        )
        
        if len(sorted_blocks) < 3:
            return False
        
        # Count consecutive same-type tasks
        consecutive_same = 0
        total_transitions = 0
        
        for i in range(len(sorted_blocks) - 1):
            task_id1 = getattr(sorted_blocks[i], 'taskId', None) or sorted_blocks[i].task_id
            task_id2 = getattr(sorted_blocks[i + 1], 'taskId', None) or sorted_blocks[i + 1].task_id
            task1 = task_map.get(task_id1)
            task2 = task_map.get(task_id2)
            
            if task1 and task2:
                total_transitions += 1
                if task1.type == task2.type:
                    consecutive_same += 1
        
        if total_transitions == 0:
            return False
        
        # If >50% of transitions are same-type, user prefers clustering
        return (consecutive_same / total_transitions) > 0.5
    
    def _extract_categories(self, tasks: List[Task]) -> List[str]:
        """Extract unique task categories/types"""
        categories = set()
        for task in tasks:
            categories.add(task.type)
        return list(categories)
    
    def _identify_peak_hours(
        self,
        blocks: List[ScheduledBlock],
        task_map: Dict[str, Task]
    ) -> List[int]:
        """Identify hours when user schedules high-priority or deep work tasks"""
        hour_scores = defaultdict(float)
        
        for block in blocks:
            task_id = getattr(block, 'taskId', None) or block.task_id
            task = task_map.get(task_id)
            if task:
                start = datetime.fromisoformat(block.start.replace('Z', '+00:00'))
                hour = start.hour
                
                # Score based on priority and task type
                score = task.priority
                if task.type in ["deep", "study"]:
                    score += 2
                
                hour_scores[hour] += score
        
        if not hour_scores:
            return [9, 10, 11]  # Default morning hours
        
        # Return top 3 hours
        sorted_hours = sorted(hour_scores.items(), key=lambda x: x[1], reverse=True)
        return [hour for hour, _ in sorted_hours[:3]]
    
    def _identify_low_energy_hours(
        self,
        blocks: List[ScheduledBlock],
        task_map: Dict[str, Task]
    ) -> List[int]:
        """Identify hours when user schedules low-energy or relax tasks"""
        low_energy_hours = []
        
        for block in blocks:
            task_id = getattr(block, 'taskId', None) or block.task_id
            task = task_map.get(task_id)
            if task and (task.energy == "low" or task.type == "relax"):
                start = datetime.fromisoformat(block.start.replace('Z', '+00:00'))
                low_energy_hours.append(start.hour)
        
        if not low_energy_hours:
            return [14, 20, 21]  # Default: post-lunch and evening
        
        # Return most common low-energy hours
        hour_counts = Counter(low_energy_hours)
        return [hour for hour, _ in hour_counts.most_common(3)]
    
    def _default_pattern(self) -> SchedulePattern:
        """Return default pattern when no data available"""
        pattern = SchedulePattern()
        pattern.work_hours_start = 9
        pattern.work_hours_end = 17
        pattern.task_type_distribution = {
            "deep": 0.3,
            "study": 0.3,
            "admin": 0.2,
            "relax": 0.2
        }
        pattern.avg_tasks_per_day = 5
        pattern.avg_deep_work_duration = 60
        pattern.break_frequency_minutes = 90
        pattern.peak_productivity_hours = [9, 10, 11]
        pattern.low_energy_hours = [14, 20, 21]
        return pattern
