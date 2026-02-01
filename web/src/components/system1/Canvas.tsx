"use client";

import type { Track } from "@/src/lib/types";
import { formatDateForStatus, makeLinearScale, parseDate } from "@/src/lib/timeScale";
import { TIMELINE_START_DATE } from "@/src/lib/timeline";
import { getTileByTileId, getSourceUrl } from "@/src/lib/data/modelRegistry";
import type { TileDataPayload } from "@/src/lib/data/fetchers/types";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

export interface CanvasProps {
  tracks: Track[];
  onRemoveTrack?: (trackId: string) => void;
}

const SERIES_COLORS = ["#0066cc", "#cc0000", "#008800", "#cc6600"] as const;
const CHART_PADDING = 4;
const CHART_LEGEND_WIDTH_PX = 48;
const VB_X_PADDING = 4;

type TileDataState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ok"; payload: TileDataPayload };

/**
 * Value at dateMs for each series using the nearest observation (no interpolation).
 * Ensures the tooltip shows an actual data point so the scrubber label (e.g. 2023-Q4)
 * is always correct for the value shown.
 */
function getValuesAtDateMs(payload: TileDataPayload, dateMs: number): Record<string, number | null> {
  const { meta, data } = payload;
  const seriesKeys = Object.keys(meta.series).filter((k) => k !== "date");
  const out: Record<string, number | null> = {};
  for (const key of seriesKeys) {
    const points: { dateMs: number; value: number }[] = [];
    for (const row of data) {
      const v = row[key];
      if (v != null && typeof v === "number" && !Number.isNaN(v)) {
        points.push({ dateMs: parseDate(row.date), value: v });
      }
    }
    if (points.length === 0) {
      out[key] = null;
      continue;
    }
    // Nearest observation by absolute time distance
    let nearest = points[0];
    let minDist = Math.abs(points[0].dateMs - dateMs);
    for (let i = 1; i < points.length; i++) {
      const dist = Math.abs(points[i].dateMs - dateMs);
      if (dist < minDist) {
        minDist = dist;
        nearest = points[i];
      }
    }
    out[key] = nearest.value;
  }
  return out;
}

