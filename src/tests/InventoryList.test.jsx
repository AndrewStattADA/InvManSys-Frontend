import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InventoryList from '../components/InventoryList';
import axiosInstance from '../api/axiosInstance';

/**
 * InventoryList Test Suite
 * Tests core data management features: Search, Filter, Sort, Edit, and Delete.
 */

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
        // Mock global window interactions
        vi.spyOn(window, 'confirm').mockImplementation(() => true);
        vi.spyOn(window, 'alert').mockImplementation(() => {});
    });

    /**
     * Test Case: Initial Data Fetch
     * Uses await findByText to handle the asynchronous transition from 
     * 'Loading...' to the actual data.
     */
    it('fetches and displays items on mount', async () => {
        axiosInstance.get.mockResolvedValueOnce({ data: mockItems });
        render(<InventoryList />);
        expect(await screen.findByText('Apple')).toBeInTheDocument();
    });

    /**
     * Test Case: Search Functionality
     * Verifies that the UI correctly updates its visible rows based on a search term.
     */
    it('filters items by search term', async () => {
        axiosInstance.get.mockResolvedValueOnce({ data: mockItems });
        render(<InventoryList />);

        await screen.findByText('Apple');

        const searchInput = screen.getByRole('textbox');
        fireEvent.change(searchInput, { target: { value: 'apple' } });

        // Apple matches, but Banana (and others) should be hidden
        expect(screen.getByText('Apple')).toBeInTheDocument();
        expect(screen.queryByText('Banana')).not.toBeInTheDocument();
    });

    /**
     * Test Case: Low Stock Filter
     * Verifies business logic (Qty < 5) applied on the client side.
     */
    it('filters items by Low Stock Only checkbox', async () => {
        axiosInstance.get.mockResolvedValueOnce({ data: mockItems });
        render(<InventoryList />);

        await screen.findByText('Apple');

        const lowStockCheckbox = screen.getByRole('checkbox');
        fireEvent.click(lowStockCheckbox);

        // Banana (2) is low stock; Apple (10) is not.
        expect(screen.getByText('Banana')).toBeInTheDocument();
        expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    });


    /**
     * Test Case: Role-Based Rendering
     * Ensures only authorized roles see management tools (AddItemForm).
     */
    it('shows AddItemForm only for Managers', async () => {
        localStorage.setItem('user_role', 'manager');
        axiosInstance.get.mockResolvedValue({ data: [] });
        
        render(<InventoryList />);
        expect(await screen.findByText(/Add New Inventory Item/i)).toBeInTheDocument();
    });

    /**
     * Test Case: Inline Updating (Staff)
     * Verifies that staff can edit specific fields (Quantity) and that the 
     * correct API call is triggered.
     */
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

    /**
     * Test Case: Delete Operation
     * Verifies window.confirm integration and backend deletion request.
     */
    it('deletes an item after confirmation', async () => {
        localStorage.setItem('user_role', 'manager');
        axiosInstance.get.mockResolvedValue({ data: [mockItems[0]] });
        axiosInstance.delete.mockResolvedValueOnce({});

        render(<InventoryList />);
        await screen.findByText('Apple');
        
        fireEvent.click(screen.getByText('Delete'));
        // Verify user was prompted for safety
        expect(window.confirm).toHaveBeenCalled();
        
        await waitFor(() => {
            expect(axiosInstance.delete).toHaveBeenCalledWith('items/1/');
        });
    });
});