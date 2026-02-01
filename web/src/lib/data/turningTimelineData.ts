/**
 * Strauss–Howe turning timeline (High, Awakening, Unraveling, Crisis).
 * Editorial / curated; dates follow common Fourth Turning framing.
 * Source: Curated model metadata (Strauss–Howe generational theory).
 *
 * Turnings: High ~1946–1964, Awakening ~1964–1984, Unraveling ~1984–2008, Crisis ~2008–2030s.
 * For 1985–2025 we show Unraveling (1985–2007) and Crisis (2008–2025).
 * Series values: 1=High, 2=Awakening, 3=Unraveling, 4=Crisis when active (0 otherwise)
 * so the chart draws distinct horizontal bands.
 */
import type { TileDataPayload } from "@/src/lib/data/fetchers/types";
import { TIMELINE_END_YEAR, TIMELINE_START_YEAR } from "@/src/lib/timeline";

const TURNING_BOUNDARIES: { year: number; phase: 1 | 2 | 3 | 4 }[] = [
  { year: 1946, phase: 1 },
  { year: 1964, phase: 2 },
  { year: 1984, phase: 3 },
  { year: 2008, phase: 4 },
];

function phaseForYear(year: number): 1 | 2 | 3 | 4 {
  let p: 1 | 2 | 3 | 4 = 1;
  for (const b of TURNING_BOUNDARIES) {
    if (year >= b.year) p = b.phase;
  }
  return p;
}

export function getTurningTimelinePayload(): TileDataPayload {
  const data: Record<string, string | number | null>[] = [];
  for (let y = TIMELINE_START_YEAR; y <= TIMELINE_END_YEAR; y++) {
    const phase = phaseForYear(y);
    data.push({
      date: `${y}-06-01`,
      high: phase === 1 ? 1 : 0,
      awakening: phase === 2 ? 2 : 0,
      unraveling: phase === 3 ? 3 : 0,
      crisis: phase === 4 ? 4 : 0,
    });
  }

  return {
    meta: {
      units: "phase",
      frequency: "annual",
      series: {
        high: "High",
        awakening: "Awakening",
        unraveling: "Unraveling",
        crisis: "Crisis",
      },
    },
    data,
  };
}
