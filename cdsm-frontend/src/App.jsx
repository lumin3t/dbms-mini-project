// src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import DoctorsPage from './pages/DoctorsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import UploadsPage from './pages/UploadsPage';
import Navbar from './components/Navbar';

// --- Simple Auth Hook ---
const useAuth = () => {
    const [token, setToken] = useState(localStorage.getItem('adminToken') || null);

    useEffect(() => {
        if (token) {
            localStorage.setItem('adminToken', token);
        } else {
            localStorage.removeItem('adminToken');
        }
    }, [token]);

    const login = (jwt) => setToken(jwt);
    const logout = () => setToken(null);
    const isAuthenticated = !!token;

    return { token, login, logout, isAuthenticated };
};

// --- Protected Route Component ---
const ProtectedRoute = ({ element: Component, auth }) => {
    return auth.isAuthenticated ? (
        <Component auth={auth} />
    ) : (
        <Navigate to="/login" replace />
    );
};

export default function App() {
    const auth = useAuth();
    
    return (
        <Router>
            {/* Show Navbar only when authenticated */}
            {auth.isAuthenticated && <Navbar auth={auth} />}
            <div className="container p-4">
                <Routes>
                    {/* Public Route */}
                    <Route path="/login" element={<LoginPage auth={auth} />} />
                    
                    {/* Protected Routes */}
                    <Route path="/dashboard" element={<ProtectedRoute element={DashboardPage} auth={auth} />} />
                    <Route path="/patients" element={<ProtectedRoute element={PatientsPage} auth={auth} />} />
                    <Route path="/doctors" element={<ProtectedRoute element={DoctorsPage} auth={auth} />} />
                    <Route path="/appointments" element={<ProtectedRoute element={AppointmentsPage} auth={auth} />} />
                    <Route path="/uploads" element={<ProtectedRoute element={UploadsPage} auth={auth} />} />
                    
                    {/* Default Route */}
                    <Route path="/" element={<Navigate to={auth.isAuthenticated ? "/dashboard" : "/login"} replace />} />
                    <Route path="*" element={<h1>404 Not Found</h1>} />
                </Routes>
            </div>
        </Router>
    );
}