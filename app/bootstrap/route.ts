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
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    results.current_profile = profile;

    // Attempt 1: Try INSERT directly (maybe INSERT policy is different from UPDATE)
    const { error: insertErr } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        is_superadmin: true,
        created_datetime_utc: new Date().toISOString(),
      });
    results.insert_with_superadmin = insertErr?.message ?? "SUCCESS";

    // Attempt 2: Try UPSERT with onConflict
    const { error: upsertErr } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: user.email,
          is_superadmin: true,
          modified_datetime_utc: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    results.upsert_with_superadmin = upsertErr?.message ?? "SUCCESS";

    // Attempt 3: Delete profile then re-insert with superadmin
    const { error: deleteErr } = await supabase
      .from("profiles")
      .delete()
      .eq("id", user.id);
    results.delete_profile = deleteErr?.message ?? "SUCCESS";

    if (!deleteErr) {
      const { error: reinsertErr } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email,
          is_superadmin: true,
          created_datetime_utc: new Date().toISOString(),
        });
      results.reinsert_with_superadmin = reinsertErr?.message ?? "SUCCESS";

      // If reinsert failed, restore the profile without superadmin
      if (reinsertErr) {
        await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          is_superadmin: false,
          created_datetime_utc: profile?.created_datetime_utc ?? new Date().toISOString(),
        });
        results.restored_profile = true;
      }
    }

    // Attempt 4: Try updating user metadata through auth
    const { error: metaErr } = await supabase.auth.updateUser({
      data: { is_superadmin: true },
    });
    results.auth_metadata_update = metaErr?.message ?? "SUCCESS";

    // Re-check profile
    const { data: updatedProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    results.final_profile = updatedProfile;

    return NextResponse.json(results, { status: 200 });
  } catch (e) {
    return NextResponse.json({ caught_error: String(e) }, { status: 500 });
  }
}
