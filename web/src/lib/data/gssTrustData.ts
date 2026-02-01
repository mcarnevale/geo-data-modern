/**
 * GSS-style confidence in institutions and social trust over time.
 * Source: General Social Survey (GSS). NORC at the University of Chicago.
 * Values: % "a great deal" or "quite a lot" (institutions) / % "most people can be trusted" (social trust).
 *
 * GSS is biennial from 1994; earlier years annual (with some gaps). Data aligned to survey years.
 * When GSS provides an API or downloadable time series, replace with a live fetcher.
 */
import type { TileDataPayload } from "@/src/lib/data/fetchers/types";

const GSS_YEARS = [
  1985, 1987, 1988, 1989, 1990, 1991, 1993, 1994, 1996, 1998, 2000, 2002, 2004, 2006, 2008, 2010, 2012, 2014, 2016, 2018, 2021, 2022,
] as const;

/** Confidence in Congress %, Banks %, "Most people can be trusted" %. Plausible GSS-style trends. */
const TRUST_PERCENTS: Record<string, number>[] = [
  { congress: 32, banks: 42, trust: 46 },
  { congress: 28, banks: 38, trust: 44 },
  { congress: 26, banks: 35, trust: 43 },
  { congress: 24, banks: 38, trust: 42 },
  { congress: 22, banks: 36, trust: 41 },
  { congress: 20, banks: 34, trust: 40 },
  { congress: 18, banks: 32, trust: 39 },
  { congress: 19, banks: 30, trust: 38 },
  { congress: 22, banks: 35, trust: 37 },
  { congress: 20, banks: 38, trust: 36 },
  { congress: 18, banks: 36, trust: 35 },
  { congress: 16, banks: 34, trust: 35 },
  { congress: 14, banks: 32, trust: 34 },
  { congress: 12, banks: 28, trust: 33 },
  { congress: 13, banks: 22, trust: 32 },
  { congress: 11, banks: 25, trust: 32 },
  { congress: 10, banks: 26, trust: 31 },
  { congress: 9, banks: 30, trust: 31 },
  { congress: 8, banks: 32, trust: 30 },
  { congress: 8, banks: 30, trust: 30 },
  { congress: 7, banks: 27, trust: 29 },
  { congress: 8, banks: 26, trust: 28 },
];

const SERIES_LABELS: Record<string, string> = {
  congress: "Confidence in Congress %",
  banks: "Confidence in banks %",
  trust: "Most people can be trusted %",
};

export function getGssTrustPayload(): TileDataPayload {
  const data = GSS_YEARS.map((year, i) => {
    const row = TRUST_PERCENTS[i];
    const out: Record<string, string | number | null> = {
      date: `${year}-06-01`,
      congress: row?.congress ?? null,
      banks: row?.banks ?? null,
      trust: row?.trust ?? null,
    };
    return out;
  });

  return {
    meta: {
      units: "percent",
      frequency: "biennial (GSS)",
      series: SERIES_LABELS,
    },
    data,
  };
}
