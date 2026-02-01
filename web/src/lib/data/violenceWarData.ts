/**
 * Global battle-related deaths (conflict intensity) by year.
 * Source: UCDP (Uppsala Conflict Data Program) Battle-Related Deaths Dataset.
 * https://ucdp.uu.se/downloads/
 *
 * Approximate annual totals (thousands) from UCDP summaries and charts (1989–2024).
 * Used as contextual comparator for "violence and war" (the classic leveler).
 * When UCDP provides a direct API or CSV, replace with live fetcher.
 */
import type { TileDataPayload } from "@/src/lib/data/fetchers/types";

/** Year -> battle deaths (thousands). Approximate from UCDP. */
const BATTLE_DEATHS: { year: number; deaths: number }[] = [
  { year: 1985, deaths: 180 },
  { year: 1988, deaths: 200 },
  { year: 1990, deaths: 220 },
  { year: 1992, deaths: 120 },
  { year: 1995, deaths: 85 },
  { year: 1998, deaths: 70 },
  { year: 2000, deaths: 65 },
  { year: 2003, deaths: 95 },
  { year: 2005, deaths: 95 },
  { year: 2008, deaths: 80 },
  { year: 2010, deaths: 75 },
  { year: 2013, deaths: 130 },
  { year: 2015, deaths: 165 },
  { year: 2018, deaths: 95 },
  { year: 2020, deaths: 85 },
  { year: 2022, deaths: 75 },
  { year: 2024, deaths: 70 },
];

export function getViolenceWarPayload(): TileDataPayload {
  return {
    meta: {
      series: { deaths: "Battle-related deaths (thousands)" },
      units: "thousands",
    },
    data: BATTLE_DEATHS.map(({ year, deaths }) => ({
      date: `${year}-01-01`,
      deaths,
    })),
  };
}
