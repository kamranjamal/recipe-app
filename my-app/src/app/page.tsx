"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface ICategory {
  _id: string;
  name: string;
}

export default function Home() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [newCategory, setNewCategory] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/category");
      const payload = await res.json();
      if (payload.success) {
        setCategories(payload.data);
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    await fetch("/api/category", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategory }),
    });
    setNewCategory("");
    fetchCategories();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1f] via-[#0d1a33] to-[#001133] text-white p-6">
      <div className="max-w-2xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-500 drop-shadow-[0_0_10px_rgba(56,189,248,0.8)]"
        >
          Recipe Categories
        </motion.h1>

        {/* Add new category */}
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 mb-6 bg-[#0f1b33]/80 p-3 rounded-xl shadow-lg border border-blue-700/40 backdrop-blur-md"
        >
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name"
            className="flex-1 px-3 py-2 rounded-md bg-[#0d152b] border border-blue-700/50 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-gradient-to-r from-sky-500 to-blue-600 text-sm font-semibold shadow-md hover:scale-105 transition-transform"
          >
            Add
          </button>
        </form>

        {/* Categories grid */}
        <AnimatePresence>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Link href={`/category/${cat._id}`}>
                  <div className="bg-gradient-to-br from-[#0a2345] to-[#0d2d5c] p-5 rounded-2xl text-center font-semibold shadow-lg hover:shadow-[0_0_20px_rgba(56,189,248,0.6)] hover:scale-105 transition-transform cursor-pointer border border-blue-700/50">
                    <span className="block text-lg tracking-wide">
                      {cat.name}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}
