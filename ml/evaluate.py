"""
Model evaluation script.

Loads trained model and evaluates on test scenarios.
Generates metrics, confusion matrix, and example predictions.
"""

import sys
import json
import random
import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime, timedelta
from catboost import CatBoostClassifier

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))
from ml_service.scheduler import generate_free_slots
from shared.models import Preferences, Event


def load_model(model_path: Path) -> CatBoostClassifier:
    """Load trained CatBoost model."""
    model = CatBoostClassifier()
    model.load_model(str(model_path))
    return model


def extract_features(task: dict, slot: dict, events: list) -> dict:
    """
    Extract features from task-slot pair.
    Must match feature extraction in train.py exactly.
    """
    # Parse slot time
    slot_start = datetime.fromisoformat(slot['start'].replace('Z', '+00:00'))
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
        'task_priority': task.get('priority', 3),
        'task_type_study': 1 if task.get('type') == 'study' else 0,
        'task_type_deep': 1 if task.get('type') == 'deep' else 0,
        'task_type_admin': 1 if task.get('type') == 'admin' else 0,
        'task_type_relax': 1 if task.get('type') == 'relax' else 0,
        'task_energy_low': 1 if task.get('energy') == 'low' else 0,
        'task_energy_med': 1 if task.get('energy') == 'med' else 0,
        'task_energy_high': 1 if task.get('energy') == 'high' else 0,
        
        # Slot features
        'slot_duration': slot_duration,
        'buffer_time': slot_duration - task_duration,
        
        # Context features (simplified for evaluation)
        'tasks_scheduled_today': 0,
        'heavy_tasks_today': 0,
        'total_scheduled_minutes': 0,
    }
    
    # Deadline features
    if task.get('dueAt'):
        deadline = datetime.fromisoformat(task['dueAt'].replace('Z', '+00:00'))
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
        if event.get('kind') == 'fixed':
            event_end = datetime.fromisoformat(event['end'].replace('Z', '+00:00'))
            minutes_since = (slot_start - event_end).total_seconds() / 60
            if 0 <= minutes_since <= 30:
                has_recent_meeting = True
                minutes_since_meeting = min(minutes_since_meeting, minutes_since)
    
    features['has_recent_meeting'] = 1 if has_recent_meeting else 0
    features['minutes_since_meeting'] = minutes_since_meeting
    
    return features


def evaluate_on_scenarios(
    model: CatBoostClassifier,
    scenarios: pd.DataFrame,
    num_scenarios: int = 100
) -> dict:
    """
    Evaluate model on test scenarios.
    
    Returns metrics and example predictions.
    """
    print(f"\nEvaluating on {num_scenarios} scenarios...")
    
    # Sample scenarios
    test_scenarios = scenarios.sample(n=min(num_scenarios, len(scenarios)), random_state=42)
    
    all_predictions = []
    all_labels = []
    example_predictions = []
    
    for idx, scenario in test_scenarios.iterrows():
        if (len(all_predictions) + 1) % 20 == 0:
            print(f"  Processed {len(all_predictions) + 1}/{num_scenarios} scenarios...")
        
        tasks = scenario['tasks']
        events = scenario['events']
        preferences_dict = scenario['preferences']
        
        # Convert preferences dict to Preferences object
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
                kind=e.get('kind', 'fixed')
            )
            for i, e in enumerate(events)
        ]
        
        # Generate free slots with date range
        try:
            # Calculate date range
            all_dates = []
            for task in tasks:
                if task.get('dueAt'):
                    due_date = datetime.fromisoformat(task['dueAt'].replace('Z', '+00:00'))
                    all_dates.append(due_date)
            for event in event_objects:
                event_start = datetime.fromisoformat(event.start.replace('Z', '+00:00'))
                event_end = datetime.fromisoformat(event.end.replace('Z', '+00:00'))
                all_dates.append(event_start)
                all_dates.append(event_end)
            
            if not all_dates:
                start_date = datetime.now()
                end_date = start_date + timedelta(days=7)
            else:
                start_date = min(all_dates)
                end_date = max(all_dates)
                if end_date <= start_date:
                    end_date = start_date + timedelta(days=1)
            
            date_range = (start_date, end_date)
            slot_objects = generate_free_slots(event_objects, preferences, date_range)
            
            # Convert Slot objects to dictionaries
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
        
        # For each task, find best slot according to model
        for task in tasks[:3]:  # Limit to first 3 tasks per scenario
            valid_slots = [s for s in slots if s['durationMin'] >= task['durationMin']]
            
            if not valid_slots:
                continue
            
            # Extract features for all valid slots
            slot_features = []
            for slot in valid_slots:
                features = extract_features(task, slot, events)
                slot_features.append(features)
            
            if not slot_features:
                continue
            
            # Convert to DataFrame
            X = pd.DataFrame(slot_features)
            
            # Predict probabilities
            probs = model.predict_proba(X)[:, 1]
            
            # Find best slot
            best_idx = np.argmax(probs)
            best_slot = valid_slots[best_idx]
            best_prob = probs[best_idx]
            
            # Store prediction
            all_predictions.append(best_prob)
            all_labels.append(1 if best_prob >= 0.6 else 0)
            
            # Save example
            if len(example_predictions) < 10:
                example_predictions.append({
                    'task': {
                        'title': task.get('title', 'Task'),
                        'duration': task['durationMin'],
                        'type': task.get('type', 'admin'),
                        'priority': task.get('priority', 3),
                        'dueAt': task.get('dueAt')
                    },
                    'best_slot': {
                        'start': best_slot['start'],
                        'duration': best_slot['durationMin']
                    },
                    'confidence': float(best_prob)
                })
    
    # Compute metrics
    predictions_array = np.array(all_predictions)
    labels_array = np.array(all_labels)
    
    # Threshold at 0.6
    binary_preds = (predictions_array >= 0.6).astype(int)
    
    # Accuracy
    accuracy = np.mean(binary_preds == labels_array)
    
    # Precision, Recall, F1
    tp = np.sum((binary_preds == 1) & (labels_array == 1))
    fp = np.sum((binary_preds == 1) & (labels_array == 0))
    fn = np.sum((binary_preds == 0) & (labels_array == 1))
    tn = np.sum((binary_preds == 0) & (labels_array == 0))
    
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
    
    return {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1': f1,
        'confusion_matrix': {
            'tp': int(tp),
            'fp': int(fp),
            'fn': int(fn),
            'tn': int(tn)
        },
        'num_predictions': len(all_predictions),
        'example_predictions': example_predictions
    }


