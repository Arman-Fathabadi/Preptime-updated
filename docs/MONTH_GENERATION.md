# AI Month Generation Feature

## Overview

The AI Month Generation feature allows users to manually create their schedule for Week 1, then automatically generate Weeks 2-4 based on detected patterns and productivity techniques.

## User Workflow

### Step 1: Create Week 1 Manually
Users fill in their first week with tasks, events, and preferences:
- Add tasks with titles, durations, types, energy levels
- Add fixed events (meetings, appointments)
- Set preferences (work hours, break duration, etc.)
- Schedule at least 5 tasks to enable AI generation

### Step 2: Generate Rest of Month
Once Week 1 is complete, users click **"Generate Rest of Month"** button:
- AI analyzes Week 1 patterns
- Shows preview with detected patterns and applied techniques
- User can review before applying

### Step 3: Review & Apply
Preview shows:
- **Detected Patterns**: Work hours, task distribution, peak hours
- **Applied Techniques**: Pomodoro, time blocking, energy management
- **Statistics**: Number of tasks, blocks, weeks generated
- **Task Distribution**: Visual breakdown by type

User can:
- **Apply to Calendar**: Add generated schedule to their calendar
- **Cancel**: Discard and try again

## Pattern Analysis

The AI analyzes Week 1 to extract:

### 1. Work Hours
- **Start Hour**: When user typically begins work
- **End Hour**: When user typically ends work
- Uses median to avoid outliers

### 2. Task Type Distribution
- Percentage of deep work, study, admin, relax tasks
- Used to generate similar distribution in future weeks

### 3. Energy Patterns
- When user schedules high-energy tasks (morning, afternoon, evening)
- When user schedules low-energy tasks
- Identifies peak productivity hours

### 4. Break Patterns
- How often user takes breaks
- Average break duration
- Gap between consecutive tasks

### 5. Task Clustering
- Does user group similar tasks together?
- Used to apply time blocking technique

### 6. Tasks Per Day
- Average number of tasks scheduled daily
- Used to generate realistic workload

## Productivity Techniques Applied

### 1. Pomodoro Technique
- **25-minute work blocks** for deep work and study tasks
- **5-minute breaks** after each Pomodoro
- Automatically inserted between work sessions
- Prevents burnout and maintains focus

### 2. Time Blocking
- **Groups similar tasks** together if user prefers clustering
- Reduces context switching
- Improves flow state

### 3. Energy Management
- **High-energy tasks** scheduled during peak hours
- **Low-energy tasks** scheduled during low-energy periods
- Matches task demands to natural energy levels

### 4. Break Optimization
- **Regular breaks** based on detected frequency
- Prevents fatigue
- Maintains productivity throughout day

### 5. Task Distribution
- **Balanced workload** across days
- Avoids overloading single days
- Maintains sustainable pace

## Technical Architecture

### Backend Components

#### 1. Pattern Analyzer (`ml_service/pattern_analyzer.py`)
```python
class PatternAnalyzer:
    def analyze_week(
        scheduled_blocks: List[ScheduledBlock],
        tasks: List[Task],
        events: List[Event]
    ) -> SchedulePattern
```

Extracts patterns from Week 1:
- Work hours (start/end)
- Task type distribution
- Energy patterns
- Break frequency
- Task clustering preference
- Peak productivity hours

#### 2. Month Generator (`ml_service/month_generator.py`)
```python
class MonthGenerator:
    def generate_month(
        pattern: SchedulePattern,
        week1_blocks: List[ScheduledBlock],
        week1_tasks: List[Task],
        existing_events: List[Event],
        start_date: datetime,
        preferences: Preferences
    ) -> Dict[str, Any]
```

Generates Weeks 2-4:
- Creates tasks based on patterns
- Applies productivity techniques
- Schedules tasks using greedy algorithm
- Returns generated tasks and scheduled blocks

#### 3. FastAPI Endpoint (`ml_service/main.py`)
```python
@app.post("/generate-month")
async def generate_month(request: GenerateMonthRequest) -> GenerateMonthResponse
```

API endpoint that:
- Receives Week 1 data
- Analyzes patterns
- Generates Weeks 2-4
- Returns results with applied techniques

### Frontend Components

#### 1. Month Generator Button (`web/components/MonthGeneratorButton.tsx`)
React component that:
- Shows "Generate Rest of Month" button
- Validates Week 1 has enough data (≥5 tasks)
- Calls API to generate month
- Shows preview modal with results
- Applies generated schedule on confirmation

