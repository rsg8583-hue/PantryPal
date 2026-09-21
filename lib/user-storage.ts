import type { PantryItem, Recipe } from "@/lib/data";

export type UserMealEntry = {
  id?: string;
  date: string;
  meal: string;
  value?: number;
};

export type UserShoppingItem = {
  name: string;
  quantity: string;
  unit: string;
};

export type UserProfile = {
  id: string;
  username: string;
  password: string;
  pantry: PantryItem[];
  recipes: Recipe[];
  shopping: UserShoppingItem[];
  mealHistory: UserMealEntry[];
  preferences: string[];
};

const USERS_KEY = "pantrypal-users";
const CURRENT_USER_KEY = "pantrypal-current-user";

function readUsers(): Record<string, UserProfile> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = window.localStorage.getItem(USERS_KEY);
    if (!stored) {
      return {};
    }

    const parsed = JSON.parse(stored) as Record<string, UserProfile>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function getCurrentUserId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(CURRENT_USER_KEY);
}

export function getCurrentUser(): UserProfile | null {
  const userId = getCurrentUserId();
  if (!userId) {
    return null;
  }

  const users = readUsers();
  return users[userId] ?? null;
}

export function saveCurrentUser(profile: UserProfile) {
  if (typeof window === "undefined") {
    return;
  }

  const users = readUsers();
  users[profile.id] = profile;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  window.localStorage.setItem(CURRENT_USER_KEY, profile.id);
}

export function signInUser(username: string, password: string) {
  const trimmed = username.trim();
  if (!trimmed || !password.trim()) {
    return null;
  }

  const users = readUsers();
  const existing = Object.values(users).find((user) => user.username.toLowerCase() === trimmed.toLowerCase());

  if (existing) {
    if (existing.password !== password) {
      return null;
    }

    window.localStorage.setItem(CURRENT_USER_KEY, existing.id);
    return existing;
  }

  const newUser: UserProfile = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    username: trimmed,
    password,
    pantry: [],
    recipes: [],
    shopping: [],
    mealHistory: [],
    preferences: [],
  };

  users[newUser.id] = newUser;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  window.localStorage.setItem(CURRENT_USER_KEY, newUser.id);
  return newUser;
}

export function logOutUser() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CURRENT_USER_KEY);
}

export function syncUserProfile(update: Partial<UserProfile>) {
  const current = getCurrentUser();
  if (!current) {
    return null;
  }

  const nextUser = { ...current, ...update };
  saveCurrentUser(nextUser);
  return nextUser;
}

export function getUserStorageState<T>(key: keyof UserProfile, fallback: T): T {
  const current = getCurrentUser();
  if (!current) {
    return fallback;
  }

  const value = current[key];
  return (Array.isArray(value) ? value : fallback) as T;
}
