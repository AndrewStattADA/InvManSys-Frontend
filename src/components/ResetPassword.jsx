import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const ResetPassword = () => {
    // Grabs /reset-password/:uid/:token from the URL
    const { uid, token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const response = await axiosInstance.post('password-reset-confirm/', {
                uid: uid,
                token: token,
                password: password
            });
            
            setMessage(response.data.message);
            setError('');
            // Redirect to login after 3 seconds
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.error || "Link expired or invalid.");
            setMessage('');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Create New Password</h2>
            <p style={{ fontSize: '0.9em', color: '#666' }}>Please enter your new password below.</p>
            
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