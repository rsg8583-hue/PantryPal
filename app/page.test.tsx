import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import HomePage from './page';
import InventoryPage from './inventory/page';
import RecipesPage from './recipes/page';
import ShoppingPage from './shopping/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: vi.fn(),
    push: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('HomePage', () => {
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
});

describe('InventoryPage', () => {
  it('removes an inventory item when delete is clicked', () => {
    render(<InventoryPage />);

    const chicken = screen.getByText('Chicken Breast');
    fireEvent.click(screen.getByRole('button', { name: /delete chicken breast/i }));

    expect(chicken).not.toBeInTheDocument();
  });
});

describe('RecipesPage', () => {
  it('removes a recipe when delete is clicked', () => {
    render(<RecipesPage />);

    const recipeTitle = screen.getByText('Chicken Rice Bowl');
    fireEvent.click(screen.getByRole('button', { name: /delete chicken rice bowl/i }));

    expect(recipeTitle).not.toBeInTheDocument();
  });
});

describe('ShoppingPage', () => {
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
