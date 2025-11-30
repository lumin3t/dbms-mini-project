// src/components/Navbar.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css'; // Ensure global styles are imported

const Navbar = ({ auth }) => {
    return (
        // 🚨 FIX 1: Replace styles.nav with className="navbar card-shadow" 🚨
        <nav className="navbar card-shadow">
            
            {/* 🚨 FIX 2: Replace styles.logo with className="navbar-logo" 🚨 */}
            <div className="navbar-logo">CDSMP Manager</div>
            
            {/* 🚨 FIX 3: Replace styles.links with className="navbar-links" 🚨 */}
            <div className="navbar-links">
                
                {/* 🚨 FIX 4: Use className="navbar-link" for all links 🚨 */}
                <Link to="/dashboard" className="navbar-link">Dashboard</Link>
                <Link to="/patients" className="navbar-link">Patients</Link>
                <Link to="/doctors" className="navbar-link">Doctors</Link>
                <Link to="/appointments" className="navbar-link">Appointments</Link>
                <Link to="/uploads" className="navbar-link">Uploads</Link>
                
                {/* 🚨 FIX 5: Use className="btn navbar-logout-btn" for the button 🚨 */}
                <button onClick={auth.logout} className="btn navbar-logout-btn">Logout</button>
            </div>
        </nav>
    );
};

// 🚨 REMINDER: Ensure the old 'const styles = {...}' block is completely deleted from this file. 🚨

export default Navbar;