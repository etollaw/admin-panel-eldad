import { requireSuperAdmin } from "@/lib/auth";

export default async function CaptionsPage() {
  const { supabase } = await requireSuperAdmin();

  const { data: captions, error } = await supabase
    .from("captions")
    .select("*, images(image_url), profiles(display_name)")
    .order("created_datetime_utc", { ascending: false });

  if (error) {
    return (
      <div className="text-red-400">
        Failed to load captions: {error.message}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Captions</h2>
      <p className="text-gray-400 text-sm mb-4">
        {captions?.length ?? 0} total captions (read-only)
      </p>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-4 py-3 text-gray-400 font-medium">Image</th>
                <th className="px-4 py-3 text-gray-400 font-medium">
                  Caption
                </th>
                <th className="px-4 py-3 text-gray-400 font-medium">Author</th>
                <th className="px-4 py-3 text-gray-400 font-medium">Score</th>
                <th className="px-4 py-3 text-gray-400 font-medium">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {captions?.map((caption) => {
                const imageData = caption.images as
                  | { image_url: string }
                  | null;
                const profileData = caption.profiles as
                  | { display_name: string }
                  | null;

                return (
                  <tr
                    key={caption.id}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      {imageData?.image_url ? (
                        <img
                          src={imageData.image_url}
                          alt=""
                          className="w-12 h-12 object-cover rounded-lg border border-gray-700"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-800 rounded-lg border border-gray-700" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-300 max-w-md">
                      <p className="line-clamp-2">{caption.caption_text}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {profileData?.display_name || "Anonymous"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-amber-400">
                        {caption.score ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {caption.created_datetime_utc
                        ? new Date(
                            caption.created_datetime_utc
                          ).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                );
              })}
              {(!captions || captions.length === 0) && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No captions found.
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
