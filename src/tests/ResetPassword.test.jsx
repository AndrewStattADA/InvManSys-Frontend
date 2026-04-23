import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ResetPassword from '../components/ResetPassword';
import axiosInstance from '../api/axiosInstance';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * ResetPassword Test Suite
 * Special focus on Mocking Hooks (useParams, useNavigate) and Handling Timers.
 */

vi.mock('../api/axiosInstance', () => ({
    default: { post: vi.fn() },
}));

// Mock react-router-dom to control URL params and navigation behavior
vi.mock('react-router-dom', () => ({
    useParams: vi.fn(),
    useNavigate: vi.fn(),
}));

describe('ResetPassword Component', () => {
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        
        /**
         * vi.useFakeTimers:
         * This allows us to "fast-forward" through the 3000ms delay in the component
         * without actually making the test wait for 3 seconds.
         */
        vi.useFakeTimers({ shouldAdvanceTime: true });
        
        // Mocking return values for the hooks
        useParams.mockReturnValue({ uid: '123', token: 'abc-token' });
        useNavigate.mockReturnValue(mockNavigate);
    });

    // Helper to grab the password fields (since they may lack unique labels)
    const getInputs = () => {
        const inputs = document.querySelectorAll('input[type="password"]');
        return { newPass: inputs[0], confirmPass: inputs[1] };
    };

    it('renders the form correctly', () => {
        render(<ResetPassword />);
        expect(screen.getByText(/Create New Password/i)).toBeInTheDocument();
    });

    it('shows an error if passwords do not match', async () => {
        render(<ResetPassword />);
        const { newPass, confirmPass } = getInputs();

        fireEvent.change(newPass, { target: { value: 'pass1' } });
        fireEvent.change(confirmPass, { target: { value: 'pass2' } });
        fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));

        expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });

    /**
     * Test Case: Successful Reset and Redirect
     * Verifies the full async flow plus the timed redirect logic.
     */
    it('successfully resets password and redirects', async () => {
        axiosInstance.post.mockResolvedValueOnce({ data: { message: 'Success!' } });
        render(<ResetPassword />);
        
        const { newPass, confirmPass } = getInputs();
        fireEvent.change(newPass, { target: { value: 'new-pass' } });
        fireEvent.change(confirmPass, { target: { value: 'new-pass' } });
        fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));

        // 1. Wait for the API call to resolve and the success UI to appear
        await waitFor(() => {
            expect(screen.getByText(/Success!/i)).toBeInTheDocument();
        });

        /**
         * 2. Advance Timers:
         * We wrap this in 'act' because the timer triggers a state change/navigation.
         * This simulates the 3-second wait instantly.
         */
        act(() => {
            vi.advanceTimersByTime(3000);
        });

        // Ensure the component actually tried to redirect to /login
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    /**
     * Test Case: Error Handling
     * Validates that server-side errors are extracted and displayed correctly.
     */
    it('displays backend errors', async () => {
        axiosInstance.post.mockRejectedValueOnce({
            response: { data: { error: 'Invalid link' } }
        });

        render(<ResetPassword />);
        const { newPass, confirmPass } = getInputs();

        fireEvent.change(newPass, { target: { value: 'pass' } });
        fireEvent.change(confirmPass, { target: { value: 'pass' } });
        fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));

        await waitFor(() => {
            expect(screen.getByText(/Invalid link/i)).toBeInTheDocument();
        });
    });
});