import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

/**
 * AuditLogs Component
 * Displays a historical record of system activities, split into inventory 
 * changes and user administrative actions.
 */
const AuditLogs = () => {
    // State to hold data for the two different types of logs
    const [stockLogs, setStockLogs] = useState([]);
    const [userLogs, setUserLogs] = useState([]);
    
    // Toggle state to switch between 'stock' and 'users' view
    const [activeTab, setActiveTab] = useState('stock'); 
    const [loading, setLoading] = useState(true);

    /**
     * Fetches both sets of logs simultaneously to improve performance.
     */
    const fetchLogs = async () => {
        setLoading(true);
        try {
            // Promise.all runs requests in parallel rather than sequentially
            const [stockRes, userRes] = await Promise.all([
                axiosInstance.get('stock-logs/'),
                axiosInstance.get('user-action-logs/')
            ]);
            
            setStockLogs(stockRes.data);
            setUserLogs(userRes.data);
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            // Ensure loading spinner is turned off regardless of success or failure
            setLoading(false);
        }
    };

    // Load data once when the component is first mounted
    useEffect(() => { fetchLogs(); }, []);

    if (loading) return <p>Loading audit trails...</p>;

    return (
        <div className="audit-container" style={{ padding: '20px' }}>
            <h2>System Audit Logs</h2>
            
            {/* Navigation Tabs for switching between log categories */}
            <div className="tabs" style={{ marginBottom: '20px' }}>
                <button 
                    onClick={() => setActiveTab('stock')}
                    style={{ fontWeight: activeTab === 'stock' ? 'bold' : 'normal', marginRight: '10px' }}
                >
                    Inventory Logs
                </button>
                <button 
                    onClick={() => setActiveTab('users')}
                    style={{ fontWeight: activeTab === 'users' ? 'bold' : 'normal' }}
                >
                    User Management Logs
                </button>
            </div>

            {/* Conditional Rendering: Switch between Inventory Table and User Table based on activeTab */}
            {activeTab === 'stock' ? (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Item</th>
                            <th>Action</th>
                            <th>Details</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stockLogs.map(log => (
                            <tr key={log.id}>
                                <td>{log.user}</td>
                                {/* Fallback logic in case the linked item was deleted from the database */}
                                <td>{log.item_name || log.item || "Deleted Item"}</td>
                                <td><strong>{log.action}</strong></td>
                                <td>{log.details}</td>
                                {/* Formats the raw timestamp into a human-readable local date/time */}
                                <td>{new Date(log.timestamp).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Performed By</th>
                            <th>Target User</th>
                            <th>Change Details</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userLogs.map(log => (
                            <tr key={log.id}>
                                <td>{log.actor}</td>
                                <td>{log.target_user}</td>
                                <td>{log.action_details}</td>
                                <td>{new Date(log.timestamp).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AuditLogs;