import { getScfWealthByCohortPayload } from "@/src/lib/data/scfWealthByCohortData";
import type { TileDataPayload } from "./types";

/**
 * Returns SCF-style median household net worth by age cohort (triennial).
 * Data source: Federal Reserve Survey of Consumer Finances (SCF).
 * Currently uses static data; can be replaced with live Fed CSV/API when available.
 */
export function fetchScfWealthByCohort(_init?: RequestInit): Promise<TileDataPayload> {
  return Promise.resolve(getScfWealthByCohortPayload());
}
