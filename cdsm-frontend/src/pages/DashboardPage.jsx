// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PatientQuickAddModal from '../components/PatientQuickAddModal'; 
import DoctorQuickAddModal from '../components/DoctorQuickAddModal'; 

const API_URL = 'http://localhost:5000/api/dashboard/summary';

const DashboardPage = ({ auth }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [showDoctorModal, setShowDoctorModal] = useState(false);

    useEffect(() => {
        if (auth.token) {
            fetchDashboardData();
        }
    }, [auth.token]);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${auth.token}` }
            });
            setData(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch dashboard data.');
            setLoading(false);
            console.error(err.response?.data);
        }
    };

    if (loading) return <div style={styles.padding}>Loading Dashboard...</div>;
    if (error) return <div style={{ ...styles.padding, color: 'red' }}>Error: {error}</div>;

    const { summary, recentActivity, adminName } = data;
    
    // Helper for formatting date/time
    const formatTime = (isoString) => new Date(isoString).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });

    return (
        <div style={styles.padding}>
            {/* Greeting */}
            <h1 style={styles.greeting}>Hello, {adminName} 👋</h1>
            
            {/* Quick Actions */}
            <div style={styles.quickActions}>
                <button onClick={() => setShowPatientModal(true)} style={styles.actionButton}>
                    ➕ Add Patient
                </button>
                <button onClick={() => setShowDoctorModal(true)} style={styles.actionButton}>
                    ➕ Add Doctor
                </button>
            </div>
            
            {/* Summary Cards */}
            <div style={styles.summaryGrid}>
                <Card title="Total Patients" value={summary.totalPatients} icon="🧑‍🤝‍🧑" />
                <Card title="Total Doctors" value={summary.totalDoctors} icon="⚕️" />
                <Card title="Appointments Today" value={summary.totalAppointmentsToday} icon="⏰" isHighlight={true} />
                <Card title="Upcoming Appointments" value={summary.totalAppointmentsUpcoming} icon="📅" />
            </div>

            {/* Recent Activity */}
            <h2 style={{ marginTop: '40px' }}>Recent Appointments</h2>
            <ul style={styles.activityList}>
                {recentActivity.map((a, index) => (
                    <li key={index} style={styles.activityItem}>
                        <span style={styles.activityTime}>{formatTime(a.appointment_time)}</span> 
                        - **{a.patient_fname} {a.patient_lname}** with Dr. {a.doctor_lname}
                    </li>
                ))}
                {recentActivity.length === 0 && <li>No recent appointments found.</li>}
            </ul>

            {/* Modals for Quick Add */}
            {showPatientModal && <PatientQuickAddModal onClose={() => setShowPatientModal(false)} auth={auth} onRefresh={fetchDashboardData} />}
            {showDoctorModal && <DoctorQuickAddModal onClose={() => setShowDoctorModal(false)} auth={auth} onRefresh={fetchDashboardData} />}
        </div>
    );
};

// --- Helper Components (Style is basic for brevity) ---
const Card = ({ title, value, icon, isHighlight }) => (
    <div style={{ ...styles.card, backgroundColor: isHighlight ? '#fff3cd' : '#f8f9fa' }}>
        <div style={styles.cardIcon}>{icon}</div>
        <div style={styles.cardContent}>
            <p style={styles.cardTitle}>{title}</p>
            <h3 style={styles.cardValue}>{value}</h3>
        </div>
    </div>
);

// Placeholder Modals (Requires creating these components separately)
//const PatientQuickAddModal = ({ onClose }) => <div style={styles.modal}>Quick Add Patient Form (TBD) <button onClick={onClose}>X</button></div>;
//const DoctorQuickAddModal = ({ onClose }) => <div style={styles.modal}>Quick Add Doctor Form (TBD) <button onClick={onClose}>X</button></div>;


const styles = {
    padding: { padding: '20px' },
    greeting: { fontSize: '2em', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' },
    quickActions: { display: 'flex', gap: '15px', marginBottom: '30px' },
    actionButton: { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
    card: { padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center' },
    cardIcon: { fontSize: '2em', marginRight: '15px' },
    cardTitle: { margin: 0, color: '#666', fontSize: '0.9em' },
    cardValue: { margin: 0, fontSize: '1.8em', fontWeight: 'bold' },
    activityList: { listStyleType: 'none', paddingLeft: 0, marginTop: '15px' },
    activityItem: { padding: '10px', borderBottom: '1px solid #eee' },
    activityTime: { fontWeight: 'lighter', color: '#888' },
    modal: { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '40px', border: '1px solid #ccc', zIndex: 100 }
};

export default DashboardPage;