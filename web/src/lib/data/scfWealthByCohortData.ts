/**
 * SCF-style median household net worth by age cohort (triennial).
 * Source: Federal Reserve Survey of Consumer Finances (SCF).
 * Values: median net worth in thousands of 2022 dollars.
 * Age classes: Under 35, 35-44, 45-54, 55-64, 65-74, 75+.
 *
 * Data aligned to SCF survey years (1989, 1992, ..., 2022).
 * When the Fed provides a direct CSV/API, replace this with a live fetcher.
 */
import type { TileDataPayload, TileDataRow } from "@/src/lib/data/fetchers/types";

const SCF_YEARS = [1989, 1992, 1995, 1998, 2001, 2004, 2007, 2010, 2013, 2016, 2019, 2022] as const;

/** Median net worth by age cohort, thousands of 2022 dollars. Triennial SCF years 1989–2022. */
const MEDIAN_NET_WORTH_THOUSANDS: Record<string, number>[] = [
  { under35: 11, age35_44: 61, age45_54: 99, age55_64: 131, age65_74: 122, age75plus: 95 },
  { under35: 10, age35_44: 54, age45_54: 100, age55_64: 131, age65_74: 117, age75plus: 99 },
  { under35: 9, age35_44: 62, age45_54: 104, age55_64: 138, age65_74: 128, age75plus: 108 },
  { under35: 12, age35_44: 79, age45_54: 125, age55_64: 167, age65_74: 152, age75plus: 132 },
  { under35: 11, age35_44: 82, age45_54: 120, age55_64: 179, age65_74: 164, age75plus: 143 },
  { under35: 10, age35_44: 69, age45_54: 114, age55_64: 198, age65_74: 178, age75plus: 159 },
  { under35: 12, age35_44: 69, age45_54: 128, age55_64: 216, age65_74: 194, age75plus: 168 },
  { under35: 4, age35_44: 35, age45_54: 96, age55_64: 195, age65_74: 170, age75plus: 152 },
  { under35: 6, age35_44: 42, age45_54: 91, age55_64: 168, age65_74: 179, age75plus: 162 },
  { under35: 6, age35_44: 47, age45_54: 105, age55_64: 194, age65_74: 216, age75plus: 195 },
  { under35: 10, age35_44: 59, age45_54: 126, age55_64: 252, age65_74: 266, age75plus: 255 },
  { under35: 14, age35_44: 90, age45_54: 170, age55_64: 364, age65_74: 410, age75plus: 336 },
];

const SERIES_LABELS: Record<string, string> = {
  under35: "Under 35",
  age35_44: "35-44",
  age45_54: "45-54",
  age55_64: "55-64",
  age65_74: "65-74",
  age75plus: "75+",
};

export function getScfWealthByCohortPayload(): TileDataPayload {
  const data: TileDataRow[] = SCF_YEARS.map((year, i) => {
    const row = MEDIAN_NET_WORTH_THOUSANDS[i];
    return {
      date: `${year}-06-01`,
      under35: row?.under35 ?? null,
      age35_44: row?.age35_44 ?? null,
      age45_54: row?.age45_54 ?? null,
      age55_64: row?.age55_64 ?? null,
      age65_74: row?.age65_74 ?? null,
      age75plus: row?.age75plus ?? null,
    };
  });

  return {
    meta: {
      units: "thousands of 2022 dollars",
      frequency: "triennial",
      series: SERIES_LABELS,
    },
    data,
  };
}
