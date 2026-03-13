import { requireSuperAdmin } from "@/lib/auth";

export default async function CaptionRequestsPage() {
  const { supabase } = await requireSuperAdmin();

  const { data, error } = await supabase
    .from("caption_requests")
    .select("id, created_datetime_utc, profile_id, image_id")
    .order("created_datetime_utc", { ascending: false })
    .limit(200);

  if (error) return <div className="text-red-400">Failed to load caption requests: {error.message}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Caption Requests</h2>
      <p className="text-gray-400 text-sm mb-4">{data?.length ?? 0} rows</p>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-4 py-3 text-gray-400 font-medium">Created</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Profile ID</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Image ID</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Request ID</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((row) => (
              <tr key={row.id} className="border-b border-gray-800/50">
                <td className="px-4 py-3 text-gray-300">{row.created_datetime_utc ? new Date(row.created_datetime_utc).toLocaleString() : "-"}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{row.profile_id}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{row.image_id}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{row.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
