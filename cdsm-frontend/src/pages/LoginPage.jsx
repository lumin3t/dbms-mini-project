// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import '../index.css';

const API_URL = 'http://localhost:5000/api/admin/login';

const LoginPage = ({ auth }) => {
    const [email, setEmail] = useState('test@admin.com');
    const [password, setPassword] = useState('securepassword123');
    const [error, setError] = useState('');

    if (auth.isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post(API_URL, { email, password });
            auth.login(response.data.token); 
        } catch (err) {
            console.error(err);
            // This error handling relies on the CSS class 'login-error'
            setError(err.response?.data?.message || 'Login failed. Check server status.');
        }
    };

    return (
        <div className="login-container card-shadow">
            <h2 className="login-header">Admin Login</h2>
            
            <form onSubmit={handleSubmit} className="login-form">
                
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="form-control"
                />
                
                {/* 🚨 FIX 4: Replace styles.input with CSS class 🚨 */}
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="form-control"
                />
                
                <button type="submit" className="btn btn-primary">Sign In</button>
            </form>
            
            {error && <p className="login-error">{error}</p>}
            
        </div>
    );
};

export default LoginPage;