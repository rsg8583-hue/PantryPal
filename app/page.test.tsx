import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { getIngredientNutrition, getPantryItemStatus, getRecipeNutrition, getWeeklyMealChart } from '@/lib/data';
import HomePage from './page';
import InventoryPage from './inventory/page';
import RecipesPage from './recipes/page';
import ShoppingPage from './shopping/page';
import { signInUser } from '@/lib/user-storage';
import { POST } from './api/recommendations/route';

beforeEach(() => {
    window.localStorage.clear();
});

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        replace: vi.fn(),
        push: vi.fn(),
        prefetch: vi.fn(),
    }),
}));

describe('User auth', () => {
    it('creates a new empty user profile when logging in', () => {
        const user = signInUser('amy', 'secret');

        expect(user).not.toBeNull();
        expect(user?.username).toBe('amy');
        expect(user?.pantry).toEqual([]);
        expect(user?.recipes).toEqual([]);
        expect(user?.shopping).toEqual([]);
        expect(user?.mealHistory).toEqual([]);
        expect(user?.preferences).toEqual([]);
    });
});

describe('Recommendation API', () => {
    it('returns a structured recipe object with the required fields', async () => {
        const request = new Request('http://localhost/api/recommendations', {
            method: 'POST',
            body: JSON.stringify({
                mealHistory: [{ date: 'Mon', meal: 'Chicken Bowl', value: 1 }],
                pantryItems: [{ name: 'Chicken Breast', quantity: 1, unit: 'kg', expiration: '2026-12-31', location: 'Fridge', status: 'fresh' }],
                preferences: ['High protein'],
            }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(data.recipe).toMatchObject({
            title: expect.any(String),
            time: expect.any(String),
            servings: expect.any(Number),
            tags: expect.any(Array),
            ingredients: expect.any(Array),
            instructions: expect.any(Array),
        });
    });
});

describe('Nutrition data', () => {
    it('calculates nutrition for a single ingredient and a full recipe', () => {
        const ingredient = getIngredientNutrition('Chicken Breast');
        const recipe = getRecipeNutrition(['Chicken Breast', 'Rice', 'Spinach']);

        expect(ingredient).toMatchObject({
            calories: expect.any(Number),
            protein: expect.any(Number),
            carbs: expect.any(Number),
            fat: expect.any(Number),
        });

        expect(recipe).toMatchObject({
            calories: expect.any(Number),
            protein: expect.any(Number),
            carbs: expect.any(Number),
            fat: expect.any(Number),
        });
    });
});

describe('HomePage', () => {
    it('counts one meal per entry on the weekly bar', () => {
        const chart = getWeeklyMealChart([
            { date: 'Mon', meal: 'Chicken bowl', value: 5 },
            { date: 'Mon', meal: 'Oatmeal', value: 3 },
            { date: 'Thu', meal: 'Salad', value: 4 },
            { date: '2026-09-15', meal: 'Pasta', value: 2 },
        ] as Array<{ date: string; meal: string; value?: number }>);

        expect(chart.find((entry) => entry.label === 'Mon')?.value).toBe(2);
        expect(chart.find((entry) => entry.label === 'Thu')?.value).toBe(1);
    });

    it('renders the PantryPal dashboard headline', () => {
        render(<HomePage />);

        expect(
            screen.getByRole('heading', { name: /kitchen intelligence dashboard/i }),
        ).toBeInTheDocument();
    });

    it('shows core pantry summary cards', () => {
        render(<HomePage />);

        expect(screen.getByText(/items in pantry/i)).toBeInTheDocument();
        expect(screen.getByText(/expiring soon/i)).toBeInTheDocument();
        expect(screen.getByText(/recipes ready/i)).toBeInTheDocument();
    });

    it('generates a fresh AI suggestion whenever the button is clicked again', async () => {
        global.fetch = vi.fn()
            .mockResolvedValueOnce({
                json: async () => ({ recipe: { title: 'Fresh Bowl', time: '20 min', servings: 2, tags: ['Quick'], ingredients: ['Rice'], instructions: ['Cook rice'] } }),
            })
            .mockResolvedValueOnce({
                json: async () => ({ recipe: { title: 'Second Bowl', time: '18 min', servings: 1, tags: ['Fast'], ingredients: ['Eggs'], instructions: ['Cook eggs'] } }),
            });

        render(<HomePage />);

        fireEvent.click(screen.getByRole('button', { name: /generate new suggestion/i }));
        expect(await screen.findByText('Fresh Bowl')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /generate new suggestion/i }));
        expect(await screen.findByText('Second Bowl')).toBeInTheDocument();
    });

    it('shows the saved shopping list items on the dashboard', () => {
        window.localStorage.setItem(
            'pantrypal-shopping-list',
            JSON.stringify([{ name: 'Bananas', quantity: '6', unit: 'count' }]),
        );

        render(<HomePage />);

        expect(screen.getByText('Bananas')).toBeInTheDocument();
    });

    it('starts a new signed-in user with an empty pantry and shopping list', () => {
        signInUser('amy', 'secret');

        render(<HomePage />);

        expect(screen.queryByText('Chicken Breast')).not.toBeInTheDocument();
        expect(screen.queryByText('Avocado')).not.toBeInTheDocument();
        expect(screen.queryByText('family meals')).not.toBeInTheDocument();
    });

    it('shows zero ready recipes when the user starts with an empty pantry', () => {
        signInUser('amy', 'secret');

        render(<HomePage />);

        const cardsReady = screen.getByText('Recipes ready').closest('a');

        expect(cardsReady).not.toBeNull();
        expect(cardsReady).toHaveTextContent('0');
    });

    it('ranks the signed-in user\'s saved recipes instead of the built-in recipe catalog', () => {
        const user = signInUser('amy', 'secret');
        const customRecipes = [
            {
                id: 'custom-1',
                title: 'Avo Egg Bowl',
                time: '12 min',
                servings: 1,
                tags: ['Breakfast'],
                match: 100,
                ingredients: ['Avocado', 'Eggs'],
                instructions: ['Cook eggs', 'Serve with avocado'],
            },
        ];

        if (!user) {
            throw new Error('User should exist after sign in');
        }

        const updatedUser = { ...user, pantry: [{
            id: 'p1',
            name: 'Avocado',
            quantity: 2,
            unit: 'count',
            expiration: '2026-12-31',
            location: 'Counter',
            status: 'fresh',
        }], recipes: customRecipes };
        window.localStorage.setItem('pantrypal-users', JSON.stringify({ [updatedUser.id]: updatedUser }));
        window.localStorage.setItem('pantrypal-current-user', updatedUser.id);

        render(<HomePage />);

        expect(screen.getByText('Avo Egg Bowl')).toBeInTheDocument();
        expect(screen.queryByText('Chicken Rice Bowl')).not.toBeInTheDocument();
    });

    it('links summary cards and pantry items to the inventory page', () => {
        render(<HomePage />);

        expect(screen.getByRole('link', { name: /items in pantry/i })).toHaveAttribute('href', '/inventory');
        expect(screen.getByRole('link', { name: /expiring soon/i })).toHaveAttribute('href', '/inventory');
        expect(screen.getByRole('link', { name: /recipes ready/i })).toHaveAttribute('href', '/inventory');
        expect(screen.getByRole('link', { name: /chicken breast/i })).toHaveAttribute('href', '/inventory');
    });
});

describe('InventoryPage', () => {
    it('marks items as expiring within five days and expired after the date passes', () => {
        const today = new Date();
        const soon = new Date(today);
        soon.setDate(today.getDate() + 3);
        const past = new Date(today);
        past.setDate(today.getDate() - 2);
        const future = new Date(today);
        future.setDate(today.getDate() + 20);

        expect(getPantryItemStatus({ quantity: 2, expiration: soon.toISOString().slice(0, 10) })).toBe('expiring');
        expect(getPantryItemStatus({ quantity: 2, expiration: past.toISOString().slice(0, 10) })).toBe('expired');
        expect(getPantryItemStatus({ quantity: 0.5, expiration: future.toISOString().slice(0, 10) })).toBe('fresh');
    });

    it('keeps newly added pantry items after reload', () => {
        const { unmount } = render(<InventoryPage />);

        fireEvent.click(screen.getByRole('button', { name: /\+ add item/i }));
        fireEvent.change(screen.getAllByRole('textbox')[0], {
            target: { value: 'Mango' },
        });
        fireEvent.change(screen.getAllByRole('spinbutton')[0], {
            target: { value: '3' },
        });
        fireEvent.change(screen.getAllByRole('textbox')[1], {
            target: { value: 'count' },
        });
        fireEvent.click(screen.getByRole('button', { name: /save item/i }));

        expect(screen.getByText('Mango')).toBeInTheDocument();
        unmount();
        render(<InventoryPage />);

        expect(screen.getByText('Mango')).toBeInTheDocument();
    });

    it('removes an inventory item when delete is clicked', () => {
        render(<InventoryPage />);

        const chicken = screen.getByText('Chicken Breast');
        fireEvent.click(screen.getByRole('button', { name: /delete chicken breast/i }));

        expect(chicken).not.toBeInTheDocument();
    });
});

describe('RecipesPage', () => {
    it('keeps newly added recipes after reload', () => {
        const { unmount } = render(<RecipesPage />);

        fireEvent.click(screen.getByRole('button', { name: /\+ new recipe/i }));
        fireEvent.change(screen.getByPlaceholderText(/recipe title/i), {
            target: { value: 'Lemon Pasta' },
        });
        fireEvent.change(screen.getByPlaceholderText(/time/i), {
            target: { value: '15 min' },
        });
        fireEvent.change(screen.getByPlaceholderText(/servings/i), {
            target: { value: '2' },
        });
        fireEvent.change(screen.getByPlaceholderText(/ingredients \(one per line\)/i), {
            target: { value: 'Pasta\nLemon\nParsley' },
        });
        fireEvent.change(screen.getByPlaceholderText(/instructions \(one per line\)/i), {
            target: { value: 'Boil pasta\nMix with lemon' },
        });
        fireEvent.click(screen.getByRole('button', { name: /save recipe/i }));

        expect(screen.getByText('Lemon Pasta')).toBeInTheDocument();
        unmount();
        render(<RecipesPage />);

        expect(screen.getByText('Lemon Pasta')).toBeInTheDocument();
    });

    it('removes a recipe when delete is clicked', () => {
        render(<RecipesPage />);

        const recipeTitle = screen.getByText('Chicken Rice Bowl');
        fireEvent.click(screen.getByRole('button', { name: /delete chicken rice bowl/i }));

        expect(recipeTitle).not.toBeInTheDocument();
    });

    it('links ingredients to the inventory page', () => {
        render(<RecipesPage />);

        const ingredientLinks = screen.getAllByRole('link', { name: /chicken breast/i });
        expect(ingredientLinks.length).toBeGreaterThan(0);
        ingredientLinks.forEach((link) => expect(link).toHaveAttribute('href', '/inventory'));
    });
});

describe('ShoppingPage', () => {
    it('keeps newly added shopping items after reload', () => {
        const { unmount } = render(<ShoppingPage />);

        fireEvent.click(screen.getByRole('button', { name: /\+ add item/i }));
        fireEvent.change(screen.getByPlaceholderText(/item name/i), {
            target: { value: 'Bananas' },
        });
        fireEvent.change(screen.getByPlaceholderText(/quantity/i), {
            target: { value: '6' },
        });
        fireEvent.change(screen.getByPlaceholderText(/unit/i), {
            target: { value: 'count' },
        });
        fireEvent.click(screen.getByRole('button', { name: /save item/i }));

        expect(screen.getByText('Bananas')).toBeInTheDocument();
        unmount();
        render(<ShoppingPage />);

        expect(screen.getByText('Bananas')).toBeInTheDocument();
    });

    it('opens the add-item form and adds a new shopping item', () => {
        render(<ShoppingPage />);

        fireEvent.click(screen.getByRole('button', { name: /\+ add item/i }));

        fireEvent.change(screen.getByPlaceholderText(/item name/i), {
            target: { value: 'Bananas' },
        });
        fireEvent.change(screen.getByPlaceholderText(/quantity/i), {
            target: { value: '6' },
        });
        fireEvent.change(screen.getByPlaceholderText(/unit/i), {
            target: { value: 'count' },
        });
        fireEvent.click(screen.getByRole('button', { name: /save item/i }));

        expect(screen.getByText('Bananas')).toBeInTheDocument();
    });

    it('adds a bought item to inventory storage', () => {
        render(<ShoppingPage />);

        fireEvent.click(screen.getAllByRole('button', { name: /buy/i })[0]);

        expect(window.localStorage.getItem('pantrypal-pantry-items')).toContain('Avocado');
        expect(window.localStorage.getItem('pantrypal-shopping-list')).not.toContain('Avocado');
    });

    it('removes an item when buy is clicked', () => {
        render(<ShoppingPage />);

        const avocado = screen.getByText('Avocado');
        fireEvent.click(screen.getAllByRole('button', { name: /buy/i })[0]);

        expect(avocado).not.toBeInTheDocument();
    });

    it('removes a shopping list item when delete is clicked', () => {
        render(<ShoppingPage />);

        const lime = screen.getByText('Lime');
        fireEvent.click(screen.getByRole('button', { name: /delete lime/i }));

        expect(lime).not.toBeInTheDocument();
    });
});
