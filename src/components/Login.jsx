import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

// Add onShowRegister to the props
const Login = ({ onLoginSuccess, onShowRegister }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState(''); 
    const [showForgot, setShowForgot] = useState(false);
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('token/', { username, password });
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            localStorage.setItem('user_role', response.data.role);
            onLoginSuccess();
        } catch (error) {
            alert("Invalid credentials");
        }
    };

    const handleResetRequest = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('password-reset/', { email });
            setMessage(response.data.message);
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