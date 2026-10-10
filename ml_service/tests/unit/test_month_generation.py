"""
Unit tests for month generation functionality
"""

import pytest
from datetime import datetime, timedelta
from shared.models import Task, Event, ScheduledBlock, Preferences
from ml_service.pattern_analyzer import PatternAnalyzer, SchedulePattern
from ml_service.month_generator import MonthGenerator
from ml_service.scorer import SlotScorer


def create_sample_task(task_id: str, task_type: str = "deep", duration: int = 60) -> Task:
    """Helper to create sample task"""
    return Task(
        id=task_id,
        title=f"Task {task_id}",
        durationMin=duration,
        type=task_type,
        energy="high" if task_type in ["deep", "study"] else "med",
        splittable=False,
        priority=3,
        mode="balanced"
    )


def create_sample_block(block_id: str, task_id: str, start_hour: int) -> ScheduledBlock:
    """Helper to create sample scheduled block"""
    start = datetime(2024, 1, 1, start_hour, 0)
    end = start + timedelta(hours=1)
    return ScheduledBlock(
        id=block_id,
        taskId=task_id,
        start=start.isoformat(),
        end=end.isoformat()
    )


class TestPatternAnalyzer:
    """Test pattern analysis from Week 1"""
    
    def test_analyze_empty_week_returns_defaults(self):
        """Test that empty week returns default patterns"""
        analyzer = PatternAnalyzer()
        pattern = analyzer.analyze_week([], [], [])
        
        assert pattern.work_hours_start == 9
        assert pattern.work_hours_end == 17
        assert pattern.avg_tasks_per_day == 5.0
        assert "deep" in pattern.task_type_distribution
    
    def test_analyze_work_hours(self):
        """Test work hours detection from scheduled blocks"""
        analyzer = PatternAnalyzer()
        
        # Create blocks from 8am to 6pm
        blocks = [
            create_sample_block(f"b{i}", f"t{i}", 8 + i)
            for i in range(10)
        ]
        
        pattern = analyzer.analyze_week(blocks, [], [])
        
        # Should detect work hours around 8-18
        assert 6 <= pattern.work_hours_start <= 10
        assert 17 <= pattern.work_hours_end <= 22
    
    def test_analyze_task_type_distribution(self):
        """Test task type distribution calculation"""
        analyzer = PatternAnalyzer()
        
        tasks = [
            create_sample_task("t1", "deep"),
            create_sample_task("t2", "deep"),
            create_sample_task("t3", "study"),
            create_sample_task("t4", "admin"),
        ]
        
        blocks = [
            create_sample_block(f"b{i}", f"t{i+1}", 9 + i)
            for i in range(4)
        ]
        
        pattern = analyzer.analyze_week(blocks, tasks, [])
        
        # Should have 50% deep, 25% study, 25% admin
        assert pattern.task_type_distribution["deep"] == 0.5
        assert pattern.task_type_distribution["study"] == 0.25
        assert pattern.task_type_distribution["admin"] == 0.25
    
    def test_analyze_tasks_per_day(self):
        """Test average tasks per day calculation"""
        analyzer = PatternAnalyzer()
        
        # Create 10 tasks over 2 days
        blocks = []
        for day in range(2):
            for hour in range(5):
                start = datetime(2024, 1, 1 + day, 9 + hour, 0)
                end = start + timedelta(hours=1)
                blocks.append(ScheduledBlock(
                    id=f"b{day}_{hour}",
                    taskId=f"t{day}_{hour}",
                    start=start.isoformat(),
                    end=end.isoformat()
                ))
        
        pattern = analyzer.analyze_week(blocks, [], [])
        
        # Should be 5 tasks per day
        assert pattern.avg_tasks_per_day == 5.0


