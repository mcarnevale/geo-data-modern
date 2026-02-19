"use client";

import type { Track } from "@/src/lib/types";
import { formatDateForStatus, makeLinearScale, parseDate } from "@/src/lib/timeScale";
import { TIMELINE_START_DATE } from "@/src/lib/timeline";
import { getTileByTileId, getSourceUrl } from "@/src/lib/data/modelRegistry";
import type { TileDataPayload } from "@/src/lib/data/fetchers/types";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

export interface CanvasProps {
  tracks: Track[];
  onRemoveTrack?: (trackId: string) => void;
}

const SERIES_COLORS = ["#4f7cff", "#f97316", "#22c55e", "#a855f7"] as const;
const CHART_HEIGHT = 160;
const CHART_PADDING = 8;
const CHART_LEGEND_WIDTH_PX = 72;
const VB_X_PADDING = 4;

type TileDataState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ok"; payload: TileDataPayload };

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
  if (Number.isInteger(v)) {
    return v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  return v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function formatAxisLabel(val: number, units?: string): string {
  const isDollars = units != null && /\$|dollar/i.test(units);
  const prefix = isDollars ? "$" : "";
  const abs = Math.abs(val);
  if (abs >= 1e12) return prefix + (val / 1e12).toFixed(1) + "T";
  if (abs >= 1e9) return prefix + (val / 1e9).toFixed(1) + "B";
  if (abs >= 1e6) return prefix + (val / 1e6).toFixed(1) + "M";
  if (abs >= 1e3) return prefix + (val / 1e3).toFixed(1) + "K";
  if (!Number.isInteger(val)) return prefix + val.toFixed(1);
  return prefix + val.toString();
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
  const chartId = useId();
  const vbW = 100;
  const vbH = CHART_PADDING * 2 + CHART_HEIGHT;
  // useMemo must be called unconditionally before any early returns
  const xScale = useMemo(
    () => makeLinearScale(domainStartMs, domainEndMs, VB_X_PADDING, vbW - VB_X_PADDING),
    [domainStartMs, domainEndMs]
  );

  const stateStyle: React.CSSProperties = {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    height: CHART_HEIGHT,
    fontSize: 13,
    color: "var(--fg-muted)",
    background: "rgba(255,255,255,0.02)",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border-subtle)",
  };

  if (dataState == null || dataState.status === "loading") {
    return <div style={stateStyle}>Loading data…</div>;
  }
  if (dataState.status === "error") {
    return <div style={stateStyle}>Data unavailable</div>;
  }
  const { meta, data } = dataState.payload;
  if (data.length === 0) {
    return <div style={stateStyle}>No data yet</div>;
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

  const legendWidth = CHART_LEGEND_WIDTH_PX;

  function y(val: number): number {
    return CHART_PADDING + CHART_HEIGHT - ((val - minVal) / range) * CHART_HEIGHT;
  }

  const linePoints = (key: string): string => {
    const pts: string[] = [];
    data.forEach((row) => {
      const v = row[key];
      if (v == null || typeof v !== "number") return;
      const xViewBox = xScale.xFromDateMs(parseDate(row.date));
      pts.push(`${xViewBox},${y(v)}`);
    });
    return pts.join(" ");
  };

  const areaPath = (key: string): string => {
    const pts: Array<[number, number]> = [];
    data.forEach((row) => {
      const v = row[key];
      if (v == null || typeof v !== "number") return;
      pts.push([xScale.xFromDateMs(parseDate(row.date)), y(v)]);
    });
    if (pts.length < 2) return "";
    const bottom = CHART_PADDING + CHART_HEIGHT;
    let d = `M ${pts[0][0]},${bottom}`;
    for (const [px, py] of pts) d += ` L ${px},${py}`;
    d += ` L ${pts[pts.length - 1][0]},${bottom} Z`;
    return d;
  };

  const gridYPositions = [0.25, 0.5, 0.75].map(
    (frac) => CHART_PADDING + frac * CHART_HEIGHT
  );

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full items-stretch">
        {/* Y-axis labels */}
        <div
          className="relative shrink-0"
          style={{ width: legendWidth, minHeight: CHART_HEIGHT }}
        >
          <span
            style={{
              position: "absolute",
              top: CHART_PADDING,
              right: 8,
              fontSize: 10,
              color: "var(--fg-muted)",
              whiteSpace: "nowrap",
              lineHeight: 1,
              transform: "translateY(-50%)",
            }}
          >
            {formatAxisLabel(maxVal, meta.units)}
          </span>
          <span
            style={{
              position: "absolute",
              bottom: CHART_PADDING,
              right: 8,
              fontSize: 10,
              color: "var(--fg-muted)",
              whiteSpace: "nowrap",
              lineHeight: 1,
              transform: "translateY(50%)",
            }}
          >
            {formatAxisLabel(minVal, meta.units)}
          </span>
        </div>

        {/* SVG chart */}
        <div className="min-w-0 flex-1">
          <svg
            viewBox={`0 0 ${vbW} ${vbH}`}
            preserveAspectRatio="none"
            width="100%"
            height={CHART_HEIGHT}
            className="block w-full"
            style={{ overflow: "visible" }}
          >
            <defs>
              {seriesKeys.map((key, i) => {
                const color = SERIES_COLORS[i % SERIES_COLORS.length];
                const safeId = `${chartId}-grad-${i}`;
                return (
                  <linearGradient
                    key={key}
                    id={safeId}
                    x1="0"
                    y1={CHART_PADDING}
                    y2={CHART_PADDING + CHART_HEIGHT}
                    x2="0"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor={color} stopOpacity="0.18" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                  </linearGradient>
                );
              })}
            </defs>

            {/* Gridlines */}
            {gridYPositions.map((yPos) => (
              <line
                key={yPos}
                x1={0}
                y1={yPos}
                x2={vbW}
                y2={yPos}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="0.4"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {/* Area fills */}
            {seriesKeys.map((key, i) => (
              <path
                key={`area-${key}`}
                d={areaPath(key)}
                fill={`url(#${chartId}-grad-${i})`}
              />
            ))}

            {/* Lines */}
            {seriesKeys.map((key, i) => (
              <polyline
                key={key}
                fill="none"
                stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                strokeWidth="1.5"
                points={linePoints(key)}
                vectorEffect="non-scaling-stroke"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div
        className="flex flex-wrap items-center gap-x-3 gap-y-1"
        style={{ paddingLeft: legendWidth }}
      >
        {seriesKeys.map((key, i) => (
          <span key={key} className="flex shrink-0 items-center gap-1.5">
            <span
              className="shrink-0"
              style={{
                width: 10,
                height: 10,
                borderRadius: "var(--radius-sm)",
                backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length],
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: 11, color: "var(--fg-muted)" }}>{meta.series[key] ?? key}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const DEFAULT_DOMAIN_START_MS = parseDate(TIMELINE_START_DATE);
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
      className="flex w-full shrink-0 border-b px-4 py-2"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div
        className="flex shrink-0 items-end"
        style={{ width: CHART_LEGEND_WIDTH_PX, paddingRight: 8 }}
      >
        <span style={{ fontSize: 10, color: "var(--fg-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Year
        </span>
      </div>
      <div ref={chartAreaRef} className="relative min-h-[20px] flex-1" style={{ minWidth: 0 }}>
        {chartInnerWidthPx > 0 &&
          ticks.map((dateMs) => {
            const x = scale.xFromDateMs(dateMs);
            const year = new Date(dateMs).getFullYear();
            return (
              <span
                key={dateMs}
                className="absolute bottom-0"
                style={{
                  left: `${x}px`,
                  transform: "translateX(-50%)",
                  fontSize: 10,
                  color: "var(--fg-muted)",
                  letterSpacing: "0.04em",
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
  const [isHoveringButtons, setIsHoveringButtons] = useState(false);
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

  void setDomainStartMs;
  void setDomainEndMs;
  void chartAreaLeftOffset;
  void setChartAreaLeftOffset;

  useEffect(() => {
    const fetchableTileIds = new Set<string>();
    for (const track of tracks) {
      const tile = getTileByTileId(track.tileId);
      if (tile?.fetch.kind !== "none") fetchableTileIds.add(track.tileId);
    }
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

  const tooltipVisible =
    !isHoveringButtons &&
    isHovering &&
    hoveredTrackId != null &&
    cursorDateMs != null &&
    (() => {
      const track = tracks.find((t) => t.id === hoveredTrackId);
      const dataState = track ? dataByTileId[track.tileId] : undefined;
      if (dataState?.status !== "ok") return false;
      const { data } = dataState.payload;
      if (data.length === 0) return false;
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
    const fitsRight = cursorClientX + 16 + width <= window.innerWidth;
    setTooltipOnLeft(!fitsRight);
    const fitsBelow = cursorClientY + 16 + height <= window.innerHeight;
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
      className="flex h-7 shrink-0 items-center justify-between border-t px-4"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <span style={{ fontSize: 12, color: "var(--fg-faint)" }}>Ready</span>
      {isHovering && cursorDateMs != null ? (
        <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>
          {formatDateForStatus(cursorDateMs)}
        </span>
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );

  if (tracks.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div
          className="flex flex-1 items-center justify-center"
          style={{ color: "var(--fg-muted)", fontSize: 13 }}
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
          className="relative flex min-h-full flex-col"
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
              className="flex flex-col border-b px-4 py-4"
              style={{
                borderColor: "var(--border-subtle)",
                background: hoveredTrackId === track.id ? "rgba(255,255,255,0.015)" : "transparent",
                transition: "background 0.15s",
              }}
              onMouseEnter={() => setHoveredTrackId(track.id)}
              onMouseLeave={() => setHoveredTrackId(null)}
            >
              {/* Track header */}
              <div className="mb-3 flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--fg)" }}>
                    {track.tileName}
                  </span>
                  <span
                    className="ml-2"
                    style={{ fontSize: 11, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}
                  >
                    {track.modelName}
                  </span>
                  {track.tileId === "wealth-distribution" && (
                    <span
                      className="ml-2"
                      style={{ fontSize: 11, color: "var(--fg-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}
                      title="Distributional Financial Accounts; series available from 1989"
                    >
                      DFA via FRED (from 1989)
                    </span>
                  )}
                </div>

                {/* Track action buttons */}
                <div
                  className="flex shrink-0 items-center gap-1"
                  onMouseEnter={() => setIsHoveringButtons(true)}
                  onMouseLeave={() => setIsHoveringButtons(false)}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInfoTrackId((prev) => (prev === track.id ? null : track.id));
                    }}
                    className="flex h-6 w-6 shrink-0 items-center justify-center text-[12px] transition-colors"
                    style={{
                      borderRadius: "var(--radius-sm)",
                      background: infoTrackId === track.id ? "var(--accent-muted)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${infoTrackId === track.id ? "var(--accent)" : "var(--border)"}`,
                      color: infoTrackId === track.id ? "var(--accent)" : "var(--fg-muted)",
                      cursor: "pointer",
                      fontFamily: "ui-monospace, monospace",
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
                        className="flex h-6 w-6 items-center justify-center text-[12px] transition-colors"
                        style={{
                          borderRadius: "var(--radius-sm)",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid var(--border)",
                          color: "var(--fg-muted)",
                          fontFamily: "ui-monospace, monospace",
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
                      className="flex h-6 w-6 shrink-0 items-center justify-center text-[12px] transition-colors"
                      style={{
                        borderRadius: "var(--radius-sm)",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid var(--border)",
                        color: "var(--fg-muted)",
                        cursor: "pointer",
                        fontFamily: "ui-monospace, monospace",
                      }}
                      title="Remove from canvas"
                      aria-label="Remove from canvas"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Info panel */}
              {infoTrackId === track.id && (() => {
                const tile = getTileByTileId(track.tileId);
                const text = tile?.chartStory ?? tile?.description ?? "What this chart shows.";
                return (
                  <div
                    className="mb-3 px-3 py-2 text-[13px] leading-relaxed"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      color: "var(--fg-muted)",
                    }}
                    role="region"
                    aria-label="Chart explanation"
                  >
                    {text}
                  </div>
                );
              })()}

              {/* Chart */}
              <div className="relative w-full" style={{ minHeight: CHART_HEIGHT }}>
                {getTileByTileId(track.tileId)?.fetch.kind !== "none" ? (
                  <DataChart
                    dataState={dataByTileId[track.tileId]}
                    domainStartMs={domainStartMs}
                    domainEndMs={domainEndMs}
                  />
                ) : (
                  <div
                    className="flex w-full flex-col items-center justify-center gap-1"
                    style={{
                      height: CHART_HEIGHT,
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      color: "var(--fg-muted)",
                    }}
                  >
                    <span style={{ fontSize: 13 }}>{track.tileName}</span>
                    <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg-faint)" }}>
                      Data not yet available
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Cursor hairline */}
          {isHovering && cursorLeftPx !== null && (
            <div
              className="pointer-events-none absolute top-0 bottom-0 z-10 w-px"
              style={{
                left: `${cursorLeftPx}px`,
                background: "var(--accent)",
                opacity: 0.5,
              }}
              aria-hidden
            />
          )}

          {/* Tooltip */}
          {tooltipVisible &&
            (() => {
              const track = tracks.find((t) => t.id === hoveredTrackId)!;
              const dataState = dataByTileId[track.tileId] as { status: "ok"; payload: TileDataPayload };
              const values = getValuesAtDateMs(dataState.payload, cursorDateMs!);
              const { meta } = dataState.payload;
              const entries = Object.keys(meta.series)
                .filter((k) => k !== "date")
                .map((key, i) => ({ label: meta.series[key] ?? key, value: values[key], color: SERIES_COLORS[i % SERIES_COLORS.length] }))
                .filter((e) => e.value != null);
              if (entries.length === 0) return null;
              return (
                <div
                  ref={tooltipRef}
                  className="pointer-events-none fixed z-30 px-3 py-2"
                  style={{
                    left: tooltipOnLeft ? cursorClientX - 16 - tooltipWidth : cursorClientX + 16,
                    top: tooltipAbove ? cursorClientY - 16 - tooltipHeight : cursorClientY + 16,
                    background: "var(--surface-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                    minWidth: 140,
                  }}
                  role="tooltip"
                  aria-live="polite"
                >
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--fg-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {formatDateForStatus(cursorDateMs!)}
                  </div>
                  {entries.map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between gap-4" style={{ marginTop: 3 }}>
                      <span className="flex items-center gap-1.5" style={{ fontSize: 12, color: "var(--fg-muted)" }}>
                        <span style={{ width: 8, height: 8, borderRadius: "2px", background: color, display: "inline-block", flexShrink: 0 }} />
                        {label}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--fg)", fontWeight: 500 }}>
                        {formatTooltipValue(value as number, meta.units)}
                      </span>
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
