// src/pages/PatientsPage.jsx (UPDATED for Create/Add Patient)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../index.css';
const API_URL = 'http://localhost:5000/api/patients';

const PatientsPage = ({ auth }) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAdding, setIsAdding] = useState(false); // New state for modal/form visibility
    const [newPatient, setNewPatient] = useState({ 
        first_name: '', 
        last_name: '', 
        date_of_birth: '', 
        email: '', 
        phone: '' 
    });

    useEffect(() => {
        if (auth.token) {
            fetchPatients();
        }
    }, [auth.token]);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${auth.token}` }
            });
            setPatients(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch patients.');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setNewPatient({ ...newPatient, [e.target.name]: e.target.value });
    };

    const handleCreatePatient = async (e) => {
        e.preventDefault();
        try {
            await axios.post(API_URL, newPatient, {
                headers: { 
                    Authorization: `Bearer ${auth.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            // Clear form and refetch data
            setNewPatient({ first_name: '', last_name: '', date_of_birth: '', email: '', phone: '' });
            setIsAdding(false);
            fetchPatients();
        } catch (err) {
            alert('Failed to add patient: ' + (err.response?.data?.message || JSON.stringify(err.response?.data?.errors)));
            console.error(err.response?.data);
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading Patients...</div>;

    // src/pages/PatientsPage.jsx (Updated return block)

// Assuming this component fetches 'patients' array and 'auth' is available
// Assuming Link is imported from 'react-router-dom'

return (
    // Use container class for padding
    <div className="container">
        <h1>Patient Management</h1>
        
        <Link to="/dashboard" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                + Add New Patient 
        </Link>

        {error && <div className="login-error" style={{ marginTop: '15px' }}>Error: {error}</div>}

        <h3 style={{ marginTop: '30px' }}>Registered Patients ({patients.length})</h3>
        
        {/* 🚨 FIX 5: Use className="data-table card-shadow" for the table 🚨 */}
        <table className="data-table card-shadow" style={{borderSpacing: '0 1px'}}>
            <thead>
                <tr style={{ backgroundColor: '#e9ecef' }}>
                    <th className="data-table-header" style={{borderTopLeftRadius: '8px'}}>ID</th>
                    <th className="data-table-header">Name</th>
                    <th className="data-table-header">Email</th>
                    <th className="data-table-header" style={{borderTopRightRadius: '8px'}}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {patients.map(p => (
                    <tr key={p.patient_id}>
                        {/* 🚨 FIX 6: Use className="data-table-cell" 🚨 */}
                        <td className="data-table-cell">{p.patient_id}</td>
                        <td className="data-table-cell">
                            {/* Link to profile page */}
                            <Link to={`/patients/${p.patient_id}`} className="table-link">
                                {p.first_name} {p.last_name}
                            </Link>
                        </td>
                        <td className="data-table-cell">{p.email}</td>
                        <td className="data-table-cell">[Edit | Delete]</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);
};

/*const styles = {
    button: { padding: '10px 15px', background: '#337ab7', color: 'white', border: 'none', cursor: 'pointer', marginBottom: '20px' },
    saveButton: { padding: '10px 15px', background: '#5cb85c', color: 'white', border: 'none', cursor: 'pointer', marginTop: '10px' },
    th: { border: '1px solid #ddd', padding: '12px', textAlign: 'left' },
    td: { border: '1px solid #ddd', padding: '12px' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    formContainer: { border: '1px solid #ddd', padding: '20px', marginBottom: '30px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' },
    input: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }
};*/

export default PatientsPage;