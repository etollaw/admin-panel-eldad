"use server";

import { requireSuperAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateHumorMix(formData: FormData) {
  const { supabase } = await requireSuperAdmin();

  const id = formData.get("id") as string;
  const captionCountRaw = formData.get("caption_count") as string;
  const captionCount = Number(captionCountRaw);

  if (!id || Number.isNaN(captionCount)) {
    return { error: "Invalid row id or caption count." };
  }

  const { error } = await supabase
    .from("humor_flavor_mix")
    .update({ caption_count: captionCount })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/humor-mix");
  return { success: true };
}
