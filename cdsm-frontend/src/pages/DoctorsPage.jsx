// src/pages/DoctorsPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
        <div>
            <h1>👨‍⚕️ Doctor Management</h1>
            <button style={{ padding: '10px', background: '#337ab7', color: 'white', border: 'none', marginBottom: '15px' }}>
                + Add New Doctor
            </button>
            
            <h3>Registered Doctors ({doctors.length})</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>Specialization</th>
                        <th style={styles.th}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {doctors.map(d => (
                        <tr key={d.doctor_id} style={styles.tr}>
                            <td style={styles.td}>{d.doctor_id}</td>
                            <td style={styles.td}>{d.first_name} {d.last_name}</td>
                            <td style={styles.td}>{d.specialization}</td>
                            <td style={styles.td}>[Edit | Delete]</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const styles = {
    th: { border: '1px solid #ddd', padding: '8px', textAlign: 'left' },
    td: { border: '1px solid #ddd', padding: '8px' },
    tr: { '&:nth-child(even)': { backgroundColor: '#f9f9f9' } }
};

export default DoctorsPage;
