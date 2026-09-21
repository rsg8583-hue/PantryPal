import { NextResponse } from "next/server";
import OpenAI from "openai";

type RecipeRecommendation = {
    title: string;
    time: string;
    servings: number;
    tags: string[];
    ingredients: string[];
    instructions: string[];
};

function buildFallbackRecipe(mealHistory: unknown[], pantryItems: unknown[], preferences: unknown[]): RecipeRecommendation {
    const recentMeals = Array.isArray(mealHistory)
        ? mealHistory.slice(0, 3).map((entry) => {
            if (typeof entry === "object" && entry !== null && "meal" in entry && typeof (entry as { meal?: unknown }).meal === "string") {
                return (entry as { meal: string }).meal;
            }

            return "recent meal";
        }).join(", ")
        : "recent meals";
    const pantrySummary = Array.isArray(pantryItems)
        ? pantryItems.slice(0, 5).map((item) => {
            if (typeof item === "object" && item !== null && "name" in item && typeof (item as { name?: unknown }).name === "string") {
                return String((item as { name: string }).name);
            }

            return "pantry item";
        })
        : ["Chicken Breast", "Rice", "Spinach"];
    const tags = Array.isArray(preferences) && preferences.length > 0
        ? preferences.slice(0, 2).map((tag) => String(tag))
        : ["Balanced", "Quick"];

    return {
        title: `Protein Bowl Inspired by ${recentMeals || "Your Pantry"}`,
        time: "25 min",
        servings: 2,
        tags,
        ingredients: pantrySummary.length > 0 ? pantrySummary : ["Chicken Breast", "Rice", "Spinach"],
        instructions: [
            "Prep the base ingredient and cook it until ready.",
            "Add your fresh vegetables and protein from the pantry.",
            "Season to taste and serve warm in a bowl.",
        ],
    };
}

export async function POST(request: Request) {
    let payload: { mealHistory?: unknown[]; pantryItems?: unknown[]; preferences?: unknown[] } = {};

    try {
        payload = await request.json();
    } catch {
        payload = {};
    }

    try {
        const { mealHistory, pantryItems, preferences } = payload;
        const apiKey = process.env.OPENAI_API_KEY;
        const fallbackRecipe = buildFallbackRecipe(
            Array.isArray(mealHistory) ? mealHistory : [],
            Array.isArray(pantryItems) ? pantryItems : [],
            Array.isArray(preferences) ? preferences : []
        );

        if (!apiKey) {
            return NextResponse.json({
                recommendation: fallbackRecipe,
                recipe: fallbackRecipe,
            });
        }

        const client = new OpenAI({ apiKey });

        const prompt = `You are PantryPal's meal intelligence assistant. Based on the user's meal history, pantry items, and dietary preferences, create a realistic recipe recommendation in JSON format with exactly these fields: title, time, servings, tags, ingredients, instructions.

Rules:
- title: a short recipe name
- time: cooking time as a string like "25 min"
- servings: a number
- tags: array of strings such as ["High protein", "Quick"]
- ingredients: array of ingredient names, using only items the user likely has
- instructions: array of step strings
- keep it grounded in the pantry items and preferences

Meal history:
${JSON.stringify(mealHistory ?? [], null, 2)}

Pantry items:
${JSON.stringify(pantryItems ?? [], null, 2)}

Preferences:
${JSON.stringify(preferences ?? [], null, 2)}

Return valid JSON only, no markdown, no extra commentary.`;

        const completion = await client.responses.create({
            model: "gpt-4o-mini",
            input: prompt,
        });

        const rawText = completion.output_text?.trim() || "";
        const parsed = rawText ? JSON.parse(rawText) : fallbackRecipe;

        const recipe = {
            title: String(parsed.title || "Pantry Bowl"),
            time: String(parsed.time || "25 min"),
            servings: Number(parsed.servings || 2),
            tags: Array.isArray(parsed.tags) ? parsed.tags.map(String) : ["Balanced"],
            ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients.map(String) : [],
            instructions: Array.isArray(parsed.instructions) ? parsed.instructions.map(String) : ["Prepare ingredients and serve."],
        };

        return NextResponse.json({ recommendation: recipe, recipe });
    } catch (error) {
        console.error("Recommendation generation failed:", error);

        const fallbackRecipe = buildFallbackRecipe(
            Array.isArray(payload.mealHistory) ? payload.mealHistory : [],
            Array.isArray(payload.pantryItems) ? payload.pantryItems : [],
            Array.isArray(payload.preferences) ? payload.preferences : []
        );

        return NextResponse.json({
            recommendation: fallbackRecipe,
            recipe: fallbackRecipe,
        }, { status: 200 });
    }
}
