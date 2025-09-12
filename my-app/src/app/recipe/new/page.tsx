"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function NewRecipePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Please enter a recipe name");
    if (!imageFile) return setError("Please upload an image");

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("categoryId", categoryId || "");
      formData.append("file", imageFile);

      const res = await fetch("/api/recipe", {
        method: "POST",
        body: formData,
      });
      const payload = await res.json();

      if (!payload.success) throw new Error(payload.message || "Failed to create");

      router.push(`/category/${categoryId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6 text-white">
      <div className="max-w-lg mx-auto space-y-6">
         <button
          onClick={() => router.back()}
          className="p-3  rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-md hover:scale-105 transition-transform flex items-center"
         
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold">Create New Recipe</h1>
        <form onSubmit={handleSubmit} className="space-y-4 bg-slate-800/60 p-4 rounded-xl shadow-lg">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Recipe name"
            className="w-full p-3 rounded-md border border-slate-700 bg-slate-900/50"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full p-3 rounded-md border border-slate-700 bg-slate-900/50"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-slate-300"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-md disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Recipe"}
          </button>
        </form>
      </div>
    </div>
  );
}
