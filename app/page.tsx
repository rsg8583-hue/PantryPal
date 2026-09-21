"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { dietaryPreferences, formatNutrientFacts, getPantryItemStatus, getRecipeNutrition, getWeeklyMealChart, mealHistory, pantryItems, recipes, shoppingList as defaultShoppingList } from "@/lib/data";
import { getCurrentUser, saveCurrentUser } from "@/lib/user-storage";

type PantryEntry = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiration: string;
  location: string;
  status: "fresh" | "low" | "expiring" | "expired";
};

function getStatusClasses(status: string) {
  switch (status) {
    case "expired":
      return "bg-[#f9e3dc] text-[#9b4d3c] ring-[#f1c8bd]";
    case "expiring":
      return "bg-[#f8efe2] text-[#9d643e] ring-[#ead6ba]";
    default:
      return "bg-[#edf4ee] text-[#496a5a] ring-[#dfeae0]";
  }
}

type MealEntry = {
  date: string;
  meal: string;
  value: number;
};

type ShoppingItem = {
  name: string;
  quantity: string;
  unit: string;
};

type RecommendationRecipe = {
  id: string;
  title: string;
  time: string;
  servings: number;
  tags: string[];
  ingredients: string[];
  instructions: string[];
  match?: number;
};

function getItemEmoji(name: string) {
  const lowerName = name.toLowerCase();

  if (lowerName.includes("chicken") || lowerName.includes("salmon")) return "🍗";
  if (lowerName.includes("yogurt") || lowerName.includes("milk")) return "🥣";
  if (lowerName.includes("rice") || lowerName.includes("quinoa")) return "🍚";
  if (lowerName.includes("spinach") || lowerName.includes("broccoli") || lowerName.includes("veg")) return "🥬";
  if (lowerName.includes("tomato") || lowerName.includes("pepper")) return "🍅";
  if (lowerName.includes("egg")) return "🥚";
  if (lowerName.includes("avocado")) return "🥑";
  if (lowerName.includes("sweet") || lowerName.includes("potato")) return "🍠";
  if (lowerName.includes("cucumber") || lowerName.includes("lime")) return "🫒";
  return "🥕";
}

