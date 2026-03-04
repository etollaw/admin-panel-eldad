"use server";

import { requireSuperAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createImage(formData: FormData) {
  const { supabase } = await requireSuperAdmin();

  const imageUrl = formData.get("image_url") as string;

  if (!imageUrl?.trim()) {
    return { error: "Image URL is required." };
  }

  const { error } = await supabase.from("images").insert({
    image_url: imageUrl.trim(),
    created_datetime_utc: new Date().toISOString(),
    modified_datetime_utc: new Date().toISOString(),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/images");
  return { success: true };
}

export async function updateImage(formData: FormData) {
  const { supabase } = await requireSuperAdmin();

  const id = formData.get("id") as string;
  const imageUrl = formData.get("image_url") as string;

  if (!id || !imageUrl?.trim()) {
    return { error: "Image ID and URL are required." };
  }

  const { error } = await supabase
    .from("images")
    .update({
      image_url: imageUrl.trim(),
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/images");
  return { success: true };
}

export async function deleteImage(formData: FormData) {
  const { supabase } = await requireSuperAdmin();

  const id = formData.get("id") as string;

  if (!id) {
    return { error: "Image ID is required." };
  }

  const { error } = await supabase.from("images").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/images");
  return { success: true };
}