def main():
    print("=" * 60)
    print("PrepTime ML Model Evaluation")
    print("=" * 60)
    
    # Paths
    model_path = Path(__file__).parent / "model" / "slot_scorer.cbm"
    scenarios_path = Path(__file__).parent / "data" / "scenarios.parquet"
    output_path = Path(__file__).parent / "artifacts" / "evaluation_results.json"
    
    # Create artifacts directory
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Load model
    print("\nLoading model...")
    if not model_path.exists():
        print(f"Error: Model not found at {model_path}")
        print("Run 'python -m ml.train' first to train the model.")
        return
    
    model = load_model(model_path)
    print(f"[OK] Loaded model from {model_path}")
    
    # Load scenarios
    print("\nLoading scenarios...")
    if not scenarios_path.exists():
        print(f"Error: Scenarios not found at {scenarios_path}")
        print("Run 'python -m ml.scenario_generator' first to generate scenarios.")
        return
    
    scenarios = pd.read_parquet(scenarios_path)
    print(f"[OK] Loaded {len(scenarios)} scenarios")
    
    # Evaluate
    results = evaluate_on_scenarios(model, scenarios, num_scenarios=100)
    
    # Print results
    print("\n" + "=" * 60)
    print("Evaluation Results")
    print("=" * 60)
    print(f"\nOverall Metrics:")
    print(f"  Accuracy:  {results['accuracy']:.4f}")
    print(f"  Precision: {results['precision']:.4f}")
    print(f"  Recall:    {results['recall']:.4f}")
    print(f"  F1 Score:  {results['f1']:.4f}")
    
    print(f"\nConfusion Matrix:")
    cm = results['confusion_matrix']
    print(f"  True Positives:  {cm['tp']}")
    print(f"  False Positives: {cm['fp']}")
    print(f"  True Negatives:  {cm['tn']}")
    print(f"  False Negatives: {cm['fn']}")
    
    print(f"\nTotal Predictions: {results['num_predictions']}")
    
    print(f"\nExample Predictions:")
    for i, example in enumerate(results['example_predictions'][:5], 1):
        task = example['task']
        slot = example['best_slot']
        print(f"\n  {i}. {task['title']}")
        print(f"     Type: {task['type']}, Priority: {task['priority']}, Duration: {task['duration']}min")
        if task['dueAt']:
            print(f"     Due: {task['dueAt']}")
        print(f"     Best Slot: {slot['start']} ({slot['duration']}min)")
        print(f"     Confidence: {example['confidence']:.2%}")
    
    # Save results
    with open(output_path, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n[OK] Results saved to {output_path}")
    print(f"  File size: {output_path.stat().st_size / 1024:.2f} KB")
    
    print("\n" + "=" * 60)
    print("Evaluation complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
