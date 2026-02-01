/** 40-year timeline range for Canvas and data APIs (prototype) */
export const TIMELINE_START_YEAR = 1985;
export const TIMELINE_END_YEAR = 2025;
export const TIMELINE_YEARS = TIMELINE_END_YEAR - TIMELINE_START_YEAR;

export const TIMELINE_START_DATE = `${TIMELINE_START_YEAR}-01-01`;
export const TIMELINE_END_DATE = `${TIMELINE_END_YEAR}-12-31`;

/** Percent (0–100) to date string YYYY-MM-DD */
export function dateFromPercent(percent: number): string {
  const p = Math.max(0, Math.min(100, percent)) / 100;
  const year = TIMELINE_START_YEAR + p * TIMELINE_YEARS;
  const y = Math.floor(year);
  const frac = year - y;
  const month = 1 + Math.floor(frac * 12);
  const m = Math.min(12, month);
  const d = m === 12 && frac >= 1 ? 31 : 1;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Date string YYYY-MM-DD to percent (0–100) */
export function percentFromDate(dateStr: string): number {
  const y = parseInt(dateStr.slice(0, 4), 10);
  const m = parseInt(dateStr.slice(5, 7), 10) || 1;
  const d = parseInt(dateStr.slice(8, 10), 10) || 1;
  const startMs = new Date(TIMELINE_START_YEAR, 0, 1).getTime();
  const endMs = new Date(TIMELINE_END_YEAR, 11, 31).getTime();
  const dateMs = new Date(y, m - 1, d).getTime();
  const p = (dateMs - startMs) / (endMs - startMs);
  return Math.max(0, Math.min(100, p * 100));
}

/** Decade years for axis labels (within timeline) */
export function getDecadeYears(): number[] {
  const years: number[] = [];
  const start = Math.ceil(TIMELINE_START_YEAR / 10) * 10;
  for (let y = start; y <= TIMELINE_END_YEAR; y += 10) {
    years.push(y);
  }
  return years;
}
