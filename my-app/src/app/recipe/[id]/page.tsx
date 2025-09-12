"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

type Recipe = {
  _id: string;
  name: string;
  description?: string;
  imageUrl: string;
  ingredients?: string[];
  steps?: string[];
  notes?: { text: string; createdAt: string }[];
  likes: number;
  gallery?: string[];
};

const Skeleton = ({ className }: { className: string }) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-[#E0AB8B]/40 via-[#FFEEE7] to-[#E0AB8B]/40 rounded-md ${className}`}
  />
);

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

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

  async function updateRecipe(data:any ) {
    const res = await fetch(`/api/recipe/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const payload = await res.json();
    if (payload.success) setRecipe(payload.data);
  }

  async function deleteRecipe() {
    if (!confirm("Are you sure you want to delete this recipe?")) return;
    const res = await fetch(`/api/recipe/${id}`, {
      method: "DELETE",
    });
    const payload = await res.json();
    if (payload.success) {
      router.push("/"); // Or navigate to category list if you want
    } else {
      alert(payload.message || "Failed to delete");
    }
  }
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#FFEEE7] via-white to-[#FFEEE7] text-[#5C3D2E]">
        <div className="w-full max-w-2xl space-y-6 p-6">
          <Skeleton className="w-32 h-10" />
          <Skeleton className="w-full h-72" />
          <Skeleton className="w-1/2 h-6" />
          <Skeleton className="w-full h-24" />
        </div>
      </div>
    );

  if (!recipe)
    return <p className="p-4 text-red-600">Recipe not found.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFEEE7] via-white to-[#FFEEE7] text-[#5C3D2E] p-6 overflow-y-scroll">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back Button */}
         <div className="flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="p-3 rounded-full bg-[#E0AB8B] text-white hover:bg-[#c89273] transition"
          >
            ← Back
          </button>

          {/* Delete button */}
          <button
            onClick={deleteRecipe}
            className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
            title="Delete Recipe"
          >
            {/* Trash SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>

        {/* Hero Image */}
        <motion.img
          src={recipe.imageUrl}
          alt={recipe.name}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full h-72 object-cover rounded-2xl shadow-lg border border-[#E0AB8B]/40"
        />

        {/* Gallery */}
        {recipe.gallery && recipe.gallery.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {recipe.gallery.map((img, idx) => (
              <Image
                key={idx}
                src={img}
                alt={`gallery-${idx}`}
                className="w-full h-32 object-cover rounded-lg shadow border border-[#E0AB8B]/40 hover:opacity-90 transition"
              />
            ))}
          </div>
        )}

        {/* Title + description */}
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#E0AB8B]">
            {recipe.name}
          </h1>
          {recipe.description && (
            <p className="text-[#5C3D2E] leading-relaxed">
              {recipe.description}
            </p>
          )}
        </div>

        {/* Like button */}
        <button
          onClick={() => updateRecipe({ action: "like" })}
          className="bg-[#E0AB8B] text-white px-5 py-2 rounded-lg shadow hover:bg-[#c89273] transition"
        >
          ❤️ {recipe.likes}
        </button>

        {/* Ingredients */}
        <section className="bg-[#FFEEE7] p-5 rounded-xl shadow-md border border-[#E0AB8B]/40">
          <h2 className="text-2xl font-semibold mb-3 text-[#5C3D2E]">
            🥕 Ingredients
          </h2>
          <ul className="list-disc list-inside space-y-1 text-[#5C3D2E]">
            {(recipe.ingredients ?? []).map((i, idx) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <input
              className="flex-1 p-2 rounded-md bg-white border border-[#E0AB8B]/40 focus:ring-2 focus:ring-[#E0AB8B] outline-none"
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
              className="bg-[#E0AB8B] text-white hover:bg-[#c89273] px-3 rounded-md transition"
            >
              Add
            </button>
          </div>
        </section>

        {/* Steps */}
        <section className="bg-[#FFEEE7] p-5 rounded-xl shadow-md border border-[#E0AB8B]/40">
          <h2 className="text-2xl font-semibold mb-3 text-[#5C3D2E]">
            📖 Steps
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-[#5C3D2E]">
            {(recipe.steps ?? []).map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ol>
          <div className="mt-3 flex gap-2">
            <input
              className="flex-1 p-2 rounded-md bg-white border border-[#E0AB8B]/40 focus:ring-2 focus:ring-[#E0AB8B] outline-none"
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
              className="bg-[#E0AB8B] text-white hover:bg-[#c89273] px-3 rounded-md transition"
            >
              Add
            </button>
           
          </div>
        </section>

        {/* Notes */}
        <section className="bg-[#FFEEE7] p-5 rounded-xl shadow-md border border-[#E0AB8B]/40">
          <h2 className="text-2xl font-semibold mb-3 text-[#5C3D2E]">
            📝 Notes
          </h2>
          <ul className="space-y-2 text-[#5C3D2E]">
            {(recipe.notes ?? []).map((n, idx) => (
              <li key={idx} className="border-b border-[#E0AB8B]/30 pb-1">
                {n.text}{" "}
                <span className="text-xs text-[#E0AB8B]">
                  ({new Date(n.createdAt).toLocaleDateString()})
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <textarea
              className="flex-1 p-2 rounded-md bg-white border border-[#E0AB8B]/40 focus:ring-2 focus:ring-[#E0AB8B] outline-none"
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
              className="bg-[#E0AB8B] text-white hover:bg-[#c89273] px-3 rounded-md transition h-fit px-3 py-2"
            >
              Save
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