function formatTooltipValue(v: number, units?: string): string {
  const isDollars = units != null && /\$|dollar/i.test(units);
  if (isDollars) {
    const rounded = Math.abs(v) >= 1e6 ? Math.round(v) : v;
    return "$" + rounded.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
  // Always use commas for thousands separators
  if (Number.isInteger(v)) {
    return v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  // For decimals: show up to 2 decimal places, strip trailing zeros
  const formatted = v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return formatted;
}

function DataChart({
  dataState,
  domainStartMs,
  domainEndMs,
}: {
  dataState: TileDataState | undefined;
  domainStartMs: number;
  domainEndMs: number;
}) {
  if (dataState == null || dataState.status === "loading") {
    return (
      <div
        className="flex w-full items-center justify-center border py-[var(--sys-space-2)] text-[1rem]"
        style={{ borderColor: "var(--sys-border)", background: "var(--sys-titlebar)", color: "var(--sys-fg)" }}
      >
        Loading data...
      </div>
    );
  }
  if (dataState.status === "error") {
    return (
      <div
        className="flex w-full items-center justify-center border py-[var(--sys-space-2)] text-[1rem]"
        style={{ borderColor: "var(--sys-border)", background: "var(--sys-titlebar)", color: "var(--sys-fg)" }}
      >
        Data unavailable
      </div>
    );
  }
  const { meta, data } = dataState.payload;
  if (data.length === 0) {
    return (
      <div
        className="flex w-full items-center justify-center border py-[var(--sys-space-2)] text-[1rem]"
        style={{ borderColor: "var(--sys-border)", background: "var(--sys-titlebar)", color: "var(--sys-fg)" }}
      >
        No data yet
      </div>
    );
  }

  const seriesKeys = Object.keys(meta.series).filter((k) => k !== "date");
  let minVal = Infinity;
  let maxVal = -Infinity;
  for (const row of data) {
    for (const k of seriesKeys) {
      const v = row[k];
      if (typeof v === "number" && !Number.isNaN(v)) {
        if (v < minVal) minVal = v;
        if (v > maxVal) maxVal = v;
      }
    }
  }
  if (minVal === Infinity) minVal = 0;
  if (maxVal <= minVal) maxVal = minVal + 1;
  const range = maxVal - minVal;

  const chartHeight = 32;
  const legendWidth = CHART_LEGEND_WIDTH_PX;
  const vbW = 100;
  const xScale = useMemo(
    () => makeLinearScale(domainStartMs, domainEndMs, VB_X_PADDING, vbW - VB_X_PADDING),
    [domainStartMs, domainEndMs]
  );

  function y(val: number): number {
    return CHART_PADDING + chartHeight - ((val - minVal) / range) * chartHeight;
  }

  const points = (key: string) => {
    const pts: string[] = [];
    data.forEach((row) => {
      const v = row[key];
      if (v == null || typeof v !== "number") return;
      const dateMs = parseDate(row.date);
      const xViewBox = xScale.xFromDateMs(dateMs);
      pts.push(`${xViewBox},${y(v)}`);
    });
    return pts.join(" ");
  };

  const svgHeight = 32;
  const vbH = 40;

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full">
        <div
          className="flex shrink-0"
          style={{ width: legendWidth }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <svg
            viewBox={`0 0 ${vbW} ${vbH}`}
            preserveAspectRatio="none"
            width="100%"
            height={svgHeight}
            className="block w-full"
            style={{ overflow: "visible" }}
          >
            {seriesKeys.map((key, i) => (
              <polyline
                key={key}
                fill="none"
                stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                strokeWidth="0.5"
                points={points(key)}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
        </div>
      </div>
      <div
        className="flex flex-wrap items-center gap-x-[var(--sys-space-2)] gap-y-0 pt-[var(--sys-space-1)] text-[10px] uppercase"
        style={{ fontFamily: '"Tiny5", sans-serif', fontWeight: 400 }}
      >
        {seriesKeys.map((key, i) => (
          <span key={key} className="flex shrink-0 items-center gap-1">
            <span
              className="shrink-0 border border-black"
              style={{
                width: 6,
                height: 6,
                backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length],
                borderColor: "var(--sys-border)",
              }}
            />
            <span style={{ color: "var(--sys-fg)" }}>{meta.series[key] ?? key}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const DEFAULT_DOMAIN_START_MS = parseDate(TIMELINE_START_DATE);
// Use end of 2025 explicitly so the timeline and scrubber extend to 2025-Q4 regardless of TIMELINE_END_DATE string parsing.
const DEFAULT_DOMAIN_END_MS = new Date(2025, 11, 31).getTime();

function getDecadeTicks(domainStartMs: number, domainEndMs: number): number[] {
  const startYear = new Date(domainStartMs).getFullYear();
  const endYear = new Date(domainEndMs).getFullYear();
  const start = Math.ceil(startYear / 10) * 10;
  const ticks: number[] = [];
  for (let y = start; y <= endYear; y += 10) {
    ticks.push(new Date(y, 0, 1).getTime());
  }
  return ticks;
}

function CanvasTimeline({
  domainStartMs,
  domainEndMs,
  chartInnerWidthPx,
  chartAreaRef,
}: {
  domainStartMs: number;
  domainEndMs: number;
  chartInnerWidthPx: number;
  chartAreaRef: React.RefObject<HTMLDivElement | null>;
}) {
  const scale = useMemo(
    () => makeLinearScale(domainStartMs, domainEndMs, 0, chartInnerWidthPx),
    [domainStartMs, domainEndMs, chartInnerWidthPx]
  );
  const ticks = useMemo(
    () => getDecadeTicks(domainStartMs, domainEndMs),
    [domainStartMs, domainEndMs]
  );
  return (
    <div
      className="flex w-full shrink-0 border-b py-[var(--sys-space-1)]"
      style={{ borderColor: "var(--sys-border)", color: "var(--sys-fg)" }}
    >
      <div
        className="flex shrink-0 flex-col justify-end text-[10px] uppercase"
        style={{ width: CHART_LEGEND_WIDTH_PX, fontFamily: '"Tiny5", sans-serif', fontWeight: 400 }}
      >
        <span>Year</span>
      </div>
      <div
        ref={chartAreaRef}
        className="relative min-h-[20px] flex-1"
        style={{ minWidth: 0 }}
      >
        {chartInnerWidthPx > 0 &&
          ticks.map((dateMs) => {
            const x = scale.xFromDateMs(dateMs);
            const year = new Date(dateMs).getFullYear();
            return (
              <span
                key={dateMs}
                className="absolute bottom-0 text-[10px] uppercase"
                style={{
                  left: `${x}px`,
                  transform: "translateX(-50%)",
                  fontFamily: '"Tiny5", sans-serif',
                  fontWeight: 400,
                }}
              >
                {year}
              </span>
            );
          })}
      </div>
    </div>
  );
}

export function Canvas({ tracks, onRemoveTrack }: CanvasProps) {
  const [domainStartMs, setDomainStartMs] = useState(DEFAULT_DOMAIN_START_MS);
  const [domainEndMs, setDomainEndMs] = useState(DEFAULT_DOMAIN_END_MS);
  // #region agent log
  const loggedDomainRef = useRef(false);
  if (tracks.length > 0 && !loggedDomainRef.current) {
    loggedDomainRef.current = true;
    const d = (ms: number) => new Date(ms).toISOString().slice(0, 10);
    fetch("http://127.0.0.1:7243/ingest/2aa66e59-222d-4d8d-98fc-3b76d81f99ff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "Canvas.tsx:domain-state",
        message: "Canvas domain state (first render with tracks)",
        data: { domainStartDate: d(domainStartMs), domainEndDate: d(domainEndMs) },
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "H3",
      }),
    }).catch(() => {});
  }
  // #endregion
  const [chartInnerWidthPx, setChartInnerWidthPx] = useState(0);
  const [cursorLeftPx, setCursorLeftPx] = useState<number | null>(null);
  const [cursorDateMs, setCursorDateMs] = useState<number | null>(null);
  const [chartAreaLeftOffset, setChartAreaLeftOffset] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [dataByTileId, setDataByTileId] = useState<Record<string, TileDataState>>({});
  const [hoveredTrackId, setHoveredTrackId] = useState<string | null>(null);
  const [infoTrackId, setInfoTrackId] = useState<string | null>(null);
  const [cursorClientX, setCursorClientX] = useState(0);
  const [cursorClientY, setCursorClientY] = useState(0);
  const [tooltipOnLeft, setTooltipOnLeft] = useState(false);
  const [tooltipWidth, setTooltipWidth] = useState(0);
  const [tooltipAbove, setTooltipAbove] = useState(false);
  const [tooltipHeight, setTooltipHeight] = useState(0);
  const startedFetchRef = useRef<Set<string>>(new Set());
  const tooltipRef = useRef<HTMLDivElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const pendingClientXRef = useRef<number | null>(null);

  // Fetch data for each track whose tile has fetch.kind !== 'none'
  useEffect(() => {
    const fetchableTileIds = new Set<string>();
    for (const track of tracks) {
      const tile = getTileByTileId(track.tileId);
      if (tile?.fetch.kind !== "none") fetchableTileIds.add(track.tileId);
    }
    // Allow refetch when a tileId is no longer on canvas
    for (const tileId of startedFetchRef.current) {
      if (!fetchableTileIds.has(tileId)) startedFetchRef.current.delete(tileId);
    }
    for (const tileId of fetchableTileIds) {
      if (startedFetchRef.current.has(tileId)) continue;
      startedFetchRef.current.add(tileId);
      setDataByTileId((prev) => ({ ...prev, [tileId]: { status: "loading" } }));
      fetch(`/api/data/${tileId}`)
        .then((res) => {
          if (!res.ok) throw new Error(String(res.status));
          return res.json();
        })
        .then((body: TileDataPayload) => {
          // #region agent log
          if (body?.data?.length > 0) {
            const dates = body.data.map((r) => r.date);
            const minD = dates.reduce((a, b) => (a < b ? a : b));
            const maxD = dates.reduce((a, b) => (a > b ? a : b));
            fetch("http://127.0.0.1:7243/ingest/2aa66e59-222d-4d8d-98fc-3b76d81f99ff", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                location: "Canvas.tsx:data-received",
                message: "Tile data date range received",
                data: { tileId, rowCount: body.data.length, minDate: minD, maxDate: maxD },
                timestamp: Date.now(),
                sessionId: "debug-session",
                hypothesisId: "H2",
              }),
            }).catch(() => {});
          }
          // #endregion
          setDataByTileId((prev) => ({ ...prev, [tileId]: { status: "ok", payload: body } }));
        })
        .catch(() => {
          setDataByTileId((prev) => ({ ...prev, [tileId]: { status: "error" } }));
        });
    }
  }, [tracks]);

  // Measure chart area width and left offset
  useLayoutEffect(() => {
    const chartEl = chartAreaRef.current;
    const containerEl = containerRef.current;
    if (chartEl == null || containerEl == null) return;
    const update = () => {
      const chartRect = chartEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();
      setChartInnerWidthPx(chartRect.width);
      setChartAreaLeftOffset(chartRect.left - containerRect.left);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(chartEl);
    return () => ro.disconnect();
  }, [tracks.length]);

  // Flip tooltip to left when not enough room on the right; only show tooltip if cursor is within data range
  const tooltipVisible =
    isHovering &&
    hoveredTrackId != null &&
    cursorDateMs != null &&
    (() => {
      const track = tracks.find((t) => t.id === hoveredTrackId);
      const dataState = track ? dataByTileId[track.tileId] : undefined;
      if (dataState?.status !== "ok") return false;
      const { data } = dataState.payload;
      if (data.length === 0) return false;
      // Check if cursor is within the data range (min to max observation date)
      const dates = data.map((row) => parseDate(row.date));
      const minDate = Math.min(...dates);
      const maxDate = Math.max(...dates);
      return cursorDateMs >= minDate && cursorDateMs <= maxDate;
    })();
  useLayoutEffect(() => {
    if (!tooltipVisible) {
      setTooltipOnLeft(false);
      setTooltipAbove(false);
      return;
    }
    if (!tooltipRef.current) return;
    const rect = tooltipRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    setTooltipWidth(width);
    setTooltipHeight(height);
    const fitsRight = cursorClientX + 12 + width <= window.innerWidth;
    setTooltipOnLeft(!fitsRight);
    const fitsBelow = cursorClientY + 12 + height <= window.innerHeight;
    setTooltipAbove(!fitsBelow);
  }, [tooltipVisible, cursorClientX, cursorClientY, hoveredTrackId]);

  const updateCursor = useCallback(() => {
    rafIdRef.current = null;
    const chartEl = chartAreaRef.current;
    const containerEl = containerRef.current;
    const clientX = pendingClientXRef.current;
    if (chartEl == null || containerEl == null || clientX == null) return;
    const chartRect = chartEl.getBoundingClientRect();
    const containerRect = containerEl.getBoundingClientRect();
    const leftOffset = chartRect.left - containerRect.left;
    const chartX = clientX - chartRect.left;
    if (chartX < 0 || chartX > chartRect.width) {
      setCursorLeftPx(null);
      setCursorDateMs(null);
      setIsHovering(false);
      return;
    }
    const clampedChartX = Math.max(0, Math.min(chartRect.width, chartX));
    const scale = makeLinearScale(domainStartMs, domainEndMs, 0, chartRect.width);
    const dateMs = scale.dateMsFromX(clampedChartX);
    setCursorLeftPx(leftOffset + clampedChartX);
    setCursorDateMs(dateMs);
    setIsHovering(true);
  }, [domainStartMs, domainEndMs]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      pendingClientXRef.current = e.clientX;
      setCursorClientX(e.clientX);
      setCursorClientY(e.clientY);
      if (rafIdRef.current == null) {
        rafIdRef.current = requestAnimationFrame(updateCursor);
      }
      if (!isHovering) setIsHovering(true);
    },
    [isHovering, updateCursor]
  );

  const handleMouseLeave = useCallback(() => {
    if (rafIdRef.current != null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    pendingClientXRef.current = null;
    setCursorLeftPx(null);
    setCursorDateMs(null);
    setIsHovering(false);
    setHoveredTrackId(null);
  }, []);

  const statusBar = (
    <div
      className="flex h-6 shrink-0 items-center justify-between border-t px-[var(--sys-space-2)] text-[1rem]"
      style={{ borderColor: "var(--sys-border)", background: "var(--sys-titlebar)", color: "var(--sys-fg)" }}
    >
      <span>Ready</span>
      {isHovering && cursorDateMs != null ? (
        <span>{formatDateForStatus(cursorDateMs)}</span>
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );

  if (tracks.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div
          className="flex flex-1 items-center justify-center p-[var(--sys-space-3)] text-[1rem]"
          style={{ color: "var(--sys-fg)" }}
        >
          No tracks yet. Add data from a model.
        </div>
        {statusBar}
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-auto">
        <div
          ref={containerRef}
          className="relative flex min-h-full flex-col gap-0 p-[var(--sys-space-3)]"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <CanvasTimeline
            domainStartMs={domainStartMs}
            domainEndMs={domainEndMs}
            chartInnerWidthPx={chartInnerWidthPx}
            chartAreaRef={chartAreaRef}
          />
          {tracks.map((track) => (
          <div
            key={track.id}
            className="flex flex-col border-b py-[var(--sys-space-2)]"
            style={{ borderColor: "var(--sys-border)" }}
            onMouseEnter={() => setHoveredTrackId(track.id)}
            onMouseLeave={() => setHoveredTrackId(null)}
          >
            <div
              className="mb-[var(--sys-space-1)] flex items-start gap-x-[var(--sys-space-2)] leading-tight"
              style={{ color: "var(--sys-fg)" }}
            >
              <div className="min-w-0 flex-1 flex flex-wrap items-baseline gap-x-[var(--sys-space-2)] gap-y-0">
                <span className="text-[0.875rem]">{track.tileName}</span>
                <span
                  className="text-[10px] uppercase opacity-80"
                  style={{ fontFamily: '"Tiny5", sans-serif', fontWeight: 400 }}
                >
                  {track.modelName}
                </span>
                {track.tileId === "wealth-distribution" && (
                  <span
                    className="text-[10px] uppercase opacity-70"
                    style={{ fontFamily: '"Tiny5", sans-serif', fontWeight: 400 }}
                    title="Distributional Financial Accounts; series available from 1989"
                  >
                    DFA via FRED (from 1989)
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex shrink-0 items-center gap-[2px]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setInfoTrackId((prev) => (prev === track.id ? null : track.id));
                  }}
                  className="flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center border text-[0.75rem] font-normal"
                  style={{
                    borderColor: "var(--sys-border)",
                    background: infoTrackId === track.id ? "var(--sys-fg)" : "var(--sys-titlebar)",
                    color: infoTrackId === track.id ? "var(--sys-bg)" : "var(--sys-fg)",
                    fontFamily: "ui-monospace, monospace",
                    lineHeight: 1,
                    cursor: "pointer",
                  }}
                  title="What this chart shows"
                  aria-label="What this chart shows"
                  aria-expanded={infoTrackId === track.id}
                >
                  i
                </button>
                {(() => {
                  const tile = getTileByTileId(track.tileId);
                  const sourceUrl = tile ? getSourceUrl(tile) : undefined;
                  return sourceUrl ? (
                    <a
                      href={sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-[1.125rem] w-[1.125rem] items-center justify-center border text-[0.75rem]"
                      style={{
                        borderColor: "var(--sys-border)",
                        background: "var(--sys-titlebar)",
                        color: "var(--sys-fg)",
                        fontFamily: "ui-monospace, monospace",
                        lineHeight: 1,
                        cursor: "pointer",
                        textDecoration: "none",
                      }}
                      title="Open source data in new window"
                      aria-label="Open source data in new window"
                    >
                      ↗
                    </a>
                  ) : null;
                })()}
                {onRemoveTrack && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveTrack(track.id);
                    }}
                    className="flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center border text-[0.75rem]"
                    style={{
                      borderColor: "var(--sys-border)",
                      background: "var(--sys-titlebar)",
                      color: "var(--sys-fg)",
                      fontFamily: "ui-monospace, monospace",
                      lineHeight: 1,
                      cursor: "pointer",
                    }}
                    title="Remove from canvas"
                    aria-label="Remove from canvas"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            {infoTrackId === track.id && (() => {
              const tile = getTileByTileId(track.tileId);
              const text = tile?.chartStory ?? tile?.description ?? "What this chart shows.";
              return (
                <div
                  className="mb-[var(--sys-space-1)] border px-[var(--sys-space-2)] py-[var(--sys-space-1)] text-[0.8125rem] leading-snug"
                  style={{
                    borderColor: "var(--sys-border)",
                    background: "var(--sys-titlebar)",
                    color: "var(--sys-fg)",
                  }}
                  role="region"
                  aria-label="Chart explanation"
                >
                  {text}
                </div>
              );
            })()}
            <div className="relative w-full min-h-[40px] overflow-hidden">
              {getTileByTileId(track.tileId)?.fetch.kind !== "none" ? (
                <DataChart
                  dataState={dataByTileId[track.tileId]}
                  domainStartMs={domainStartMs}
                  domainEndMs={domainEndMs}
                />
              ) : (
                <div
                  className="flex w-full flex-col items-center justify-center gap-[var(--sys-space-1)] border py-[var(--sys-space-2)] px-[var(--sys-space-2)]"
                  style={{ borderColor: "var(--sys-border)", background: "var(--sys-titlebar)", color: "var(--sys-fg)" }}
                >
                  <span className="text-[1rem]">{track.tileName}</span>
                  <span className="text-[10px] uppercase opacity-70" style={{ fontFamily: '"Tiny5", sans-serif', fontWeight: 400 }}>
                    Data not yet available
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

          {isHovering && cursorLeftPx !== null && (
            <div
              className="pointer-events-none absolute top-0 bottom-0 z-10 w-px"
              style={{
                left: `${cursorLeftPx}px`,
                backgroundColor: "var(--sys-border)",
              }}
              aria-hidden
            />
          )}

          {tooltipVisible &&
            (() => {
              const track = tracks.find((t) => t.id === hoveredTrackId)!;
              const dataState = dataByTileId[track.tileId] as { status: "ok"; payload: TileDataPayload };
              const values = getValuesAtDateMs(dataState.payload, cursorDateMs!);
              const { meta } = dataState.payload;
              const entries = Object.keys(meta.series)
                .filter((k) => k !== "date")
                .map((key) => ({ label: meta.series[key] ?? key, value: values[key] }))
                .filter((e) => e.value != null);
              if (entries.length === 0) return null;
              return (
                <div
                  ref={tooltipRef}
                  className="pointer-events-none fixed z-30 border px-[var(--sys-space-2)] py-[var(--sys-space-1)] text-[15px]"
                  style={{
                    left: tooltipOnLeft ? cursorClientX - 12 - tooltipWidth : cursorClientX + 12,
                    top: tooltipAbove ? cursorClientY - 12 - tooltipHeight : cursorClientY + 12,
                    borderColor: "var(--sys-border)",
                    backgroundColor: "var(--sys-titlebar)",
                    color: "var(--sys-fg)",
                    fontFamily: '"Tiny5", sans-serif',
                    fontWeight: 400,
                    boxShadow: "2px 2px 0 0 var(--sys-shadow)",
                  }}
                  role="tooltip"
                  aria-live="polite"
                >
                  <div className="font-semibold uppercase" style={{ marginBottom: 2 }}>
                    {formatDateForStatus(cursorDateMs!)}
                  </div>
                  {entries.map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-4">
                      <span>{label}</span>
                      <span style={{ marginLeft: 8 }}>{formatTooltipValue(value as number, meta.units)}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
        </div>
      </div>
      {statusBar}
    </div>
  );
}
