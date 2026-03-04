import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  // If already logged in as superadmin, redirect to admin
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_superadmin")
      .eq("id", user.id)
      .single();

    if (profile?.is_superadmin) {
      redirect("/admin");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md shadow-xl">
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Admin Panel
        </h1>
        <p className="text-gray-400 text-center mb-6 text-sm">
          Sign in with your superadmin account
        </p>

        {error === "unauthorized" && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
            Access denied. You are not a superadmin.
          </div>
        )}
        {error === "oauth_failed" && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
            Authentication failed. Please try again.
          </div>
        )}

        <LoginForm />
      </div>
    </div>
  );
}
