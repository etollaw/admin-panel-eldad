"use server";

import { requireSuperAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createProvider(formData: FormData) {
  const { supabase } = await requireSuperAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await supabase.from("llm_providers").insert({
    id: crypto.randomUUID(),
    created_datetime_utc: new Date().toISOString(),
    name,
  });

  revalidatePath("/admin/llm-providers");
}

export async function updateProvider(formData: FormData) {
  const { supabase } = await requireSuperAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return;

  await supabase.from("llm_providers").update({ name }).eq("id", id);

  revalidatePath("/admin/llm-providers");
}

export async function deleteProvider(formData: FormData) {
  const { supabase } = await requireSuperAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  await supabase.from("llm_providers").delete().eq("id", id);

  revalidatePath("/admin/llm-providers");
}
