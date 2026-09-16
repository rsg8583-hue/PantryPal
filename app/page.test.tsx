import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { getPantryItemStatus, getWeeklyMealChart } from '@/lib/data';
import HomePage from './page';
import InventoryPage from './inventory/page';
import RecipesPage from './recipes/page';
import ShoppingPage from './shopping/page';

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

describe('HomePage', () => {
    it('counts one meal per entry on the weekly bar', () => {
        const chart = getWeeklyMealChart([
            { date: 'Mon', meal: 'Chicken bowl', value: 5 },
            { date: 'Mon', meal: 'Oatmeal', value: 3 },
            { date: 'Thu', meal: 'Salad', value: 4 },
            { date: '2026-09-15', meal: 'Pasta', value: 2 },
        ]);

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
        expect(screen.getByText(/low stock/i)).toBeInTheDocument();
    });

    it('shows the saved shopping list items on the dashboard', () => {
        window.localStorage.setItem(
            'pantrypal-shopping-list',
            JSON.stringify([{ name: 'Bananas', quantity: '6', unit: 'count' }]),
        );

        render(<HomePage />);

        expect(screen.getByText('Bananas')).toBeInTheDocument();
    });

    it('links summary cards and pantry items to the inventory page', () => {
        render(<HomePage />);

        expect(screen.getByRole('link', { name: /items in pantry/i })).toHaveAttribute('href', '/inventory');
        expect(screen.getByRole('link', { name: /expiring soon/i })).toHaveAttribute('href', '/inventory');
        expect(screen.getByRole('link', { name: /low stock/i })).toHaveAttribute('href', '/inventory');
        expect(screen.getByRole('link', { name: /chicken breast/i })).toHaveAttribute('href', '/inventory');
    });
});

describe('InventoryPage', () => {
    it('marks items as expiring within five days and expired after the date passes', () => {
        expect(getPantryItemStatus({ quantity: 2, expiration: '2026-09-16' })).toBe('expiring');
        expect(getPantryItemStatus({ quantity: 2, expiration: '2026-09-12' })).toBe('expired');
        expect(getPantryItemStatus({ quantity: 0.5, expiration: '2026-12-31' })).toBe('low');
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
