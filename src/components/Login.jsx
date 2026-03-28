import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const Login = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState(''); // For reset request
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

    if (showForgot) {
        return (
            <div className="login-form">
                <h3>Reset Password</h3>
                <p>Enter your email to receive a reset link.</p>
                <form onSubmit={handleResetRequest}>
                    <input 
                        type="email" 
                        placeholder="Your Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
                    />
                    <button type="submit" className="login-btn">Send Reset Link</button>
                    <button 
                        type="button" 
                        onClick={() => setShowForgot(false)} 
                        style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', marginTop: '10px' }}
                    >
                        Back to Login
                    </button>
                </form>
                {message && <p style={{ marginTop: '10px', color: 'green' }}>{message}</p>}
            </div>
        );
    }

    return (
        <div className="login-form">
            <form onSubmit={handleLogin}>
                <input 
                    type="text" 
                    placeholder="Username" 
                    onChange={(e) => setUsername(e.target.value)} 
                    style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    onChange={(e) => setPassword(e.target.value)} 
                    style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
                />
                <button type="submit" className="login-btn" style={{ width: '100%', padding: '10px' }}>Login</button>
            </form>
            <button 
                onClick={() => setShowForgot(true)} 
                style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', marginTop: '15px', fontSize: '0.85em' }}
            >
                Forgot Password?
            </button>
        </div>
    );
};

export default Login;