import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InventoryList from '../components/InventoryList';
import axiosInstance from '../api/axiosInstance';

vi.mock('../api/axiosInstance', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockItems = [
  { id: 1, name: 'Apple', category: 'Fruit', quantity: 10 },
  { id: 2, name: 'Banana', category: 'Fruit', quantity: 2 }, 
  { id: 3, name: 'Carrot', category: 'Veg', quantity: 15 },
];

describe('InventoryList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('fetches and displays items on mount', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: mockItems });
    render(<InventoryList />);
    // findBy queries wait for the element to appear
    expect(await screen.findByText('Apple')).toBeInTheDocument();
  });

  it('filters items by search term', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: mockItems });
    render(<InventoryList />);

    // 1. Wait for data to load
    await screen.findByText('Apple');

    // 2. Find input by type since we aren't using labels/ids
    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'apple' } });

    // 3. Assert
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
  });

  it('filters items by Low Stock Only checkbox', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: mockItems });
    render(<InventoryList />);

    // 1. Wait for data to load
    await screen.findByText('Apple');

    // 2. Find checkbox and click
    const lowStockCheckbox = screen.getByRole('checkbox');
    fireEvent.click(lowStockCheckbox);

    // 3. Banana is < 5, Apple is 10
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });

  it('sorts items by quantity when header is clicked', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: mockItems });
    render(<InventoryList />);
    await screen.findByText('Apple');

    const qtyHeader = screen.getByText(/Quantity/i);
    
    // Sort Ascending
    fireEvent.click(qtyHeader);
    let rows = screen.getAllByRole('row').slice(1);
    expect(within(rows[0]).getByText('Banana')).toBeInTheDocument();

    // Sort Descending
    fireEvent.click(qtyHeader);
    rows = screen.getAllByRole('row').slice(1);
    expect(within(rows[0]).getByText('Carrot')).toBeInTheDocument();
  });

  it('shows AddItemForm only for Managers', async () => {
    localStorage.setItem('user_role', 'manager');
    axiosInstance.get.mockResolvedValue({ data: [] });
    
    render(<InventoryList />);
    // findBy handles the async render logic
    expect(await screen.findByText(/Add New Inventory Item/i)).toBeInTheDocument();
  });

  it('handles inline editing correctly for staff (quantity only)', async () => {
    localStorage.setItem('user_role', 'staff');
    axiosInstance.get.mockResolvedValue({ data: [mockItems[0]] });
    axiosInstance.patch.mockResolvedValueOnce({ data: {} });

    render(<InventoryList />);
    await screen.findByText('Apple');
    
    fireEvent.click(screen.getByText('Edit'));
    const qtyInput = screen.getByDisplayValue('10');

    fireEvent.change(qtyInput, { target: { value: '25' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(axiosInstance.patch).toHaveBeenCalledWith('items/1/', { quantity: '25' });
    });
  });

  it('deletes an item after confirmation', async () => {
    localStorage.setItem('user_role', 'manager');
    axiosInstance.get.mockResolvedValue({ data: [mockItems[0]] });
    axiosInstance.delete.mockResolvedValueOnce({});

    render(<InventoryList />);
    await screen.findByText('Apple');
    
    fireEvent.click(screen.getByText('Delete'));
    expect(window.confirm).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(axiosInstance.delete).toHaveBeenCalledWith('items/1/');
    });
  });
});