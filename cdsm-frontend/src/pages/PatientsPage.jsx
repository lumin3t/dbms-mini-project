// src/pages/PatientsPage.jsx (UPDATED for Create/Add Patient)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

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

    return (
        <div style={{ padding: '20px' }}>
            <h1>🩺 Patient Management</h1>
            <button 
                onClick={() => setIsAdding(!isAdding)} 
                style={styles.button}
            >
                {isAdding ? 'Close Form' : '+ Add New Patient'}
            </button>
            
            {/* ADD PATIENT FORM */}
            {isAdding && (
                <form onSubmit={handleCreatePatient} style={styles.formContainer}>
                    <h3>Add New Patient</h3>
                    <input name="first_name" placeholder="First Name" value={newPatient.first_name} onChange={handleInputChange} required style={styles.input} />
                    <input name="last_name" placeholder="Last Name" value={newPatient.last_name} onChange={handleInputChange} required style={styles.input} />
                    <input name="date_of_birth" placeholder="DOB (YYYY-MM-DD)" value={newPatient.date_of_birth} onChange={handleInputChange} required style={styles.input} />
                    <input name="email" placeholder="Email" value={newPatient.email} onChange={handleInputChange} style={styles.input} />
                    <input name="phone" placeholder="Phone" value={newPatient.phone} onChange={handleInputChange} style={styles.input} />
                    <button type="submit" style={styles.saveButton}>Save Patient</button>
                </form>
            )}

            {error && <div style={{ color: 'red', marginTop: '15px' }}>Error: {error}</div>}

            <h3 style={{ marginTop: '30px' }}>Registered Patients ({patients.length})</h3>
            <table style={styles.table}>
                {/* ... Table Header and Body (unchanged) ... */}
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>Email</th>
                        <th style={styles.th}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {patients.map(p => (
                        <tr key={p.patient_id}>
                            <td style={styles.td}>{p.patient_id}</td>
                            <td style={styles.td}>{p.first_name} {p.last_name}</td>
                            <td style={styles.td}>{p.email}</td>
                            <td style={styles.td}>
                {/* 🚨 NEW LINK 🚨 */}
                <Link to={`/patients/${p.patient_id}`} style={{ color: '#007bff', textDecoration: 'none' }}>
                    {p.first_name} {p.last_name}
                </Link>
            </td>
                            <td style={styles.td}>[Edit | Delete]</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const styles = {
    button: { padding: '10px 15px', background: '#337ab7', color: 'white', border: 'none', cursor: 'pointer', marginBottom: '20px' },
    saveButton: { padding: '10px 15px', background: '#5cb85c', color: 'white', border: 'none', cursor: 'pointer', marginTop: '10px' },
    th: { border: '1px solid #ddd', padding: '12px', textAlign: 'left' },
    td: { border: '1px solid #ddd', padding: '12px' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    formContainer: { border: '1px solid #ddd', padding: '20px', marginBottom: '30px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' },
    input: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }
};

export default PatientsPage;