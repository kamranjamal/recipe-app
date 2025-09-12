"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

type Recipe = {
  _id: string;
  name: string;
  description?: string;
  imageUrl: string;
  ingredients?: string[];
  steps?: string[];
  notes?: { text: string; createdAt: string }[];
  likes: number;
};

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  // form states
  const [note, setNote] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [step, setStep] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/recipe/${id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setRecipe(res.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function updateRecipe(data: any) {
    const res = await fetch(`/api/recipe/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const payload = await res.json();
    if (payload.success) setRecipe(payload.data);
  }

  if (loading) return <p className="p-4 text-slate-400">Loading…</p>;
  if (!recipe) return <p className="p-4 text-red-400">Recipe not found.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white p-6 overflow-y-scroll">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Hero Image */}
        <motion.img
          src={recipe.imageUrl}
          alt={recipe.name}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full h-72 object-cover rounded-2xl shadow-2xl"
        />

        {/* Title + description */}
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {recipe.name}
          </h1>
          {recipe.description && (
            <p className="text-slate-300 leading-relaxed">{recipe.description}</p>
          )}
        </div>

        {/* Like button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => updateRecipe({ action: "like" })}
          className="bg-gradient-to-r from-pink-500 to-red-500 px-5 py-2 rounded-lg shadow-lg hover:opacity-90 transition"
        >
          ❤️ {recipe.likes}
        </motion.button>

        {/* Ingredients */}
        <section className="bg-slate-800/50 p-5 rounded-xl shadow-xl backdrop-blur-md">
          <h2 className="text-2xl font-semibold mb-3">🥕 Ingredients</h2>
          <ul className="list-disc list-inside space-y-1 text-slate-300">
            {(recipe.ingredients ?? []).map((i, idx) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <input
              className="flex-1 p-2 rounded-md bg-slate-900/70 border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
              value={ingredient}
              onChange={(e) => setIngredient(e.target.value)}
              placeholder="Add ingredient"
            />
            <button
              onClick={() => {
                if (ingredient.trim()) {
                  updateRecipe({ action: "add-ingredient", ingredient });
                  setIngredient("");
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 px-3 rounded-md transition"
            >
              Add
            </button>
          </div>
        </section>

        {/* Steps */}
        <section className="bg-slate-800/50 p-5 rounded-xl shadow-xl backdrop-blur-md">
          <h2 className="text-2xl font-semibold mb-3">📖 Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-slate-300">
            {(recipe.steps ?? []).map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ol>
          <div className="mt-3 flex gap-2">
            <input
              className="flex-1 p-2 rounded-md bg-slate-900/70 border border-slate-700 focus:ring-2 focus:ring-green-500 outline-none"
              value={step}
              onChange={(e) => setStep(e.target.value)}
              placeholder="Add step"
            />
            <button
              onClick={() => {
                if (step.trim()) {
                  updateRecipe({ action: "add-step", step });
                  setStep("");
                }
              }}
              className="bg-green-600 hover:bg-green-700 px-3 rounded-md transition"
            >
              Add
            </button>
          </div>
        </section>

        {/* Notes */}
        <section className="bg-slate-800/50 p-5 rounded-xl shadow-xl backdrop-blur-md">
          <h2 className="text-2xl font-semibold mb-3">📝 Notes</h2>
          <ul className="space-y-2 text-slate-400">
            {(recipe.notes ?? []).map((n, idx) => (
              <li key={idx} className="border-b border-slate-700 pb-1">
                {n.text}{" "}
                <span className="text-xs text-slate-500">
                  ({new Date(n.createdAt).toLocaleDateString()})
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <input
              className="flex-1 p-2 rounded-md bg-slate-900/70 border border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add note"
            />
            <button
              onClick={() => {
                if (note.trim()) {
                  updateRecipe({ action: "add-note", note });
                  setNote("");
                }
              }}
              className="bg-purple-600 hover:bg-purple-700 px-3 rounded-md transition"
            >
              Save
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
