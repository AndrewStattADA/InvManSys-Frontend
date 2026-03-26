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
            onRegisterSuccess(); // Switch user back to login view
        } catch (error) {
            console.error("Registration error:", error.response?.data);
            alert("Registration failed. Username might already be taken.");
        }
    };

    return (
        <div style={{ maxWidth: '300px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Create Account</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input 
                    type="text" 
                    placeholder="Username" 
                    required 
                    onChange={e => setFormData({...formData, username: e.target.value})} 
                />
                <input 
                    type="email" 
                    placeholder="Email" 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    required 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                />
                <input 
                    type="password" 
                    placeholder="Confirm Password" 
                    required 
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                />
                <button type="submit" style={{ backgroundColor: '#28a745', color: 'white', padding: '10px' }}>
                    Register
                </button>
            </form>
            <button 
                onClick={onBackToLogin} 
                style={{ marginTop: '10px', background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}
            >
                Already have an account? Log in
            </button>
        </div>
    );
};

export default Register;