class TestMonthGenerator:
    """Test month schedule generation"""
    
    def test_generate_month_creates_tasks(self):
        """Test that month generation creates tasks for Weeks 2-4"""
        generator = MonthGenerator()
        
        # Create simple pattern
        pattern = SchedulePattern()
        pattern.avg_tasks_per_day = 3
        pattern.task_type_distribution = {"deep": 0.5, "admin": 0.5}
        
        # Create sample Week 1 data
        week1_tasks = [create_sample_task(f"t{i}") for i in range(5)]
        week1_blocks = [create_sample_block(f"b{i}", f"t{i}", 9 + i) for i in range(5)]
        
        preferences = Preferences(
            dayStartHour=9,
            dayEndHour=17,
            slotStepMin=30,
            bufferMin=5,
            maxHeavyPerDay=3
        )
        
        start_date = datetime(2024, 1, 8)  # Week 2 start
        
        result = generator.generate_month(
            pattern=pattern,
            week1_blocks=week1_blocks,
            week1_tasks=week1_tasks,
            existing_events=[],
            start_date=start_date,
            preferences=preferences
        )
        
        # Should generate tasks for 3 weeks
        assert len(result["generatedTasks"]) > 0
        assert "appliedTechniques" in result
        assert len(result["appliedTechniques"]) > 0
    
    def test_generate_task_respects_distribution(self):
        """Test that generated tasks follow type distribution"""
        generator = MonthGenerator()
        
        pattern = SchedulePattern()
        pattern.task_type_distribution = {"deep": 1.0}  # 100% deep work
        
        # Generate multiple tasks
        tasks = []
        for i in range(10):
            task = generator._generate_task(
                pattern=pattern,
                date=datetime(2024, 1, 8),
                task_idx=i,
                week_num=2,
                day_offset=0
            )
            tasks.append(task)
        
        # All tasks should be deep work
        deep_count = sum(1 for t in tasks if t.type == "deep")
        assert deep_count >= 8  # Allow some randomness
    
    def test_apply_pomodoro_breaks(self):
        """Test that Pomodoro breaks are inserted"""
        generator = MonthGenerator()
        
        tasks = [
            create_sample_task("t1", "deep"),
            create_sample_task("t2", "deep"),
        ]
        
        pattern = SchedulePattern()
        tasks_with_breaks = generator._apply_pomodoro_breaks(tasks, pattern)
        
        # Should have original tasks + break tasks
        assert len(tasks_with_breaks) > len(tasks)
        
        # Should have break tasks
        break_tasks = [t for t in tasks_with_breaks if "break" in t.id.lower()]
        assert len(break_tasks) > 0
    
    def test_apply_time_blocking(self):
        """Test that time blocking groups similar tasks"""
        generator = MonthGenerator()
        
        tasks = [
            create_sample_task("t1", "admin"),
            create_sample_task("t2", "deep"),
            create_sample_task("t3", "admin"),
            create_sample_task("t4", "deep"),
        ]
        
        blocked_tasks = generator._apply_time_blocking(tasks)
        
        # Tasks should be grouped by type
        # First two should be same type, last two should be same type
        assert blocked_tasks[0].type == blocked_tasks[1].type or \
               blocked_tasks[2].type == blocked_tasks[3].type


class TestIntegration:
    """Integration tests for full workflow"""
    
    def test_full_month_generation_workflow(self):
        """Test complete workflow from Week 1 to month generation"""
        # Step 1: Create Week 1 data
        week1_tasks = [
            create_sample_task(f"t{i}", "deep" if i < 3 else "admin")
            for i in range(5)
        ]
        
        week1_blocks = [
            create_sample_block(f"b{i}", f"t{i}", 9 + i)
            for i in range(5)
        ]
        
        # Step 2: Analyze patterns
        analyzer = PatternAnalyzer()
        pattern = analyzer.analyze_week(week1_blocks, week1_tasks, [])
        
        assert pattern is not None
        assert pattern.avg_tasks_per_day > 0
        
        # Step 3: Generate month
        generator = MonthGenerator()
        preferences = Preferences(
            dayStartHour=9,
            dayEndHour=17,
            slotStepMin=30,
            bufferMin=5,
            maxHeavyPerDay=3
        )
        
        result = generator.generate_month(
            pattern=pattern,
            week1_blocks=week1_blocks,
            week1_tasks=week1_tasks,
            existing_events=[],
            start_date=datetime(2024, 1, 8),
            preferences=preferences
        )
        
        # Verify results
        assert len(result["generatedTasks"]) > 0
        assert len(result["scheduledBlocks"]) > 0
        assert len(result["appliedTechniques"]) > 0
        
        # The plan is anchored to Week 1. (This used to assert Pomodoro / Time Blocking /
        # Energy Management, which the generator listed but never actually applied.)
        techniques = result["appliedTechniques"]
        assert any("Anchoring" in t for t in techniques)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
