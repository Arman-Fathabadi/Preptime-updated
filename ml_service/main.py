"""
FastAPI service for intelligent scheduling.
"""

import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from shared.models import Task, Event, Preferences, ScheduledBlock
from ml_service.scheduler import (
    generate_free_slots,
    greedy_schedule,
    generate_explanations,
    compute_metrics
)
from ml_service.scorer import SlotScorer
from ml_service.pattern_analyzer import PatternAnalyzer
from ml_service.month_generator import MonthGenerator

logger = logging.getLogger("preptime.main")


# Request/Response models
class ScheduleRequest(BaseModel):
    tasks: list[Task]
    events: list[Event]
    preferences: Preferences
    dateRange: dict  # {start: str, end: str}


class ScheduleResponse(BaseModel):
    scheduledBlocks: list[ScheduledBlock]
    unscheduledTasks: list[str]
    explanations: dict[str, list[str]]
    metrics: dict


class GenerateMonthRequest(BaseModel):
    week1Blocks: list[ScheduledBlock]
    week1Tasks: list[Task]
    existingEvents: list[Event]
    preferences: Preferences
    startDate: str  # ISO 8601 date for Week 2 start


class GenerateMonthResponse(BaseModel):
    generatedTasks: list[Task]
    scheduledBlocks: list[ScheduledBlock]
    appliedTechniques: list[str]
    patterns: dict  # Extracted patterns from Week 1


# Initialize FastAPI app
app = FastAPI(
    title="Intelligent Scheduler API",
    description="ML-powered task scheduling service",
    version="1.0.0"
)

# Add CORS middleware for Next.js integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize scorer (heuristic only for now, ML model will be added later)
scorer = SlotScorer()  # Initialize immediately instead of in startup event
pattern_analyzer = PatternAnalyzer()
month_generator = MonthGenerator(scorer)


@app.on_event("startup")
async def startup_event():
    """Initialize scorer on startup."""
    global scorer
    # Scorer is already initialized, just log
    # Later: scorer = SlotScorer(model_path="ml/model/slot_scorer.cbm")
    print("Scheduler service started with heuristic scoring")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "model_loaded": scorer is not None and scorer.model is not None,
        "scoring_mode": "ml" if (scorer and scorer.model) else "heuristic"
    }


@app.post("/schedule", response_model=ScheduleResponse)
async def create_schedule(request: ScheduleRequest):
    """
    Generate an optimized schedule for the given tasks and events.
    
    Args:
        request: ScheduleRequest containing tasks, events, preferences, and date range
    
    Returns:
        ScheduleResponse with scheduled blocks, explanations, and metrics
    
    Raises:
        HTTPException: 400 for validation errors, 500 for internal errors
    """
    try:
        # Parse date range
        start_date = datetime.fromisoformat(request.dateRange["start"].replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(request.dateRange["end"].replace('Z', '+00:00'))
        date_range = (start_date, end_date)
        
        # Generate free slots
        slots = generate_free_slots(
            events=request.events,
            preferences=request.preferences,
            date_range=date_range
        )
        
        # Run greedy scheduling
        schedule_result = greedy_schedule(
            tasks=request.tasks,
            slots=slots,
            scorer=scorer,
            max_heavy_per_day=request.preferences.max_heavy_per_day
        )
        
        # Generate explanations
        explanations = generate_explanations(
            scheduled_blocks=schedule_result["scheduledBlocks"],
            tasks=request.tasks,
            events=request.events,
            scorer=scorer
        )
        
        # Compute metrics
        metrics = compute_metrics(
            scheduled_blocks=schedule_result["scheduledBlocks"],
            tasks=request.tasks,
            slots=slots,
            date_range=date_range
        )
        
        return ScheduleResponse(
            scheduledBlocks=schedule_result["scheduledBlocks"],
            unscheduledTasks=schedule_result["unscheduledTasks"],
            explanations=explanations,
            metrics=metrics
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid input: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@app.post("/generate-month", response_model=GenerateMonthResponse)
async def generate_month(request: GenerateMonthRequest):
    """
    Generate Weeks 2-4 based on Week 1 patterns with productivity techniques.
    
    This endpoint analyzes the user's Week 1 schedule to extract behavioral patterns,
    then generates tasks and schedules for the remaining weeks of the month using
    techniques like Pomodoro, time blocking, and energy management.
    
    Args:
        request: GenerateMonthRequest with Week 1 data and preferences
    
    Returns:
        GenerateMonthResponse with generated tasks, schedules, and applied techniques
    
    Raises:
        HTTPException: 400 for validation errors, 500 for internal errors
    """
    try:
        logger.debug(f"Received {len(request.week1Blocks)} blocks and {len(request.week1Tasks)} tasks")
        if request.week1Tasks:
            logger.debug(f"First task: {request.week1Tasks[0].title}, color: {request.week1Tasks[0].color}")
        if request.week1Blocks:
            logger.debug(f"First block: start={request.week1Blocks[0].start}")
        
        # Analyze Week 1 patterns
        pattern = pattern_analyzer.analyze_week(
            scheduled_blocks=request.week1Blocks,
            tasks=request.week1Tasks,
            events=request.existingEvents
        )
        
        # Parse start date for Week 2
        start_date = datetime.fromisoformat(request.startDate.replace('Z', '+00:00'))
        
        # Generate Weeks 2-4
        result = month_generator.generate_month(
            pattern=pattern,
            week1_blocks=request.week1Blocks,
            week1_tasks=request.week1Tasks,
            existing_events=request.existingEvents,
            start_date=start_date,
            preferences=request.preferences
        )
        
        # Extract pattern summary for response
        pattern_summary = {
            "workHoursStart": pattern.work_hours_start,
            "workHoursEnd": pattern.work_hours_end,
            "avgTasksPerDay": pattern.avg_tasks_per_day,
            "taskTypeDistribution": pattern.task_type_distribution,
            "peakProductivityHours": pattern.peak_productivity_hours,
            "breakFrequencyMinutes": pattern.break_frequency_minutes,
            "preferredTaskClustering": pattern.preferred_task_clustering
        }
        
        return GenerateMonthResponse(
            generatedTasks=result["generatedTasks"],
            scheduledBlocks=result["scheduledBlocks"],
            appliedTechniques=result["appliedTechniques"],
            patterns=pattern_summary
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid input: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
