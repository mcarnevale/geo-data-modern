import { getGssTrustPayload } from "@/src/lib/data/gssTrustData";
import type { TileDataPayload } from "./types";

/**
 * Returns GSS-style confidence in institutions and social trust over time.
 * Source: General Social Survey (GSS). Currently uses static data; replace with
 * live GSS Data Explorer / SDA export when available.
 */
export function fetchGssTrust(_init?: RequestInit): Promise<TileDataPayload> {
  return Promise.resolve(getGssTrustPayload());
}
