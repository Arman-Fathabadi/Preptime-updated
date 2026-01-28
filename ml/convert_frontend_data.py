"""
Convert frontend exported data to ML training format
Processes JSON/CSV exports from the web app into training scenarios
"""

import json
import csv
import pandas as pd
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any
import sys


def load_json_export(filepath: str) -> List[Dict[str, Any]]:
    """Load JSON export from frontend"""
    with open(filepath, 'r') as f:
        sessions = json.load(f)
    return sessions


def load_csv_export(filepath: str) -> pd.DataFrame:
    """Load CSV export from frontend"""
    return pd.read_csv(filepath)


def convert_json_to_scenarios(sessions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Convert frontend sessions to ML training scenarios
    Each scenario represents a day's worth of scheduling decisions
    """
    scenarios = []
    
    for session in sessions:
        # Group events by date
        events_by_date = {}
        
        for event in session['events']:
            if event['eventType'] != 'task_created':
                continue  # Only use creation events for training
                
            date = event['taskData']['date']
            if date not in events_by_date:
                events_by_date[date] = []
            events_by_date[date].append(event)
        
        # Create a scenario for each date
        for date, events in events_by_date.items():
            if len(events) < 2:  # Need at least 2 tasks for meaningful training
                continue
                
            tasks = []
            for event in events:
                task_data = event['taskData']
                context = event['context']
                
                tasks.append({
                    'name': task_data['title'],
                    'duration': task_data['duration'],
                    'priority': 'high' if context['timeOfDay'] in ['morning', 'afternoon'] else 'medium',
                    'category': task_data.get('label', 'general'),
                    'preferred_time': task_data['startHour'],
                    'actual_start': task_data['startHour'],
                    'actual_end': task_data['endHour'],
                })
            
            # Extract constraints from context
            first_event = events[0]
            context = first_event['context']
            
            scenario = {
                'date': date,
                'day_of_week': first_event['taskData']['dayOfWeek'],
                'is_weekend': context['isWeekend'],
                'tasks': tasks,
                'constraints': {
                    'work_hours_start': 9,
                    'work_hours_end': 17,
                    'min_break_duration': 0.5,
                    'max_tasks_per_day': len(tasks),
                },
                'metadata': {
                    'session_id': session['sessionId'],
                    'total_tasks_week': context['totalTasksThisWeek'],
                    'source': 'frontend_export',
                }
            }
            
            scenarios.append(scenario)
    
    return scenarios


def convert_csv_to_scenarios(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """Convert CSV export to ML training scenarios"""
    scenarios = []
    
    # Group by session and date
    for (session_id, date), group in df.groupby(['session_id', 'timestamp']):
        # Extract date from timestamp
        date_str = pd.to_datetime(group['timestamp'].iloc[0]).strftime('%Y-%m-%d')
        
        # Filter only task creation events
        created_tasks = group[group['event_type'] == 'task_created']
        
        if len(created_tasks) < 2:
            continue
        
        tasks = []
        for _, row in created_tasks.iterrows():
            tasks.append({
                'name': row['task_title'],
                'duration': row['duration'],
                'priority': 'high' if row['time_of_day'] in ['morning', 'afternoon'] else 'medium',
                'category': row['task_label'] if pd.notna(row['task_label']) else 'general',
                'preferred_time': row['start_hour'],
                'actual_start': row['start_hour'],
                'actual_end': row['end_hour'],
            })
        
        scenario = {
            'date': date_str,
            'day_of_week': int(created_tasks['day_of_week'].iloc[0]),
            'is_weekend': bool(created_tasks['is_weekend'].iloc[0]),
            'tasks': tasks,
            'constraints': {
                'work_hours_start': 9,
                'work_hours_end': 17,
                'min_break_duration': 0.5,
                'max_tasks_per_day': len(tasks),
            },
            'metadata': {
                'session_id': session_id,
                'total_tasks_week': int(created_tasks['total_tasks_week'].iloc[0]),
                'source': 'frontend_export',
            }
        }
        
        scenarios.append(scenario)
    
    return scenarios


def save_scenarios(scenarios: List[Dict[str, Any]], output_path: str):
    """Save scenarios to JSON file"""
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, 'w') as f:
        json.dump(scenarios, f, indent=2)
    
    print(f"✅ Saved {len(scenarios)} scenarios to {output_path}")


def print_statistics(scenarios: List[Dict[str, Any]]):
    """Print statistics about converted data"""
    total_tasks = sum(len(s['tasks']) for s in scenarios)
    categories = set()
    for s in scenarios:
        for task in s['tasks']:
            categories.add(task['category'])
    
    print("\n📊 Conversion Statistics:")
    print(f"  Total scenarios: {len(scenarios)}")
    print(f"  Total tasks: {total_tasks}")
    print(f"  Avg tasks per scenario: {total_tasks / len(scenarios):.1f}")
    print(f"  Unique categories: {len(categories)}")
    print(f"  Categories: {', '.join(sorted(categories))}")
    
    # Day of week distribution
    dow_counts = {}
    for s in scenarios:
        dow = s['day_of_week']
        dow_counts[dow] = dow_counts.get(dow, 0) + 1
    
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    print("\n  Day distribution:")
    for dow, count in sorted(dow_counts.items()):
        print(f"    {days[dow]}: {count}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python convert_frontend_data.py <input_file> [output_file]")
        print("\nExample:")
        print("  python convert_frontend_data.py preptime_training_data.json")
        print("  python convert_frontend_data.py preptime_training_data.csv ml/data/user_scenarios.json")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else 'ml/data/user_scenarios.json'
    
    print(f"📥 Loading data from {input_file}...")
    
    # Detect file type and convert
    if input_file.endswith('.json'):
        sessions = load_json_export(input_file)
        scenarios = convert_json_to_scenarios(sessions)
    elif input_file.endswith('.csv'):
        df = load_csv_export(input_file)
        scenarios = convert_csv_to_scenarios(df)
    else:
        print("❌ Error: File must be .json or .csv")
        sys.exit(1)
    
    if not scenarios:
        print("⚠️  No valid scenarios found in the data")
        sys.exit(1)
    
    # Print statistics
    print_statistics(scenarios)
    
    # Save converted data
    save_scenarios(scenarios, output_file)
    
    print(f"\n✨ Ready to train! Run: python ml/train.py --data {output_file}")


if __name__ == '__main__':
    main()
