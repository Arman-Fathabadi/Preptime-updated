"""
Slot scoring logic for the intelligent scheduler.
"""

from datetime import datetime
from typing import Optional
from shared.models import Task
from ml_service.scheduler import Slot


class SchedulingContext:
    """Context information for scoring a task-slot pair."""
    
    def __init__(
        self,
        minutes_since_last_meeting: Optional[int] = None,
        minutes_until_next_meeting: Optional[int] = None,
        heavy_tasks_scheduled_today: int = 0,
        total_scheduled_duration_today: int = 0,
        slot_utilization_ratio: float = 0.0
    ):
        self.minutes_since_last_meeting = minutes_since_last_meeting
        self.minutes_until_next_meeting = minutes_until_next_meeting
        self.heavy_tasks_scheduled_today = heavy_tasks_scheduled_today
        self.total_scheduled_duration_today = total_scheduled_duration_today
        self.slot_utilization_ratio = slot_utilization_ratio


class SlotScorer:
    """
    Scores task-slot pairs using heuristic rules or ML model.
    """
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize the slot scorer.
        
        Args:
            model_path: Optional path to trained ML model. If None, uses heuristic scoring.
        """
        self.model = None
        if model_path:
            self.model = self._load_model(model_path)
    
    def _load_model(self, model_path: str):
        """
        Load trained model from disk.
        
        Args:
            model_path: Path to the model file
            
        Returns:
            Loaded model object (to be implemented when ML training is ready)
        """
        # TODO: Implement model loading when ML training pipeline is complete
        # For now, return None to use heuristic scoring
        return None
    
    def score(
        self,
        task: Task,
        slot: Slot,
        context: Optional[SchedulingContext] = None
    ) -> float:
        """
        Score a task-slot pair.
        
        Args:
            task: The task to be scheduled
            slot: The slot where the task would be placed
            context: Optional scheduling context for additional scoring factors
            
        Returns:
            Score between 0 and 1 (higher is better)
        """
        if self.model:
            return self._ml_score(task, slot, context)
        else:
            return self._heuristic_score(task, slot, context)
    
    def _heuristic_score(
        self,
        task: Task,
        slot: Slot,
        context: Optional[SchedulingContext] = None
    ) -> float:
        """
        Calculate heuristic score for a task-slot pair.
        
        Scoring rules:
        1. Deadline proximity: higher score for slots closer to deadline
        2. Energy alignment: match task energy to time of day
        3. Uninterrupted time: prefer longer slots for deep work
        4. Post-meeting avoidance: penalize slots immediately after meetings
        5. Priority weighting: multiply score by task priority
        
        Args:
            task: The task to be scheduled
            slot: The slot where the task would be placed
            context: Optional scheduling context
            
        Returns:
            Score value (higher is better)
        """
        if context is None:
            context = SchedulingContext()
        
        score = 0.0
        
        # 1. Deadline proximity (0-1 points)
        if task.due_at:
            deadline = datetime.fromisoformat(task.due_at.replace('Z', '+00:00'))
            time_until_deadline = (deadline - slot.start).total_seconds() / 3600  # hours
            
            if time_until_deadline > 0:
                # Closer to deadline = higher score
                # Use exponential decay: score decreases as time increases
                # Max score at 0 hours, approaches 0 as time increases
                deadline_score = 1.0 / (1.0 + time_until_deadline / 24.0)  # Normalize by days
                score += deadline_score
            else:
                # Past deadline - very low score
                score += 0.1
        else:
            # No deadline - neutral score
            score += 0.5
        
        # 2. Energy alignment (0-1 points)
        slot_hour = slot.start.hour
        
        # Define time of day energy levels
        # Morning (6-12): high energy
        # Afternoon (12-18): medium energy
        # Evening (18-24): low energy
        # Night (0-6): low energy
        
        if 6 <= slot_hour < 12:
            time_energy = "high"
        elif 12 <= slot_hour < 18:
            time_energy = "med"
        else:
            time_energy = "low"
        
        # Match task energy to time energy
        if task.energy == time_energy:
            energy_score = 1.0
        elif (task.energy == "high" and time_energy == "med") or \
             (task.energy == "med" and time_energy == "high") or \
             (task.energy == "med" and time_energy == "low") or \
             (task.energy == "low" and time_energy == "med"):
            energy_score = 0.5
        else:
            energy_score = 0.2
        
        score += energy_score
        
        # 2.5. Time window preference (0-1 points)
        # If task has a preferred time window, boost score for slots in that window
        if task.window:
            window_start = task.window.get('startHour', 0)
            window_end = task.window.get('endHour', 24)
            task_start_hour = slot.start.hour + slot.start.minute / 60.0
            task_end_hour = task_start_hour + (task.duration_min / 60.0)
            
            # Check if task fits perfectly in window
            if window_start <= task_start_hour and task_end_hour <= window_end:
                # Boost score significantly for matching preferred time
                window_score = 1.5
            else:
                window_score = 0.0
            
            score += window_score
        
        # 3. Uninterrupted time (0-1 points)
        # Prefer longer slots for deep work tasks
        if task.type in ["deep", "study"]:
            # Calculate how much extra time is available
            extra_time = slot.duration_min - task.duration_min
            
            if extra_time >= 60:
                uninterrupted_score = 1.0
            elif extra_time >= 30:
                uninterrupted_score = 0.7
            elif extra_time >= 15:
                uninterrupted_score = 0.4
            else:
                uninterrupted_score = 0.2
            
            score += uninterrupted_score
        else:
            # For non-deep work, exact fit is fine
            score += 0.5
        
        # 4. Post-meeting avoidance (0-1 points)
        if context.minutes_since_last_meeting is not None:
            if context.minutes_since_last_meeting < 15:
                # Very recent meeting - penalize heavily
                meeting_score = 0.2
            elif context.minutes_since_last_meeting < 30:
                # Recent meeting - penalize moderately
                meeting_score = 0.5
            else:
                # Sufficient buffer - no penalty
                meeting_score = 1.0
            
            score += meeting_score
        else:
            # No meeting context - neutral score
            score += 0.5
        
        # 5. Priority weighting
        # Multiply total score by priority (1-5)
        # This makes high priority tasks more likely to get good slots
        score *= task.priority
        
        # Normalize to 0-1 range
        # Max possible score before priority: 4.0
        # Max possible score after priority: 4.0 * 5 = 20.0
        normalized_score = score / 20.0
        
        return min(1.0, max(0.0, normalized_score))
    
    def _ml_score(
        self,
        task: Task,
        slot: Slot,
        context: Optional[SchedulingContext] = None
    ) -> float:
        """
        Use ML model to score a task-slot pair.
        
        Args:
            task: The task to be scheduled
            slot: The slot where the task would be placed
            context: Optional scheduling context
            
        Returns:
            Score between 0 and 1 (higher is better)
        """
        # TODO: Implement ML scoring when model is trained
        # For now, fall back to heuristic
        return self._heuristic_score(task, slot, context)
    
    def _extract_features(
        self,
        task: Task,
        slot: Slot,
        context: SchedulingContext
    ) -> dict:
        """
        Extract features for ML model.
        
        Task features:
        - duration_min
        - priority (1-5)
        - energy_level (encoded: low=0, med=1, high=2)
        - type (one-hot: study, deep, admin, relax)
        - mode (one-hot: study, lockin, relax, balanced)
        - has_deadline (bool)
        - hours_until_deadline (if applicable)
        
        Slot features:
        - start_hour (0-23)
        - duration_min
        - day_of_week (0-6)
        - is_morning (bool)
        - is_afternoon (bool)
        - is_evening (bool)
        
        Context features:
        - minutes_since_last_meeting
        - minutes_until_next_meeting
        - heavy_tasks_scheduled_today (count)
        - total_scheduled_duration_today
        - slot_utilization_ratio (scheduled / available)
        
        Args:
            task: The task to be scheduled
            slot: The slot where the task would be placed
            context: Scheduling context
            
        Returns:
            Dictionary of features
        """
        # Task features
        features = {
            'task_duration_min': task.duration_min,
            'task_priority': task.priority,
            'task_energy_low': 1 if task.energy == 'low' else 0,
            'task_energy_med': 1 if task.energy == 'med' else 0,
            'task_energy_high': 1 if task.energy == 'high' else 0,
            'task_type_study': 1 if task.type == 'study' else 0,
            'task_type_deep': 1 if task.type == 'deep' else 0,
            'task_type_admin': 1 if task.type == 'admin' else 0,
            'task_type_relax': 1 if task.type == 'relax' else 0,
            'task_mode_study': 1 if task.mode == 'study' else 0,
            'task_mode_lockin': 1 if task.mode == 'lockin' else 0,
            'task_mode_relax': 1 if task.mode == 'relax' else 0,
            'task_mode_balanced': 1 if task.mode == 'balanced' else 0,
            'task_has_deadline': 1 if task.due_at else 0,
        }
        
        if task.due_at:
            deadline = datetime.fromisoformat(task.due_at.replace('Z', '+00:00'))
            hours_until_deadline = (deadline - slot.start).total_seconds() / 3600
            features['task_hours_until_deadline'] = hours_until_deadline
        else:
            features['task_hours_until_deadline'] = -1
        
        # Slot features
        features['slot_start_hour'] = slot.start.hour
        features['slot_duration_min'] = slot.duration_min
        features['slot_day_of_week'] = slot.start.weekday()
        features['slot_is_morning'] = 1 if 6 <= slot.start.hour < 12 else 0
        features['slot_is_afternoon'] = 1 if 12 <= slot.start.hour < 18 else 0
        features['slot_is_evening'] = 1 if 18 <= slot.start.hour < 24 else 0
        
        # Context features
        features['context_minutes_since_last_meeting'] = context.minutes_since_last_meeting or -1
        features['context_minutes_until_next_meeting'] = context.minutes_until_next_meeting or -1
        features['context_heavy_tasks_today'] = context.heavy_tasks_scheduled_today
        features['context_scheduled_duration_today'] = context.total_scheduled_duration_today
        features['context_slot_utilization'] = context.slot_utilization_ratio
        
        return features
