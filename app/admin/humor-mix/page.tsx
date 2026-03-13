import { requireSuperAdmin } from "@/lib/auth";
import EditCaptionCount from "./EditCaptionCount";

export default async function HumorMixPage() {
  const { supabase } = await requireSuperAdmin();

  const { data, error } = await supabase
    .from("humor_flavor_mix")
    .select("id, created_datetime_utc, humor_flavor_id, caption_count, humor_flavors(slug)")
    .order("created_datetime_utc", { ascending: false });

  if (error) return <div className="text-red-400">Failed to load humor mix: {error.message}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Humor Mix</h2>
      <p className="text-gray-400 text-sm mb-4">Read + Update caption_count</p>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-4 py-3 text-gray-400 font-medium">Flavor Slug</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Flavor ID</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Caption Count</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((row) => {
              const flavorRows = row.humor_flavors as { slug: string }[] | null;
              const flavorSlug = flavorRows?.[0]?.slug;
              return (
                <tr key={row.id} className="border-b border-gray-800/50">
                  <td className="px-4 py-3 text-gray-200">{flavorSlug || "-"}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{row.humor_flavor_id}</td>
                  <td className="px-4 py-3">
                    <EditCaptionCount id={row.id} initialCount={row.caption_count} />
                  </td>
                  <td className="px-4 py-3 text-gray-400">{row.created_datetime_utc ? new Date(row.created_datetime_utc).toLocaleString() : "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
