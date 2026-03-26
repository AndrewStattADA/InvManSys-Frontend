import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    // Get user permissions from local storage
    const userRole = localStorage.getItem('user_role');
    // Managers can edit Staff/Users, but only Superusers can edit/assign Managers
    const isSuperuser = userRole === 'superuser'; 

    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get('users/');
            setUsers(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching users:", error);
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await axiosInstance.patch(`users/${userId}/`, { role: newRole });
            alert("User role updated successfully!");
            fetchUsers(); 
        } catch (error) {
            alert(error.response?.data?.detail || "Failed to update role. Hierarchy restriction.");
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    if (loading) return <p>Loading users...</p>;

    return (
        <div className="admin-container">
            <h3>Staff & User Management</h3>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Current Role</th>
                        <th>Change Permission</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => {
                        // Disables the dropdown if the target is a manager and isn't a superuser
                        const isTargetManager = user.role === 'manager';
                        const canEditThisUser = isSuperuser || (!isTargetManager && userRole === 'manager');

                        return (
                            <tr key={user.id}>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`badge ${user.role}`}>
                                        {user.role || 'No Role'}
                                    </span>
                                </td>
                                <td>
                                    <select 
                                        value={user.role || ''} 
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        disabled={!canEditThisUser}
                                    >
                                        <option value="user">User (Read-Only)</option>
                                        <option value="staff">Staff (Edit Inventory)</option>
                                        
                                        {/* Only let Superusers see/assign the Manager option */}
                                        {isSuperuser && <option value="manager">Manager</option>}
                                        
                                        {/* If a Manager is viewing another Manager, show it but keep it disabled */}
                                        {!isSuperuser && isTargetManager && (
                                            <option value="manager">Manager (Protected)</option>
                                        )}
                                    </select>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default AdminPanel;