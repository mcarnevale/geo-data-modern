import { getUnrestPayload } from "@/src/lib/data/unrestData";
import type { TileDataPayload } from "./types";

/**
 * Returns US political unrest events (demonstrations, protests, political violence) by year.
 * Source: ACLED (Armed Conflict Location & Event Data Project). Currently uses static data from ACLED reports.
 */
export function fetchUnrest(_init?: RequestInit): Promise<TileDataPayload> {
  return Promise.resolve(getUnrestPayload());
}
