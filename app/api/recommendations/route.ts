import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const { mealHistory, pantryItems, preferences } = await request.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      const recentMeals = Array.isArray(mealHistory)
        ? mealHistory.slice(0, 4).map((entry: { meal?: string }) => entry.meal ?? "a recent meal").join(", ")
        : "your recent meals";
      const pantrySummary = Array.isArray(pantryItems)
        ? pantryItems.slice(0, 5).map((item: { name?: string }) => item.name ?? "pantry item").join(", ")
        : "your pantry";
      const preferenceSummary = Array.isArray(preferences) ? preferences.join(", ") : "your preferences";

      return NextResponse.json({
        recommendation: `Based on your recent meals (${recentMeals}) and pantry items (${pantrySummary}), try a light, protein-forward meal with ${preferenceSummary}. A good next option is a chicken and spinach rice bowl using ingredients you already have.`,
      });
    }

    const client = new OpenAI({ apiKey });

    const prompt = `You are PantryPal's meal intelligence assistant. Based on the user's meal history, pantry items, and dietary preferences, suggest the single best next meal recommendation. Keep it practical, realistic, and directly grounded in what they already have. 

Meal history:
${JSON.stringify(mealHistory ?? [], null, 2)}

Pantry items:
${JSON.stringify(pantryItems ?? [], null, 2)}

Preferences:
${JSON.stringify(preferences ?? [], null, 2)}

Return only one concise recommendation paragraph, no bullet list, no markdown, and no extra commentary.`;

    const completion = await client.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
    });

    const text = completion.output_text?.trim() || "I suggest a fresh, balanced meal based on what you already have in your pantry and your recent eating patterns.";

    return NextResponse.json({ recommendation: String(text) });
  } catch (error) {
    console.error("Recommendation generation failed:", error);

    return NextResponse.json({
      recommendation: "Your meal history and pantry items are saved. A good next idea is a balanced bowl combining protein, greens, and a grain you already have on hand.",
    }, { status: 200 });
  }
}
