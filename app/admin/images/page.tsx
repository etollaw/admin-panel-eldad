import { requireSuperAdmin } from "@/lib/auth";
import ImageTable from "./ImageTable";
import CreateImageForm from "./CreateImageForm";

export default async function ImagesPage() {
  const { supabase } = await requireSuperAdmin();

  const { data: images, error } = await supabase
    .from("images")
    .select("*")
    .order("created_datetime_utc", { ascending: false });

  if (error) {
    return (
      <div className="text-red-400">
        Failed to load images: {error.message}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Images</h2>
          <p className="text-gray-400 text-sm mt-1">
            {images?.length ?? 0} total images
          </p>
        </div>
      </div>

      <CreateImageForm />
      <ImageTable images={images ?? []} />
    </div>
  );
}
