import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const Register = ({ onRegisterSuccess, onBackToLogin }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            await axiosInstance.post('register/', {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            alert("Account created successfully! You can now log in.");
            onRegisterSuccess(); 
        } catch (error) {
            console.error("Registration error:", error.response?.data);
            alert("Registration failed. Username might already be taken.");
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h2>Enterprise Inventory Manager</h2>
                <div className="login-content">
                    <h3>Create Account</h3>
                    <form onSubmit={handleSubmit} className="login-form">
                        <input 
                            type="text" 
                            placeholder="Username" 
                            required 
                            value={formData.username}
                            onChange={e => setFormData({...formData, username: e.target.value})} 
                        />
                        <input 
                            type="email" 
                            placeholder="Email" 
                            required
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})} 
                        />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            required 
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})} 
                        />
                        <input 
                            type="password" 
                            placeholder="Confirm Password" 
                            required 
                            value={formData.confirmPassword}
                            onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                        />
                        <button type="submit" className="login-submit-btn">
                            Register
                        </button>
                    </form>

                    <div className="signup-container">
                        <p>
                            Already have an account? 
                            <button 
                                type="button" 
                                className="create-btn-link" 
                                onClick={onBackToLogin}
                            >
                                Log in
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;