export default function HomePage() {
  const currentUser = getCurrentUser();
  const [pantryInventory, setPantryInventory] = useState<PantryEntry[]>(currentUser ? (currentUser.pantry ?? []) : (pantryItems as PantryEntry[]));
  const [hydrated, setHydrated] = useState(false);
  const summary = useMemo(
    () => ({
      totalItems: pantryInventory.length,
      expiringSoon: pantryInventory.filter((item) => {
        const status = getPantryItemStatus(item);
        return status === "expiring" || status === "expired";
      }).length,
    }),
    [pantryInventory]
  );
  const [preferences, setPreferences] = useState(currentUser ? (currentUser.preferences ?? []) : dietaryPreferences);
  const [newPreference, setNewPreference] = useState("");
  const [mealEntries, setMealEntries] = useState<MealEntry[]>(currentUser ? (currentUser.mealHistory as MealEntry[] ?? []) : (mealHistory as MealEntry[]));
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(currentUser ? (currentUser.shopping ?? []) : (defaultShoppingList as ShoppingItem[]));
  const [mealName, setMealName] = useState("Chicken Rice Bowl");
  const [mealDate, setMealDate] = useState(new Date().toISOString().slice(0, 10));
  const [recommendation, setRecommendation] = useState<RecommendationRecipe | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecipeSaved, setIsRecipeSaved] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const user = getCurrentUser();
    const storedPantry = window.localStorage.getItem("pantrypal-pantry-items");
    const storedMeals = window.localStorage.getItem("pantrypal-meal-history");
    const storedShopping = window.localStorage.getItem("pantrypal-shopping-list");

    if (user) {
      setPantryInventory((user.pantry ?? []) as PantryEntry[]);
      setMealEntries((user.mealHistory ?? []) as MealEntry[]);
      setShoppingItems((user.shopping ?? []) as ShoppingItem[]);
      setPreferences(user.preferences ?? []);
    } else {
      if (storedPantry) {
        try {
          setPantryInventory(JSON.parse(storedPantry) as PantryEntry[]);
        } catch {
          setPantryInventory(pantryItems as PantryEntry[]);
        }
      }

      if (storedMeals) {
        try {
          setMealEntries(JSON.parse(storedMeals) as MealEntry[]);
        } catch {
          setMealEntries(mealHistory as MealEntry[]);
        }
      }

      if (storedShopping) {
        try {
          setShoppingItems(JSON.parse(storedShopping) as ShoppingItem[]);
        } catch {
          setShoppingItems(defaultShoppingList as ShoppingItem[]);
        }
      }
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }

    const user = getCurrentUser();

    if (user) {
      saveCurrentUser({
        ...user,
        pantry: pantryInventory,
        mealHistory: mealEntries,
        shopping: shoppingItems,
        preferences,
      });
      return;
    }

    window.localStorage.setItem("pantrypal-meal-history", JSON.stringify(mealEntries));
    window.localStorage.setItem("pantrypal-pantry-items", JSON.stringify(pantryInventory));
    window.localStorage.setItem("pantrypal-shopping-list", JSON.stringify(shoppingItems));
  }, [hydrated, mealEntries, pantryInventory, preferences, shoppingItems]);

  const addPreference = (event: React.FormEvent) => {
    event.preventDefault();
    const cleaned = newPreference.trim();

    if (!cleaned) {
      return;
    }

    if (!preferences.includes(cleaned)) {
      setPreferences((current) => [...current, cleaned]);
    }

    setNewPreference("");
  };

  const removePreference = (preferenceToRemove: string) => {
    setPreferences((current) => current.filter((pref) => pref !== preferenceToRemove));
  };

  const addMealEntry = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedMeal = mealName.trim();

    if (!trimmedMeal) {
      return;
    }

    const normalizedDate = new Date(`${mealDate}T12:00:00`).toISOString().slice(0, 10);

    setMealEntries((current: MealEntry[]) => [
      {
        date: normalizedDate,
        meal: trimmedMeal,
        value: 1,
      },
      ...current,
    ]);
    setMealName("");
    setMealDate(new Date().toISOString().slice(0, 10));
  };

  const addRecommendationToRecipeList = (recipe: RecommendationRecipe) => {
    const activeUser = getCurrentUser();

    if (!activeUser) {
      return;
    }

    const existingRecipes = Array.isArray(activeUser.recipes) ? activeUser.recipes : [];
    saveCurrentUser({
      ...activeUser,
      recipes: [recipe, ...existingRecipes.filter((existingRecipe) => existingRecipe.id !== recipe.id)],
    });
    setIsRecipeSaved(true);
  };

  const generateRecommendation = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealHistory: mealEntries,
          pantryItems: pantryInventory,
          preferences,
        }),
      });

      const data = await response.json();
      const recipe = data.recipe ?? data.recommendation;

      if (recipe && typeof recipe === "object" && recipe.title) {
        const createdRecipe: RecommendationRecipe = {
          id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
          title: String(recipe.title),
          time: String(recipe.time || "25 min"),
          servings: Number(recipe.servings || 2),
          tags: Array.isArray(recipe.tags) ? recipe.tags.map(String) : ["AI suggestion"],
          match: 100,
          ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.map(String).filter(Boolean) : [],
          instructions: Array.isArray(recipe.instructions) ? recipe.instructions.map(String).filter(Boolean) : ["Cook and enjoy."],
        };

        setRecommendation(createdRecipe);
        setIsRecipeSaved(false);
        return;
      }

      setRecommendation(null);
      setIsRecipeSaved(false);
    } catch {
      setRecommendation(null);
      setIsRecipeSaved(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const recentMeals = useMemo(() => mealEntries.slice(0, 5), [mealEntries]);
  const weeklyMealChart = useMemo(() => getWeeklyMealChart(mealEntries), [mealEntries]);

  const suggestedRecipes = useMemo(() => {
    const pantryNames = pantryInventory.map((item) => item.name.toLowerCase());
    const recentMealKeywords = mealEntries.flatMap((entry) =>
      entry.meal
        .toLowerCase()
        .split(/[^a-z]+/)
        .filter(Boolean)
    );
    const userRecipes = currentUser?.recipes ?? [];

    if (!currentUser || userRecipes.length === 0) {
      return [];
    }

    const hasMeaningfulSignals = pantryNames.length > 0 || preferences.length > 0 || recentMealKeywords.length > 0;

    if (!hasMeaningfulSignals) {
      return [];
    }

    return [...userRecipes]
      .map((recipe) => {
        const ingredientMatches = recipe.ingredients.filter((ingredient) =>
          pantryNames.some((name) => name.includes(ingredient.toLowerCase()) || ingredient.toLowerCase().includes(name))
        ).length;

        const preferenceMatches = recipe.tags.filter((tag) =>
          preferences.some((pref) =>
            pref.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(pref.toLowerCase())
          )
        ).length;

        const recentMatchCount = recipe.title
          .toLowerCase()
          .split(/[^a-z]+/)
          .filter(Boolean)
          .filter((word) => recentMealKeywords.includes(word)).length;

        const match = Math.min(
          98,
          ingredientMatches * 18 + preferenceMatches * 12 + recentMatchCount * 10
        );

        return { ...recipe, match };
      })
      .filter((recipe) => recipe.match > 0)
      .sort((a, b) => b.match - a.match)
      .slice(0, 3);
  }, [currentUser, mealEntries, pantryInventory, preferences]);

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="overflow-hidden rounded-[32px] border border-emerald-200/80 bg-white/80 p-6 shadow-[0_25px_70px_rgba(16,185,129,0.12)] backdrop-blur-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e8dccd] bg-[#f8f2ed] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#5f7262]">
                <span className="h-2 w-2 rounded-full bg-[#9fb39d]" />
                PantryPal
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                Kitchen intelligence dashboard
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/meal-history"
                className="rounded-full border border-[#e7d9cf] bg-[#f9f2ee] px-4 py-2.5 text-sm font-semibold text-[#4d685d] transition hover:bg-[#f3e8e2]"
              >
                Meal history
              </Link>
              <Link
                href="/recipes"
                className="rounded-full border border-[#e7d9cf] bg-[#f9f2ee] px-4 py-2.5 text-sm font-semibold text-[#4d685d] transition hover:bg-[#f3e8e2]"
              >
                View recipes
              </Link>
              <Link
                href="/inventory"
                className="rounded-full bg-gradient-to-r from-[#7c9b82] via-[#658b73] to-[#c97d5d] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#dcc4b5] transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#dcc4b5]"
              >
                Add item
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Items in pantry", value: summary.totalItems, accent: "bg-[#edf4ee] text-[#496a5a]", glow: "from-[#a9beae]/20 to-[#d9c1b4]/20" },
            { label: "Expiring soon", value: summary.expiringSoon, accent: "bg-[#f8efe7] text-[#9d643e]", glow: "from-[#dba985]/20 to-[#f3dfd5]/20" },
            { label: "Recipes ready", value: suggestedRecipes.length, accent: "bg-[#edf3f7] text-[#4a6476]", glow: "from-[#b7d0dc]/20 to-[#dfe7ee]/20" },
          ].map((card) => (
            <Link
              key={card.label}
              href="/inventory"
              className={`block rounded-3xl border border-white/80 bg-gradient-to-br ${card.glow} p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-1`}
            >
              <div className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${card.accent}`}>
                {card.label}
              </div>
              <div className="mt-4 text-3xl font-black text-slate-900">{card.value}</div>
            </Link>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <div className="rounded-[30px] border border-white/80 bg-white/80 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Pantry overview</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                Updated today
              </span>
            </div>

            <div className="space-y-3">
              {pantryInventory.map((item) => (
                <Link
                  key={item.id}
                  href="/inventory"
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-50 to-white px-4 py-3 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="min-w-0 text-left">
                    <div className="font-semibold text-slate-800">{item.name}</div>
                    <div className="text-sm text-slate-500">
                      {item.quantity} {item.unit} · {item.location}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden text-sm text-slate-500 sm:inline">Expires {item.expiration}</span>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getStatusClasses(getPantryItemStatus(item))}`}>
                      {getPantryItemStatus(item)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[30px] border border-white/80 bg-white/80 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <h2 className="text-xl font-bold text-slate-900">Smart suggestions</h2>
              <div className="mt-4 space-y-3">
                {suggestedRecipes.length > 0 ? (
                  suggestedRecipes.map((recipe) => (
                    <Link
                      key={recipe.id}
                      href="/recipes"
                      className="block rounded-2xl border border-[#eddcce] bg-gradient-to-r from-[#f7f3eee9] to-white p-3 transition hover:border-[#d9baa8] hover:shadow-md"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-800">{recipe.title}</span>
                        <span className="rounded-full bg-gradient-to-r from-[#7c9b82] to-[#c97d5d] px-2 py-1 text-[10px] font-bold text-white">
                          {Math.round(recipe.match)}% match
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                        <span>{recipe.time}</span>
                        <span>•</span>
                        <span>{recipe.servings} servings</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {recipe.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-white px-2 py-1 text-[11px] font-medium text-slate-600 shadow-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#e5d7cd] bg-[#f9f4ef] p-4 text-sm text-slate-600">
                    Add ingredients, preferences, or meal history to unlock suggestions.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/80 bg-white/80 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <h2 className="text-xl font-bold text-slate-900">Shopping list</h2>
              <div className="mt-4 space-y-3">
                {shoppingItems.map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-slate-50 to-white px-3 py-2.5 text-sm shadow-sm">
                    <span className="font-medium text-slate-700">{item.name}</span>
                    <span className="text-slate-500">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[30px] border border-white/80 bg-white/80 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-900">Meal history</h2>
              <button
                type="button"
                onClick={generateRecommendation}
                disabled={isGenerating}
                className="rounded-full bg-gradient-to-r from-[#7c9b82] to-[#c77f5d] px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-[#dcc4b5] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGenerating ? "Thinking..." : "AI suggestions"}
              </button>
            </div>

            <form onSubmit={addMealEntry} className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_auto]">
              <input
                value={mealName}
                onChange={(event) => setMealName(event.target.value)}
                placeholder="Meal name"
                className="rounded-2xl border border-[#e7d9cf] bg-[#f8f3ee] px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#b7c9b0] focus:bg-white"
              />
              <input
                type="date"
                value={mealDate}
                onChange={(event) => setMealDate(event.target.value)}
                className="rounded-2xl border border-[#e7d9cf] bg-[#f8f3ee] px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#b7c9b0] focus:bg-white"
              />
              <button
                type="submit"
                className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Record meal
              </button>
            </form>

            <div className="mt-5 flex items-end gap-3">
              {weeklyMealChart.map((entry) => (
                <div key={entry.label} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[10px] font-semibold text-slate-500">{entry.value}</span>
                  <div
                    style={{ height: `${Math.max(entry.value, 0) * 22 + (entry.value > 0 ? 8 : 0)}px` }}
                    className="w-full max-w-10 rounded-t-xl bg-gradient-to-t from-[#9fb39d] via-[#c9a894] to-[#dca387] shadow-sm"
                  />
                  <span className="text-[11px] font-medium text-slate-500">{entry.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-[#ead7ca] bg-gradient-to-r from-[#f7f2ee] to-[#edf4ee] p-3.5 shadow-inner shadow-[#ead7ca]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5f7262]">AI recommendation</div>

              {recommendation ? (
                <div className="mt-3 space-y-3 text-sm text-slate-700">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{recommendation.title}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                        <span>{recommendation.time}</span>
                        <span>•</span>
                        <span>{recommendation.servings} servings</span>
                      </div>
                    </div>
                    <span className="rounded-full bg-[#dfeae0] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#496a5a]">
                      AI
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {recommendation.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-white px-2 py-1 text-[11px] font-medium text-slate-600 shadow-sm">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div>
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Ingredients</div>
                    <ul className="space-y-1 pl-5">
                      {recommendation.ingredients.map((ingredient) => (
                        <li key={ingredient} className="list-disc text-slate-700">
                          <span>{ingredient}</span>
                          <span className="ml-2 text-[11px] text-slate-500">
                            ({formatNutrientFacts(getRecipeNutrition([ingredient]))})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">Recipe nutrition</div>
                    <div className="mt-1 text-sm font-medium text-slate-700">
                      {formatNutrientFacts(getRecipeNutrition(recommendation.ingredients))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Instructions</div>
                    <ol className="list-decimal space-y-1 pl-5">
                      {recommendation.instructions.map((instruction) => (
                        <li key={instruction}>{instruction}</li>
                      ))}
                    </ol>
                  </div>

                  <button
                    type="button"
                    onClick={() => addRecommendationToRecipeList(recommendation)}
                    disabled={!getCurrentUser() || isRecipeSaved}
                    className={`w-full rounded-full px-4 py-2.5 text-sm font-semibold shadow-md transition ${
                      isRecipeSaved
                        ? "bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700"
                        : "bg-gradient-to-r from-[#7c9b82] to-[#c97d5d] text-white shadow-[#dcc4b5] hover:shadow-lg"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {isRecipeSaved ? "Added ✓ Recipe saved" : getCurrentUser() ? "Add to recipe list" : "Log in to save"}
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Loading your meal intelligence...
                </p>
              )}
            </div>

            <div className="mt-5 space-y-2">
              {recentMeals.map((entry: MealEntry) => (
                <div key={`${entry.date}-${entry.meal}`} className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-slate-50 to-white px-3 py-2.5 text-sm shadow-sm">
                  <span className="font-medium text-slate-700">{entry.meal}</span>
                  <span className="text-slate-500">{entry.date}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/80 bg-white/80 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
            <h2 className="text-xl font-bold text-slate-900">Preferences</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {preferences.map((pref) => (
                <button
                  key={pref}
                  type="button"
                  onClick={() => removePreference(pref)}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-200"
                  aria-label={`Remove preference ${pref}`}
                >
                  <span>{pref}</span>
                  <span aria-hidden="true">×</span>
                </button>
              ))}
            </div>
            <form onSubmit={addPreference} className="mt-5 flex gap-2">
              <input
                value={newPreference}
                onChange={(event) => setNewPreference(event.target.value)}
                placeholder="Add a preference"
                className="flex-1 rounded-full border border-[#e7d9cf] bg-[#f8f3ee] px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#b7c9b0] focus:bg-white"
              />
              <button
                type="submit"
                className="rounded-full bg-gradient-to-r from-[#7c9b82] to-[#c97d5d] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#dcc4b5] transition hover:shadow-lg"
              >
                Add
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
