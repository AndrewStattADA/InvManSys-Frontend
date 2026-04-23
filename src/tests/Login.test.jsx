import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from '../components/Login';
import axiosInstance from '../api/axiosInstance';

/**
 * Login Test Suite
 * Verifies authentication logic, token persistence, and UI state toggling.
 */

// 1. Mock the API instance to prevent real network calls
vi.mock('../api/axiosInstance', () => ({
    default: {
        post: vi.fn(),
    },
}));

describe('Login Component', () => {
    const mockOnLoginSuccess = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear(); // Ensure a clean slate for token storage tests
        
        // 2. Mock window.alert: This is essential because standard test environments 
        // (like JSDOM) do not implement window.alert, and it would otherwise throw an error.
        vi.spyOn(window, 'alert').mockImplementation(() => {});
    });

    /**
     * Test Case: Successful Authentication
     * Validates that the component correctly interacts with the API, 
     * stores the returned JWTs, and notifies the parent app.
     */
    it('handles successful login and saves tokens', async () => {
        // Define the shape of the successful API response
        const mockResponse = {
            data: {
                access: 'fake-access-token',
                refresh: 'fake-refresh-token',
                role: 'admin',
            },
        };
        axiosInstance.post.mockResolvedValueOnce(mockResponse);

        render(<Login onLoginSuccess={mockOnLoginSuccess} />);

        // Simulate user input for credentials
        fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'admin' } });
        fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });
        
        // Trigger the form submission
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            // Verify the API was called with the correct endpoint and payload
            expect(axiosInstance.post).toHaveBeenCalledWith('token/', {
                username: 'admin',
                password: 'password123',
            });
            
            // Assert that tokens and roles are persisted for session management
            expect(localStorage.getItem('access_token')).toBe('fake-access-token');
            expect(localStorage.getItem('user_role')).toBe('admin');
            
            // Ensure the application state is updated via the success callback
            expect(mockOnLoginSuccess).toHaveBeenCalled();
        });
    });

    /**
     * Test Case: Failed Authentication
     * Verifies that the component handles 401 Unauthorized errors by alerting the user.
     */
    it('shows an alert when login fails', async () => {
        // Simulate a rejection from the server
        axiosInstance.post.mockRejectedValueOnce(new Error('Unauthorized'));

        render(<Login onLoginSuccess={mockOnLoginSuccess} />);

        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            // Verify that the user received feedback about the failure
            expect(window.alert).toHaveBeenCalledWith('Invalid credentials');
        });
    });

    /**
     * Test Case: UI State Toggle (Forgot Password)
     * Ensures the component switches between the Login and Password Reset views correctly.
     */
    it('toggles the forgot password view', () => {
        render(<Login onLoginSuccess={mockOnLoginSuccess} />);
        
        // Open the "Forgot Password" view
        fireEvent.click(screen.getByText(/forgot password\?/i));
        
        // Verify the reset-specific UI elements are visible
        expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/your email/i)).toBeInTheDocument();
        
        // Switch back to the standard Login view
        fireEvent.click(screen.getByText(/back to login/i));
        expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    });
});