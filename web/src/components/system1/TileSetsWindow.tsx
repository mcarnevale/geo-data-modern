import type { TileSet } from "@/src/lib/types";
import { Window } from "./Window";

export interface TileSetsWindowProps {
  tileSets: TileSet[];
  onSaveTileSet: (name: string) => void;
  onApplyTileSet: (tileSetId: string) => void;
  onClose: () => void;
}

const btnStyle = {
  borderColor: "var(--sys-border)" as const,
  color: "var(--sys-fg)" as const,
  background: "var(--sys-titlebar)" as const,
};

export function TileSetsWindow({
  tileSets,
  onSaveTileSet,
  onApplyTileSet,
  onClose,
}: TileSetsWindowProps) {
  return (
    <Window title="TILE SETS" className="w-64 shrink-0">
      <div className="flex flex-col gap-[var(--sys-space-3)]">
        <ul className="space-y-[var(--sys-space-1)]">
          {tileSets.map((ts) => (
            <li key={ts.id}>
              <button
                type="button"
                onClick={() => onApplyTileSet(ts.id)}
                className="w-full border px-[var(--sys-space-2)] py-[var(--sys-space-1)] text-left text-[1rem]"
                style={btnStyle}
              >
                {ts.name}
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => {
            const name = window.prompt("Tile set name:");
            if (name != null && name.trim()) onSaveTileSet(name.trim());
          }}
          className="border px-[var(--sys-space-2)] py-[var(--sys-space-1)] text-[1rem]"
          style={btnStyle}
        >
          Save Tile Set
        </button>
        <button
          type="button"
          onClick={onClose}
          className="border px-[var(--sys-space-2)] py-[var(--sys-space-1)] text-[1rem]"
          style={btnStyle}
        >
          Close
        </button>
      </div>
    </Window>
  );
}
