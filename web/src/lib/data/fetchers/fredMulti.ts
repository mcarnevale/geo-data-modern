import { fetchFredSeriesCsv } from "@/src/lib/data/fredCsv";
import { TIMELINE_END_DATE, TIMELINE_START_DATE } from "@/src/lib/timeline";
import type { FredMultiParams } from "@/src/lib/data/modelRegistry";
import type { TileDataPayload } from "./types";

const FRED_DATE_RANGE = { observation_start: TIMELINE_START_DATE, observation_end: TIMELINE_END_DATE };

export async function fetchFredMulti(
  params: FredMultiParams,
  init?: RequestInit
): Promise<TileDataPayload> {
  const { series } = params;
  if (!series?.length) {
    return { meta: { series: {} }, data: [] };
  }

  const allPoints = await Promise.all(
    series.map((s) => fetchFredSeriesCsv(s.id, init, FRED_DATE_RANGE))
  );

  const byDate = new Map<string, Record<string, number | null>>();
  const seriesById: Record<string, string> = {};
  for (const s of series) {
    seriesById[s.id] = s.label;
  }

  for (let i = 0; i < series.length; i++) {
    const id = series[i].id;
    const points = allPoints[i];
    for (const p of points) {
      let row = byDate.get(p.date);
      if (!row) {
        row = { date: p.date } as Record<string, number | null>;
        for (const s of series) row[s.id] = null;
        byDate.set(p.date, row);
      }
      row[id] = p.value;
    }
  }

  const data = Array.from(byDate.values())
    .filter(
      (row) =>
        series.some((s) => row[s.id] != null) &&
        row.date >= TIMELINE_START_DATE &&
        row.date <= TIMELINE_END_DATE
    )
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .map((row) => ({ ...row, date: row.date })) as TileDataPayload["data"];

  // #region agent log
  if (data.length > 0) {
    const minD = data.reduce((a, r) => (r.date < a ? r.date : a), data[0].date);
    const maxD = data.reduce((a, r) => (r.date > a ? r.date : a), data[0].date);
    fetch("http://127.0.0.1:7243/ingest/2aa66e59-222d-4d8d-98fc-3b76d81f99ff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "fredMulti.ts:payload",
        message: "fredMulti payload date range after filter",
        data: {
          observation_start: TIMELINE_START_DATE,
          observation_end: TIMELINE_END_DATE,
          rowCount: data.length,
          minDate: minD,
          maxDate: maxD,
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "H2",
      }),
    }).catch(() => {});
  }
  // #endregion

  return {
    meta: { series: seriesById },
    data,
  };
}
