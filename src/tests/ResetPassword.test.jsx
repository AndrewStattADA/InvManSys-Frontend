import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ResetPassword from '../components/ResetPassword';
import axiosInstance from '../api/axiosInstance';
import { useParams, useNavigate } from 'react-router-dom';

vi.mock('../api/axiosInstance', () => ({
  default: { post: vi.fn() },
}));

vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
  useNavigate: vi.fn(),
}));

describe('ResetPassword Component', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Use modern timers and ensure they don't block promises
    vi.useFakeTimers({ shouldAdvanceTime: true });
    useParams.mockReturnValue({ uid: '123', token: 'abc-token' });
    useNavigate.mockReturnValue(mockNavigate);
  });

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

  it('successfully resets password and redirects', async () => {
    axiosInstance.post.mockResolvedValueOnce({ data: { message: 'Success!' } });
    render(<ResetPassword />);
    
    const { newPass, confirmPass } = getInputs();
    fireEvent.change(newPass, { target: { value: 'new-pass' } });
    fireEvent.change(confirmPass, { target: { value: 'new-pass' } });
    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));

    // 1. Wait for the API call and the "Success!" message to appear
    await waitFor(() => {
      expect(screen.getByText(/Success!/i)).toBeInTheDocument();
    });

    // 2. NOW skip the timer for the redirect
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('displays backend errors', async () => {
    axiosInstance.post.mockRejectedValueOnce({
      response: { data: { error: 'Invalid link' } }
    });

    render(<ResetPassword />);
    const { newPass, confirmPass } = getInputs();

    fireEvent.change(newPass, { target: { value: 'pass' } });
    fireEvent.change(confirmPass, { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));

    // Increased timeout for waitFor just in case
    await waitFor(() => {
      expect(screen.getByText(/Invalid link/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});