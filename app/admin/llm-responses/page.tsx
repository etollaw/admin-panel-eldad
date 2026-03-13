import { requireSuperAdmin } from "@/lib/auth";

export default async function LlmResponsesPage() {
  const { supabase } = await requireSuperAdmin();

  const { data, error } = await supabase
    .from("llm_model_responses")
    .select("id, created_datetime_utc, llm_model_response, processing_time_seconds, llm_model_id, profile_id, caption_request_id")
    .order("created_datetime_utc", { ascending: false })
    .limit(200);

  if (error) return <div className="text-red-400">Failed to load llm responses: {error.message}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">LLM Responses</h2>
      <p className="text-gray-400 text-sm mb-4">{data?.length ?? 0} rows</p>
      <div className="space-y-4">
        {data?.map((row) => (
          <div key={row.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-2">
              <span>Model: <span className="font-mono">{row.llm_model_id}</span></span>
              <span>Profile: <span className="font-mono">{row.profile_id}</span></span>
              <span>Request: <span className="font-mono">{row.caption_request_id}</span></span>
              <span>Latency: {row.processing_time_seconds}s</span>
            </div>
            <p className="text-gray-300 whitespace-pre-wrap text-sm">{row.llm_model_response || "(empty response)"}</p>
            <p className="text-gray-500 text-xs mt-2">{row.created_datetime_utc ? new Date(row.created_datetime_utc).toLocaleString() : "-"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
