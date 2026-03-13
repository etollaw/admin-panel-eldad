import { requireSuperAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function createTerm(formData: FormData) {
  "use server";
  const { supabase } = await requireSuperAdmin();

  const term = String(formData.get("term") ?? "").trim();
  const definition = String(formData.get("definition") ?? "").trim();
  const example = String(formData.get("example") ?? "").trim();
  const priority = Number(formData.get("priority") ?? "0");
  const termTypeIdRaw = String(formData.get("term_type_id") ?? "").trim();

  if (!term || !definition || !example || Number.isNaN(priority)) {
    return;
  }

  await supabase.from("terms").insert({
    id: crypto.randomUUID(),
    created_datetime_utc: new Date().toISOString(),
    modified_datetime_utc: new Date().toISOString(),
    term,
    definition,
    example,
    priority,
    term_type_id: termTypeIdRaw || null,
  });

  revalidatePath("/admin/terms");
}

async function updateTerm(formData: FormData) {
  "use server";
  const { supabase } = await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  const term = String(formData.get("term") ?? "").trim();
  const definition = String(formData.get("definition") ?? "").trim();
  const example = String(formData.get("example") ?? "").trim();
  const priority = Number(formData.get("priority") ?? "0");
  const termTypeIdRaw = String(formData.get("term_type_id") ?? "").trim();

  if (!id || !term || !definition || !example || Number.isNaN(priority)) return;

  await supabase
    .from("terms")
    .update({
      modified_datetime_utc: new Date().toISOString(),
      term,
      definition,
      example,
      priority,
      term_type_id: termTypeIdRaw || null,
    })
    .eq("id", id);

  revalidatePath("/admin/terms");
}

async function deleteTerm(formData: FormData) {
  "use server";
  const { supabase } = await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase.from("terms").delete().eq("id", id);
  revalidatePath("/admin/terms");
}

export default async function TermsPage() {
  const { supabase } = await requireSuperAdmin();
  const { data, error } = await supabase
    .from("terms")
    .select("id, created_datetime_utc, term, definition, example, priority, term_type_id")
    .order("created_datetime_utc", { ascending: false })
    .limit(200);

  if (error) return <div className="text-red-400">Failed to load terms: {error.message}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Terms</h2>

      <form action={createTerm} className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-5 gap-3">
        <input name="term" required placeholder="term" className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
        <input name="definition" required placeholder="definition" className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
        <input name="example" required placeholder="example" className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
        <input name="priority" type="number" required placeholder="priority" className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
        <div className="flex gap-2">
          <input name="term_type_id" placeholder="term_type_id (optional)" className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm">Create</button>
        </div>
      </form>

      <div className="space-y-3">
        {data?.map((row) => (
          <form key={row.id} action={updateTerm} className="bg-gray-900 border border-gray-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
            <input type="hidden" name="id" value={row.id} />
            <input name="term" defaultValue={row.term} required className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
            <input name="definition" defaultValue={row.definition} required className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
            <input name="example" defaultValue={row.example} required className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
            <input name="priority" type="number" defaultValue={row.priority} required className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
            <input name="term_type_id" defaultValue={row.term_type_id ?? ""} className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm">Update</button>
              <button formAction={deleteTerm} className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm">Delete</button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
