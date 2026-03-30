import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Register from '../components/Register';
import axiosInstance from '../api/axiosInstance';

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
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('shows an alert when passwords do not match', async () => {
    render(<Register onRegisterSuccess={mockOnRegisterSuccess} onBackToLogin={mockOnBackToLogin} />);

    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'testuser' } });
    // Using ^ and $ ensures we only get the field that is EXACTLY "Password"
    fireEvent.change(screen.getByPlaceholderText(/^Password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText(/Confirm Password/i), { target: { value: 'mismatch' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Passwords do not match!");
    });

    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  it('successfully registers a user', async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: {} });
    render(<Register onRegisterSuccess={mockOnRegisterSuccess} onBackToLogin={mockOnBackToLogin} />);

    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/^Password$/i), { target: { value: 'secure123' } });
    fireEvent.change(screen.getByPlaceholderText(/Confirm Password/i), { target: { value: 'secure123' } });

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith("Account created successfully! You can now log in.");
      expect(mockOnRegisterSuccess).toHaveBeenCalled();
    });
  });

  it('calls onBackToLogin when clicking the link', () => {
    render(<Register onRegisterSuccess={mockOnRegisterSuccess} onBackToLogin={mockOnBackToLogin} />);
    fireEvent.click(screen.getByText(/Already have an account\? Log in/i));
    expect(mockOnBackToLogin).toHaveBeenCalled();
  });
});