import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// TEMPORARY ROUTE: remove after regaining access.
export async function GET() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Log in first, then open /bootstrap again." },
      { status: 401 }
    );
  }

  const { data: existingProfile, error: profileReadError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileReadError || !existingProfile) {
    return NextResponse.json(
      { error: profileReadError?.message || "Profile not found." },
      { status: 500 }
    );
  }

  const { error: deleteError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", user.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  const { error: insertError } = await supabase.from("profiles").insert({
    ...existingProfile,
    is_superadmin: true,
    modified_datetime_utc: new Date().toISOString(),
  });

  if (insertError) {
    // best-effort rollback
    await supabase.from("profiles").insert(existingProfile);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message:
      "You are now superadmin. Go to /admin. IMPORTANT: remove /bootstrap route after this.",
    email: user.email,
  });
}
