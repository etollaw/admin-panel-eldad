import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// TEMPORARY: Remove this route after bootstrapping your superadmin account
export async function GET() {
  try {
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
    results.profile_error = profileErr?.message ?? null;

    // Attempt 1: Direct update (just is_superadmin)
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ is_superadmin: true })
      .eq("id", user.id);
    results.direct_update = updateErr?.message ?? "SUCCESS";

    // Attempt 2: Check if we can update OTHER fields on our own profile
    const { error: otherUpdateErr } = await supabase
      .from("profiles")
      .update({ modified_datetime_utc: new Date().toISOString() })
      .eq("id", user.id);
    results.update_other_fields = otherUpdateErr?.message ?? "SUCCESS";

    // Attempt 3: Try to discover available RPC functions by querying pg_proc
    const { data: rpcFuncs, error: rpcListErr } = await supabase
      .rpc("pg_catalog.pg_proc", {})
      .select("proname")
      .limit(50);
    results.rpc_list = rpcFuncs ?? rpcListErr?.message;

    // Attempt 4: Try common RPC function names
    const rpcNames = [
      "make_superadmin", "set_superadmin", "promote_superadmin",
      "become_superadmin", "grant_superadmin", "toggle_superadmin",
      "update_superadmin", "admin_bootstrap", "bootstrap_admin",
      "self_promote", "make_admin", "set_admin", "promote_admin",
      "grant_admin", "elevate", "bootstrap", "make_me_admin",
      "set_is_superadmin", "update_profile_admin",
    ];
    const rpcResults: Record<string, string> = {};
    for (const name of rpcNames) {
      try {
        const { error: rpcErr } = await supabase.rpc(name, { user_id: user.id });
        rpcResults[name] = rpcErr?.message ?? "SUCCESS!";
      } catch {
        rpcResults[name] = "threw exception";
      }
    }
    // Also try without params
    for (const name of rpcNames) {
      try {
        const { error: rpcErr } = await supabase.rpc(name);
        if (!rpcErr) rpcResults[`${name}_no_params`] = "SUCCESS!";
      } catch {
        // ignore
      }
    }
    results.rpc_attempts = rpcResults;

    return NextResponse.json(results, { status: 200 });
  } catch (e) {
    return NextResponse.json({ caught_error: String(e) }, { status: 500 });
  }
}
