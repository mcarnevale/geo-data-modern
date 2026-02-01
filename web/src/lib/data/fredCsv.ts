/**
 * Fetch a single FRED series as CSV (public, no API key).
 * Header: DATE,VALUE. Missing or "." values become null.
 */

export interface FredSeriesPoint {
  date: string;
  value: number | null;
}

export interface FredCsvOptions {
  /** Start date YYYY-MM-DD (FRED graph uses cosd) */
  observation_start?: string;
  /** End date YYYY-MM-DD (FRED graph uses coed) */
  observation_end?: string;
}

export async function fetchFredSeriesCsv(
  seriesId: string,
  init?: RequestInit,
  options?: FredCsvOptions
): Promise<FredSeriesPoint[]> {
  let url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${encodeURIComponent(seriesId)}`;
  if (options?.observation_start) {
    url += `&cosd=${encodeURIComponent(options.observation_start)}`;
  }
  if (options?.observation_end) {
    url += `&coed=${encodeURIComponent(options.observation_end)}`;
  }
  // #region agent log
  if (typeof url !== "undefined" && url.includes("fred.stlouisfed")) {
    fetch("http://127.0.0.1:7243/ingest/2aa66e59-222d-4d8d-98fc-3b76d81f99ff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "fredCsv.ts:request",
        message: "FRED CSV request URL",
        data: { seriesId, url: url.slice(0, 200), hasCosd: url.includes("cosd"), hasCoed: url.includes("coed") },
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "H5",
      }),
    }).catch(() => {});
  }
  // #endregion
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`FRED fetch failed: ${res.status}`);
  const text = await res.text();
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const points: FredSeriesPoint[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(",");
    const date = parts[0]?.trim() ?? "";
    const raw = parts[1]?.trim() ?? "";
    const num = parseFloat(raw);
    const value =
      raw === "" || raw === "." ? null : Number.isNaN(num) ? null : num;
    points.push({ date, value });
  }

  points.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  // #region agent log
  if (points.length > 0) {
    const first = points[0].date;
    const last = points[points.length - 1].date;
    fetch("http://127.0.0.1:7243/ingest/2aa66e59-222d-4d8d-98fc-3b76d81f99ff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "fredCsv.ts:response",
        message: "FRED CSV response date range",
        data: { seriesId, count: points.length, firstDate: first, lastDate: last },
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "H2",
      }),
    }).catch(() => {});
  }
  // #endregion
  return points;
}
