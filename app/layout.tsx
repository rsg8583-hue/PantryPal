import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PantryPal",
  description: "Smart pantry and meal planning dashboard",
};

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/inventory", label: "Inventory" },
  { href: "/recipes", label: "Recipes" },
  { href: "/shopping", label: "Shopping" },
  { href: "/meal-history", label: "Meal history" },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-transparent text-slate-800">
        <div className="sticky top-0 z-30 border-b border-emerald-200/80 bg-white/75 backdrop-blur-xl shadow-[0_10px_30px_rgba(16,185,129,0.08)]">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3 text-slate-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[#b7c9b0] via-[#8ca98d] to-[#c98a69] text-lg shadow-lg shadow-[#d7c3b7]">
                🧺
              </span>
              <span className="text-lg font-black tracking-tight">PantryPal</span>
            </Link>
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
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
