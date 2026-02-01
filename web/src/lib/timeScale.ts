/**
 * Time scale helpers for Canvas timeline.
 * Domain is in ms; range is in px (or viewBox units).
 */

/**
 * Parse date string to ms (start of that day, local time).
 * Handles: YYYY-MM-DD (FRED default), YYYY (annual → end of year), YYYY-MM (→ end of month).
 * Ensures data points align correctly with the time axis and scrubber.
 */
export function parseDate(iso: string): number {
  const trimmed = String(iso).trim();
  const y = parseInt(trimmed.slice(0, 4), 10);
  if (Number.isNaN(y)) return 0;
  // YYYY only (e.g. annual data): use end of year so point sits at right of year
  if (trimmed.length <= 4) return new Date(y, 11, 31).getTime();
  const m = parseInt(trimmed.slice(5, 7), 10) || 1;
  const d = parseInt(trimmed.slice(8, 10), 10);
  // YYYY-MM: use last day of month
  if (trimmed.length === 7 || Number.isNaN(d)) {
    return new Date(y, m, 0).getTime();
  }
  return new Date(y, m - 1, d).getTime();
}

export interface LinearTimeScale {
  xFromDateMs: (dateMs: number) => number;
  dateMsFromX: (x: number) => number;
}

/** Linear scale: domain [domainStartMs, domainEndMs] -> range [rangeStartPx, rangeEndPx]. Clamps x to range. */
export function makeLinearScale(
  domainStartMs: number,
  domainEndMs: number,
  rangeStartPx: number,
  rangeEndPx: number
): LinearTimeScale {
  const domainSpan = domainEndMs - domainStartMs;
  const rangeSpan = rangeEndPx - rangeStartPx;

  function xFromDateMs(dateMs: number): number {
    if (domainSpan <= 0) return rangeStartPx;
    const t = (dateMs - domainStartMs) / domainSpan;
    const clamped = Math.max(0, Math.min(1, t));
    return rangeStartPx + clamped * rangeSpan;
  }

  function dateMsFromX(x: number): number {
    if (rangeSpan <= 0) return domainStartMs;
    const t = (x - rangeStartPx) / rangeSpan;
    const clamped = Math.max(0, Math.min(1, t));
    return domainStartMs + clamped * domainSpan;
  }

  return { xFromDateMs, dateMsFromX };
}

/** Format date (ms) for status bar: YYYY-Q for quarterly, YYYY otherwise */
export function formatDateForStatus(dateMs: number): string {
  const d = new Date(dateMs);
  const y = d.getFullYear();
  const m = d.getMonth();
  const q = Math.floor(m / 3) + 1;
  return `${y}-Q${q}`;
}
