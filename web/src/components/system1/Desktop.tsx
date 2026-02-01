"use client";

import { prototypeModels } from "@/src/lib/data/modelRegistry";
import type { RegistryModel, TileDef } from "@/src/lib/data/modelRegistry";
import type { SaveStatus, Scene, TileSet, Track } from "@/src/lib/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";
import { MenuBar } from "./MenuBar";
import { ScenesWindow } from "./ScenesWindow";
import { TileSetsWindow } from "./TileSetsWindow";
import { DataPanel } from "./DataPanel";
import { Window } from "./Window";

function createSceneId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `scene-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createTileSetId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `tileset-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isStateShape(s: unknown): s is Record<string, unknown> {
  return s != null && typeof s === "object" && !Array.isArray(s);
}

function dedupeByTileId(tracks: Track[]): Track[] {
  const seen = new Set<string>();
  return tracks.filter((t) => {
    if (seen.has(t.tileId)) return false;
    seen.add(t.tileId);
    return true;
  });
}

export function Desktop() {
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [tileSets, setTileSets] = useState<TileSet[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("Not saved");
  const [isScenesOpen, setIsScenesOpen] = useState(false);
  const [isTileSetsOpen, setIsTileSetsOpen] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedModel = selectedModelId
    ? prototypeModels.find((m) => m.id === selectedModelId) ?? null
    : null;

  // Load user and workspace on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const meRes = await fetch("/api/me");
      if (cancelled) return;
      const meData = await meRes.json().catch(() => ({}));
      const user = meData?.user ?? null;
      if (!user) {
        setIsLoggedIn(false);
        setSaveStatus("Not saved");
        setHasHydrated(true);
        return;
      }
      setIsLoggedIn(true);
      const workspaceRes = await fetch("/api/workspace");
      if (cancelled) return;
      const workspaceData = await workspaceRes.json().catch(() => ({}));
      const state = workspaceData?.state;
      if (isStateShape(state)) {
        if (Array.isArray(state.tracks)) setTracks(dedupeByTileId(state.tracks as Track[]));
        if (Array.isArray(state.scenes)) setScenes(state.scenes as Scene[]);
        if (Array.isArray(state.tileSets)) setTileSets(state.tileSets as TileSet[]);
        if (state.selectedModelId === null || typeof state.selectedModelId === "string") {
          setSelectedModelId(state.selectedModelId as string | null);
        }
        if (state.activeSceneId === null || typeof state.activeSceneId === "string") {
          setActiveSceneId(state.activeSceneId as string | null);
        }
      }
      setSaveStatus("Saved");
      setTimeout(() => {
        if (!cancelled) setHasHydrated(true);
      }, 0);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced autosave when state changes and user is logged in
  useEffect(() => {
    if (!isLoggedIn || !hasHydrated) return;
    setSaveStatus("Saving...");
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    const stateToSave = {
      tracks,
      scenes,
      tileSets,
      selectedModelId,
      activeSceneId,
    };
    saveTimeoutRef.current = setTimeout(async () => {
      saveTimeoutRef.current = null;
      try {
        await fetch("/api/workspace", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: stateToSave }),
        });
        setSaveStatus("Saved");
      } catch {
        setSaveStatus("Not saved");
      }
    }, 800);
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [
    isLoggedIn,
    hasHydrated,
    tracks,
    scenes,
    tileSets,
    selectedModelId,
    activeSceneId,
  ]);

  const handleAddTile = useCallback((model: RegistryModel, tile: TileDef) => {
    setTracks((prev) => {
      if (prev.some((t) => t.tileId === tile.tileId)) return prev;
      const track: Track = {
        id: `track-${model.id}-${tile.tileId}-${Date.now()}`,
        modelId: model.id,
        modelName: model.name,
        tileId: tile.tileId,
        tileName: tile.label,
      };
      return [...prev, track];
    });
  }, []);

  const handleRemoveTile = useCallback((tileId: string) => {
    setTracks((prev) => prev.filter((t) => t.tileId !== tileId));
  }, []);

  const handleRemoveTrack = useCallback((trackId: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
  }, []);

  const handleSaveScene = useCallback(
    (name: string) => {
      setScenes((prev) => [
        ...prev,
        {
          id: createSceneId(),
          name,
          tracks: [...tracks],
          createdAt: Date.now(),
        },
      ]);
    },
    [tracks]
  );

  const handleLoadScene = useCallback((sceneId: string | null) => {
    setActiveSceneId(sceneId);
    if (sceneId == null) return;
    setScenes((current) => {
      const scene = current.find((s) => s.id === sceneId);
      if (scene) {
        setTracks(dedupeByTileId(scene.tracks));
      }
      return current;
    });
  }, []);

  const handleSaveTileSet = useCallback((name: string) => {
    setTileSets((prev) => [
      ...prev,
      {
        id: createTileSetId(),
        name,
        tracks: [...tracks],
        createdAt: Date.now(),
      },
    ]);
  }, [tracks]);

  const handleApplyTileSet = useCallback((tileSetId: string) => {
    setTileSets((current) => {
      const tileSet = current.find((ts) => ts.id === tileSetId);
      if (tileSet) setTracks(dedupeByTileId(tileSet.tracks));
      return current;
    });
  }, []);

  return (
    <div className="desktop-texture flex h-screen w-screen flex-col overflow-hidden">
      <MenuBar />
      <div className="flex min-h-0 flex-1 flex-row">
        <aside className="flex w-[200px] shrink-0 flex-col p-[var(--sys-space-3)]">
          <Window title="MODELS" contentClassName="p-0" className="min-h-0 flex-1">
            <div className="p-[var(--sys-space-2)] text-[1rem]">
              <div className="space-y-[var(--sys-space-1)]">
                {prototypeModels.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => setSelectedModelId(model.id)}
                    className="w-full text-left"
                    style={{
                      color: "var(--sys-fg)",
                      background: selectedModelId === model.id ? "var(--sys-titlebar)" : "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "var(--sys-space-1) 0",
                    }}
                  >
                    {model.name}
                  </button>
                ))}
              </div>
            </div>
          </Window>
        </aside>

        <aside className="flex w-[320px] min-h-0 shrink-0 flex-col overflow-hidden p-[var(--sys-space-3)]">
          <DataPanel selectedModel={selectedModel} tracks={tracks} onAddTile={handleAddTile} onRemoveTile={handleRemoveTile} />
        </aside>

        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col p-[var(--sys-space-3)]">
          <div className="flex min-h-0 flex-1 flex-col">
            <Window title="CANVAS" contentClassName="flex min-h-0 flex-1 flex-col p-0" className="min-h-0 w-full flex-1">
              <Canvas tracks={tracks} onRemoveTrack={handleRemoveTrack} />
            </Window>
          </div>
          {isScenesOpen && (
            <div
              className="absolute right-[var(--sys-space-3)] top-[var(--sys-space-3)] z-10"
              aria-label="Scenes"
            >
              <ScenesWindow
                scenes={scenes}
                activeSceneId={activeSceneId}
                onSaveScene={handleSaveScene}
                onLoadScene={handleLoadScene}
                onClose={() => setIsScenesOpen(false)}
              />
            </div>
          )}
          {isTileSetsOpen && (
            <div
              className="absolute right-[var(--sys-space-3)] top-[var(--sys-space-3)] z-10"
              aria-label="Tile Sets"
              style={{ marginRight: isScenesOpen ? "280px" : 0 }}
            >
              <TileSetsWindow
                tileSets={tileSets}
                onSaveTileSet={handleSaveTileSet}
                onApplyTileSet={handleApplyTileSet}
                onClose={() => setIsTileSetsOpen(false)}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
