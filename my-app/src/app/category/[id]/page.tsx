"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
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
  const router = useRouter();

  const [recipes, setRecipes] = useState<RecipeBrief[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const gridCols = useMemo(() => "grid-cols-2 sm:grid-cols-3", []);

  useEffect(() => {
    if (!id) return;
    fetchList();
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
      setError(err.message || "Failed to load recipes");
    } finally {
      setLoading(false);
    }
  }

  const filteredRecipes = recipes.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 text-white">
      <div className="max-w-3xl mx-auto">
         <button
          onClick={() => router.back()}
          className="p-3  rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-md hover:scale-105 transition-transform flex items-center"
        >
          ← Back
        </button>
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Recipes
            </h1>
            <p className="text-xs text-slate-400">Category: {id}</p>
          </div>
          <button
            onClick={() => router.push(`/recipe/new?categoryId=${id}`)}
            className="p-3  rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-md hover:scale-105 transition-transform sticky bottom-3 right-3"
          >
            + Add
          </button>
        </header>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes..."
            className="w-full p-3 rounded-lg border border-slate-700 bg-slate-800/60 placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Listing */}
        {loading ? (
          <div className="py-8 text-center text-sm text-slate-400 animate-pulse">
            Loading…
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">
            No recipes yet — be the first to add one!
          </div>
        ) : (
          <div className={`grid gap-4 ${gridCols}`}>
            <AnimatePresence>
              {filteredRecipes.map((r, idx) => (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}
                  onClick={() => router.push(`/recipe/${r._id}`)}
                  className="cursor-pointer bg-slate-800/70 rounded-xl overflow-hidden shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-transform"
                >
                  <img
                    src={r.imageUrl}
                    alt={r.name}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-3">
                    <h3 className="text-lg font-semibold">{r.name}</h3>
                    <p className="text-xs text-slate-400">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
