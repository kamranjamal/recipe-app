"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type RecipeBrief = {
  _id: string;
  name: string;
  imageUrl: string;
  categoryId: string;
  likes?: number;
  createdAt?: string;
};

export default function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [recipes, setRecipes] = useState<RecipeBrief[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});

  const gridCols = useMemo(() => "grid-cols-1", []);

  useEffect(() => {
    if (!id) return;
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchList() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/recipe?categoryId=${id}`);
      const payload = await res.json();
      if (!payload.success) throw new Error(payload.message || "Failed");
      setRecipes(payload.data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load recipes");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddRecipe(e?: React.FormEvent) {
    e?.preventDefault();
    if (!name.trim()) return setError("Please enter a name for the recipe");
    if (!imageFile) return setError("Please select an image");

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("name", name.trim());
      formData.append("categoryId", id);

      const createResp = await fetch("/api/recipe", {
        method: "POST",
        body: formData,
      });

      const created = await createResp.json();
      if (!created.success) throw new Error(created.message || "Failed to create");

      // optimistic insert at the top
      setRecipes((s) => [{ ...created.data }, ...s]);
      setName("");
      setImageFile(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to add recipe");
    } finally {
      setUploading(false);
    }
  }

  async function handleLike(recipeId: string) {
    setRecipes((prev) =>
      prev.map((r) => (r._id === recipeId ? { ...r, likes: (r.likes || 0) + 1 } : r))
    );

    try {
      const res = await fetch("/api/recipe", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like", recipeId }),
      });
      const payload = await res.json();
      if (!payload.success) throw new Error(payload.message || "Failed to like");
      setRecipes((prev) =>
        prev.map((r) => (r._id === recipeId ? { ...r, likes: payload.data.likes } : r))
      );
    } catch {
      fetchList();
    }
  }

  async function handleAddNote(recipeId: string) {
    const text = notesMap[recipeId]?.trim();
    if (!text) return;
    try {
      const res = await fetch("/api/recipe", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add-note", recipeId, noteText: text }),
      });
      const payload = await res.json();
      if (!payload.success) throw new Error(payload.message || "Failed to add note");
      setNotesMap((m) => ({ ...m, [recipeId]: "" }));
    } catch {
      setError("Failed to add note");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 text-white">
      <div className="max-w-md mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Recipes
          </h1>
          <p className="text-xs text-slate-400">Category: {id}</p>
        </header>

        {/* Add recipe */}
        <section className="mb-6">
          <form
            onSubmit={handleAddRecipe}
            className="bg-slate-800/60 backdrop-blur-sm p-4 rounded-xl shadow-lg space-y-3"
          >
            <input
              className="w-full p-3 rounded-md border border-slate-600 bg-slate-900/50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Recipe name"
            />
            <input
              accept="image/*"
              type="file"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-slate-300"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 rounded-md text-sm font-medium shadow-md disabled:opacity-60"
              >
                {uploading ? "Uploading..." : "Add Recipe"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setName("");
                  setImageFile(null);
                  setError(null);
                }}
                className="px-3 py-2 text-sm rounded-md border border-slate-600 bg-slate-700/60"
              >
                Clear
              </button>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </form>
        </section>

        {/* Listing */}
        <section>
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-400 animate-pulse">
              Loading…
            </div>
          ) : recipes.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No recipes yet — be the first to add one!
            </div>
          ) : (
            <div className={`grid gap-4 ${gridCols}`}>
              <AnimatePresence>
                {recipes.map((r) => (
                  <motion.article
                    key={r._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.2 }}
                    className="bg-slate-800/70 backdrop-blur-sm p-3 rounded-xl shadow-md flex gap-3 items-start"
                  >
                    <img
                      src={r.imageUrl}
                      alt={r.name}
                      className="w-24 h-24 rounded-md object-cover flex-shrink-0 border border-slate-700"
                      loading="lazy"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-sm font-semibold">{r.name}</h3>
                        <span className="text-xs text-slate-400">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => handleLike(r._id)}
                          className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-md border border-slate-600 bg-slate-700/60"
                        >
                          ❤️ {r.likes ?? 0}
                        </button>
                        <div className="flex-1">
                          <input
                            value={notesMap[r._id] ?? ""}
                            onChange={(e) =>
                              setNotesMap((m) => ({ ...m, [r._id]: e.target.value }))
                            }
                            placeholder="Add a note"
                            className="w-full text-xs p-2 rounded-md border border-slate-600 bg-slate-900/50"
                          />
                          <div className="flex mt-2 gap-2">
                            <button
                              onClick={() => handleAddNote(r._id)}
                              className="text-xs px-3 py-1 rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                            >
                              Save
                            </button>
                            <button
                              onClick={() =>
                                setNotesMap((m) => ({ ...m, [r._id]: "" }))
                              }
                              className="text-xs px-3 py-1 rounded-md border border-slate-600 bg-slate-700/50"
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
