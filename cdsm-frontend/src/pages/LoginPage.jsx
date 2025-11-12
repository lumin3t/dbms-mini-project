// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

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
            setError(err.response?.data?.message || 'Login failed. Check server status.');
        }
    };

    return (
        <div style={styles.container}>
            <h2>Admin Login</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    style={styles.input}
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    style={styles.input}
                />
                <button type="submit" style={styles.button}>Login</button>
            </form>
            {error && <p style={styles.error}>{error}</p>}
            <p style={{ marginTop: '20px', fontSize: '12px' }}>
                Use: test@admin.com / securepassword123 (from backend registration)
            </p>
        </div>
    );
};

const styles = {
    container: { maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '2px 2px 10px rgba(0,0,0,0.1)' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    input: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px' },
    button: { padding: '10px', backgroundColor: '#5cb85c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    error: { color: 'red', marginTop: '10px' }
};

export default LoginPage;