"""
Regression tests for slot generation (date range, step alignment, buffers) and
greedy placement (time windows, deadlines, max heavy tasks per day).
"""

from datetime import datetime, timedelta

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from ml_service.scheduler import generate_free_slots, greedy_schedule, validate_placement, Slot
from ml_service.scorer import SlotScorer
from shared.models import Event, Preferences, Task


def prefs(start=9, end=17, step=30, buffer=0, heavy=3):
    return Preferences(dayStartHour=start, dayEndHour=end, slotStepMin=step, bufferMin=buffer, maxHeavyPerDay=heavy)


def task(id, minutes=60, energy="med", window=None, due=None, priority=3):
    return Task(id=id, title=id, durationMin=minutes, dueAt=due, type="study", energy=energy,
                window=window, splittable=False, priority=priority, mode="study")


def event(id, start, end):
    return Event(id=id, title=id, start=start.isoformat(), end=end.isoformat(), kind="blocked")


MON = datetime(2024, 1, 1)


# --- slot generation -------------------------------------------------------

def test_slots_never_run_past_date_range_end():
    # Range ends 09:00 the next day: day 2 contributes nothing.
    slots = generate_free_slots([], prefs(), (MON.replace(hour=9), MON.replace(hour=9) + timedelta(days=1)))
    assert [s.start.date() for s in slots] == [MON.date()]
    assert slots[0].end == MON.replace(hour=17)


def test_slots_clamped_to_range_start_and_end_within_a_day():
    slots = generate_free_slots([], prefs(), (MON.replace(hour=11), MON.replace(hour=14)))
    assert len(slots) == 1
    assert slots[0].start == MON.replace(hour=11) and slots[0].end == MON.replace(hour=14)


def test_slot_start_aligned_to_step_after_event():
    ev = event("e", MON.replace(hour=9), MON.replace(hour=10, minute=10))
    slots = generate_free_slots([ev], prefs(step=15), (MON, MON + timedelta(days=1)))
    assert slots[0].start == MON.replace(hour=10, minute=15)


def test_buffer_leaves_room_around_events():
    ev = event("e", MON.replace(hour=12), MON.replace(hour=13))
    slots = generate_free_slots([ev], prefs(step=15, buffer=15), (MON, MON + timedelta(days=1)))
    assert [(s.start.hour, s.start.minute, s.end.hour, s.end.minute) for s in slots] == [(9, 0, 11, 45), (13, 15, 17, 0)]


def test_buffer_not_applied_against_day_boundaries():
    slots = generate_free_slots([], prefs(buffer=30), (MON, MON + timedelta(days=1)))
    assert slots[0].start.hour == 9 and slots[0].end.hour == 17


# --- windows and deadlines -------------------------------------------------

def test_task_with_window_is_placed_at_window_start_inside_a_wider_slot():
    slot = Slot(start=MON.replace(hour=9), end=MON.replace(hour=17), duration_min=480)
    t = task("w", 60, window={"startHour": 14, "endHour": 16})
    assert validate_placement(t, slot, [])[0]
    res = greedy_schedule([t], [slot], SlotScorer())
    block = res["scheduledBlocks"][0]
    assert block.start == MON.replace(hour=14).isoformat()
    assert block.end == MON.replace(hour=15).isoformat()


def test_window_too_small_for_task_is_rejected():
    slot = Slot(start=MON.replace(hour=9), end=MON.replace(hour=17), duration_min=480)
    t = task("w", 120, window={"startHour": 14, "endHour": 15})
    ok, msg = validate_placement(t, slot, [])
    assert not ok and "window" in msg.lower()


def test_deadline_in_middle_of_slot_still_allows_early_placement():
    slot = Slot(start=MON.replace(hour=9), end=MON.replace(hour=17), duration_min=480)
    t = task("d", 60, due=MON.replace(hour=12).isoformat())
    assert validate_placement(t, slot, [])[0]
    block = greedy_schedule([t], [slot], SlotScorer())["scheduledBlocks"][0]
    assert datetime.fromisoformat(block.end) <= MON.replace(hour=12)


def test_deadline_before_earliest_possible_finish_is_rejected():
    slot = Slot(start=MON.replace(hour=9), end=MON.replace(hour=17), duration_min=480)
    t = task("d", 120, due=MON.replace(hour=10).isoformat())
    ok, msg = validate_placement(t, slot, [])
    assert not ok and "deadline" in msg.lower()


def test_leftover_slot_time_before_and_after_a_placement_is_kept():
    slot = Slot(start=MON.replace(hour=9), end=MON.replace(hour=17), duration_min=480)
    res = greedy_schedule(
        [task("a", 60, window={"startHour": 12, "endHour": 13}), task("b", 120), task("c", 120)],
        [slot], SlotScorer())
    assert res["unscheduledTasks"] == []
    blocks = sorted((datetime.fromisoformat(b.start), datetime.fromisoformat(b.end)) for b in res["scheduledBlocks"])
    for (s1, e1), (s2, e2) in zip(blocks, blocks[1:]):
        assert e1 <= s2, "blocks must not overlap"


# --- max heavy per day -----------------------------------------------------

def test_max_heavy_per_day_is_enforced():
    slots = [Slot(start=MON.replace(hour=9) + timedelta(days=d), end=MON.replace(hour=17) + timedelta(days=d), duration_min=480)
             for d in range(2)]
    tasks = [task(f"h{i}", 60, energy="high") for i in range(5)]
    res = greedy_schedule(tasks, slots, SlotScorer(), max_heavy_per_day=2)
    per_day = {}
    for b in res["scheduledBlocks"]:
        d = datetime.fromisoformat(b.start).date()
        per_day[d] = per_day.get(d, 0) + 1
    assert max(per_day.values()) <= 2
    assert len(res["scheduledBlocks"]) == 4 and len(res["unscheduledTasks"]) == 1


def test_light_tasks_ignore_heavy_cap():
    slot = Slot(start=MON.replace(hour=9), end=MON.replace(hour=17), duration_min=480)
    res = greedy_schedule([task(f"l{i}", 60, energy="low") for i in range(4)], [slot], SlotScorer(), max_heavy_per_day=1)
    assert len(res["scheduledBlocks"]) == 4


def test_no_cap_by_default():
    slot = Slot(start=MON.replace(hour=9), end=MON.replace(hour=17), duration_min=480)
    res = greedy_schedule([task(f"h{i}", 60, energy="high") for i in range(5)], [slot], SlotScorer())
    assert len(res["scheduledBlocks"]) == 5
