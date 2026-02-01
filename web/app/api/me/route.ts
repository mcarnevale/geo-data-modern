import { createServerSupabaseClient } from "@/src/lib/supabase/server";
import { getSessionFromCookies } from "@/src/lib/auth/server";
import { isAuthConfigured } from "@/src/lib/auth/middleware";
import { NextResponse } from "next/server";

export async function GET() {
  if (isAuthConfigured()) {
    const session = await getSessionFromCookies();
    if (session) {
      return NextResponse.json({ user: { id: session.sub } });
    }
    return NextResponse.json({ user: null });
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return NextResponse.json({ user: user ?? null });
  } catch {
    return NextResponse.json({ user: null });
  }
}
