import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddItemForm from '../components/AddItemForm';
import axiosInstance from '../api/axiosInstance';

// Mock the API instance
vi.mock('../api/axiosInstance', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('AddItemForm Component', () => {
  const mockOnItemAdded = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window.alert to prevent it from pausing the test runner
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    // Mock console.error to keep the test output clean when we deliberately trigger errors
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders all form fields correctly', () => {
    render(<AddItemForm onItemAdded={mockOnItemAdded} />);
    
    expect(screen.getByText(/Add New Inventory Item/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Item Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Category/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Quantity/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add to Inventory/i })).toBeInTheDocument();
  });

  it('successfully submits a new item and resets the form', async () => {
    // Mock a successful API response
    axiosInstance.post.mockResolvedValueOnce({ data: { message: 'Success' } });

    render(<AddItemForm onItemAdded={mockOnItemAdded} />);

    const nameInput = screen.getByPlaceholderText(/Item Name/i);
    const categoryInput = screen.getByPlaceholderText(/Category/i);
    const quantityInput = screen.getByPlaceholderText(/Quantity/i);
    const submitButton = screen.getByRole('button', { name: /Add to Inventory/i });

    // Fill out the form
    fireEvent.change(nameInput, { target: { value: 'Steel Nails' } });
    fireEvent.change(categoryInput, { target: { value: 'Hardware' } });
    fireEvent.change(quantityInput, { target: { value: '500' } });

    // Submit the form
    fireEvent.click(submitButton);

    await waitFor(() => {
      // 1. Verify the API was called with the exact right payload (including integer conversion)
      expect(axiosInstance.post).toHaveBeenCalledWith('items/', {
        name: 'Steel Nails',
        category_name: 'Hardware',
        quantity: 500, // Note: This checks that parseInt(quantity) worked
      });

      // 2. Verify the parent callback was triggered so the UI can update
      expect(mockOnItemAdded).toHaveBeenCalled();

      // 3. Verify the form fields were reset to their initial state
      expect(nameInput.value).toBe('');
      expect(categoryInput.value).toBe('');
      expect(quantityInput.value).toBe('0');
    });
  });

  it('displays an error alert when the API fails', async () => {
    // Mock an API failure
    axiosInstance.post.mockRejectedValueOnce(new Error('Network Error'));

    render(<AddItemForm onItemAdded={mockOnItemAdded} />);

    fireEvent.change(screen.getByPlaceholderText(/Item Name/i), { target: { value: 'Broken Item' } });
    fireEvent.change(screen.getByPlaceholderText(/Category/i), { target: { value: 'Misc' } });
    fireEvent.change(screen.getByPlaceholderText(/Quantity/i), { target: { value: '10' } });

    fireEvent.click(screen.getByRole('button', { name: /Add to Inventory/i }));

    await waitFor(() => {
      // Ensure the alert popped up with your specific error string
      expect(window.alert).toHaveBeenCalledWith("Failed to add item. Check console for details.");
      
      // Ensure the console.error was triggered
      expect(console.error).toHaveBeenCalled();
      
      // Ensure the callback was NOT called because the item failed to save
      expect(mockOnItemAdded).not.toHaveBeenCalled();
    });
  });

  it('works even if onItemAdded prop is missing', async () => {
  axiosInstance.post.mockResolvedValueOnce({});
  render(<AddItemForm />); // No prop passed
  fireEvent.click(screen.getByRole('button'));
  // No error should be thrown
});
});