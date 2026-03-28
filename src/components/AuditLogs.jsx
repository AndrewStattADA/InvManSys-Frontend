import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuditLogs = () => {
    const [stockLogs, setStockLogs] = useState([]);
    const [userLogs, setUserLogs] = useState([]);
    const [activeTab, setActiveTab] = useState('stock'); 
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const [stockRes, userRes] = await Promise.all([
                axiosInstance.get('stock-logs/'),
                axiosInstance.get('user-action-logs/')
            ]);
            setStockLogs(stockRes.data);
            setUserLogs(userRes.data);
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLogs(); }, []);

    if (loading) return <p>Loading audit trails...</p>;

    return (
        <div className="audit-container" style={{ padding: '20px' }}>
            <h2>System Audit Logs</h2>
            
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
                                <td>{log.item}</td>
                                <td><strong>{log.action}</strong></td>
                                <td>{log.details}</td>
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