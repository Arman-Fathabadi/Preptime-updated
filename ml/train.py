"""
ML training pipeline for slot scoring.

Loads synthetic scenarios, applies labeling logic, trains CatBoost model.
"""

import sys
import json
import random
import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
from sklearn.model_selection import train_test_split
from catboost import CatBoostClassifier, Pool
import warnings
warnings.filterwarnings('ignore')

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))
from ml_service.scheduler import generate_free_slots
from ml_service.scorer import SlotScorer


def parse_datetime(dt_str: str) -> datetime:
    """Parse ISO datetime string."""
    return datetime.fromisoformat(dt_str.replace('Z', '+00:00'))


def compute_heuristic_score(
    task: Dict[str, Any],
    slot: Dict[str, Any],
    events: List[Dict[str, Any]],
    tasks_scheduled_today: int = 0
) -> float:
    """
    Compute heuristic score for a task-slot pair.
    Mirrors the logic in ml_service/scorer.py
    """
    
    score = 0.0
    slot_start = parse_datetime(slot['start'])
    slot_hour = slot_start.hour
    slot_duration = slot['durationMin']
    task_duration = task['durationMin']
    
    # 1. Deadline proximity (weight: 0.3)
    if task.get('dueAt'):
        deadline = parse_datetime(task['dueAt'])
        days_until = (deadline - slot_start).total_seconds() / 86400
        
        if days_until < 0:
            deadline_score = 0.0
        elif days_until < 1:
            deadline_score = 1.0
        elif days_until < 3:
            deadline_score = 0.7
        else:
            deadline_score = 0.3
    else:
        deadline_score = 0.5
    
    score += 0.3 * deadline_score
    
    # 2. Energy alignment (weight: 0.25)
    energy = task['energy']
    if 6 <= slot_hour < 12:  # Morning
        if energy == 'high':
            energy_score = 1.0
        elif energy == 'med':
            energy_score = 0.7
        else:
            energy_score = 0.4
    elif 12 <= slot_hour < 17:  # Afternoon
        if energy == 'med':
            energy_score = 1.0
        elif energy == 'high':
            energy_score = 0.8
        else:
            energy_score = 0.6
    elif 17 <= slot_hour < 22:  # Evening
        if energy == 'low':
            energy_score = 1.0
        elif energy == 'med':
            energy_score = 0.7
        else:
            energy_score = 0.3
    else:  # Late night/early morning
        energy_score = 0.3
    
    score += 0.25 * energy_score
    
    # 3. Uninterrupted time (weight: 0.2)
    buffer = slot_duration - task_duration
    if task['type'] in ['deep', 'study']:
        if buffer >= 30:
            uninterrupted_score = 1.0
        elif buffer >= 15:
            uninterrupted_score = 0.8
        else:
            uninterrupted_score = 0.5
    else:
        uninterrupted_score = 0.7
    
    score += 0.2 * uninterrupted_score
    
    # 4. Post-meeting avoidance (weight: 0.15)
    has_recent_meeting = False
    for event in events:
        if event['kind'] == 'fixed':
            event_end = parse_datetime(event['end'])
            minutes_since = (slot_start - event_end).total_seconds() / 60
            if 0 <= minutes_since <= 30:
                has_recent_meeting = True
                break
    
    if has_recent_meeting:
        if task['type'] in ['deep', 'study']:
            post_meeting_score = 0.2
        else:
            post_meeting_score = 0.6
    else:
        post_meeting_score = 1.0
    
    score += 0.15 * post_meeting_score
    
    # 5. Priority weighting (weight: 0.1)
    priority_score = task['priority'] / 5.0
    score += 0.1 * priority_score
    
    return score


