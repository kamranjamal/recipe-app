"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Upload } from "lucide-react";

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

      if (!payload.success)
        throw new Error(payload.message || "Failed to create");

      router.push(`/category/${categoryId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffeee7] via-[#fff4ef] to-[#ffeee7] p-6 text-[#4a2c1a]">
      <div className="max-w-lg mx-auto space-y-6">
        <button
          onClick={() => router.back()}
          className="p-3 rounded-full bg-gradient-to-r from-[#E0AB8B] to-[#c97c54] shadow-md hover:scale-105 transition-transform flex items-center text-white"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#E0AB8B] to-[#c97c54] bg-clip-text text-transparent">
          Create New Recipe
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-gradient-to-br from-[#fff7f3] to-[#f6d4c4] p-5 rounded-xl shadow-lg"
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Recipe name"
            className="w-full p-3 rounded-md border border-[#E0AB8B]/50 bg-[#fffdfc]/70 text-[#4a2c1a] placeholder-[#a88570] focus:ring-2 focus:ring-[#E0AB8B]"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full p-3 rounded-md border border-[#E0AB8B]/50 bg-[#fffdfc]/70 text-[#4a2c1a] placeholder-[#a88570] focus:ring-2 focus:ring-[#E0AB8B]"
          />

          {/* Upload field with icon */}
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#E0AB8B]/60 rounded-lg cursor-pointer bg-[#fffdfc]/70 hover:bg-[#fbe6da] transition">
            <Upload className="w-8 h-8 text-[#c97c54] mb-2" />
            <span className="text-sm text-[#7a5c49]">
              {imageFile ? imageFile.name : "Click to upload image"}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-md bg-gradient-to-r from-[#E0AB8B] to-[#c97c54] text-white font-medium shadow-md hover:scale-105 transition-transform disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Recipe"}
          </button>
        </form>
      </div>
    </div>
  );
}
