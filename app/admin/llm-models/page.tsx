import { requireSuperAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function createModel(formData: FormData) {
  "use server";
  const { supabase } = await requireSuperAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const llmProviderId = String(formData.get("llm_provider_id") ?? "").trim();
  const providerModelId = String(formData.get("provider_model_id") ?? "").trim();
  const isTemperatureSupported = String(formData.get("is_temperature_supported") ?? "") === "on";

  if (!name || !llmProviderId || !providerModelId) return;

  await supabase.from("llm_models").insert({
    id: crypto.randomUUID(),
    created_datetime_utc: new Date().toISOString(),
    name,
    llm_provider_id: llmProviderId,
    provider_model_id: providerModelId,
    is_temperature_supported: isTemperatureSupported,
  });

  revalidatePath("/admin/llm-models");
}

async function updateModel(formData: FormData) {
  "use server";
  const { supabase } = await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const llmProviderId = String(formData.get("llm_provider_id") ?? "").trim();
  const providerModelId = String(formData.get("provider_model_id") ?? "").trim();
  const isTemperatureSupported = String(formData.get("is_temperature_supported") ?? "") === "on";

  if (!id || !name || !llmProviderId || !providerModelId) return;

  await supabase
    .from("llm_models")
    .update({
      name,
      llm_provider_id: llmProviderId,
      provider_model_id: providerModelId,
      is_temperature_supported: isTemperatureSupported,
    })
    .eq("id", id);

  revalidatePath("/admin/llm-models");
}

async function deleteModel(formData: FormData) {
  "use server";
  const { supabase } = await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase.from("llm_models").delete().eq("id", id);
  revalidatePath("/admin/llm-models");
}

export default async function LlmModelsPage() {
  const { supabase } = await requireSuperAdmin();

  const [{ data, error }, { data: providers }] = await Promise.all([
    supabase
      .from("llm_models")
      .select("id, created_datetime_utc, name, llm_provider_id, provider_model_id, is_temperature_supported")
      .order("created_datetime_utc", { ascending: false })
      .limit(300),
    supabase.from("llm_providers").select("id, name").order("name", { ascending: true }),
  ]);

  if (error) return <div className="text-red-400">Failed to load llm models: {error.message}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">LLM Models</h2>

      <form action={createModel} className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
        <input name="name" required placeholder="name" className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
        <select name="llm_provider_id" required className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm">
          <option value="">Select provider</option>
          {providers?.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <input name="provider_model_id" required placeholder="provider_model_id" className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
        <label className="text-sm text-gray-300 flex items-center gap-2">
          <input type="checkbox" name="is_temperature_supported" />
          Temp supported
        </label>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm">Create</button>
      </form>

      <div className="space-y-3">
        {data?.map((row) => (
          <form key={row.id} action={updateModel} className="bg-gray-900 border border-gray-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
            <input type="hidden" name="id" value={row.id} />
            <input name="name" defaultValue={row.name} required className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
            <select name="llm_provider_id" defaultValue={row.llm_provider_id} required className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm">
              {providers?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input name="provider_model_id" defaultValue={row.provider_model_id} required className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
            <label className="text-sm text-gray-300 flex items-center gap-2">
              <input type="checkbox" name="is_temperature_supported" defaultChecked={row.is_temperature_supported} />
              Temp supported
            </label>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm">Update</button>
            <button formAction={deleteModel} className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm">Delete</button>
          </form>
        ))}
      </div>
    </div>
  );
}
