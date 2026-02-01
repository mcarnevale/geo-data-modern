import { createServerSupabaseClient } from "@/src/lib/supabase/server";

/**
 * Expects public.workspaces: (user_id uuid, name text, state jsonb)
 * with unique constraint on (user_id, name).
 */
const WORKSPACE_NAME = "Default";

export async function getWorkspaceState(userId: string): Promise<Record<string, unknown> | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("workspaces")
    .select("state")
    .eq("user_id", userId)
    .eq("name", WORKSPACE_NAME)
    .maybeSingle();

  if (error) throw error;
  return data?.state ?? null;
}

export async function upsertWorkspaceState(
  userId: string,
  state: Record<string, unknown>
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("workspaces").upsert(
    { user_id: userId, name: WORKSPACE_NAME, state },
    { onConflict: "user_id,name" }
  );
  if (error) throw error;
}
