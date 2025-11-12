// src/components/Navbar.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ auth }) => {
    return (
        <nav style={styles.nav}>
            <div style={styles.logo}>CDSMP Admin</div>
            <div style={styles.links}>
                <Link to="/dashboard" style={styles.link}>Dashboard</Link>
                <Link to="/patients" style={styles.link}>Patients</Link>
                <Link to="/doctors" style={styles.link}>Doctors</Link>
                <Link to="/appointments" style={styles.link}>Appointments</Link>
                <Link to="/uploads" style={styles.link}>Uploads</Link>
                <button onClick={auth.logout} style={styles.logoutButton}>Logout</button>
            </div>
        </nav>
    );
};

const styles = {
    nav: { display: 'flex', justifyContent: 'space-between', padding: '15px 20px', backgroundColor: '#333', color: 'white' },
    logo: { fontWeight: 'bold' },
    links: { display: 'flex', gap: '20px', alignItems: 'center' },
    link: { color: 'white', textDecoration: 'none' },
    logoutButton: { background: '#d9534f', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }
};

export default Navbar;