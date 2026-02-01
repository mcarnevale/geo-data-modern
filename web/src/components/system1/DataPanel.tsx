import type { RegistryModel, TileDef } from "@/src/lib/data/modelRegistry";
import type { Track } from "@/src/lib/types";
import { Window } from "./Window";

export interface DataPanelProps {
  selectedModel: RegistryModel | null;
  tracks: Track[];
  onAddTile: (model: RegistryModel, tile: TileDef) => void;
  onRemoveTile: (tileId: string) => void;
}

const buttonStyle = {
  borderColor: "var(--sys-border)" as const,
  color: "var(--sys-fg)" as const,
  background: "var(--sys-titlebar)" as const,
};

export function DataPanel({ selectedModel, tracks, onAddTile, onRemoveTile }: DataPanelProps) {
  const addedTileIds = new Set(tracks.map((t) => t.tileId));

  return (
    <Window title="DATA" className="w-full min-h-0 flex-1 overflow-hidden flex flex-col" contentClassName="flex flex-col min-h-0 overflow-y-auto">
      {selectedModel === null ? (
        <div
          className="flex min-h-[120px] items-center justify-center text-[1rem]"
          style={{ color: "var(--sys-fg)" }}
        >
          Select a model.
        </div>
      ) : (
        <div className="space-y-[var(--sys-space-3)] min-h-0">
          <div>
            <p className="font-semibold text-[1rem]" style={{ color: "var(--sys-fg)" }}>
              {selectedModel.name}
            </p>
            <p className="mt-[var(--sys-space-1)] text-[1rem]" style={{ color: "var(--sys-fg)" }}>
              {selectedModel.description}
            </p>
          </div>

          <div className="min-h-0 min-w-0">
            <ul className="mt-[var(--sys-space-2)] space-y-[var(--sys-space-2)]">
              {selectedModel.tiles.map((tile) => {
                const isAdded = addedTileIds.has(tile.tileId);
                return (
                  <li
                    key={tile.tileId}
                    className="flex items-start justify-between gap-[var(--sys-space-2)] border-b py-[var(--sys-space-1)]"
                    style={{ borderColor: "var(--sys-border)" }}
                  >
                    <div className="min-w-0 flex-1">
                      <span
                        className="font-semibold"
                        style={isAdded ? { color: "var(--sys-fg)", opacity: 0.7 } : undefined}
                      >
                        {tile.label}
                      </span>
                      {tile.description != null && tile.description !== "" && (
                        <div className="mt-[var(--sys-space-1)] text-[1rem]" style={{ color: "var(--sys-fg)", opacity: 0.85 }}>
                          {tile.description}
                        </div>
                      )}
                      <div
                        className="mt-[var(--sys-space-1)] text-[10px] uppercase opacity-70"
                        style={{ color: "var(--sys-fg)", fontFamily: '"Tiny5", sans-serif', fontWeight: 400 }}
                      >
                        {tile.source.provider}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => (isAdded ? onRemoveTile(tile.tileId) : onAddTile(selectedModel, tile))}
                      className="flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center border text-[0.75rem]"
                      style={{
                        ...buttonStyle,
                        fontFamily: "ui-monospace, monospace",
                        lineHeight: 1,
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
        </div>
      )}
    </Window>
  );
}
