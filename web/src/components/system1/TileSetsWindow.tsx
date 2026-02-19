import type { TileSet } from "@/src/lib/types";
import { Window } from "./Window";

export interface TileSetsWindowProps {
  tileSets: TileSet[];
  onSaveTileSet: (name: string) => void;
  onApplyTileSet: (tileSetId: string) => void;
  onClose: () => void;
}

const ghostBtn: React.CSSProperties = {
  width: "100%",
  textAlign: "left",
  background: "transparent",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  color: "var(--fg-muted)",
  fontSize: 13,
  padding: "6px 10px",
  cursor: "pointer",
};

const actionBtn: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  color: "var(--fg-muted)",
  fontSize: 13,
  padding: "6px 10px",
  cursor: "pointer",
};

export function TileSetsWindow({
  tileSets,
  onSaveTileSet,
  onApplyTileSet,
  onClose,
}: TileSetsWindowProps) {
  return (
    <Window title="Tile Sets" className="w-64 shrink-0">
      <div className="flex flex-col gap-3">
        <ul className="flex flex-col gap-1">
          {tileSets.map((ts) => (
            <li key={ts.id}>
              <button type="button" onClick={() => onApplyTileSet(ts.id)} style={ghostBtn}>
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
          style={actionBtn}
        >
          Save Tile Set
        </button>
        <button type="button" onClick={onClose} style={actionBtn}>
          Close
        </button>
      </div>
    </Window>
  );
}
