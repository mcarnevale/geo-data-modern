import { getAbsoluteMobilityPayload } from "@/src/lib/data/absoluteMobilityData";
import type { TileDataPayload } from "./types";

/**
 * Returns absolute income mobility by birth cohort (Chetty et al.).
 * Date = year when cohort turned 30 (reference year). Value = % of children earning more than parents.
 */
export function fetchAbsoluteMobility(_init?: RequestInit): Promise<TileDataPayload> {
  return Promise.resolve(getAbsoluteMobilityPayload());
}
