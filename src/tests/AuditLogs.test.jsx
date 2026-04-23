import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuditLogs from '../components/AuditLogs';
import axiosInstance from '../api/axiosInstance';

/**
 * AuditLogs Test Suite
 * Verifies data integrity across different log types (Stock vs. User Management).
 * Focuses on correct column mapping and date formatting.
 */

vi.mock('../api/axiosInstance', () => ({
    default: { get: vi.fn() },
}));

// Mock data representing the "Inventory" log structure
const mockStockLogs = [{
    id: 101,
    user: 'jdoe_manager',
    item_name: 'Industrial Saw',
    action: 'UPDATE_QTY',
    details: 'Increased from 5 to 15',
    timestamp: '2026-03-30T14:00:00Z'
}];

// Mock data representing the "User Management" log structure
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
        
        /**
         * Conditional Mocking:
         * Since the component calls two different endpoints, we use mockImplementation
         * to return the correct mock data based on the requested URL.
         */
        axiosInstance.get.mockImplementation((url) => {
            if (url === 'stock-logs/') return Promise.resolve({ data: mockStockLogs });
            if (url === 'user-action-logs/') return Promise.resolve({ data: mockUserLogs });
        });
    });

    /**
     * Test Case: Inventory Log Columns
     * Ensures the table displays the specific fields required for stock auditing.
     */
    it('displays every relevant column for Inventory Logs', async () => {
        render(<AuditLogs />);

        // We use findByRole to wait for the async data to render the row
        const row = await screen.findByRole('row', { name: /Industrial Saw/i });
        
        // Use 'within' to focus queries on this specific row only
        const cells = within(row).getAllByRole('cell');

        // Verify content by index to ensure correct column alignment
        expect(cells[0]).toHaveTextContent('jdoe_manager');
        expect(cells[1]).toHaveTextContent('Industrial Saw');
        expect(cells[2]).toHaveTextContent('UPDATE_QTY');
        expect(cells[3]).toHaveTextContent('Increased from 5 to 15');
        
        // Verify time formatting logic
        const formattedDate = new Date(mockStockLogs[0].timestamp).toLocaleString();
        expect(cells[4]).toHaveTextContent(formattedDate);
    });

    /**
     * Test Case: Tab Switching and User Log Columns
     * Ensures that clicking the tab updates the view with the correct management logs.
     */
    it('displays every relevant column for User Management Logs', async () => {
        render(<AuditLogs />);
        
        // Trigger tab change
        const userTabButton = await screen.findByRole('button', { name: /User Management Logs/i });
        fireEvent.click(userTabButton);

        const row = await screen.findByRole('row', { name: /admin_user/i });
        const cells = within(row).getAllByRole('cell');

        // Note: User logs have fewer columns or different labels than stock logs
        expect(cells[0]).toHaveTextContent('admin_user');
        expect(cells[1]).toHaveTextContent('staff_member_1');
        expect(cells[2]).toHaveTextContent('Deactivated account due to inactivity');
        
        const formattedDate = new Date(mockUserLogs[0].timestamp).toLocaleString();
        expect(cells[3]).toHaveTextContent(formattedDate);
    });

    /**
     * Test Case: Header Consistency
     * Ensures the <thead> labels update correctly when switching views.
     */
    it('verifies that headers match the data columns', async () => {
        render(<AuditLogs />);
        await screen.findByText('Inventory Logs');

        // Initial check for Inventory Headers
        const stockHeaders = screen.getAllByRole('columnheader').map(h => h.textContent);
        expect(stockHeaders).toEqual(['User', 'Item', 'Action', 'Details', 'Time']);

        // Switch and check for User Management Headers
        fireEvent.click(screen.getByText(/User Management Logs/i));
        const userHeaders = screen.getAllByRole('columnheader').map(h => h.textContent);
        expect(userHeaders).toEqual(['Performed By', 'Target User', 'Change Details', 'Time']);
    });
});