def extract_features(
    task: Dict[str, Any],
    slot: Dict[str, Any],
    events: List[Dict[str, Any]],
    tasks_scheduled_today: int = 0,
    heavy_tasks_today: int = 0,
    total_scheduled_minutes: int = 0
) -> Dict[str, Any]:
    """Extract features for a task-slot pair."""
    
    slot_start = parse_datetime(slot['start'])
    slot_hour = slot_start.hour
    slot_day = slot_start.weekday()
    slot_duration = slot['durationMin']
    task_duration = task['durationMin']
    
    features = {
        # Temporal features
        'slot_hour': slot_hour,
        'slot_day_of_week': slot_day,
        'is_morning': 1 if 6 <= slot_hour < 12 else 0,
        'is_afternoon': 1 if 12 <= slot_hour < 17 else 0,
        'is_evening': 1 if 17 <= slot_hour < 22 else 0,
        
        # Task features
        'task_duration': task_duration,
        'task_priority': task['priority'],
        'task_type_study': 1 if task['type'] == 'study' else 0,
        'task_type_deep': 1 if task['type'] == 'deep' else 0,
        'task_type_admin': 1 if task['type'] == 'admin' else 0,
        'task_type_relax': 1 if task['type'] == 'relax' else 0,
        'task_energy_low': 1 if task['energy'] == 'low' else 0,
        'task_energy_med': 1 if task['energy'] == 'med' else 0,
        'task_energy_high': 1 if task['energy'] == 'high' else 0,
        
        # Slot features
        'slot_duration': slot_duration,
        'buffer_time': slot_duration - task_duration,
        
        # Context features
        'tasks_scheduled_today': tasks_scheduled_today,
        'heavy_tasks_today': heavy_tasks_today,
        'total_scheduled_minutes': total_scheduled_minutes,
    }
    
    # Deadline features
    if task.get('dueAt'):
        deadline = parse_datetime(task['dueAt'])
        days_until = (deadline - slot_start).total_seconds() / 86400
        features['days_until_deadline'] = max(0, days_until)
        features['has_deadline'] = 1
    else:
        features['days_until_deadline'] = 999
        features['has_deadline'] = 0
    
    # Meeting proximity
    has_recent_meeting = False
    minutes_since_meeting = 999
    for event in events:
        if event['kind'] == 'fixed':
            event_end = parse_datetime(event['end'])
            minutes_since = (slot_start - event_end).total_seconds() / 60
            if 0 <= minutes_since <= 30:
                has_recent_meeting = True
                minutes_since_meeting = min(minutes_since_meeting, minutes_since)
    
    features['has_recent_meeting'] = 1 if has_recent_meeting else 0
    features['minutes_since_meeting'] = minutes_since_meeting
    
    return features


