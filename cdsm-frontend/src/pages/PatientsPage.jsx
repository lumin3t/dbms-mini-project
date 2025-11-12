// src/pages/PatientsPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/patients';

const PatientsPage = ({ auth }) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPatients();
    }, [auth.token]); // Dependency on token ensures re-fetch on login/logout

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_URL, {
                headers: {
                    Authorization: `Bearer ${auth.token}`
                }
            });
            setPatients(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch patients. Check token or backend status.');
            setLoading(false);
            console.error(err);
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading Patients...</div>;
    if (error) return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>🩺 Patient Management</h1>
            <button style={styles.button}>+ Add New Patient</button>
            
            <h3 style={{ marginTop: '20px' }}>Registered Patients ({patients.length})</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
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
                            <td style={styles.td}>[Edit | Delete]</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const styles = {
    button: { padding: '10px 15px', background: '#337ab7', color: 'white', border: 'none', cursor: 'pointer' },
    th: { border: '1px solid #ddd', padding: '12px', textAlign: 'left' },
    td: { border: '1px solid #ddd', padding: '12px' }
};

export default PatientsPage;