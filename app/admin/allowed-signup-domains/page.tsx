import { requireSuperAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function createDomain(formData: FormData) {
  "use server";
  const { supabase } = await requireSuperAdmin();
  const apexDomain = String(formData.get("apex_domain") ?? "").trim().toLowerCase();
  if (!apexDomain) return;
  await supabase.from("allowed_signup_domains").insert({
    id: crypto.randomUUID(),
    created_datetime_utc: new Date().toISOString(),
    apex_domain: apexDomain,
  });
  revalidatePath("/admin/allowed-signup-domains");
}

async function updateDomain(formData: FormData) {
  "use server";
  const { supabase } = await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  const apexDomain = String(formData.get("apex_domain") ?? "").trim().toLowerCase();
  if (!id || !apexDomain) return;
  await supabase.from("allowed_signup_domains").update({ apex_domain: apexDomain }).eq("id", id);
  revalidatePath("/admin/allowed-signup-domains");
}

async function deleteDomain(formData: FormData) {
  "use server";
  const { supabase } = await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase.from("allowed_signup_domains").delete().eq("id", id);
  revalidatePath("/admin/allowed-signup-domains");
}

export default async function AllowedSignupDomainsPage() {
  const { supabase } = await requireSuperAdmin();
  const { data, error } = await supabase
    .from("allowed_signup_domains")
    .select("id, created_datetime_utc, apex_domain")
    .order("created_datetime_utc", { ascending: false });

  if (error) return <div className="text-red-400">Failed to load allowed signup domains: {error.message}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Allowed Signup Domains</h2>

      <form action={createDomain} className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 flex gap-3">
        <input name="apex_domain" required placeholder="example.edu" className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm">Create</button>
      </form>

      <div className="space-y-3">
        {data?.map((row) => (
          <form key={row.id} action={updateDomain} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-3 items-center">
            <input type="hidden" name="id" value={row.id} />
            <input name="apex_domain" defaultValue={row.apex_domain} required className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm">Update</button>
            <button formAction={deleteDomain} className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm">Delete</button>
          </form>
        ))}
      </div>
    </div>
  );
}
