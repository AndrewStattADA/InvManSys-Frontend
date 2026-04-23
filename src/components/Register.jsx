import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

/**
 * Register Component
 * Facilitates new user account creation with basic validation and error handling.
 * @param {Function} onRegisterSuccess - Callback to trigger navigation or UI change after successful signup.
 * @param {Function} onBackToLogin - Callback to return the user to the login view.
 */
const Register = ({ onRegisterSuccess, onBackToLogin }) => {
    // Single state object to manage all registration form fields
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    /**
     * Handles form submission, performs password validation, and makes API request.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic client-side validation to ensure password consistency
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            // Sends registration data to the backend
            // Note: confirmPassword is not sent to the server, only used for local validation
            await axiosInstance.post('register/', {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            
            alert("Account created successfully! You can now log in.");
            
            // Execute success callback (usually redirects to login or logs the user in)
            onRegisterSuccess(); 
        } catch (error) {
            // Logs specific backend error data for debugging
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
                        {/* Input change handlers use functional state updates with the spread operator 
                           to preserve other fields while updating the target field.
                        */}
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