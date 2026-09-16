import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.upsert({
        where: { email: "demo@pantrypal.app" },
        update: {},
        create: {
            email: "demo@pantrypal.app",
            name: "Demo User",
        },
    });

    const ingredients = [
        { name: "Chicken Breast", category: "Protein", unit: "kg" },
        { name: "Greek Yogurt", category: "Dairy", unit: "cups" },
        { name: "Rice", category: "Grain", unit: "bag" },
        { name: "Spinach", category: "Vegetable", unit: "kg" },
        { name: "Tomatoes", category: "Vegetable", unit: "count" },
        { name: "Eggs", category: "Protein", unit: "count" },
    ];

    for (const ingredient of ingredients) {
        await prisma.ingredient.upsert({
            where: { name: ingredient.name },
            update: {},
            create: ingredient,
        });
    }

    const pantryIngredients = await prisma.ingredient.findMany();

    for (const [index, ingredient] of pantryIngredients.entries()) {
        await prisma.pantryItem.create({
            data: {
                userId: user.id,
                ingredientId: ingredient.id,
                quantity: [1.2, 2, 1, 0.5, 4, 6][index] ?? 1,
                unit: ingredient.unit,
                expirationDate: new Date(Date.now() + (index + 3) * 86400000),
                location: index % 2 === 0 ? "Fridge" : "Pantry",
                notes: index === 0 ? "Meal prep batch" : "",
            },
        });
    }

    const recipe = await prisma.recipe.create({
        data: {
            userId: user.id,
            title: "Chicken Rice Bowl",
            description: "A quick, high-protein favorite using pantry staples.",
            cuisine: "Healthy",
            prepTimeMinutes: 10,
            cookTimeMinutes: 15,
            servings: 2,
            ingredients: {
                create: [
                    { ingredient: { connect: { name: "Chicken Breast" } }, quantity: 250, unit: "g" },
                    { ingredient: { connect: { name: "Rice" } }, quantity: 1, unit: "cup" },
                    { ingredient: { connect: { name: "Spinach" } }, quantity: 100, unit: "g" },
                    { ingredient: { connect: { name: "Tomatoes" } }, quantity: 2, unit: "count" },
                ],
            },
        },
    });

    await prisma.mealLog.createMany({
        data: [
            { userId: user.id, recipeId: recipe.id, mealType: "dinner", eatenAt: new Date() },
            { userId: user.id, mealType: "breakfast", eatenAt: new Date(Date.now() - 86400000) },
        ],
    });

    await prisma.userPreference.createMany({
        data: [
            { userId: user.id, key: "favoriteCuisine", value: "Healthy", weight: 1.2 },
            { userId: user.id, key: "dietType", value: "High protein", weight: 1.5 },
            { userId: user.id, key: "avoid", value: "Shellfish", weight: 1 },
        ],
    });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (error) => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    });
