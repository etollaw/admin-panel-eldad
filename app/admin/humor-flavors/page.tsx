import { requireSuperAdmin } from "@/lib/auth";

export default async function HumorFlavorsPage() {
  const { supabase } = await requireSuperAdmin();

  const { data, error } = await supabase
    .from("humor_flavors")
    .select("id, created_datetime_utc, slug, description")
    .order("created_datetime_utc", { ascending: false });

  if (error) return <div className="text-red-400">Failed to load humor flavors: {error.message}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Humor Flavors</h2>
      <p className="text-gray-400 text-sm mb-4">{data?.length ?? 0} rows</p>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-4 py-3 text-gray-400 font-medium">Slug</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Description</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Created</th>
              <th className="px-4 py-3 text-gray-400 font-medium">ID</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((row) => (
              <tr key={row.id} className="border-b border-gray-800/50">
                <td className="px-4 py-3 text-gray-200">{row.slug}</td>
                <td className="px-4 py-3 text-gray-400 max-w-xl">{row.description || "-"}</td>
                <td className="px-4 py-3 text-gray-400">{row.created_datetime_utc ? new Date(row.created_datetime_utc).toLocaleString() : "-"}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{row.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
