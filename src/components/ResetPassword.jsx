import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

/**
 * ResetPassword Component
 * Finalizes the password reset process by accepting a new password from the user.
 * It utilizes URL parameters (uid and token) provided by a link sent via email.
 */
const ResetPassword = () => {
    // useParams extracts dynamic segments from the URL (defined in your Router)
    // uid: The user's encoded ID
    // token: The secure, single-use reset token
    const { uid, token } = useParams();
    const navigate = useNavigate();

    // --- State Management ---
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState(''); // Stores success feedback
    const [error, setError] = useState('');     // Stores validation or API errors

    /**
     * Submits the new password along with the verification tokens to the backend.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Ensure both password inputs match before making an expensive network call
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            // POST request to confirm the password change
            const response = await axiosInstance.post('password-reset-confirm/', {
                uid: uid,
                token: token,
                password: password
            });
            
            setMessage(response.data.message);
            setError(''); // Clear any existing errors on success
            
            // UX Improvement: Provide a delay so the user can read the success message
            // then redirect them to the login page.
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            // Handle expired links (tokens usually have a lifespan) or server errors
            setError(err.response?.data?.error || "Link expired or invalid.");
            setMessage('');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Create New Password</h2>
            <p style={{ fontSize: '0.9em', color: '#666' }}>Please enter your new password below.</p>
            
            {/* Conditional feedback alerts */}
            {message && <div style={{ color: 'green', marginBottom: '10px' }}>{message}</div>}
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>New Password:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Confirm Password:</label>
                    <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Update Password
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;