"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPantryItemStatus, pantryItems } from "@/lib/data";

export default function InventoryPage() {
    const router = useRouter();
    const [items, setItems] = useState(pantryItems);
    const [hydrated, setHydrated] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: "",
        quantity: "1",
        unit: "count",
        expiration: "2026-10-15",
        location: "Fridge",
    });

    useEffect(() => {
        if (!hydrated || typeof window === "undefined") {
            return;
        }

        window.localStorage.setItem("pantrypal-pantry-items", JSON.stringify(items));
    }, [hydrated, items]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const stored = window.localStorage.getItem("pantrypal-pantry-items");
        if (stored) {
            try {
                setItems(JSON.parse(stored));
            } catch {
                setItems(pantryItems);
            }
        }

        setHydrated(true);
    }, []);

    const handleAddItem = (event: React.FormEvent) => {
        event.preventDefault();
        const name = form.name.trim();

        if (!name) {
            return;
        }

        setItems((current) => [
            {
                id: crypto.randomUUID(),
                name,
                quantity: Number(form.quantity) || 1,
                unit: form.unit,
                expiration: form.expiration,
                location: form.location,
                status: getPantryItemStatus({
                    quantity: Number(form.quantity) || 1,
                    expiration: form.expiration,
                }),
            },
            ...current,
        ]);

        setForm({
            name: "",
            quantity: "1",
            unit: "count",
            expiration: "2026-10-15",
            location: "Fridge",
        });
        setShowForm(false);
        router.replace("/inventory");
    };

    const handleDeleteItem = (id: string) => {
        setItems((current) => current.filter((item) => item.id !== id));
    };

    return (
        <main className="min-h-screen bg-[#edf5ec] p-6 text-slate-800">
            <div className="mx-auto max-w-6xl space-y-6">
                <header className="flex items-center justify-between rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">PantryPal</p>
                        <h1 className="mt-2 text-3xl font-bold text-slate-900">Inventory</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/recipes" className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                            Recipes
                        </Link>
                        <button
                            type="button"
                            onClick={() => setShowForm(true)}
                            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                        >
                            + Add item
                        </button>
                    </div>
                </header>

                {showForm && (
                    <form
                        onSubmit={handleAddItem}
                        className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-slate-900">Add item</h2>
                            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-slate-500">
                                Close
                            </button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-5">
                            <input
                                value={form.name}
                                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                                placeholder="Item name"
                                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-300"
                            />
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={form.quantity}
                                onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
                                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-300"
                            />
                            <input
                                value={form.unit}
                                onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))}
                                placeholder="Unit"
                                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-300"
                            />
                            <input
                                type="date"
                                value={form.expiration}
                                onChange={(event) => setForm((current) => ({ ...current, expiration: event.target.value }))}
                                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-300"
                            />
                            <select
                                value={form.location}
                                onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-300"
                            >
                                <option value="Fridge">Fridge</option>
                                <option value="Pantry">Pantry</option>
                                <option value="Counter">Counter</option>
                                <option value="Freezer">Freezer</option>
                            </select>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button type="submit" className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                                Save item
                            </button>
                        </div>
                    </form>
                )}

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200 text-left">
                        <thead className="bg-slate-50 text-sm uppercase tracking-[0.12em] text-slate-500">
                            <tr>
                                <th className="px-5 py-3">Item</th>
                                <th className="px-5 py-3">Qty</th>
                                <th className="px-5 py-3">Location</th>
                                <th className="px-5 py-3">Expiration</th>
                                <th className="px-5 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                            {items.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="px-5 py-4 font-medium text-slate-900">{item.name}</td>
                                    <td className="px-5 py-4">{item.quantity} {item.unit}</td>
                                    <td className="px-5 py-4">{item.location}</td>
                                    <td className="px-5 py-4">{item.expiration}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getPantryItemStatus(item) === "expired"
                                                    ? "bg-red-100 text-red-700"
                                                    : getPantryItemStatus(item) === "expiring"
                                                        ? "bg-amber-100 text-amber-700"
                                                        : getPantryItemStatus(item) === "low"
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-emerald-100 text-emerald-700"
                                                }`}>
                                                {getPantryItemStatus(item)}
                                            </span>
                                            <button
                                                type="button"
                                                aria-label={`Delete ${item.name}`}
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="ml-auto rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 transition hover:border-red-200 hover:text-red-600"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
