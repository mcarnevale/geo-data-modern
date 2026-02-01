import { getTurningTimelinePayload } from "@/src/lib/data/turningTimelineData";
import type { TileDataPayload } from "./types";

/**
 * Returns Strauss–Howe turning timeline (High, Awakening, Unraveling, Crisis) as editorial overlay.
 * Source: Curated model metadata.
 */
export function fetchTurningTimeline(_init?: RequestInit): Promise<TileDataPayload> {
  return Promise.resolve(getTurningTimelinePayload());
}
