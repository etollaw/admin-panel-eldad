"use server";

import { requireSuperAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const API_BASE = "https://api.almostcrackd.ai";

export async function createImage(formData: FormData) {
  const { supabase } = await requireSuperAdmin();

  const imageUrl = formData.get("image_url") as string;

  if (!imageUrl?.trim()) {
    return { error: "Image URL is required." };
  }

  const { error } = await supabase.from("images").insert({
    url: imageUrl.trim(),
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
      url: imageUrl.trim(),
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

export async function uploadImageFile(formData: FormData) {
  const { supabase } = await requireSuperAdmin();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { error: "You must be logged in." };
  }

  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) {
    return { error: "No image file provided." };
  }

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
  ];
  if (!allowedTypes.includes(file.type)) {
    return { error: `Unsupported image type: ${file.type}` };
  }

  const step1Res = await fetch(`${API_BASE}/pipeline/generate-presigned-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ contentType: file.type }),
  });

  if (!step1Res.ok) {
    return { error: `Presign failed (${step1Res.status})` };
  }

  const { presignedUrl, cdnUrl } = (await step1Res.json()) as {
    presignedUrl: string;
    cdnUrl: string;
  };

  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const step2Res = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: fileBuffer,
  });

  if (!step2Res.ok) {
    return { error: `Upload failed (${step2Res.status})` };
  }

  const step3Res = await fetch(`${API_BASE}/pipeline/upload-image-from-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false }),
  });

  if (!step3Res.ok) {
    return { error: `Register image failed (${step3Res.status})` };
  }

  revalidatePath("/admin/images");
  return { success: true };
}
