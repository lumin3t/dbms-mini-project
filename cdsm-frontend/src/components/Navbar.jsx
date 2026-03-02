// src/components/Navbar.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css'; // Ensure global styles are imported

const Navbar = ({ auth }) => {
    return (
        <nav className="navbar card-shadow">

            <div className="navbar-logo">CDSMP Manager</div>
        
            <div className="navbar-links">
                <Link to="/dashboard" className="navbar-link">Dashboard</Link>
                <Link to="/patients" className="navbar-link">Patients</Link>
                <Link to="/doctors" className="navbar-link">Doctors</Link>
                <Link to="/appointments" className="navbar-link">Appointments</Link>
                <Link to="/uploads" className="navbar-link">Uploads</Link>
                
                <button onClick={auth.logout} className="btn navbar-logout-btn">Logout</button>
            </div>
        </nav>
    );
};

export default Navbar;