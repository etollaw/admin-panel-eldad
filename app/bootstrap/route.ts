import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// TEMPORARY: Remove this route after bootstrapping your superadmin account
export async function GET() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in first. Go to /login and sign in with Google, then come back to /bootstrap." },
      { status: 401 }
    );
  }

  const results: Record<string, unknown> = { user_id: user.id, email: user.email };

  // Check current profile
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  results.current_profile = profile;
  results.profile_error = profileErr?.message;

  // Attempt 1: Direct update
  const { error: updateErr } = await supabase
    .from("profiles")
    .update({ is_superadmin: true })
    .eq("id", user.id);
  results.update_error = updateErr?.message ?? "SUCCESS";

  // Attempt 2: Upsert
  if (updateErr) {
    const { error: upsertErr } = await supabase
      .from("profiles")
      .upsert({ id: user.id, is_superadmin: true });
    results.upsert_error = upsertErr?.message ?? "SUCCESS";
  }

  // Attempt 3: Check for any RPC functions
  const rpcNames = [
    "make_superadmin",
    "set_superadmin",
    "promote_superadmin",
    "become_superadmin",
    "grant_superadmin",
    "toggle_superadmin",
    "update_superadmin",
    "admin_bootstrap",
    "bootstrap_admin",
    "self_promote",
  ];

  for (const name of rpcNames) {
    const { error: rpcErr } = await supabase.rpc(name, { user_id: user.id });
    if (!rpcErr || !rpcErr.message.includes("Could not find")) {
      results[`rpc_${name}`] = rpcErr?.message ?? "SUCCESS";
    }
  }

  // Attempt 4: Check if we can update other fields (to understand RLS scope)
  const { error: otherUpdateErr } = await supabase
    .from("profiles")
    .update({ modified_datetime_utc: new Date().toISOString() })
    .eq("id", user.id);
  results.update_other_fields = otherUpdateErr?.message ?? "SUCCESS";

  return NextResponse.json(results, { status: 200 });
}
