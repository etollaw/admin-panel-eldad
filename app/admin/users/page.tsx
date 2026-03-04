import { requireSuperAdmin } from "@/lib/auth";

export default async function UsersPage() {
  const { supabase } = await requireSuperAdmin();

  const { data: users, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_datetime_utc", { ascending: false });

  if (error) {
    return (
      <div className="text-red-400">Failed to load users: {error.message}</div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Users / Profiles</h2>
      <p className="text-gray-400 text-sm mb-4">
        {users?.length ?? 0} total users (read-only)
      </p>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-4 py-3 text-gray-400 font-medium">
                  Name
                </th>
                <th className="px-4 py-3 text-gray-400 font-medium">Email</th>
                <th className="px-4 py-3 text-gray-400 font-medium">
                  Superadmin
                </th>
                <th className="px-4 py-3 text-gray-400 font-medium">
                  Created
                </th>
                <th className="px-4 py-3 text-gray-400 font-medium">ID</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-4 py-3 text-white">
                    {[user.first_name, user.last_name].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {user.email || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {user.is_superadmin ? (
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                        Yes
                      </span>
                    ) : (
                      <span className="bg-gray-700/50 text-gray-500 text-xs px-2 py-1 rounded-full">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {user.created_datetime_utc
                      ? new Date(
                          user.created_datetime_utc
                        ).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                    {user.id.slice(0, 8)}...
                  </td>
                </tr>
              ))}
              {(!users || users.length === 0) && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
