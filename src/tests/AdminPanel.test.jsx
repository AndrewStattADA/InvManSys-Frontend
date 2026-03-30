import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AdminPanel from '../components/AdminPanel';
import axiosInstance from '../api/axiosInstance';

// Mock the API
vi.mock('../api/axiosInstance', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockUsers = [
  { id: 1, username: 'user_alice', email: 'alice@test.com', role: 'user' },
  { id: 2, username: 'staff_bob', email: 'bob@test.com', role: 'staff' },
  { id: 3, username: 'manager_charlie', email: 'charlie@test.com', role: 'manager' }
];

describe('AdminPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    // Clear localStorage before each test so roles don't bleed over
    localStorage.clear(); 
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state initially', () => {
    // Return a promise that doesn't resolve immediately to test the loading text
    axiosInstance.get.mockImplementationOnce(() => new Promise(() => {}));
    
    render(<AdminPanel />);
    expect(screen.getByText(/Loading users.../i)).toBeInTheDocument();
  });

  it('fetches and renders the list of users', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: mockUsers });
    render(<AdminPanel />);

    await waitFor(() => {
      expect(screen.getByText('user_alice')).toBeInTheDocument();
      expect(screen.getByText('staff_bob')).toBeInTheDocument();
      expect(screen.getByText('manager_charlie')).toBeInTheDocument();
    });
  });

  it('Superuser permissions: can edit everyone and assign managers', async () => {
    localStorage.setItem('user_role', 'superuser');
    axiosInstance.get.mockResolvedValueOnce({ data: mockUsers });
    render(<AdminPanel />);

    await waitFor(() => {
      expect(screen.getByText('user_alice')).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(3);

    // Superuser should have ALL dropdowns enabled
    selects.forEach(select => {
      expect(select).not.toBeDisabled();
    });

    // Superuser should be able to see the "Manager" option in the dropdowns
    // (We check the first dropdown to see if the manager option rendered)
    const options = Array.from(selects[0].options).map(opt => opt.value);
    expect(options).toContain('manager');
  });

  it('Manager permissions: can edit users/staff but NOT other managers', async () => {
    localStorage.setItem('user_role', 'manager');
    axiosInstance.get.mockResolvedValueOnce({ data: mockUsers });
    render(<AdminPanel />);

    await waitFor(() => {
      expect(screen.getByText('user_alice')).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    
    // Alice (User) -> Should be editable by Manager
    expect(selects[0]).not.toBeDisabled();
    
    // Bob (Staff) -> Should be editable by Manager
    expect(selects[1]).not.toBeDisabled();
    
    // Charlie (Manager) -> Should NOT be editable by another Manager
    expect(selects[2]).toBeDisabled();
    
    // Check for the protected label
    expect(screen.getByText('Manager (Protected)')).toBeInTheDocument();
  });

  it('successfully updates a user role and refetches data', async () => {
    localStorage.setItem('user_role', 'superuser');
    
    // Use mockResolvedValue (not Once) because it gets called twice (mount + refetch)
    axiosInstance.get.mockResolvedValue({ data: mockUsers });
    axiosInstance.patch.mockResolvedValueOnce({ data: {} });
    
    render(<AdminPanel />);

    await waitFor(() => {
      expect(screen.getByText('user_alice')).toBeInTheDocument();
    });

    // Change Alice's role to 'staff'
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'staff' } });

    await waitFor(() => {
      // Check if API was called correctly
      expect(axiosInstance.patch).toHaveBeenCalledWith('users/1/', { role: 'staff' });
      // Check if success alert showed
      expect(window.alert).toHaveBeenCalledWith("User role updated successfully!");
      // Check if refetch was called (1 for mount, 1 for update)
      expect(axiosInstance.get).toHaveBeenCalledTimes(2);
    });
  });

  it('displays an error alert if the role update fails', async () => {
    localStorage.setItem('user_role', 'superuser');
    axiosInstance.get.mockResolvedValueOnce({ data: mockUsers });
    
    // Mock the API rejecting the request
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
      expect(window.alert).toHaveBeenCalledWith("Hierarchy restriction.");
    });
  });
});