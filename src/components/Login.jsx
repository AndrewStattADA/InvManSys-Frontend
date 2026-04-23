import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

/**
 * Login Component
 * Handles user authentication, password reset requests, and navigation to registration.
 * @param {Function} onLoginSuccess - Callback triggered after successful authentication.
 * @param {Function} onShowRegister - Callback to switch the parent view to the registration form.
 */
const Login = ({ onLoginSuccess, onShowRegister }) => {
    // --- State Management ---
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState(''); 
    const [showForgot, setShowForgot] = useState(false); // Toggles between Login and Password Reset views
    const [message, setMessage] = useState(''); // Stores status messages for the user

    /**
     * Handles the primary login form submission.
     * On success, it stores JWT tokens and user role in localStorage.
     */
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Request JWT tokens from the backend
            const response = await axiosInstance.post('token/', { username, password });
            
            // Persist authentication data for session management
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            localStorage.setItem('user_role', response.data.role);
            
            // Execute success callback to update app-level state
            onLoginSuccess();
        } catch (error) {
            console.error("Login error:", error);
            alert("Invalid credentials");
        }
    };

    /**
     * Handles password reset requests.
     * Sends the user's email to the backend to trigger a reset link.
     */
    const handleResetRequest = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('password-reset/', { email });
            setMessage(response.data.message);
            
            // Automatically switch back to login view after a short delay
            setTimeout(() => {
                setShowForgot(false);
                setMessage('');
            }, 4000);
        } catch (error) {
            setMessage("Error: Could not send reset email.");
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h2>Enterprise Inventory Manager</h2>
                
                {/* Conditional Rendering: Password Reset View vs Login View */}
                {showForgot ? (
                    <div className="login-content">
                        <h3>Reset Password</h3>
                        <p>Enter your email to receive a reset link.</p>
                        <form onSubmit={handleResetRequest} className="login-form">
                            <input 
                                type="email" 
                                placeholder="Your Email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                            <button type="submit" className="login-submit-btn">Send Reset Link</button>
                        </form>
                        <button 
                            className="link-btn"
                            onClick={() => setShowForgot(false)} 
                        >
                            Back to Login
                        </button>
                        {message && <p className="status-message">{message}</p>}
                    </div>
                ) : (
                    <div className="login-content">
                        <h3>Please Login</h3>
                        <form onSubmit={handleLogin} className="login-form">
                            <input 
                                type="text" 
                                placeholder="Username" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)} 
                            />
                            <input 
                                type="password" 
                                placeholder="Password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} 
                            />
                            <button type="submit" className="login-submit-btn">Login</button>
                        </form>
                        
                        {/* UI Navigation Links */}
                        <button 
                            className="link-btn"
                            onClick={() => setShowForgot(true)} 
                        >
                            Forgot Password?
                        </button>
                        
                        <div className="signup-container">
                            <p>
                                Don't have an account? 
                                <button 
                                    type="button" 
                                    className="create-btn-link" 
                                    onClick={onShowRegister} 
                                >
                                    Create one here
                                </button>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;