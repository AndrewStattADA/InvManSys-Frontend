import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuditLogs from '../components/AuditLogs';
import axiosInstance from '../api/axiosInstance';

vi.mock('../api/axiosInstance', () => ({
  default: { get: vi.fn() },
}));

const mockStockLogs = [{
  id: 101,
  user: 'jdoe_manager',
  item_name: 'Industrial Saw',
  action: 'UPDATE_QTY',
  details: 'Increased from 5 to 15',
  timestamp: '2026-03-30T14:00:00Z' // Specific ISO string
}];

const mockUserLogs = [{
  id: 201,
  actor: 'admin_user',
  target_user: 'staff_member_1',
  action_details: 'Deactivated account due to inactivity',
  timestamp: '2026-03-30T15:30:00Z'
}];

describe('AuditLogs Detail Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Helper to mock the split API calls
    axiosInstance.get.mockImplementation((url) => {
      if (url === 'stock-logs/') return Promise.resolve({ data: mockStockLogs });
      if (url === 'user-action-logs/') return Promise.resolve({ data: mockUserLogs });
    });
  });

  it('displays every relevant column for Inventory Logs', async () => {
    render(<AuditLogs />);

    // Wait for the table to load
    const row = await screen.findByRole('row', { name: /Industrial Saw/i });
    const cells = within(row).getAllByRole('cell');

    // Expected order: User, Item, Action, Details, Time
    expect(cells[0]).toHaveTextContent('jdoe_manager');
    expect(cells[1]).toHaveTextContent('Industrial Saw');
    expect(cells[2]).toHaveTextContent('UPDATE_QTY');
    expect(cells[3]).toHaveTextContent('Increased from 5 to 15');
    
    // Test the Date conversion (toLocaleString varies by environment, 
    // but we check if the year/time components exist)
    const formattedDate = new Date(mockStockLogs[0].timestamp).toLocaleString();
    expect(cells[4]).toHaveTextContent(formattedDate);
  });

  it('displays every relevant column for User Management Logs', async () => {
    render(<AuditLogs />);
    
    // Switch to User Tab
    const userTabButton = await screen.findByRole('button', { name: /User Management Logs/i });
    fireEvent.click(userTabButton);

    const row = await screen.findByRole('row', { name: /admin_user/i });
    const cells = within(row).getAllByRole('cell');

    // Expected order: Performed By, Target User, Change Details, Time
    expect(cells[0]).toHaveTextContent('admin_user');
    expect(cells[1]).toHaveTextContent('staff_member_1');
    expect(cells[2]).toHaveTextContent('Deactivated account due to inactivity');
    
    const formattedDate = new Date(mockUserLogs[0].timestamp).toLocaleString();
    expect(cells[3]).toHaveTextContent(formattedDate);
  });

  it('verifies that headers match the data columns', async () => {
    render(<AuditLogs />);
    await screen.findByText('Inventory Logs');

    // Check Inventory Headers
    const stockHeaders = screen.getAllByRole('columnheader').map(h => h.textContent);
    expect(stockHeaders).toEqual(['User', 'Item', 'Action', 'Details', 'Time']);

    // Switch and Check User Headers
    fireEvent.click(screen.getByText(/User Management Logs/i));
    const userHeaders = screen.getAllByRole('columnheader').map(h => h.textContent);
    expect(userHeaders).toEqual(['Performed By', 'Target User', 'Change Details', 'Time']);
  });
});