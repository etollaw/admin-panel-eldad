import { requireSuperAdmin } from "@/lib/auth";

export default async function HumorFlavorStepsPage() {
  const { supabase } = await requireSuperAdmin();

  const { data, error } = await supabase
    .from("humor_flavor_steps")
    .select("id, created_datetime_utc, humor_flavor_id, order_by, llm_model_id, llm_temperature, description")
    .order("created_datetime_utc", { ascending: false })
    .limit(300);

  if (error) return <div className="text-red-400">Failed to load humor flavor steps: {error.message}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Humor Flavor Steps</h2>
      <p className="text-gray-400 text-sm mb-4">{data?.length ?? 0} rows</p>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-4 py-3 text-gray-400 font-medium">Flavor ID</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Order</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Model ID</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Temp</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((row) => (
              <tr key={row.id} className="border-b border-gray-800/50">
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{row.humor_flavor_id}</td>
                <td className="px-4 py-3 text-gray-300">{row.order_by}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{row.llm_model_id}</td>
                <td className="px-4 py-3 text-gray-300">{row.llm_temperature ?? "-"}</td>
                <td className="px-4 py-3 text-gray-400 max-w-xl">{row.description || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
