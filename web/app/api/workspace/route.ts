import { getWorkspaceState, upsertWorkspaceState } from "@/src/lib/workspace/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";
import { getSessionFromCookies } from "@/src/lib/auth/server";
import { isAuthConfigured } from "@/src/lib/auth/middleware";
import { NextResponse } from "next/server";

async function getAuthUserId(): Promise<string | null> {
  if (isAuthConfigured()) {
    const session = await getSessionFromCookies();
    return session?.sub ?? null;
  }
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (isAuthConfigured()) {
    return NextResponse.json({ state: null });
  }
  const state = await getWorkspaceState(userId);
  return NextResponse.json({ state });
}

export async function PUT(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const state = body?.state;
  if (state == null || typeof state !== "object") {
    return NextResponse.json({ error: "Bad request: state required" }, { status: 400 });
  }
  if (isAuthConfigured()) {
    return NextResponse.json({ ok: true });
  }
  await upsertWorkspaceState(userId, state as Record<string, unknown>);
  return NextResponse.json({ ok: true });
}
