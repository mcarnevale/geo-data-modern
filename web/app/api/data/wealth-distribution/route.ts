import { fetchWealthDistribution } from "@/src/lib/data/fetchers/wealthDistribution";
import { NextResponse } from "next/server";

const REVALIDATE_SECONDS = 6 * 60 * 60; // 6 hours

export async function GET() {
  const payload = await fetchWealthDistribution({
    next: { revalidate: REVALIDATE_SECONDS },
  });
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate`,
    },
  });
}
