/**
 * Absolute income mobility by birth cohort (Chetty et al., "The Fading American Dream").
 * Source: Opportunity Insights / NBER WP 22910.
 * Metric: Fraction of children earning more than their parents (at age 30 vs parents at age 30).
 *
 * Dates are "reference year" = year when that birth cohort turned 30, so the series
 * aligns with the app timeline (1985–2025). E.g. 1990 = 1960 birth cohort.
 */
import type { TileDataPayload } from "@/src/lib/data/fetchers/types";

/** Reference year (cohort + 30) -> absolute mobility (%). Approximate from paper. */
const ABSOLUTE_MOBILITY: { year: number; pct: number }[] = [
  { year: 1985, pct: 72 },
  { year: 1990, pct: 62 },
  { year: 1995, pct: 61 },
  { year: 2000, pct: 61 },
  { year: 2005, pct: 52 },
  { year: 2010, pct: 50 },
];

export function getAbsoluteMobilityPayload(): TileDataPayload {
  return {
    meta: {
      series: { pct: "Absolute mobility (%)" },
      units: "%",
    },
    data: ABSOLUTE_MOBILITY.map(({ year, pct }) => ({
      date: `${year}-01-01`,
      pct,
    })),
  };
}
