"use client";

import { useState } from "react";
import { shoppingList } from "@/lib/data";

type ShoppingItem = {
  name: string;
  quantity: string;
  unit: string;
};

export default function ShoppingPage() {
  const [items, setItems] = useState<ShoppingItem[]>(shoppingList);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    quantity: "1",
    unit: "count",
  });

  const handleSaveItem = (event: React.FormEvent) => {
    event.preventDefault();
    const name = form.name.trim();

    if (!name) {
      return;
    }

    setItems((current) => [
      {
        name,
        quantity: form.quantity,
        unit: form.unit,
      },
      ...current,
    ]);

    setForm({
      name: "",
      quantity: "1",
      unit: "count",
    });
    setShowForm(false);
  };

  const handleBuy = (name: string) => {
    setItems((current) => current.filter((item) => item.name !== name));
  };

  const handleDeleteItem = (name: string) => {
    setItems((current) => current.filter((item) => item.name !== name));
  };

  return (
    <main className="min-h-screen bg-[#edf5ec] p-6 text-slate-800">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">PantryPal</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Shopping list</h1>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((current) => !current)}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          >
            + Add item
          </button>
        </header>

        {showForm && (
          <form onSubmit={handleSaveItem} className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Add shopping item</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-sm text-slate-500">
                Close
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Item name"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-300"
              />
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
                placeholder="Quantity"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-300"
              />
              <input
                value={form.unit}
                onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))}
                placeholder="Unit"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-300"
              />
            </div>

            <div className="mt-4 flex justify-end">
              <button type="submit" className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                Save item
              </button>
            </div>
          </form>
        )}

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <div className="font-medium text-slate-800">{item.name}</div>
                  <div className="text-sm text-slate-500">{item.quantity} {item.unit}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleBuy(item.name)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${item.name}`}
                    onClick={() => handleDeleteItem(item.name)}
                    className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
