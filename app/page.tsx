"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { dietaryPreferences, getPantryItemStatus, getWeeklyMealChart, mealHistory, pantryItems, recipes, shoppingList as defaultShoppingList } from "@/lib/data";

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
    case "low":
      return "bg-[#f9f0d8] text-[#8d6a1d] ring-[#ecd99e]";
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
  const [pantryInventory, setPantryInventory] = useState<PantryEntry[]>(pantryItems as PantryEntry[]);
  const [hydrated, setHydrated] = useState(false);
  const summary = useMemo(
    () => ({
      totalItems: pantryInventory.length,
      expiringSoon: pantryInventory.filter((item) => {
        const status = getPantryItemStatus(item);
        return status === "expiring" || status === "expired";
      }).length,
      lowStock: pantryInventory.filter((item) => getPantryItemStatus(item) === "low").length,
    }),
    [pantryInventory]
  );
  const [preferences, setPreferences] = useState(dietaryPreferences);
  const [newPreference, setNewPreference] = useState("");
  const [mealEntries, setMealEntries] = useState<MealEntry[]>(mealHistory as MealEntry[]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(defaultShoppingList as ShoppingItem[]);
  const [mealName, setMealName] = useState("Chicken Rice Bowl");
  const [mealDate, setMealDate] = useState(new Date().toISOString().slice(0, 10));
  const [recommendation, setRecommendation] = useState("Loading your meal intelligence...");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedPantry = window.localStorage.getItem("pantrypal-pantry-items");
    const storedMeals = window.localStorage.getItem("pantrypal-meal-history");
    const storedShopping = window.localStorage.getItem("pantrypal-shopping-list");

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

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem("pantrypal-meal-history", JSON.stringify(mealEntries));
    window.localStorage.setItem("pantrypal-pantry-items", JSON.stringify(pantryInventory));
    window.localStorage.setItem("pantrypal-shopping-list", JSON.stringify(shoppingItems));
  }, [hydrated, mealEntries, pantryInventory, shoppingItems]);

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
      setRecommendation(data.recommendation || "No recommendation available yet.");
    } catch {
      setRecommendation("I couldn't generate a recommendation right now, but your recent classes are saved and ready.");
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

    return [...recipes]
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
          35 + ingredientMatches * 18 + preferenceMatches * 12 + recentMatchCount * 10
        );

        return { ...recipe, match };
      })
      .sort((a, b) => b.match - a.match)
      .slice(0, 3);
  }, [mealEntries, pantryInventory, preferences]);

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
            { label: "Low stock", value: summary.lowStock, accent: "bg-[#f9f0d8] text-[#8d6a1d]", glow: "from-[#ebd79d]/20 to-[#f5efd6]/20" },
            { label: "Recipes ready", value: recipes.length, accent: "bg-[#edf3f7] text-[#4a6476]", glow: "from-[#b7d0dc]/20 to-[#dfe7ee]/20" },
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
                  className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-50 to-white px-4 py-3 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#edf4ee] to-[#f4e5db] text-xl shadow-inner">
                      {getItemEmoji(item.name)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{item.name}</div>
                      <div className="text-sm text-slate-500">
                        {item.quantity} {item.unit} · {item.location}
                      </div>
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
                {suggestedRecipes.map((recipe) => (
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
                ))}
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
              <p className="mt-2 text-sm leading-6 text-slate-700">{recommendation}</p>
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
