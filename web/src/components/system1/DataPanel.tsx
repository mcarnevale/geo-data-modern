"use client";
import { useState } from "react";
import type { RegistryModel, TileDef } from "@/src/lib/data/modelRegistry";
import type { Track } from "@/src/lib/types";

export interface DataPanelProps {
  selectedModel: RegistryModel | null;
  tracks: Track[];
  onAddTile: (model: RegistryModel, tile: TileDef) => void;
  onRemoveTile: (tileId: string) => void;
}

function DetailIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="1" width="8" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="0" y="4" width="13" height="1" rx="0.5" fill="currentColor" opacity="0.5" />
      <rect x="0" y="6" width="11" height="1" rx="0.5" fill="currentColor" opacity="0.5" />
      <rect x="0" y="9.5" width="7" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="0" y="12" width="13" height="1" rx="0.5" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function MinimalIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="1"   width="13" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="0" y="5"   width="13" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="0" y="9"   width="13" height="1.5" rx="0.75" fill="currentColor" />
    </svg>
  );
}

export function DataPanel({ selectedModel, tracks, onAddTile, onRemoveTile }: DataPanelProps) {
  const [detailMode, setDetailMode] = useState(true);
  const addedTileIds = new Set(tracks.map((t) => t.tileId));

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div
        className="flex h-9 shrink-0 items-center justify-between border-b px-3"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--fg-muted)",
          }}
        >
          Data
        </span>
        <button
          type="button"
          onClick={() => setDetailMode((d) => !d)}
          title={detailMode ? "Switch to minimal view" : "Switch to detail view"}
          aria-label={detailMode ? "Switch to minimal view" : "Switch to detail view"}
          style={{
            background: "none",
            border: "none",
            padding: 2,
            cursor: "pointer",
            color: detailMode ? "var(--fg-muted)" : "var(--fg-faint)",
            lineHeight: 0,
            borderRadius: "var(--radius-sm)",
            display: "flex",
            alignItems: "center",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--fg)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = detailMode ? "var(--fg-muted)" : "var(--fg-faint)"; }}
        >
          {detailMode ? <MinimalIcon /> : <DetailIcon />}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {selectedModel === null ? (
          <div
            className="flex min-h-[120px] items-center justify-center text-[13px]"
            style={{ color: "var(--fg-muted)" }}
          >
            Select a model.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[13px] font-semibold" style={{ color: "var(--fg)" }}>
                {selectedModel.name}
              </p>
              <p className="mt-1 text-[12px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                {selectedModel.description}
              </p>
            </div>

            <ul className="flex flex-col gap-1">
              {selectedModel.tiles.map((tile) => {
                const isAdded = addedTileIds.has(tile.tileId);
                return (
                  <li
                    key={tile.tileId}
                    className="flex items-start justify-between gap-2 rounded px-2 py-2 transition-colors"
                    style={{
                      background: isAdded ? "var(--accent-muted)" : "transparent",
                      borderLeft: isAdded ? "2px solid var(--accent)" : "2px solid transparent",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <span
                        className="text-[13px]"
                        style={{
                          color: "var(--fg)",
                          opacity: isAdded ? 0.75 : 1,
                          fontWeight: 500,
                        }}
                      >
                        {tile.label}
                      </span>
                      {detailMode && tile.description != null && tile.description !== "" && (
                        <div className="mt-0.5 text-[11px] leading-snug" style={{ color: "var(--fg-muted)" }}>
                          {tile.description}
                        </div>
                      )}
                      {detailMode && (
                        <div
                          className="mt-1 text-[10px] uppercase tracking-wider"
                          style={{ color: "var(--fg-faint)" }}
                        >
                          {tile.source.provider}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => (isAdded ? onRemoveTile(tile.tileId) : onAddTile(selectedModel, tile))}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[12px] transition-colors"
                      style={{
                        background: isAdded ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)",
                        border: "1px solid var(--border)",
                        color: isAdded ? "var(--fg-muted)" : "var(--accent)",
                        cursor: "pointer",
                        lineHeight: 1,
                        borderRadius: "var(--radius-sm)",
                      }}
                      title={isAdded ? "Remove from canvas" : "Add to canvas"}
                      aria-label={isAdded ? "Remove from canvas" : "Add to canvas"}
                    >
                      {isAdded ? "×" : "+"}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
