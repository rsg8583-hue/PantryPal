"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser, logOutUser, signInUser } from "@/lib/user-storage";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/inventory", label: "Inventory" },
  { href: "/recipes", label: "Recipes" },
  { href: "/shopping", label: "Shopping" },
  { href: "/meal-history", label: "Meal history" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser ? { username: currentUser.username } : null);
  }, []);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    const signedIn = signInUser(form.username, form.password);

    if (!signedIn) {
      setError("Use a username and password to create or enter your account.");
      return;
    }

    setUser({ username: signedIn.username });
    setError("");
    setForm({ username: "", password: "" });
  };

  const handleLogout = () => {
    logOutUser();
    setUser(null);
  };

  return (
    <>
      <div className="sticky top-0 z-30 border-b border-emerald-200/80 bg-white/75 backdrop-blur-xl shadow-[0_10px_30px_rgba(16,185,129,0.08)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[#b7c9b0] via-[#8ca98d] to-[#c98a69] text-lg shadow-lg shadow-[#d7c3b7]">
              🧺
            </span>
            <span className="text-lg font-black tracking-tight">PantryPal</span>
          </Link>
          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-2 rounded-full border border-[#e8ddd2] bg-[#f8f3ee] p-1.5 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3.5 py-2 text-sm font-medium text-[#58675f] transition hover:bg-white hover:text-[#3d5b4a]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden text-sm font-medium text-slate-700 sm:inline">{user.username}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  Log out
                </button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="flex items-center gap-2">
                <input
                  value={form.username}
                  onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                  placeholder="username"
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-300"
                />
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="password"
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-300"
                />
                <button type="submit" className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">
                  Log in
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      {error ? <div className="mx-auto mt-4 w-full max-w-7xl px-4 text-sm text-red-600">{error}</div> : null}
      {!user ? (
        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-md rounded-[32px] border border-emerald-200 bg-white/90 p-8 shadow-[0_25px_70px_rgba(16,185,129,0.12)]">
            <div className="mb-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">PantryPal</p>
              <h1 className="mt-3 text-3xl font-black text-slate-900">Your kitchen, organized</h1>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Username</label>
                <input
                  value={form.username}
                  onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-emerald-300"
                  placeholder="Create a username"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-emerald-300"
                  placeholder="Choose a password"
                />
              </div>
              <button type="submit" className="w-full rounded-full bg-gradient-to-r from-[#7c9b82] to-[#c97d5d] px-4 py-3 text-sm font-semibold text-white shadow-md shadow-[#dcc4b5]">
                Start your pantry
              </button>
            </form>
          </div>
        </main>
      ) : (
        children
      )}
    </>
  );
}
