import { getPolarizationPayload } from "@/src/lib/data/polarizationData";
import type { TileDataPayload } from "./types";

/**
 * Returns congressional polarization (DW-NOMINATE party distance) by year.
 * Source: Voteview (Lewis et al.). Currently uses static data from polarization charts.
 */
export function fetchPolarization(_init?: RequestInit): Promise<TileDataPayload> {
  return Promise.resolve(getPolarizationPayload());
}
