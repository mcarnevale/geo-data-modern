import { getViolenceWarPayload } from "@/src/lib/data/violenceWarData";
import type { TileDataPayload } from "./types";

/**
 * Returns global battle-related deaths (conflict intensity) by year.
 * Source: UCDP (Uppsala Conflict Data Program). Currently uses static data from UCDP summaries.
 */
export function fetchViolenceWar(_init?: RequestInit): Promise<TileDataPayload> {
  return Promise.resolve(getViolenceWarPayload());
}
