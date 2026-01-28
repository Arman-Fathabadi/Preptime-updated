"""
Synthetic scenario generator for training ML model.

Generates realistic scheduling scenarios with varied:
- Task characteristics (type, energy, priority, duration)
- Event patterns (normal week, exam week, conflict-heavy)
- Time constraints (deadlines, time windows)
"""

import random
from datetime import datetime, timedelta
from typing import List, Dict, Any
import pandas as pd
from pathlib import Path


def generate_task(
    task_id: int,
    base_date: datetime,
    scenario_type: str = "normal"
) -> Dict[str, Any]:
    """Generate a single random task."""
    
    task_types = ["study", "deep", "admin", "relax"]
    energy_levels = ["low", "med", "high"]
    modes = ["study", "lockin", "relax", "balanced"]
    
    # Adjust distributions based on scenario type
    if scenario_type == "exam":
        # More study tasks, higher priority
        task_type = random.choices(
            task_types,
            weights=[0.5, 0.3, 0.1, 0.1]
        )[0]
        priority = random.choices([3, 4, 5], weights=[0.2, 0.3, 0.5])[0]
    elif scenario_type == "busy":
        # More admin tasks, varied priority
        task_type = random.choices(
            task_types,
            weights=[0.3, 0.2, 0.4, 0.1]
        )[0]
        priority = random.randint(2, 4)
    else:  # normal
        task_type = random.choice(task_types)
        priority = random.randint(1, 5)
    
    # Duration based on task type
    if task_type == "deep":
        duration = random.choice([90, 120, 150, 180])
    elif task_type == "study":
        duration = random.choice([45, 60, 90, 120])
    elif task_type == "admin":
        duration = random.choice([15, 30, 45, 60])
    else:  # relax
        duration = random.choice([30, 45, 60])
    
    # Energy level correlates with task type
    if task_type in ["deep", "study"]:
        energy = random.choices(energy_levels, weights=[0.1, 0.3, 0.6])[0]
    else:
        energy = random.choices(energy_levels, weights=[0.4, 0.4, 0.2])[0]
    
    # Mode correlates with task type
    if task_type == "deep":
        mode = "lockin"
    elif task_type == "study":
        mode = random.choice(["study", "balanced"])
    elif task_type == "relax":
        mode = "relax"
    else:
        mode = "balanced"
    
    # 60% of tasks have deadlines
    due_at = None
    if random.random() < 0.6:
        days_ahead = random.randint(1, 7)
        due_at = (base_date + timedelta(days=days_ahead)).isoformat()
    
    # 30% of tasks have time windows
    window = None
    if random.random() < 0.3:
        start_hour = random.randint(8, 16)
        end_hour = random.randint(start_hour + 2, 22)
        window = {"startHour": start_hour, "endHour": end_hour}
    
    return {
        "id": f"t{task_id}",
        "title": f"Task {task_id}",
        "durationMin": duration,
        "dueAt": due_at,
        "type": task_type,
        "energy": energy,
        "window": window,
        "splittable": random.choice([True, False]),
        "priority": priority,
        "mode": mode,
    }


def generate_event(
    event_id: int,
    base_date: datetime,
    scenario_type: str = "normal"
) -> Dict[str, Any]:
    """Generate a single random event."""
    
    # Event patterns based on scenario type
    if scenario_type == "busy":
        # More meetings
        kind = random.choices(["fixed", "blocked"], weights=[0.8, 0.2])[0]
        duration = random.choice([30, 60, 90])
    else:
        kind = random.choices(["fixed", "blocked"], weights=[0.6, 0.4])[0]
        duration = random.choice([60, 90, 120])
    
    # Random day within week
    day_offset = random.randint(0, 6)
    event_date = base_date + timedelta(days=day_offset)
    
    # Random start time (business hours)
    start_hour = random.randint(9, 17)
    start_time = event_date.replace(hour=start_hour, minute=0, second=0)
    end_time = start_time + timedelta(minutes=duration)
    
    return {
        "id": f"e{event_id}",
        "title": f"Event {event_id}",
        "start": start_time.isoformat(),
        "end": end_time.isoformat(),
        "kind": kind,
    }


def generate_scenario(
    scenario_id: int,
    scenario_type: str = "normal"
) -> Dict[str, Any]:
    """Generate a complete scheduling scenario."""
    
    base_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Number of tasks and events based on scenario type
    if scenario_type == "exam":
        num_tasks = random.randint(15, 25)
        num_events = random.randint(3, 6)
    elif scenario_type == "busy":
        num_tasks = random.randint(10, 20)
        num_events = random.randint(8, 15)
    else:  # normal
        num_tasks = random.randint(10, 20)
        num_events = random.randint(5, 10)
    
    tasks = [
        generate_task(i, base_date, scenario_type)
        for i in range(num_tasks)
    ]
    
    events = [
        generate_event(i, base_date, scenario_type)
        for i in range(num_events)
    ]
    
    # Standard preferences with some variation
    preferences = {
        "dayStartHour": random.choice([7, 8, 9]),
        "dayEndHour": random.choice([21, 22, 23]),
        "slotStepMin": random.choice([15, 30]),
        "bufferMin": random.choice([5, 10, 15]),
        "maxHeavyPerDay": random.choice([2, 3, 4]),
    }
    
    return {
        "scenario_id": scenario_id,
        "scenario_type": scenario_type,
        "tasks": tasks,
        "events": events,
        "preferences": preferences,
    }


def generate_scenarios(n: int = 1000) -> pd.DataFrame:
    """
    Generate N synthetic scenarios for training.
    
    Args:
        n: Number of scenarios to generate
        
    Returns:
        DataFrame with columns: scenario_id, scenario_type, tasks, events, preferences
    """
    
    # Distribution of scenario types
    scenario_types = random.choices(
        ["normal", "exam", "busy"],
        weights=[0.6, 0.2, 0.2],
        k=n
    )
    
    scenarios = []
    for i, scenario_type in enumerate(scenario_types):
        scenario = generate_scenario(i, scenario_type)
        scenarios.append(scenario)
        
        if (i + 1) % 100 == 0:
            print(f"Generated {i + 1}/{n} scenarios...")
    
    df = pd.DataFrame(scenarios)
    print(f"\nGenerated {len(df)} scenarios:")
    print(f"  Normal: {len(df[df['scenario_type'] == 'normal'])}")
    print(f"  Exam: {len(df[df['scenario_type'] == 'exam'])}")
    print(f"  Busy: {len(df[df['scenario_type'] == 'busy'])}")
    
    return df


def save_scenarios(df: pd.DataFrame, output_path: str = "ml/data/scenarios.parquet"):
    """Save scenarios to Parquet file."""
    
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    df.to_parquet(output_file, index=False)
    print(f"\nSaved scenarios to {output_file}")
    print(f"File size: {output_file.stat().st_size / 1024:.2f} KB")


if __name__ == "__main__":
    # Generate 1000 scenarios
    df = generate_scenarios(1000)
    
    # Save to file
    save_scenarios(df)
    
    # Show sample
    print("\nSample scenario:")
    sample = df.iloc[0]
    print(f"  Type: {sample['scenario_type']}")
    print(f"  Tasks: {len(sample['tasks'])}")
    print(f"  Events: {len(sample['events'])}")
    print(f"  First task: {sample['tasks'][0]}")
