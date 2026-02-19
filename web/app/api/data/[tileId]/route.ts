import { getTileByTileId } from "@/src/lib/data/modelRegistry";
import { fetchWealthDistribution } from "@/src/lib/data/fetchers/wealthDistribution";
import { fetchFredMulti } from "@/src/lib/data/fetchers/fredMulti";
import { fetchScfWealthByCohort } from "@/src/lib/data/fetchers/scfWealthByCohort";
import { fetchGssTrust } from "@/src/lib/data/fetchers/gssTrust";
import { fetchTurningTimeline } from "@/src/lib/data/fetchers/turningTimeline";
import { fetchAbsoluteMobility } from "@/src/lib/data/fetchers/absoluteMobility";
import { fetchPolarization } from "@/src/lib/data/fetchers/polarization";
import { fetchUnrest } from "@/src/lib/data/fetchers/unrest";
import { fetchViolenceWar } from "@/src/lib/data/fetchers/violenceWar";
import { fetchLongRunTopWealthShares } from "@/src/lib/data/fetchers/longRunTopWealthShares";
import { NextResponse } from "next/server";

const REVALIDATE_SECONDS = 5 * 60; // 5 minutes so FRED data refreshes and trendlines extend to latest available (e.g. 2025-Q4)
const fetchOpts: RequestInit = { next: { revalidate: REVALIDATE_SECONDS } };

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tileId: string }> }
) {
  const { tileId } = await params;
  const tile = getTileByTileId(tileId);
  if (!tile) {
    return NextResponse.json({ error: "Unknown tile" }, { status: 404 });
  }

  try {
  const kind = tile.fetch.kind;
  if (kind === "wealth-distribution") {
    const payload = await fetchWealthDistribution(fetchOpts);
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate`,
      },
    });
  }

  if (kind === "fred-multi" && tile.fetch.params) {
    const payload = await fetchFredMulti(tile.fetch.params as { series: { id: string; label: string }[] }, fetchOpts);
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate`,
      },
    });
  }

  if (kind === "scf-wealth-by-cohort") {
    const payload = await fetchScfWealthByCohort(fetchOpts);
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate`,
      },
    });
  }

  if (kind === "gss-institutional-trust") {
    const payload = await fetchGssTrust(fetchOpts);
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate`,
      },
    });
  }

  if (kind === "turning-timeline-overlay") {
    const payload = await fetchTurningTimeline(fetchOpts);
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate`,
      },
    });
  }

  if (kind === "absolute-mobility") {
    const payload = await fetchAbsoluteMobility(fetchOpts);
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate`,
      },
    });
  }

  if (kind === "polarization") {
    const payload = await fetchPolarization(fetchOpts);
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate`,
      },
    });
  }

  if (kind === "unrest") {
    const payload = await fetchUnrest(fetchOpts);
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate`,
      },
    });
  }

  if (kind === "long-run-top-wealth-shares") {
    const payload = await fetchLongRunTopWealthShares(fetchOpts);
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate`,
      },
    });
  }

  if (kind === "violence-war") {
    const payload = await fetchViolenceWar(fetchOpts);
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate`,
      },
    });
  }

  if (kind === "stub") {
    return NextResponse.json(
      { meta: { series: {} }, data: [] },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate`,
        },
      }
    );
  }

  return NextResponse.json({ error: "No data for this tile" }, { status: 404 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[api/data/${tileId}] fetch failed:`, message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
