import { prisma } from "@/lib/prisma";

export type PantryItem = {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    expiration: string;
    location: string;
    status: "fresh" | "low" | "expiring" | "expired";
};

export type Recipe = {
    id: string;
    title: string;
    time: string;
    servings: number;
    tags: string[];
    match: number;
    ingredients: string[];
    instructions: string[];
};

export const pantryItems: PantryItem[] = [
    { id: "p1", name: "Chicken Breast", quantity: 1.2, unit: "kg", expiration: "2026-09-20", location: "Fridge", status: "fresh" },
    { id: "p2", name: "Greek Yogurt", quantity: 2, unit: "cups", expiration: "2026-09-18", location: "Fridge", status: "expiring" },
    { id: "p3", name: "Rice", quantity: 1, unit: "bag", expiration: "2027-04-01", location: "Pantry", status: "fresh" },
    { id: "p4", name: "Spinach", quantity: 0.5, unit: "kg", expiration: "2026-09-16", location: "Fridge", status: "expired" },
    { id: "p5", name: "Tomatoes", quantity: 4, unit: "count", expiration: "2026-09-22", location: "Counter", status: "fresh" },
    { id: "p6", name: "Eggs", quantity: 6, unit: "count", expiration: "2026-09-17", location: "Fridge", status: "low" },
    { id: "p7", name: "Avocado", quantity: 2, unit: "count", expiration: "2026-09-24", location: "Counter", status: "fresh" },
    { id: "p8", name: "Sweet Potato", quantity: 3, unit: "count", expiration: "2026-09-26", location: "Pantry", status: "fresh" },
    { id: "p9", name: "Broccoli", quantity: 1, unit: "head", expiration: "2026-09-19", location: "Fridge", status: "expiring" },
    { id: "p10", name: "Bell Pepper", quantity: 3, unit: "count", expiration: "2026-09-25", location: "Fridge", status: "fresh" },
    { id: "p11", name: "Cucumber", quantity: 1, unit: "count", expiration: "2026-09-23", location: "Fridge", status: "fresh" },
    { id: "p12", name: "Lime", quantity: 2, unit: "count", expiration: "2026-09-27", location: "Counter", status: "fresh" },
];

export const recipes: Recipe[] = [
    {
        id: "r1",
        title: "Chicken Rice Bowl",
        time: "25 min",
        servings: 2,
        tags: ["High protein", "Meal prep"],
        match: 92,
        ingredients: ["Chicken Breast", "Rice", "Spinach", "Tomatoes"],
        instructions: [
            "Cook the rice according to package instructions.",
            "Sear the chicken breast until fully cooked.",
            "Add spinach and tomatoes and toss lightly.",
            "Assemble into bowls and serve warm.",
        ],
    },
    {
        id: "r2",
        title: "Greek Yogurt Parfait",
        time: "10 min",
        servings: 1,
        tags: ["Breakfast", "Quick"],
        match: 68,
        ingredients: ["Greek Yogurt", "Tomatoes", "Eggs"],
        instructions: [
            "Spoon yogurt into a bowl.",
            "Top with chopped tomatoes and a soft-boiled egg.",
            "Season lightly and serve.",
        ],
    },
    {
        id: "r3",
        title: "Spinach Omelet",
        time: "15 min",
        servings: 2,
        tags: ["Vegetarian", "High protein"],
        match: 80,
        ingredients: ["Eggs", "Spinach", "Tomatoes"],
        instructions: [
            "Whisk the eggs until smooth.",
            "Sauté spinach and tomatoes briefly.",
            "Pour in eggs and cook until set.",
            "Fold and serve immediately.",
        ],
    },
    {
        id: "r4",
        title: "Citrus Chicken Salad",
        time: "20 min",
        servings: 2,
        tags: ["Fresh", "Light"],
        match: 75,
        ingredients: ["Chicken Breast", "Cucumber", "Lime", "Bell Pepper", "Tomatoes"],
        instructions: [
            "Slice the chicken and vegetables thinly.",
            "Toss with lime juice and a pinch of salt.",
            "Serve over greens or on its own.",
        ],
    },
    {
        id: "r5",
        title: "Sweet Potato Hash",
        time: "30 min",
        servings: 2,
        tags: ["Comfort food", "High fiber"],
        match: 78,
        ingredients: ["Sweet Potato", "Bell Pepper", "Eggs", "Spinach"],
        instructions: [
            "Dice the sweet potato and roast until tender.",
            "Sauté peppers and spinach with the potato.",
            "Top with fried eggs and serve.",
        ],
    },
    {
        id: "r6",
        title: "Broccoli Chicken Stir-Fry",
        time: "20 min",
        servings: 2,
        tags: ["Quick dinner", "High protein"],
        match: 82,
        ingredients: ["Chicken Breast", "Broccoli", "Bell Pepper", "Rice"],
        instructions: [
            "Sear chicken until nearly cooked.",
            "Stir-fry broccoli and bell pepper until crisp.",
            "Add sauce and return chicken to the pan.",
            "Serve with rice.",
        ],
    },
    {
        id: "r7",
        title: "Avocado Egg Toast",
        time: "12 min",
        servings: 1,
        tags: ["Breakfast", "Easy"],
        match: 70,
        ingredients: ["Avocado", "Eggs", "Lime"],
        instructions: [
            "Toast bread until golden.",
            "Mash avocado with lime and salt.",
            "Top with a fried egg and serve.",
        ],
    },
    {
        id: "r8",
        title: "Veggie Rice Skillet",
        time: "18 min",
        servings: 2,
        tags: ["Vegetarian", "One-pan"],
        match: 74,
        ingredients: ["Rice", "Spinach", "Bell Pepper", "Tomatoes", "Cucumber"],
        instructions: [
            "Warm the rice in a skillet.",
            "Add vegetables and cook until tender.",
            "Season and serve warm.",
        ],
    },
    {
        id: "r9",
        title: "Chicken Veggie Wrap",
        time: "15 min",
        servings: 2,
        tags: ["Lunch", "Portable"],
        match: 77,
        ingredients: ["Chicken Breast", "Spinach", "Tomatoes", "Avocado"],
        instructions: [
            "Cook chicken and slice thinly.",
            "Layer with spinach, tomato, and avocado.",
            "Roll and serve immediately.",
        ],
    },
];

