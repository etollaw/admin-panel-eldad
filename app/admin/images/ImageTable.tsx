"use client";

import { useState } from "react";
import { updateImage, deleteImage } from "./actions";

interface Image {
  id: string;
  image_url: string;
  created_datetime_utc: string | null;
  modified_datetime_utc: string | null;
}

export default function ImageTable({ images }: { images: Image[] }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-4 py-3 text-gray-400 font-medium">Preview</th>
              <th className="px-4 py-3 text-gray-400 font-medium">
                Image URL
              </th>
              <th className="px-4 py-3 text-gray-400 font-medium">Created</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {images.map((image) => (
              <ImageRow key={image.id} image={image} />
            ))}
            {images.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No images found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ImageRow({ image }: { image: Image }) {
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(image.image_url);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleUpdate() {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.set("id", image.id);
    formData.set("image_url", url);
    const result = await updateImage(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setEditing(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    const formData = new FormData();
    formData.set("id", image.id);
    const result = await deleteImage(formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
  }

  return (
    <tr className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
      <td className="px-4 py-3">
        <img
          src={image.image_url}
          alt=""
          className="w-16 h-16 object-cover rounded-lg border border-gray-700"
        />
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <div className="flex flex-col gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-2 py-1 rounded cursor-pointer"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setUrl(image.image_url);
                  setError(null);
                }}
                className="text-xs text-gray-400 hover:text-white px-2 py-1 cursor-pointer"
              >
                Cancel
              </button>
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
          </div>
        ) : (
          <span className="text-gray-300 text-xs break-all">
            {image.image_url}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-gray-400 text-xs">
        {image.created_datetime_utc
          ? new Date(image.created_datetime_utc).toLocaleDateString()
          : "—"}
      </td>
      <td className="px-4 py-3">
        {confirmDelete ? (
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="text-xs bg-red-600 hover:bg-red-700 disabled:opacity-50 px-2 py-1 rounded cursor-pointer"
            >
              {loading ? "..." : "Confirm"}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-gray-400 hover:text-white px-2 py-1 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
            >
              Edit
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
            >
              Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
