import type { Scene } from "@/src/lib/types";
import { Window } from "./Window";

export interface ScenesWindowProps {
  scenes: Scene[];
  activeSceneId: string | null;
  onSaveScene: (name: string) => void;
  onLoadScene: (sceneId: string | null) => void;
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
  transition: "background 0.1s, color 0.1s",
};

const activeBtn: React.CSSProperties = {
  ...ghostBtn,
  background: "var(--accent-muted)",
  borderColor: "var(--accent)",
  color: "var(--fg)",
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

export function ScenesWindow({
  scenes,
  activeSceneId,
  onSaveScene,
  onLoadScene,
  onClose,
}: ScenesWindowProps) {
  return (
    <Window title="Scenes" className="w-64 shrink-0">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <button type="button" onClick={() => onLoadScene(null)} style={activeSceneId === null ? activeBtn : ghostBtn}>
            Current
          </button>
          {scenes.map((s) => (
            <button key={s.id} type="button" onClick={() => onLoadScene(s.id)} style={activeSceneId === s.id ? activeBtn : ghostBtn}>
              {s.name}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            const name = window.prompt("Scene name:");
            if (name != null && name.trim()) onSaveScene(name.trim());
          }}
          style={actionBtn}
        >
          Save Scene
        </button>
        <button type="button" onClick={onClose} style={actionBtn}>
          Close
        </button>
      </div>
    </Window>
  );
}
