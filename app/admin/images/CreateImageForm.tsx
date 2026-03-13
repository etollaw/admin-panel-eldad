"use client";

import { createImage, uploadImageFile } from "./actions";
import { useState } from "react";

export default function CreateImageForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await createImage(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
    }
  }

  async function handleFileSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await uploadImageFile(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
      >
        + Add Image
      </button>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
      <h3 className="text-sm font-semibold mb-3">Add New Image by URL</h3>
      <form action={handleSubmit} className="flex gap-3 mb-4">
        <input
          type="url"
          name="image_url"
          placeholder="https://images.almostcrackd.ai/..."
          required
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </form>

      <h3 className="text-sm font-semibold mb-3">Upload New Image File</h3>
      <form action={handleFileSubmit} className="flex gap-3 mb-2" encType="multipart/form-data">
        <input
          type="file"
          name="image"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
          required
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>

      <div>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="text-gray-400 hover:text-white text-sm px-3 py-2 cursor-pointer"
        >
          Cancel
        </button>
      </div>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}