export const mealHistory = [
    { date: "Mon", meal: "Chicken Rice Bowl", value: 1 },
    { date: "Tue", meal: "Salad", value: 1 },
    { date: "Wed", meal: "Pasta", value: 1 },
    { date: "Thu", meal: "Omelet", value: 1 },
    { date: "Fri", meal: "Rice Bowl", value: 1 },
];

export const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export function getMealWeekdayLabel(dateValue: string) {
    if (dayOrder.includes(dateValue as (typeof dayOrder)[number])) {
        return dateValue;
    }

    if (!dateValue) {
        return "Mon";
    }

    const parsed = new Date(`${dateValue}T12:00:00`);

    if (Number.isNaN(parsed.getTime())) {
        return "Mon";
    }

    return parsed.toLocaleDateString("en-US", { weekday: "short" });
}

export function getWeeklyMealChart(entries: Array<{ date: string; value?: number }>) {
    return dayOrder.map((label) => ({
        label,
        value: entries.reduce((total, entry) => {
            if (getMealWeekdayLabel(entry.date) !== label) {
                return total;
            }

            return total + 1;
        }, 0),
    }));
}

export const shoppingList = [
    { name: "Avocado", quantity: "2", unit: "count" },
    { name: "Lime", quantity: "1", unit: "count" },
    { name: "Cucumber", quantity: "1", unit: "count" },
    { name: "Garlic", quantity: "1", unit: "head" },
    { name: "Onion", quantity: "2", unit: "count" },
    { name: "Berries", quantity: "1", unit: "box" },
    { name: "Quinoa", quantity: "1", unit: "bag" },
    { name: "Salmon", quantity: "1", unit: "fillet" },
];

export const dietaryPreferences = [
    "High protein",
    "Low carb",
    "Vegetarian friendly",
    "Family meals",
];

export function getPantryItemStatus(item: Pick<PantryItem, "quantity" | "expiration">): PantryItem["status"] {
    const expirationDate = item.expiration ? new Date(item.expiration) : null;

    if (expirationDate && !Number.isNaN(expirationDate.getTime())) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        expirationDate.setHours(0, 0, 0, 0);

        const diffDays = Math.ceil((expirationDate.getTime() - today.getTime()) / 86400000);

        if (diffDays < 0) {
            return "expired";
        }

        if (diffDays <= 5) {
            return "expiring";
        }
    }

    if (item.quantity <= 1) {
        return "low";
    }

    return "fresh";
}

export async function getInventoryData() {
    const hasDb = Boolean(process.env.DATABASE_URL) && Boolean(prisma);

    if (!hasDb) {
        return pantryItems;
    }

    try {
        const pantry = await prisma!.pantryItem.findMany({
            include: { ingredient: true },
            orderBy: { createdAt: "desc" },
        });

        return pantry.map((item) => ({
            id: item.id,
            name: item.ingredient.name,
            quantity: Number(item.quantity),
            unit: item.unit,
            expiration: item.expirationDate ? item.expirationDate.toISOString().slice(0, 10) : "N/A",
            location: item.location,
            status: "fresh",
        }));
    } catch {
        return pantryItems;
    }
}

export async function getRecipeData() {
    const hasDb = Boolean(process.env.DATABASE_URL) && Boolean(prisma);

    if (!hasDb) {
        return recipes;
    }

    try {
        const recipeRows = await prisma!.recipe.findMany({
            include: { ingredients: { include: { ingredient: true } } },
            orderBy: { createdAt: "desc" },
        });

        return recipeRows.map((recipe) => ({
            id: recipe.id,
            title: recipe.title,
            time: `${(recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0)} min`,
            servings: recipe.servings,
            tags: [recipe.cuisine ?? "General", "Easy prep"],
            match: 90,
            ingredients: recipe.ingredients.map((entry) => entry.ingredient.name),
            instructions: [
                "Recipe loaded from database.",
                "Review ingredient list and prepare accordingly.",
            ],
        }));
    } catch {
        return recipes;
    }
}

export const getInventorySummary = () => {
    const totalItems = pantryItems.length;
    const expiringSoon = pantryItems.filter((item) => item.status === "expiring" || item.status === "expired").length;
    const lowStock = pantryItems.filter((item) => item.status === "low").length;

    return { totalItems, expiringSoon, lowStock };
};
