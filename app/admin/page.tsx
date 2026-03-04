import { requireSuperAdmin } from "@/lib/auth";

export default async function AdminDashboard() {
  const { supabase } = await requireSuperAdmin();

  // Fetch all stats in parallel
  const [
    profilesResult,
    imagesResult,
    captionsResult,
    votesResult,
    recentUsersResult,
    topCaptionsResult,
    recentImagesResult,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("images").select("*", { count: "exact", head: true }),
    supabase.from("captions").select("*", { count: "exact", head: true }),
    supabase.from("caption_votes").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id, display_name, created_datetime_utc")
      .order("created_datetime_utc", { ascending: false })
      .limit(5),
    supabase
      .from("captions")
      .select("id, caption_text, score, image_id")
      .order("score", { ascending: false })
      .limit(5),
    supabase
      .from("images")
      .select("id, image_url, created_datetime_utc")
      .order("created_datetime_utc", { ascending: false })
      .limit(5),
  ]);

  const totalUsers = profilesResult.count ?? 0;
  const totalImages = imagesResult.count ?? 0;
  const totalCaptions = captionsResult.count ?? 0;
  const totalVotes = votesResult.count ?? 0;
  const recentUsers = recentUsersResult.data ?? [];
  const topCaptions = topCaptionsResult.data ?? [];
  const recentImages = recentImagesResult.data ?? [];

  const avgCaptionsPerImage =
    totalImages > 0 ? (totalCaptions / totalImages).toFixed(1) : "0";
  const avgVotesPerCaption =
    totalCaptions > 0 ? (totalVotes / totalCaptions).toFixed(1) : "0";

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={totalUsers} color="blue" />
        <StatCard label="Total Images" value={totalImages} color="green" />
        <StatCard label="Total Captions" value={totalCaptions} color="purple" />
        <StatCard label="Total Votes" value={totalVotes} color="amber" />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatCard
          label="Avg Captions / Image"
          value={avgCaptionsPerImage}
          color="teal"
        />
        <StatCard
          label="Avg Votes / Caption"
          value={avgVotesPerCaption}
          color="rose"
        />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Users */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
          <div className="space-y-3">
            {recentUsers.length === 0 && (
              <p className="text-gray-500 text-sm">No users yet.</p>
            )}
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-300 truncate">
                  {user.display_name || "Anonymous"}
                </span>
                <span className="text-gray-500 text-xs">
                  {user.created_datetime_utc
                    ? new Date(user.created_datetime_utc).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Captions */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Top Captions by Score</h3>
          <div className="space-y-3">
            {topCaptions.length === 0 && (
              <p className="text-gray-500 text-sm">No captions yet.</p>
            )}
            {topCaptions.map((caption) => (
              <div
                key={caption.id}
                className="flex items-center justify-between text-sm gap-4"
              >
                <span className="text-gray-300 truncate flex-1">
                  {caption.caption_text}
                </span>
                <span className="text-amber-400 font-mono font-semibold shrink-0">
                  {caption.score ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Images */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Images</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {recentImages.length === 0 && (
            <p className="text-gray-500 text-sm col-span-full">
              No images yet.
            </p>
          )}
          {recentImages.map((img) => (
            <div key={img.id} className="relative group">
              <img
                src={img.image_url}
                alt={`Image ${img.id}`}
                className="w-full aspect-square object-cover rounded-lg border border-gray-700"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-end p-2">
                <span className="text-xs text-gray-300 truncate">
                  {img.created_datetime_utc
                    ? new Date(img.created_datetime_utc).toLocaleDateString()
                    : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    green: "border-green-500/30 bg-green-500/10 text-green-400",
    purple: "border-purple-500/30 bg-purple-500/10 text-purple-400",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    teal: "border-teal-500/30 bg-teal-500/10 text-teal-400",
    rose: "border-rose-500/30 bg-rose-500/10 text-rose-400",
  };

  return (
    <div
      className={`rounded-xl border p-5 ${colorMap[color] ?? colorMap.blue}`}
    >
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
