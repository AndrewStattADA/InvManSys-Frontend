import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AdminPanel from '../components/AdminPanel';
import axiosInstance from '../api/axiosInstance';

/**
 * AdminPanel Test Suite
 * Focuses on user management, hierarchy enforcement, and permission-based rendering.
 */

// Mock the API
vi.mock('../api/axiosInstance', () => ({
    default: {
        get: vi.fn(),
        patch: vi.fn(),
    },
}));

// Standardized mock data for consistent testing
const mockUsers = [
    { id: 1, username: 'user_alice', email: 'alice@test.com', role: 'user' },
    { id: 2, username: 'staff_bob', email: 'bob@test.com', role: 'staff' },
    { id: 3, username: 'manager_charlie', email: 'charlie@test.com', role: 'manager' }
];

describe('AdminPanel Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(window, 'alert').mockImplementation(() => {});
        
        // CRITICAL: Clear localStorage to ensure the 'user_role' from one 
        // test doesn't leak into the next and cause false positives/negatives.
        localStorage.clear(); 
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    /**
     * Tests the "Suspense"-like loading state.
     */
    it('renders loading state initially', () => {
        // Return an unresolved promise to keep the component in the loading state
        axiosInstance.get.mockImplementationOnce(() => new Promise(() => {}));
        
        render(<AdminPanel />);
        expect(screen.getByText(/Loading users.../i)).toBeInTheDocument();
    });

    /**
     * Verifies that user data fetched from the API is correctly displayed in the table.
     */
    it('fetches and renders the list of users', async () => {
        axiosInstance.get.mockResolvedValueOnce({ data: mockUsers });
        render(<AdminPanel />);

        await waitFor(() => {
            expect(screen.getByText('user_alice')).toBeInTheDocument();
            expect(screen.getByText('staff_bob')).toBeInTheDocument();
            expect(screen.getByText('manager_charlie')).toBeInTheDocument();
        });
    });

    /**
     * Permission Test: Superuser
     * Ensures Superusers have absolute control and can see all options.
     */
    it('Superuser permissions: can edit everyone and assign managers', async () => {
        localStorage.setItem('user_role', 'superuser');
        axiosInstance.get.mockResolvedValueOnce({ data: mockUsers });
        render(<AdminPanel />);

        await waitFor(() => {
            expect(screen.getByText('user_alice')).toBeInTheDocument();
        });

        const selects = screen.getAllByRole('combobox');
        expect(selects).toHaveLength(3);

        // Assert that no dropdowns are restricted for a superuser
        selects.forEach(select => {
            expect(select).not.toBeDisabled();
        });

        // Ensure the high-level 'manager' role is available in the dropdown
        const options = Array.from(selects[0].options).map(opt => opt.value);
        expect(options).toContain('manager');
    });

    /**
     * Permission Test: Manager (Hierarchy Enforcement)
     * Tests that the component correctly disables editing for peers (other managers).
     */
    it('Manager permissions: can edit users/staff but NOT other managers', async () => {
        localStorage.setItem('user_role', 'manager');
        axiosInstance.get.mockResolvedValueOnce({ data: mockUsers });
        render(<AdminPanel />);

        await waitFor(() => {
            expect(screen.getByText('user_alice')).toBeInTheDocument();
        });

        const selects = screen.getAllByRole('combobox');
        
        // Alice (User) & Bob (Staff) -> Should remain editable
        expect(selects[0]).not.toBeDisabled();
        expect(selects[1]).not.toBeDisabled();
        
        // Charlie (Manager) -> Must be disabled for the current 'manager' user
        expect(selects[2]).toBeDisabled();
        
        // Check for the UI hint indicating why the field is disabled
        expect(screen.getByText('Manager (Protected)')).toBeInTheDocument();
    });

    /**
     * Happy Path: Successful Role Update
     * Verifies the full cycle: UI Change -> API Patch -> Success Message -> Data Refresh.
     */
    it('successfully updates a user role and refetches data', async () => {
        localStorage.setItem('user_role', 'superuser');
        
        // mockResolvedValue is used because we expect multiple 'get' calls
        axiosInstance.get.mockResolvedValue({ data: mockUsers });
        axiosInstance.patch.mockResolvedValueOnce({ data: {} });
        
        render(<AdminPanel />);

        await waitFor(() => {
            expect(screen.getByText('user_alice')).toBeInTheDocument();
        });

        // Trigger a role change on the first user (Alice)
        const selects = screen.getAllByRole('combobox');
        fireEvent.change(selects[0], { target: { value: 'staff' } });

        await waitFor(() => {
            // Verify specific API endpoint and payload
            expect(axiosInstance.patch).toHaveBeenCalledWith('users/1/', { role: 'staff' });
            
            // Verify feedback given to user
            expect(window.alert).toHaveBeenCalledWith("User role updated successfully!");
            
            // Verify the component refreshed the user list after the change
            expect(axiosInstance.get).toHaveBeenCalledTimes(2);
        });
    });

    /**
     * Error Path: API Failure
     * Checks that backend error messages are passed through to the user's alert.
     */
    it('displays an error alert if the role update fails', async () => {
        localStorage.setItem('user_role', 'superuser');
        axiosInstance.get.mockResolvedValueOnce({ data: mockUsers });
        
        // Mock a 403 or similar hierarchy restriction error from the server
        axiosInstance.patch.mockRejectedValueOnce({
            response: { data: { detail: 'Hierarchy restriction.' } }
        });

        render(<AdminPanel />);

        await waitFor(() => {
            expect(screen.getByText('user_alice')).toBeInTheDocument();
        });

        const selects = screen.getAllByRole('combobox');
        fireEvent.change(selects[0], { target: { value: 'staff' } });

        await waitFor(() => {
            // Verify the specific error message from the response was displayed
            expect(window.alert).toHaveBeenCalledWith("Hierarchy restriction.");
        });
    });
});