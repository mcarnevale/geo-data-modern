import { fetchFredSeriesCsv } from "@/src/lib/data/fredCsv";
import { TIMELINE_END_DATE, TIMELINE_START_DATE } from "@/src/lib/timeline";
import type { TileDataPayload } from "./types";

const FRED_DATE_RANGE = { observation_start: TIMELINE_START_DATE, observation_end: TIMELINE_END_DATE };

const SERIES = {
  bottom50: "WFRBSB50189",
  p50to90: "WFRBSN40162",
  p90to99: "WFRBSN09135",
  top1: "WFRBST01108",
} as const;

type RowKey = keyof typeof SERIES;

export async function fetchWealthDistribution(init?: RequestInit): Promise<TileDataPayload> {
  const [bottom50Data, p50to90Data, p90to99Data, top1Data] = await Promise.all([
    fetchFredSeriesCsv(SERIES.bottom50, init, FRED_DATE_RANGE),
    fetchFredSeriesCsv(SERIES.p50to90, init, FRED_DATE_RANGE),
    fetchFredSeriesCsv(SERIES.p90to99, init, FRED_DATE_RANGE),
    fetchFredSeriesCsv(SERIES.top1, init, FRED_DATE_RANGE),
  ]);

  type Row = Record<string, string | number | null>;
  const byDate = new Map<string, Row>();

  function addSeries(points: { date: string; value: number | null }[], key: string) {
    for (const p of points) {
      let row = byDate.get(p.date);
      if (!row) {
        row = { date: p.date, bottom50: null, p50to90: null, p90to99: null, top1: null };
        byDate.set(p.date, row);
      }
      row[key] = p.value;
    }
  }

  addSeries(bottom50Data, "bottom50");
  addSeries(p50to90Data, "p50to90");
  addSeries(p90to99Data, "p90to99");
  addSeries(top1Data, "top1");

  const seriesKeys: RowKey[] = ["bottom50", "p50to90", "p90to99", "top1"];
  const data = Array.from(byDate.values())
    .filter(
      (row) =>
        row.date != null &&
        seriesKeys.some((k) => row[k] != null) &&
        row.date >= TIMELINE_START_DATE &&
        row.date <= TIMELINE_END_DATE
    )
    .sort((a, b) => (a.date! < b.date! ? -1 : a.date! > b.date! ? 1 : 0))
    .map((row) => ({ ...row, date: row.date })) as TileDataPayload["data"];

  return {
    meta: {
      units: "percent",
      frequency: "quarterly",
      series: { bottom50: "B50", p50to90: "50-90", p90to99: "90-99", top1: "T1" },
    },
    data,
  };
}
