import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddItemForm from '../components/AddItemForm';
import axiosInstance from '../api/axiosInstance';

/**
 * AddItemForm Test Suite
 * Tests the creation of new inventory items, form validation, 
 * and API interaction using mocked dependencies.
 */

// Mock the API instance to prevent real network requests during testing
vi.mock('../api/axiosInstance', () => ({
    default: {
        post: vi.fn(),
    },
}));

describe('AddItemForm Component', () => {
    // Shared mock function for the onItemAdded prop
    const mockOnItemAdded = vi.fn();

    beforeEach(() => {
        // Reset call counts and implementations before each test
        vi.clearAllMocks();
        
        // Spy on window.alert: This prevents the test from hanging and 
        // allows us to assert that a message was shown to the user.
        vi.spyOn(window, 'alert').mockImplementation(() => {});
        
        // Spy on console.error: Keeps the test terminal clean when 
        // testing failure paths that log errors.
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    /**
     * Test Case: Component Rendering
     * Ensures the UI elements (labels, placeholders, buttons) are present.
     */
    it('renders all form fields correctly', () => {
        render(<AddItemForm onItemAdded={mockOnItemAdded} />);
        
        expect(screen.getByText(/Add New Inventory Item/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Item Name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Category/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Quantity/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add to Inventory/i })).toBeInTheDocument();
    });

    /**
     * Test Case: Happy Path (Success)
     * Verifies that entering valid data and submitting calls the API correctly
     * and clears the form inputs afterward.
     */
    it('successfully submits a new item and resets the form', async () => {
        // Setup the mock to simulate a successful server response
        axiosInstance.post.mockResolvedValueOnce({ data: { message: 'Success' } });

        render(<AddItemForm onItemAdded={mockOnItemAdded} />);

        const nameInput = screen.getByPlaceholderText(/Item Name/i);
        const categoryInput = screen.getByPlaceholderText(/Category/i);
        const quantityInput = screen.getByPlaceholderText(/Quantity/i);
        const submitButton = screen.getByRole('button', { name: /Add to Inventory/i });

        // Simulate user typing into the form
        fireEvent.change(nameInput, { target: { value: 'Steel Nails' } });
        fireEvent.change(categoryInput, { target: { value: 'Hardware' } });
        fireEvent.change(quantityInput, { target: { value: '500' } });

        // Simulate form submission
        fireEvent.click(submitButton);

        // Use waitFor to handle the asynchronous nature of the API call
        await waitFor(() => {
            // 1. Verify the API received the correct structure and types
            // Crucial check: ensured '500' (string) became 500 (number)
            expect(axiosInstance.post).toHaveBeenCalledWith('items/', {
                name: 'Steel Nails',
                category_name: 'Hardware',
                quantity: 500, 
            });

            // 2. Verify the parent component is notified to refresh the list
            expect(mockOnItemAdded).toHaveBeenCalled();

            // 3. Verify the "State Reset" logic: inputs should be empty again
            expect(nameInput.value).toBe('');
            expect(categoryInput.value).toBe('');
            expect(quantityInput.value).toBe('0');
        });
    });

    /**
     * Test Case: Failure Path (Error)
     * Verifies that the UI reacts gracefully when the backend returns an error.
     */
    it('displays an error alert when the API fails', async () => {
        // Setup the mock to simulate a network or server failure
        axiosInstance.post.mockRejectedValueOnce(new Error('Network Error'));

        render(<AddItemForm onItemAdded={mockOnItemAdded} />);

        fireEvent.change(screen.getByPlaceholderText(/Item Name/i), { target: { value: 'Broken Item' } });
        fireEvent.change(screen.getByPlaceholderText(/Category/i), { target: { value: 'Misc' } });
        fireEvent.change(screen.getByPlaceholderText(/Quantity/i), { target: { value: '10' } });

        fireEvent.click(screen.getByRole('button', { name: /Add to Inventory/i }));

        await waitFor(() => {
            // Verify the user was notified of the error via alert
            expect(window.alert).toHaveBeenCalledWith("Failed to add item. Check console for details.");
            
            // Verify error was logged for developer troubleshooting
            expect(console.error).toHaveBeenCalled();
            
            // Verify the list was NOT refreshed (since the addition failed)
            expect(mockOnItemAdded).not.toHaveBeenCalled();
        });
    });

    /**
     * Test Case: Edge Case
     * Ensures the component doesn't crash if the optional callback prop isn't provided.
     */
    it('works even if onItemAdded prop is missing', async () => {
        axiosInstance.post.mockResolvedValueOnce({});
        render(<AddItemForm />); // Explicitly omitting the onItemAdded prop
        
        fireEvent.click(screen.getByRole('button'));
        
        // The test passes if no errors are thrown during execution
    });
});