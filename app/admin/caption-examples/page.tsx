import { requireSuperAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function createCaptionExample(formData: FormData) {
  "use server";
  const { supabase } = await requireSuperAdmin();

  const imageDescription = String(formData.get("image_description") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();
  const explanation = String(formData.get("explanation") ?? "").trim();
  const priority = Number(formData.get("priority") ?? "0");
  const imageIdRaw = String(formData.get("image_id") ?? "").trim();

  if (!imageDescription || !caption || !explanation || Number.isNaN(priority)) return;

  await supabase.from("caption_examples").insert({
    id: crypto.randomUUID(),
    created_datetime_utc: new Date().toISOString(),
    modified_datetime_utc: new Date().toISOString(),
    image_description: imageDescription,
    caption,
    explanation,
    priority,
    image_id: imageIdRaw || null,
  });

  revalidatePath("/admin/caption-examples");
}

async function updateCaptionExample(formData: FormData) {
  "use server";
  const { supabase } = await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  const imageDescription = String(formData.get("image_description") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();
  const explanation = String(formData.get("explanation") ?? "").trim();
  const priority = Number(formData.get("priority") ?? "0");
  const imageIdRaw = String(formData.get("image_id") ?? "").trim();

  if (!id || !imageDescription || !caption || !explanation || Number.isNaN(priority)) return;

  await supabase
    .from("caption_examples")
    .update({
      modified_datetime_utc: new Date().toISOString(),
      image_description: imageDescription,
      caption,
      explanation,
      priority,
      image_id: imageIdRaw || null,
    })
    .eq("id", id);

  revalidatePath("/admin/caption-examples");
}

async function deleteCaptionExample(formData: FormData) {
  "use server";
  const { supabase } = await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase.from("caption_examples").delete().eq("id", id);
  revalidatePath("/admin/caption-examples");
}

export default async function CaptionExamplesPage() {
  const { supabase } = await requireSuperAdmin();
  const { data, error } = await supabase
    .from("caption_examples")
    .select("id, created_datetime_utc, image_description, caption, explanation, priority, image_id")
    .order("created_datetime_utc", { ascending: false })
    .limit(200);

  if (error) return <div className="text-red-400">Failed to load caption examples: {error.message}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Caption Examples</h2>

      <form action={createCaptionExample} className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-6 gap-3">
        <input name="image_description" required placeholder="image description" className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
        <input name="caption" required placeholder="caption" className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
        <input name="explanation" required placeholder="explanation" className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
        <input name="priority" type="number" required placeholder="priority" className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
        <input name="image_id" placeholder="image_id (optional)" className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm">Create</button>
      </form>

      <div className="space-y-3">
        {data?.map((row) => (
          <form key={row.id} action={updateCaptionExample} className="bg-gray-900 border border-gray-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
            <input type="hidden" name="id" value={row.id} />
            <input name="image_description" defaultValue={row.image_description} required className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
            <input name="caption" defaultValue={row.caption} required className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
            <input name="explanation" defaultValue={row.explanation} required className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
            <input name="priority" type="number" defaultValue={row.priority} required className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
            <input name="image_id" defaultValue={row.image_id ?? ""} className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm">Update</button>
              <button formAction={deleteCaptionExample} className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm">Delete</button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
