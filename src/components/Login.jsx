import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const Login = ({ onLoginSuccess }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('token/', credentials);
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            onLoginSuccess();
            alert("Logged in successfully!");
        } catch (error) {
            alert("Login failed. Check your credentials.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Username" onChange={e => setCredentials({...credentials, username: e.target.value})} />
            <input type="password" placeholder="Password" onChange={e => setCredentials({...credentials, password: e.target.value})} />
            <button type="submit">Login</button>
        </form>
    );
};

export default Login;