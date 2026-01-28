from pydantic import BaseModel, Field, ConfigDict
from typing import Literal, Optional

class Task(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: str
    title: str
    duration_min: int = Field(alias="durationMin")
    due_at: Optional[str] = Field(None, alias="dueAt")
    type: Literal["study", "deep", "admin", "relax"]
    energy: Literal["low", "med", "high"]
    window: Optional[dict] = None
    splittable: bool
    priority: Literal[1, 2, 3, 4, 5]
    mode: Literal["study", "lockin", "relax", "balanced"]
    label: Optional[str] = None  # Task category/label (e.g., "Math", "Work")
    color: Optional[str] = None  # Color for the task (e.g., "#FF5733")


class Event(BaseModel):
    id: str
    title: str
    start: str
    end: str
    kind: Literal["fixed", "blocked"]


class Preferences(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    day_start_hour: int = Field(alias="dayStartHour")
    day_end_hour: int = Field(alias="dayEndHour")
    slot_step_min: int = Field(alias="slotStepMin")
    buffer_min: int = Field(alias="bufferMin")
    max_heavy_per_day: int = Field(alias="maxHeavyPerDay")


class ScheduledBlock(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: str
    task_id: str = Field(alias="taskId")
    start: str
    end: str


class ScheduleMetrics(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    free_hours: float = Field(alias="freeHours")
    scheduled_hours: float = Field(alias="scheduledHours")
    tasks_on_time: int = Field(alias="tasksOnTime")
    deep_work_hours: float = Field(alias="deepWorkHours")
    context_switch_penalty: float = Field(alias="contextSwitchPenalty")


class ScheduleResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    scheduled_blocks: list[ScheduledBlock] = Field(alias="scheduledBlocks")
    explanations: dict[str, list[str]]
    metrics: ScheduleMetrics


class ScheduleRequest(BaseModel):
    tasks: list[Task]
    events: list[Event]
    preferences: Preferences
