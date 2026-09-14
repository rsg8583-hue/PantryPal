import { fireEvent, render, screen } from '@testing-library/react';
import HomePage from './page';
import ShoppingPage from './shopping/page';

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
});
