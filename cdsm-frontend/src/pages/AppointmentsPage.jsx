// src/pages/AppointmentsPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/appointments';

const AppointmentsPage = ({ auth }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await axios.get(API_URL, {
                headers: {
                    Authorization: `Bearer ${auth.token}`
                }
            });
            setAppointments(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch appointments. Check backend CRUD logic.');
            setLoading(false);
            console.error(err);
        }
    };

    if (loading) return <div>Loading Appointments...</div>;
    if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

    return (
        <div>
            <h1>📅 Appointment Management</h1>
            <button style={{ padding: '10px', background: '#337ab7', color: 'white', border: 'none', marginBottom: '15px' }}>
                + Schedule New Appointment
            </button>
            
            <h3>Scheduled Appointments ({appointments.length})</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                        <th style={styles.th}>ID</th>
                                                <th style={styles.th}>Patient ID</th>
                        <th style={styles.th}>Doctor ID</th>
                        <th style={styles.th}>Date & Time</th>
                        <th style={styles.th}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.map(a => (
                        <tr key={a.appointment_id} style={styles.tr}>
                            <td style={styles.td}>{a.appointment_id}</td>
                            <td style={styles.td}>{a.patient_id}</td>
                            <td style={styles.td}>{a.doctor_id}</td>
                            <td style={styles.td}>{new Date(a.date_time).toLocaleString()}</td>
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

export default AppointmentsPage;
