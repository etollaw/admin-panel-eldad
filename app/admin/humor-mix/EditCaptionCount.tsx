"use client";

import { useState } from "react";
import { updateHumorMix } from "./actions";

export default function EditCaptionCount({
  id,
  initialCount,
}: {
  id: string;
  initialCount: number;
}) {
  const [value, setValue] = useState(String(initialCount));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSave() {
    setSaving(true);
    setError(null);
    const formData = new FormData();
    formData.set("id", id);
    formData.set("caption_count", value);
    const result = await updateHumorMix(formData);
    setSaving(false);
    if (result.error) setError(result.error);
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-24 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
      />
      <button
        onClick={onSave}
        disabled={saving}
        className="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-2 py-1 rounded cursor-pointer"
      >
        {saving ? "Saving..." : "Save"}
      </button>
      {error ? <span className="text-red-400 text-xs">{error}</span> : null}
    </div>
  );
}
