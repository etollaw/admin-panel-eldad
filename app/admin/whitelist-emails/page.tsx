import { requireSuperAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function createEmail(formData: FormData) {
  "use server";
  const { supabase } = await requireSuperAdmin();
  const emailAddress = String(formData.get("email_address") ?? "").trim().toLowerCase();
  if (!emailAddress) return;
  await supabase.from("whitelist_email_addresses").insert({
    created_datetime_utc: new Date().toISOString(),
    modified_datetime_utc: new Date().toISOString(),
    email_address: emailAddress,
  });
  revalidatePath("/admin/whitelist-emails");
}

async function updateEmail(formData: FormData) {
  "use server";
  const { supabase } = await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  const emailAddress = String(formData.get("email_address") ?? "").trim().toLowerCase();
  if (!id || !emailAddress) return;
  await supabase
    .from("whitelist_email_addresses")
    .update({ email_address: emailAddress, modified_datetime_utc: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/whitelist-emails");
}

async function deleteEmail(formData: FormData) {
  "use server";
  const { supabase } = await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase.from("whitelist_email_addresses").delete().eq("id", id);
  revalidatePath("/admin/whitelist-emails");
}

export default async function WhitelistEmailsPage() {
  const { supabase } = await requireSuperAdmin();
  const { data, error } = await supabase
    .from("whitelist_email_addresses")
    .select("id, created_datetime_utc, modified_datetime_utc, email_address")
    .order("created_datetime_utc", { ascending: false });

  if (error) return <div className="text-red-400">Failed to load whitelist emails: {error.message}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Whitelisted E-mail Addresses</h2>

      <form action={createEmail} className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 flex gap-3">
        <input name="email_address" type="email" required placeholder="student@example.edu" className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm">Create</button>
      </form>

      <div className="space-y-3">
        {data?.map((row) => (
          <form key={row.id} action={updateEmail} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-3 items-center">
            <input type="hidden" name="id" value={row.id} />
            <input name="email_address" type="email" defaultValue={row.email_address} required className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm">Update</button>
            <button formAction={deleteEmail} className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm">Delete</button>
          </form>
        ))}
      </div>
    </div>
  );
}