def generate_training_data(scenarios: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Generate training data from scenarios.
    
    Returns:
        X: Feature DataFrame
        y: Label Series
    """
    
    all_features = []
    all_labels = []
    
    print("Generating training data...")
    
    for idx, scenario in scenarios.iterrows():
        if (idx + 1) % 100 == 0:
            print(f"  Processed {idx + 1}/{len(scenarios)} scenarios...")
        
        tasks = scenario['tasks']
        events = scenario['events']
        preferences_dict = scenario['preferences']
        
        # Convert preferences dict to Preferences object
        from shared.models import Preferences, Event
        preferences = Preferences(
            slot_step_min=preferences_dict.get('slotStepMin', 30),
            day_start_hour=preferences_dict.get('dayStartHour', 8),
            day_end_hour=preferences_dict.get('dayEndHour', 22),
            buffer_min=preferences_dict.get('bufferMin', 10),
            max_heavy_per_day=preferences_dict.get('maxHeavyPerDay', 3)
        )
        
        # Convert events dicts to Event objects
        event_objects = [
            Event(
                id=e.get('id', f"event_{i}"),
                title=e.get('title', 'Event'),
                start=e['start'],
                end=e['end'],
                kind=e.get('kind', 'fixed')  # Default to 'fixed' if not specified
            )
            for i, e in enumerate(events)
        ]
        
        # Generate free slots with date range
        try:
            # Calculate date range from tasks and events
            all_dates = []
            
            # Get dates from tasks
            for task in tasks:
                if task.get('dueAt'):
                    due_date = datetime.fromisoformat(task['dueAt'].replace('Z', '+00:00'))
                    all_dates.append(due_date)
            
            # Get dates from events
            for event in event_objects:
                event_start = datetime.fromisoformat(event.start.replace('Z', '+00:00'))
                event_end = datetime.fromisoformat(event.end.replace('Z', '+00:00'))
                all_dates.append(event_start)
                all_dates.append(event_end)
            
            # If no dates found, use a default 7-day range
            if not all_dates:
                start_date = datetime.now()
                end_date = start_date + timedelta(days=7)
            else:
                start_date = min(all_dates)
                end_date = max(all_dates)
                # Ensure at least 1 day range
                if end_date <= start_date:
                    end_date = start_date + timedelta(days=1)
            
            date_range = (start_date, end_date)
            slot_objects = generate_free_slots(event_objects, preferences, date_range)
            
            # Convert Slot objects to dictionaries for compatibility
            slots = []
            for slot_obj in slot_objects:
                slots.append({
                    'start': slot_obj.start.isoformat(),
                    'end': slot_obj.end.isoformat(),
                    'durationMin': slot_obj.duration_min
                })
        except Exception as e:
            print(f"  Warning: Failed to generate slots for scenario {idx}: {e}")
            continue
        
        # For each task, score all valid slots
        for task in tasks:
            for slot in slots:
                # Check if slot can fit task
                if slot['durationMin'] < task['durationMin']:
                    continue
                
                # Compute heuristic score
                score = compute_heuristic_score(task, slot, events)
                
                # Add noise to simulate real-world variation
                noisy_score = score + random.gauss(0, 0.1)
                noisy_score = max(0, min(1, noisy_score))
                
                # Generate binary label (threshold at 0.6)
                label = 1 if noisy_score >= 0.6 else 0
                
                # Extract features
                features = extract_features(task, slot, events)
                
                all_features.append(features)
                all_labels.append(label)
    
    X = pd.DataFrame(all_features)
    y = pd.Series(all_labels)
    
    print(f"\nGenerated {len(X)} training examples")
    print(f"  Positive examples: {y.sum()} ({y.mean()*100:.1f}%)")
    print(f"  Negative examples: {len(y) - y.sum()} ({(1-y.mean())*100:.1f}%)")
    
    return X, y


def train_model(X: pd.DataFrame, y: pd.Series) -> CatBoostClassifier:
    """Train CatBoost model with cross-validation."""
    
    print("\nSplitting data (80/20 train/test)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"  Train: {len(X_train)} examples")
    print(f"  Test: {len(X_test)} examples")
    
    print("\nTraining CatBoost model...")
    model = CatBoostClassifier(
        iterations=500,
        learning_rate=0.1,
        depth=6,
        loss_function='Logloss',
        eval_metric='Accuracy',
        random_seed=42,
        verbose=100,
        early_stopping_rounds=50,
    )
    
    model.fit(
        X_train, y_train,
        eval_set=(X_test, y_test),
        use_best_model=True,
    )
    
    # Evaluate
    train_acc = model.score(X_train, y_train)
    test_acc = model.score(X_test, y_test)
    
    print(f"\n[OK] Training complete!")
    print(f"  Train accuracy: {train_acc:.4f}")
    print(f"  Test accuracy: {test_acc:.4f}")
    
    # Feature importance
    feature_importance = model.get_feature_importance()
    feature_names = X.columns
    importance_df = pd.DataFrame({
        'feature': feature_names,
        'importance': feature_importance
    }).sort_values('importance', ascending=False)
    
    print(f"\nTop 10 most important features:")
    for i, row in importance_df.head(10).iterrows():
        print(f"  {row['feature']}: {row['importance']:.2f}")
    
    return model


def save_model(model: CatBoostClassifier, output_path: str = "ml/model/slot_scorer.cbm"):
    """Save trained model."""
    
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    model.save_model(str(output_file))
    print(f"\n[OK] Model saved to {output_file}")
    print(f"  File size: {output_file.stat().st_size / 1024:.2f} KB")


if __name__ == "__main__":
    print("=" * 60)
    print("PrepTime ML Training Pipeline")
    print("=" * 60)
    
    # Load scenarios
    print("\nLoading scenarios...")
    scenarios_path = Path("ml/data/scenarios.parquet")
    if not scenarios_path.exists():
        print(f"Error: {scenarios_path} not found!")
        print("Run: python -m ml.scenario_generator")
        sys.exit(1)
    
    scenarios = pd.read_parquet(scenarios_path)
    print(f"[OK] Loaded {len(scenarios)} scenarios")
    
    # Generate training data
    X, y = generate_training_data(scenarios)
    
    # Train model
    model = train_model(X, y)
    
    # Save model
    save_model(model)
    
    print("\n" + "=" * 60)
    print("Training complete! 🎉")
    print("=" * 60)
