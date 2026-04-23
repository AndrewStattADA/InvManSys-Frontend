import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Register from '../components/Register';
import axiosInstance from '../api/axiosInstance';

/**
 * Register Test Suite
 * Validates user registration logic, password matching, and navigation callbacks.
 */

// Mock the API instance to isolate frontend logic
vi.mock('../api/axiosInstance', () => ({
    default: {
        post: vi.fn(),
    },
}));

describe('Register Component', () => {
    const mockOnRegisterSuccess = vi.fn();
    const mockOnBackToLogin = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Spy on window.alert to capture feedback without interrupting test execution
        vi.spyOn(window, 'alert').mockImplementation(() => {});
    });

    /**
     * Test Case: Client-side Validation
     * Ensures that the component catches mismatched passwords before 
     * attempting a network request.
     */
    it('shows an alert when passwords do not match', async () => {
        render(<Register onRegisterSuccess={mockOnRegisterSuccess} onBackToLogin={mockOnBackToLogin} />);

        fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'testuser' } });
        
        fireEvent.change(screen.getByPlaceholderText(/^Password$/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByPlaceholderText(/Confirm Password/i), { target: { value: 'mismatch' } });
        fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'test@test.com' } });
        fireEvent.click(screen.getByRole('button', { name: /register/i }));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith("Passwords do not match!");
        });

        // CRITICAL: Ensure no network traffic was generated for invalid data
        expect(axiosInstance.post).not.toHaveBeenCalled();
    });

    /**
     * Test Case: Successful Registration
     * Validates the "Happy Path" where data is valid and the server responds successfully.
     */
    it('successfully registers a user', async () => {
        axiosInstance.post.mockResolvedValueOnce({ data: {} });
        render(<Register onRegisterSuccess={mockOnRegisterSuccess} onBackToLogin={mockOnBackToLogin} />);

        fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'newuser' } });
        fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByPlaceholderText(/^Password$/i), { target: { value: 'secure123' } });
        fireEvent.change(screen.getByPlaceholderText(/Confirm Password/i), { target: { value: 'secure123' } });

        fireEvent.click(screen.getByRole('button', { name: /Register/i }));

        await waitFor(() => {
            // Verify that the data reached the endpoint
            expect(axiosInstance.post).toHaveBeenCalled();
            // Verify user feedback
            expect(window.alert).toHaveBeenCalledWith("Account created successfully! You can now log in.");
            // Verify parent state is notified
            expect(mockOnRegisterSuccess).toHaveBeenCalled();
        });
    });

    /**
     * Test Case: Navigation Navigation
     * Ensures the "Log in" link correctly triggers the callback to switch views.
     */
    it('calls onBackToLogin when clicking the link', () => {
        render(<Register onRegisterSuccess={mockOnRegisterSuccess} onBackToLogin={mockOnBackToLogin} />);
        
        // Find the button within the "Already have an account?" text block
        fireEvent.click(screen.getByRole('button', { name: /log in/i }));
        
        expect(mockOnBackToLogin).toHaveBeenCalled();
    });
});