#### 2. API Route (`web/pages/api/generate-month.ts`)
Next.js API route that:
- Proxies requests to FastAPI service
- Handles errors gracefully
- Returns generated schedule

## Data Flow

```
User creates Week 1
       ↓
Click "Generate Rest of Month"
       ↓
Frontend → Next.js API → FastAPI Service
       ↓
Pattern Analyzer extracts patterns
       ↓
Month Generator creates Weeks 2-4
       ↓
Apply productivity techniques
       ↓
Schedule tasks using greedy algorithm
       ↓
Return results to frontend
       ↓
Show preview modal
       ↓
User reviews and applies
       ↓
Calendar updated with Weeks 2-4
```

## API Reference

### POST /api/generate-month

**Request:**
```typescript
{
  week1Blocks: ScheduledBlock[];
  week1Tasks: Task[];
  existingEvents: Event[];
  preferences: Preferences;
  startDate: string; // ISO 8601
}
```

**Response:**
```typescript
{
  generatedTasks: Task[];
  scheduledBlocks: ScheduledBlock[];
  appliedTechniques: string[];
  patterns: {
    workHoursStart: number;
    workHoursEnd: number;
    avgTasksPerDay: number;
    taskTypeDistribution: Record<string, number>;
    peakProductivityHours: number[];
    breakFrequencyMinutes: number;
    preferredTaskClustering: boolean;
  };
}
```

## Usage Example

```typescript
import MonthGeneratorButton from '@/components/MonthGeneratorButton';

function MyScheduler() {
  const [week1Blocks, setWeek1Blocks] = useState<ScheduledBlock[]>([]);
  const [week1Tasks, setWeek1Tasks] = useState<Task[]>([]);
  const [allBlocks, setAllBlocks] = useState<ScheduledBlock[]>([]);

  const handleMonthGenerated = (result: GenerateMonthResult) => {
    // Add generated tasks and blocks to calendar
    setAllBlocks([...week1Blocks, ...result.scheduledBlocks]);
    console.log('Applied techniques:', result.appliedTechniques);
    console.log('Detected patterns:', result.patterns);
  };

  return (
    <div>
      {/* User creates Week 1 here */}
      
      <MonthGeneratorButton
        week1Blocks={week1Blocks}
        week1Tasks={week1Tasks}
        existingEvents={events}
        preferences={preferences}
        onMonthGenerated={handleMonthGenerated}
      />
    </div>
  );
}
```

## Configuration

### Minimum Requirements
- **Minimum tasks in Week 1**: 5 tasks
- **Reason**: Need enough data to detect meaningful patterns

### Default Patterns (when insufficient data)
- Work hours: 9:00 - 17:00
- Task distribution: 30% deep, 30% study, 20% admin, 20% relax
- Avg tasks per day: 5
- Break frequency: Every 90 minutes
- Peak hours: 9, 10, 11

## Future Enhancements

- [ ] **Custom technique selection**: Let users choose which techniques to apply
- [ ] **Pattern visualization**: Show graphs of detected patterns
- [ ] **Week-by-week generation**: Generate one week at a time instead of all at once
- [ ] **Learning from feedback**: Improve patterns based on user modifications
- [ ] **Template library**: Save and reuse common patterns
- [ ] **Collaborative patterns**: Share patterns with team members
- [ ] **Smart deadline handling**: Automatically prioritize tasks with approaching deadlines
- [ ] **Habit tracking**: Detect and reinforce positive scheduling habits

## Troubleshooting

### "Please schedule at least 5 tasks in Week 1"
- **Cause**: Not enough data to detect patterns
- **Solution**: Add more tasks to Week 1 before generating

### "Failed to generate month schedule"
- **Cause**: API service unavailable or error
- **Solution**: Check that FastAPI service is running on port 8000

### Generated schedule doesn't match expectations
- **Cause**: Patterns detected from Week 1 may not reflect preferences
- **Solution**: Adjust Week 1 schedule to better reflect desired patterns, then regenerate

### Too many/few tasks generated
- **Cause**: Based on Week 1 task density
- **Solution**: Adjust number of tasks in Week 1 to set desired pace

## Best Practices

1. **Create a representative Week 1**: Make Week 1 reflect your ideal schedule
2. **Include variety**: Mix different task types to get balanced generation
3. **Set realistic work hours**: AI will respect your Week 1 boundaries
4. **Review before applying**: Always check preview before applying
5. **Iterate**: If results aren't perfect, adjust Week 1 and regenerate
6. **Use fixed events**: Add known meetings/appointments for all 4 weeks before generating

## Questions?

Check the main README or open an issue on GitHub.
