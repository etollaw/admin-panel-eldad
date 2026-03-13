import { requireSuperAdmin } from "@/lib/auth";
import { createProvider, deleteProvider, updateProvider } from "./actions";

export default async function LlmProvidersPage() {
  const { supabase } = await requireSuperAdmin();
  const { data, error } = await supabase
    .from("llm_providers")
    .select("id, created_datetime_utc, name")
    .order("created_datetime_utc", { ascending: false });

  if (error) return <div className="text-red-400">Failed to load llm providers: {error.message}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">LLM Providers</h2>

      <form action={createProvider} className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 flex gap-3">
        <input name="name" required placeholder="Provider name" className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm" />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm">Create</button>
      </form>

      <div className="space-y-3">
        {data?.map((row) => (
          <form key={row.id} action={updateProvider} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-3 items-center">
            <input type="hidden" name="id" value={row.id} />
            <input
              name="name"
              defaultValue={row.name ?? ""}
              required
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
            />
            <span className="text-gray-500 text-xs font-mono">{String(row.id)}</span>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm">Update</button>
            <button formAction={deleteProvider} className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm">Delete</button>
          </form>
        ))}
      </div>
    </div>
  );
}
