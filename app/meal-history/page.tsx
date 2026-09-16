"use client";

import { useEffect, useState } from "react";
import { mealHistory } from "@/lib/data";

type MealEntry = {
  id: string;
  meal: string;
  date: string;
  value: number;
};

const today = new Date().toISOString().slice(0, 10);

export default function MealHistoryPage() {
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    meal: "",
    date: today,
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem("pantrypal-meal-history");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as MealEntry[];
        setEntries(parsed);
      } catch {
        setEntries(
          mealHistory.map((entry, index) => ({
            id: `${entry.date}-${index}`,
            meal: entry.meal,
            date: entry.date,
            value: entry.value,
          }))
        );
      }
    } else {
      setEntries(
        mealHistory.map((entry, index) => ({
          id: `${entry.date}-${index}`,
          meal: entry.meal,
          date: entry.date,
          value: entry.value,
        }))
      );
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem("pantrypal-meal-history", JSON.stringify(entries));
  }, [hydrated, entries]);

  const handleAddMeal = (event: React.FormEvent) => {
    event.preventDefault();
    const meal = form.meal.trim();

    if (!meal) {
      return;
    }

    setEntries((current) => [
      {
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        meal,
        date: form.date,
        value: 1,
      },
      ...current,
    ]);

    setForm({
      meal: "",
      date: today,
    });
    setShowForm(false);
  };

  const handleRemoveMeal = (id: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  };

  const handleClearAll = () => {
    setEntries([]);
  };

  return (
    <main className="min-h-screen bg-[#edf5ec] p-6 text-slate-800">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex items-center justify-between rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">PantryPal</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Meal history</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearAll}
              disabled={entries.length === 0}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={() => setShowForm((current) => !current)}
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            >
              + Add meal
            </button>
          </div>
        </header>

        {showForm && (
          <form onSubmit={handleAddMeal} className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Record a meal</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-sm text-slate-500">
                Close
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={form.meal}
                onChange={(event) => setForm((current) => ({ ...current, meal: event.target.value }))}
                placeholder="Meal name"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-300"
              />
              <input
                type="date"
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-300"
              />
            </div>

            <div className="mt-4 flex justify-end">
              <button type="submit" className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                Save meal
              </button>
            </div>
          </form>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          {entries.length === 0 ? (
            <p className="text-sm text-slate-500">No meals recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <div className="font-medium text-slate-800">{entry.meal}</div>
                    <div className="text-sm text-slate-500">{entry.date}</div>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${entry.meal}`}
                    onClick={() => handleRemoveMeal(entry.id)}
                    className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
