/**
 * US political unrest events (demonstrations, protests, political violence).
 * Source: ACLED (Armed Conflict Location & Event Data Project).
 * https://acleddata.com/united-states-and-canada/usa/
 *
 * Approximate annual event counts from ACLED reports (2018–2024).
 * 2020 saw a massive spike (22,900+ events) driven by BLM protests following George Floyd's death.
 * When ACLED provides a direct API or updated CSV, replace with live fetcher.
 */
import type { TileDataPayload } from "@/src/lib/data/fetchers/types";

/** Year -> event count. Approximate from ACLED reports and US Crisis Monitor. */
const UNREST_EVENTS: { year: number; events: number }[] = [
  { year: 2018, events: 3200 }, // Pre-2020 baseline (estimated)
  { year: 2019, events: 3800 }, // Pre-2020 baseline (estimated)
  { year: 2020, events: 22900 }, // Documented: >22,900 events (BLM protests, right-wing mobilization)
  { year: 2021, events: 8500 }, // Post-2020 decline (estimated, includes Jan 6 Capitol riot)
  { year: 2022, events: 5200 }, // Continued decline (estimated)
  { year: 2023, events: 4800 }, // Stabilization (estimated)
  { year: 2024, events: 4500 }, // Recent baseline (estimated)
];

export function getUnrestPayload(): TileDataPayload {
  return {
    meta: {
      series: { events: "Political unrest events (demonstrations, protests, violence)" },
      units: "count",
    },
    data: UNREST_EVENTS.map(({ year, events }) => ({
      date: `${year}-01-01`,
      events,
    })),
  };
}
