"use client";

import { useEffect, useState } from "react";
import { recipes } from "@/lib/data";

export default function RecipesPage() {
    const [recipeList, setRecipeList] = useState(recipes);
    const [hydrated, setHydrated] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        title: "",
        time: "20 min",
        servings: "2",
        tags: "Custom",
        ingredients: "",
        instructions: "",
    });

    useEffect(() => {
        if (!hydrated || typeof window === "undefined") {
            return;
        }

        window.localStorage.setItem("pantrypal-recipes", JSON.stringify(recipeList));
    }, [hydrated, recipeList]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const stored = window.localStorage.getItem("pantrypal-recipes");
        if (stored) {
            try {
                setRecipeList(JSON.parse(stored));
            } catch {
                setRecipeList(recipes);
            }
        }

        setHydrated(true);
    }, []);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const title = form.title.trim();
        const ingredients = form.ingredients
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);
        const instructions = form.instructions
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

        if (!title || ingredients.length === 0 || instructions.length === 0) {
            return;
        }

        const newRecipe = {
            id: crypto.randomUUID(),
            title,
            time: form.time,
            servings: Number(form.servings) || 1,
            tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean) || ["Custom"],
            match: 100,
            ingredients,
            instructions,
        };

        setRecipeList((current) => [newRecipe, ...current]);
        setForm({
            title: "",
            time: "20 min",
            servings: "2",
            tags: "Custom",
            ingredients: "",
            instructions: "",
        });
        setShowForm(false);
    };

    const handleDeleteRecipe = (id: string) => {
        setRecipeList((current) => current.filter((recipe) => recipe.id !== id));
    };

    return (
        <main className="min-h-screen bg-[#edf5ec] p-6 text-slate-800">
            <div className="mx-auto max-w-6xl space-y-6">
                <header className="flex items-center justify-between rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">PantryPal</p>
                        <h1 className="mt-2 text-3xl font-bold text-slate-900">Recipes</h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowForm((current) => !current)}
                        className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                        + New recipe
                    </button>
                </header>

                {showForm && (
                    <form onSubmit={handleSubmit} className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-slate-900">Create a recipe</h2>
                            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-slate-500">
                                Close
                            </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <input
                                value={form.title}
                                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                                placeholder="Recipe title"
                                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-300"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    value={form.time}
                                    onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
                                    placeholder="Time"
                                    className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-300"
                                />
                                <input
                                    type="number"
                                    min="1"
                                    value={form.servings}
                                    onChange={(event) => setForm((current) => ({ ...current, servings: event.target.value }))}
                                    placeholder="Servings"
                                    className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-300"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <input
                                value={form.tags}
                                onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
                                placeholder="Tags (comma separated)"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-300"
                            />
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <textarea
                                value={form.ingredients}
                                onChange={(event) => setForm((current) => ({ ...current, ingredients: event.target.value }))}
                                placeholder="Ingredients (one per line)"
                                rows={6}
                                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-300"
                            />
                            <textarea
                                value={form.instructions}
                                onChange={(event) => setForm((current) => ({ ...current, instructions: event.target.value }))}
                                placeholder="Instructions (one per line)"
                                rows={6}
                                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-300"
                            />
                        </div>

                        <div className="mt-5 flex justify-end">
                            <button type="submit" className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                                Save recipe
                            </button>
                        </div>
                    </form>
                )}

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {recipeList.map((recipe) => (
                        <article key={recipe.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-xl font-semibold text-slate-900">{recipe.title}</h2>
                                <button
                                    type="button"
                                    aria-label={`Delete ${recipe.title}`}
                                    onClick={() => handleDeleteRecipe(recipe.id)}
                                    className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:border-red-200 hover:text-red-600"
                                >
                                    Delete
                                </button>
                            </div>

                            <div className="mt-2 flex items-center justify-between">
                                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                                    {recipe.match}% match
                                </span>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                                <span>{recipe.time}</span>
                                <span>•</span>
                                <span>{recipe.servings} servings</span>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {recipe.tags.map((tag) => (
                                    <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-5">
                                <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Ingredients</h3>
                                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                                    {recipe.ingredients.map((ingredient) => (
                                        <li key={ingredient} className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                            <a href="/inventory" className="transition hover:text-emerald-700 hover:underline">
                                                {ingredient}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-5">
                                <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Steps</h3>
                                <ol className="mt-2 space-y-2 text-sm text-slate-700">
                                    {recipe.instructions.map((step, index) => (
                                        <li key={step} className="flex gap-2">
                                            <span className="font-semibold text-emerald-700">{index + 1}.</span>
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </main>
    );
}
