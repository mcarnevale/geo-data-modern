import { fetchFredSeriesCsv } from "@/src/lib/data/fredCsv";
import { TIMELINE_END_DATE, TIMELINE_START_DATE } from "@/src/lib/timeline";
import type { TileDataPayload } from "./types";

const FRED_DATE_RANGE = { observation_start: TIMELINE_START_DATE, observation_end: TIMELINE_END_DATE };

/** DFA series: top 1% and 90–99% wealth share. Top 10% = top 1% + 90–99%. */
const SERIES = {
  top1: "WFRBST01108",
  p90to99: "WFRBSN09135",
} as const;

export async function fetchLongRunTopWealthShares(init?: RequestInit): Promise<TileDataPayload> {
  const [top1Data, p90to99Data] = await Promise.all([
    fetchFredSeriesCsv(SERIES.top1, init, FRED_DATE_RANGE),
    fetchFredSeriesCsv(SERIES.p90to99, init, FRED_DATE_RANGE),
  ]);

  const byDate = new Map<string, Record<string, number | null>>();

  function addSeries(points: { date: string; value: number | null }[], key: string) {
    for (const p of points) {
      let row = byDate.get(p.date);
      if (!row) {
        row = { date: p.date, top1: null, top10: null };
        byDate.set(p.date, row);
      }
      (row as Record<string, number | null>)[key] = p.value;
    }
  }

  addSeries(top1Data, "top1");

  for (const p of p90to99Data) {
    let row = byDate.get(p.date);
    if (!row) {
      row = { date: p.date, top1: null, top10: null };
      byDate.set(p.date, row);
    }
    const top1 = row.top1;
    const p90to99 = p.value;
    row.top10 = top1 != null && p90to99 != null ? top1 + p90to99 : null;
  }

  const data = Array.from(byDate.values())
    .filter(
      (row) =>
        (row.top1 != null || row.top10 != null) &&
        row.date >= TIMELINE_START_DATE &&
        row.date <= TIMELINE_END_DATE
    )
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .map((row) => ({
      date: row.date,
      top1: row.top1 ?? null,
      top10: row.top10 ?? null,
    })) as TileDataPayload["data"];

  return {
    meta: {
      units: "percent",
      frequency: "quarterly",
      series: { top1: "Top 1%", top10: "Top 10%" },
    },
    data,
  };
}
