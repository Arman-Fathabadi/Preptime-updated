/**
 * Date helpers shared by the month generator.
 */

/** Monday 00:00 (local time) of the week containing `date`. */
export function mondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1) - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Monday 00:00 (local time) of the week after the one containing `date`. */
export function nextMondayAfter(date: Date): Date {
  const d = mondayOf(date);
  d.setDate(d.getDate() + 7);
  return d;
}

/**
 * ISO 8601 string in LOCAL time with its UTC offset ("2026-10-19T00:00:00-04:00"),
 * the same shape the Week 1 blocks are sent in. Unlike toISOString() it keeps the
 * local clock digits, so "midnight Monday" stays midnight Monday on the server.
 */
export function toLocalISO(date: Date): string {
  const p = (n: number, w = 2) => String(Math.abs(n)).padStart(w, '0');
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  return (
    `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}` +
    `T${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}` +
    `${sign}${p(Math.floor(Math.abs(offset) / 60))}:${p(Math.abs(offset) % 60)}`
  );
}
