import type { Scene } from "@/src/lib/types";
import { Window } from "./Window";

export interface ScenesWindowProps {
  scenes: Scene[];
  activeSceneId: string | null;
  onSaveScene: (name: string) => void;
  onLoadScene: (sceneId: string | null) => void;
  onClose: () => void;
}

const btnStyle = {
  borderColor: "var(--sys-border)" as const,
  color: "var(--sys-fg)" as const,
  background: "var(--sys-titlebar)" as const,
};

export function ScenesWindow({
  scenes,
  activeSceneId,
  onSaveScene,
  onLoadScene,
  onClose,
}: ScenesWindowProps) {
  return (
    <Window title="SCENES" className="w-64 shrink-0">
      <div className="flex flex-col gap-[var(--sys-space-3)]">
        <div className="space-y-[var(--sys-space-1)]">
          <button
            type="button"
            onClick={() => onLoadScene(null)}
            className="w-full border px-[var(--sys-space-2)] py-[var(--sys-space-1)] text-left text-[1rem]"
            style={{
              borderColor: "var(--sys-border)",
              color: "var(--sys-fg)",
              background: activeSceneId === null ? "var(--sys-titlebar)" : "white",
            }}
          >
            Current
          </button>
          {scenes.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onLoadScene(s.id)}
              className="w-full border px-[var(--sys-space-2)] py-[var(--sys-space-1)] text-left text-[1rem]"
              style={{
                borderColor: "var(--sys-border)",
                color: "var(--sys-fg)",
                background: activeSceneId === s.id ? "var(--sys-titlebar)" : "white",
              }}
            >
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
          className="border px-[var(--sys-space-2)] py-[var(--sys-space-1)] text-[1rem]"
          style={btnStyle}
        >
          Save Scene
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
