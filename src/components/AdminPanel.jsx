import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

/**
 * AdminPanel Component
 * Provides an interface for managing user roles based on a hierarchical permission system.
 * Hierarchy: Superuser > Manager > Staff > User
 */
const AdminPanel = () => {
    // State to store the list of users fetched from the API
    const [users, setUsers] = useState([]);
    // Loading state to handle asynchronous data fetching
    const [loading, setLoading] = useState(true);

    // Retrieve the current logged-in user's role from local storage to determine UI permissions
    const userRole = localStorage.getItem('user_role');
    
    // Boolean check: Superusers have global edit permissions
    const isSuperuser = userRole === 'superuser'; 

    /**
     * Fetches the full list of users from the backend
     */
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

    /**
     * Updates a specific user's role via a PATCH request
     * @param {number} userId - The ID of the user to update
     * @param {string} newRole - The new role string to assign
     */
    const handleRoleChange = async (userId, newRole) => {
        try {
            await axiosInstance.patch(`users/${userId}/`, { role: newRole });
            alert("User role updated successfully!");
            // Refresh the user list to reflect the changes in the UI
            fetchUsers(); 
        } catch (error) {
            // Display specific error from backend (e.g., hierarchy violation) or a default message
            alert(error.response?.data?.detail || "Failed to update role. Hierarchy restriction.");
        }
    };

    // Fetch users on component mount
    useEffect(() => { fetchUsers(); }, []);

    // Simple loading state view
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
                        /**
                         * Logic to determine if the current logged-in user can edit the user in this row:
                         * 1. Superusers can edit anyone.
                         * 2. Managers can edit anyone EXCEPT other Managers or Superusers.
                         */
                        const isTargetManager = user.role === 'manager';
                        const canEditThisUser = isSuperuser || (!isTargetManager && userRole === 'manager');

                        return (
                            <tr key={user.id}>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>
                                    {/* Visual indicator for the user's role using CSS classes for styling */}
                                    <span className={`badge ${user.role}`}>
                                        {user.role || 'No Role'}
                                    </span>
                                </td>
                                <td>
                                    <select 
                                        value={user.role || ''} 
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        disabled={!canEditThisUser} // UI enforcement of hierarchy
                                    >
                                        <option value="user">User (Read-Only)</option>
                                        <option value="staff">Staff (Edit Inventory)</option>
                                        
                                        {/* Managers cannot assign the Manager role; only Superusers see this option */}
                                        {isSuperuser && <option value="manager">Manager</option>}
                                        
                                        {/* If the target is a Manager, we show the option so the dropdown 
                                            doesn't appear empty, but we label it as Protected.
                                        */}
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