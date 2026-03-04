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

  const { error } = await supabase
    .from("profiles")
    .update({ is_superadmin: true })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `User ${user.email} is now a superadmin. Go to /admin. IMPORTANT: Delete the app/bootstrap folder and redeploy!`,
  });
}
