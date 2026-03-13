import { requireSuperAdmin } from "@/lib/auth";

export default async function LlmPromptChainsPage() {
  const { supabase } = await requireSuperAdmin();

  const { data, error } = await supabase
    .from("llm_prompt_chains")
    .select("id, created_datetime_utc, caption_request_id")
    .order("created_datetime_utc", { ascending: false })
    .limit(300);

  if (error) return <div className="text-red-400">Failed to load llm prompt chains: {error.message}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">LLM Prompt Chains</h2>
      <p className="text-gray-400 text-sm mb-4">{data?.length ?? 0} rows</p>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-4 py-3 text-gray-400 font-medium">Created</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Caption Request ID</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Prompt Chain ID</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((row) => (
              <tr key={row.id} className="border-b border-gray-800/50">
                <td className="px-4 py-3 text-gray-300">{row.created_datetime_utc ? new Date(row.created_datetime_utc).toLocaleString() : "-"}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{row.caption_request_id}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{row.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
