// src/pages/DoctorsPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../index.css';
import { Link } from 'react-router-dom';
const API_URL = 'http://localhost:5000/api/doctors';

const DoctorsPage = ({ auth }) => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await axios.get(API_URL, {
                headers: {
                    Authorization: `Bearer ${auth.token}`
                }
            });
            setDoctors(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch doctors. Check backend CRUD logic.');
            setLoading(false);
            console.error(err);
        }
    };

    if (loading) return <div>Loading Doctors...</div>;
    if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

return (
    // Use container class for padding
    <div className="container"> 
        <h1> Doctor Management</h1>
      
        <Link to="/dashboard" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                + Add New Doctor
        </Link>
        
        <h3 style={{ marginTop: '30px' }}>Registered Doctors ({doctors.length})</h3>
        
        {/* Use data-table classes for clean, modern table look */}
        <table className="data-table">
            <thead>
                <tr>
                    <th className="data-table-header">ID</th>
                    <th className="data-table-header">Name</th>
                    <th className="data-table-header">Specialization</th>
                    <th className="data-table-header">Actions</th>
                </tr>
            </thead>
            <tbody>
                {doctors.map(d => (
                    <tr key={d.doctor_id}>
                        {/* Use table cell class */}
                        <td className="data-table-cell">{d.doctor_id}</td>
                        <td className="data-table-cell">{d.first_name} {d.last_name}</td>
                        <td className="data-table-cell">{d.specialization}</td>
                        <td className="data-table-cell">[Edit | Delete]</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);
};

/*const styles = {
    th: { border: '1px solid #ddd', padding: '8px', textAlign: 'left' },
    td: { border: '1px solid #ddd', padding: '8px' },
    tr: { '&:nth-child(even)': { backgroundColor: '#f9f9f9' } }
};*/

export default DoctorsPage;
