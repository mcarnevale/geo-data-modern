/**
 * Congressional polarization (DW-NOMINATE party distance) by year.
 * Source: Voteview (Lewis et al.). https://voteview.com/
 * Metric: Difference between Republican and Democratic party means on first dimension.
 * Values range ~0-1; higher = more polarized.
 *
 * Approximate values from Voteview polarization charts (1985–2014).
 * When Voteview provides a direct CSV/API, replace with live fetcher.
 */
import type { TileDataPayload } from "@/src/lib/data/fetchers/types";

/** Year -> polarization (party mean difference). Approximate from Voteview charts. */
const POLARIZATION: { year: number; distance: number }[] = [
  { year: 1985, distance: 0.52 },
  { year: 1990, distance: 0.58 },
  { year: 1995, distance: 0.63 },
  { year: 2000, distance: 0.71 },
  { year: 2005, distance: 0.78 },
  { year: 2010, distance: 0.86 },
  { year: 2014, distance: 0.90 },
];

export function getPolarizationPayload(): TileDataPayload {
  return {
    meta: {
      series: { distance: "Party mean distance (DW-NOMINATE)" },
      units: "index (0–1)",
    },
    data: POLARIZATION.map(({ year, distance }) => ({
      date: `${year}-01-01`,
      distance,
    })),
  };
}
