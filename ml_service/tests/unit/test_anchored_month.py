"""
Month plans must keep each Week 1 task on the same weekday and start time, only moving
(on the same day) when a fixed event is in the way.
"""

from datetime import datetime, timedelta, timezone

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from ml_service.month_generator import MonthGenerator
from ml_service.pattern_analyzer import SchedulePattern
from shared.models import Event, Preferences, ScheduledBlock, Task

TZ = timezone(timedelta(hours=-4))
PREFS = Preferences(dayStartHour=7, dayEndHour=23, slotStepMin=15, bufferMin=5, maxHeavyPerDay=3)


def week1(entries):
    """entries: (id, title, weekday 0=Mon, 'HH:MM', minutes, type)"""
    tasks, blocks = [], []
    monday = datetime(2026, 10, 5, tzinfo=TZ)
    for tid, title, wd, hhmm, mins, typ in entries:
        h, m = map(int, hhmm.split(':'))
        start = monday + timedelta(days=wd, hours=h, minutes=m)
        tasks.append(Task(id=tid, title=title, durationMin=mins, type=typ, energy='high' if typ in ('deep', 'study') else 'med',
                          splittable=False, priority=3, mode='balanced', label=typ, color='bg-blue-500'))
        blocks.append(ScheduledBlock(id=tid, taskId=tid, start=start.isoformat(), end=(start + timedelta(minutes=mins)).isoformat()))
    return tasks, blocks


def run(entries, events=()):
    tasks, blocks = week1(entries)
    return MonthGenerator().generate_month(
        pattern=SchedulePattern(), week1_blocks=blocks, week1_tasks=tasks, existing_events=list(events),
        start_date=datetime(2026, 10, 12, tzinfo=TZ), preferences=PREFS)


def placed(result):
    by_id = {t.id: t for t in result['generatedTasks']}
    out = []
    for b in result['scheduledBlocks']:
        s = datetime.fromisoformat(b.start)
        e = datetime.fromisoformat(b.end)
        out.append((by_id[b.task_id].title, s.date().isoformat(), s.strftime('%a'), s.strftime('%H:%M'), e.strftime('%H:%M')))
    return out


SAMPLE = [
    ('a', 'Morning run', 0, '07:00', 60, 'relax'),
    ('b', 'Deep work', 0, '09:00', 180, 'deep'),
    ('c', 'Lunch', 0, '12:00', 60, 'relax'),
    ('d', 'Study session', 2, '14:30', 90, 'study'),
    ('e', 'Family dinner', 6, '18:30', 60, 'relax'),
]


def test_each_task_keeps_weekday_and_start_time_for_three_weeks():
    p = placed(run(SAMPLE))
    assert len(p) == len(SAMPLE) * 3
    for title, _date, wd, start, _end in p:
        want = {'Morning run': ('Mon', '07:00'), 'Deep work': ('Mon', '09:00'), 'Lunch': ('Mon', '12:00'),
                'Study session': ('Wed', '14:30'), 'Family dinner': ('Sun', '18:30')}[title]
        assert (wd, start) == want, (title, wd, start)


def test_weeks_follow_on_from_the_start_date():
    dates = sorted({d for _, d, *_ in placed(run(SAMPLE))})
    assert dates[0] == '2026-10-12' and dates[-1] == '2026-11-01'


def test_no_duplicated_meals_or_invented_tasks():
    p = placed(run(SAMPLE))
    per_day = {}
    for title, date, *_ in p:
        per_day.setdefault(date, []).append(title)
    for titles in per_day.values():
        assert len(titles) == len(set(titles)), titles


def test_durations_are_preserved_and_no_made_up_deadlines():
    r = run(SAMPLE)
    assert all(t.due_at is None for t in r['generatedTasks'])
    for title, _d, _wd, start, end in placed(r):
        if title == 'Deep work':
            assert (start, end) == ('09:00', '12:00')


def test_moves_to_nearest_free_time_same_day_when_an_event_is_in_the_way():
    # A fixed 07:00-08:00 event on Monday Oct 12 collides with the 07:00 run (buffer 5 min).
    ev = Event(id='x', title='Dentist', start=datetime(2026, 10, 12, 7, 0, tzinfo=TZ).isoformat(),
               end=datetime(2026, 10, 12, 8, 0, tzinfo=TZ).isoformat(), kind='fixed')
    p = placed(run([('a', 'Morning run', 0, '07:00', 60, 'relax')], [ev]))
    first = [x for x in p if x[1] == '2026-10-12'][0]
    assert first[2] == 'Mon'
    assert first[3] >= '08:05' or first[4] <= '06:55'
    # the following weeks have no event, so they stay at 07:00
    assert all(x[3] == '07:00' for x in p if x[1] != '2026-10-12')


def test_left_out_rather_than_moved_to_another_day_when_nothing_fits():
    # Block all of Monday Oct 12
    ev = Event(id='x', title='Trip', start=datetime(2026, 10, 12, 0, 0, tzinfo=TZ).isoformat(),
               end=datetime(2026, 10, 13, 0, 0, tzinfo=TZ).isoformat(), kind='blocked')
    p = placed(run([('a', 'Morning run', 0, '07:00', 60, 'relax')], [ev]))
    assert all(x[1] != '2026-10-12' for x in p)
    assert all(x[2] == 'Mon' for x in p)
    assert len(p) == 2


def test_titles_are_clean():
    tasks, blocks = week1([('a', 'Lunch (W2)', 0, '12:00', 60, 'relax')])
    r = MonthGenerator().generate_month(pattern=SchedulePattern(), week1_blocks=blocks, week1_tasks=tasks, existing_events=[],
                                        start_date=datetime(2026, 10, 12, tzinfo=TZ), preferences=PREFS)
    assert {t.title for t in r['generatedTasks']} == {'Lunch'}
