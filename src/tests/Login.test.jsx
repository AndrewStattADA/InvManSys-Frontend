import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from '../components/Login';
import axiosInstance from '../api/axiosInstance';

// 1. Mock the API instance
vi.mock('../api/axiosInstance', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('Login Component', () => {
  const mockOnLoginSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // 2. Mock window.alert so it doesn't pop up during tests
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('handles successful login and saves tokens', async () => {
    // Define what the "fake" server returns
    const mockResponse = {
      data: {
        access: 'fake-access-token',
        refresh: 'fake-refresh-token',
        role: 'admin',
      },
    };
    axiosInstance.post.mockResolvedValueOnce(mockResponse);

    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    // Simulate typing
    fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });
    
    // Click Login
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      // Verify API was called correctly
      expect(axiosInstance.post).toHaveBeenCalledWith('token/', {
        username: 'admin',
        password: 'password123',
      });
      
      // Verify LocalStorage saved the data
      expect(localStorage.getItem('access_token')).toBe('fake-access-token');
      expect(localStorage.getItem('user_role')).toBe('admin');
      
      // Verify the parent component is notified
      expect(mockOnLoginSuccess).toHaveBeenCalled();
    });
  });

  it('shows an alert when login fails', async () => {
    // Simulate a 401 Unauthorized
    axiosInstance.post.mockRejectedValueOnce(new Error('Unauthorized'));

    render(<Login onLoginSuccess={mockOnLoginSuccess} />);

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Invalid credentials');
    });
  });

  it('toggles the forgot password view', () => {
    render(<Login onLoginSuccess={mockOnLoginSuccess} />);
    
    // Click forgot password
    fireEvent.click(screen.getByText(/forgot password\?/i));
    
    // Check if the reset form appeared
    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your email/i)).toBeInTheDocument();
    
    // Click "Back to Login"
    fireEvent.click(screen.getByText(/back to login/i));
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
  });
});