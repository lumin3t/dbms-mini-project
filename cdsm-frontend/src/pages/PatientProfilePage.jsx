// src/pages/PatientProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
// 🚨 MODIFIED IMPORTS: These now correctly point to the functional components 🚨
import AppointmentQuickAddModal from '../components/AppointmentQuickAddModal';
import DocumentQuickUploadModal from '../components/DocumentQuickUploadModal';

const API_BASE = 'http://localhost:5000/api/patients';

const PatientProfilePage = ({ auth }) => {
    const { id } = useParams(); // Get patient ID from URL
    const navigate = useNavigate();
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showApptModal, setShowApptModal] = useState(false);
    const [showDocModal, setShowDocModal] = useState(false);

    useEffect(() => {
        if (auth.token && id) {
            fetchPatientHistory();
        }
    }, [auth.token, id]);

    const fetchPatientHistory = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE}/${id}/history`, {
                headers: { Authorization: `Bearer ${auth.token}` }
            });
            setHistory(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch patient history. Does this patient ID exist?');
            setLoading(false);
            console.error(err.response || err);
        }
    };

    if (loading) return <div style={styles.padding}>Loading Patient Profile...</div>;
    if (error) return <div style={{ ...styles.padding, color: 'red' }}>Error: {error}</div>;
    if (!history) return <div style={styles.padding}>Patient data not available.</div>;

    const { patient, appointments, documents, conditions } = history;

    const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString() : 'N/A';

    return (
        <div style={styles.padding}>
            <button onClick={() => navigate('/patients')} style={styles.backButton}>&larr; Back to Patient List</button>
            
            <h1 style={styles.header}>Patient: {patient.first_name} {patient.last_name}</h1>
            <p style={styles.subheader}>ID: {patient.patient_id} | DOB: {formatDate(patient.date_of_birth)}</p>

            {/* Quick Actions */}
            <div style={styles.quickActions}>
                <button onClick={() => setShowApptModal(true)} style={styles.actionButton}>➕ New Appointment</button>
                <button onClick={() => setShowDocModal(true)} style={styles.actionButton}>⬆️ Upload Document</button>
            </div>
            
            <div style={styles.gridContainer}>
                {/* --- 1. Medical Conditions --- */}
                <Section title="Medical Conditions" style={styles.sectionLarge}>
                    {conditions.length > 0 ? conditions.map((c, i) => (
                        <p key={i}>**{c.condition_name}** ({c.severity}) - Diagnosed: {formatDate(c.diagnosis_date)}</p>
                    )) : <p>No recorded medical conditions.</p>}
                </Section>

                {/* --- 2. Appointments List --- */}
                <Section title={`Appointments (${appointments.length})`} style={styles.sectionLarge}>
                    {appointments.length > 0 ? appointments.map(a => (
                        <div key={a.appointment_id} style={styles.apptItem}>
                            <span style={styles.apptTime}>{formatDate(a.appointment_time)} @ {new Date(a.appointment_time).toLocaleTimeString()}</span>
                            <span style={{ color: getStatusColor(a.status) }}>**{a.status}**</span>
                            <span>Dr. {a.doctor_lname} ({a.reason})</span>
                        </div>
                    )) : <p>No appointment history.</p>}
                </Section>
                
                {/* --- 3. Uploaded Files --- */}
                <Section title={`Uploaded Files (${documents.length})`} style={styles.sectionSmall}>
                    {documents.length > 0 ? documents.map(d => (
                        <p key={d.document_id} style={styles.docItem}>
                            {d.title} ({d.document_type}) - <a href={`http://localhost:5000/${d.file_path}`} target="_blank" rel="noopener noreferrer">View</a>
                        </p>
                    )) : <p>No files uploaded.</p>}
                </Section>
            </div>

            {/* 🚨 MODALS RENDERED HERE 🚨 */}
            {showApptModal && (
                <AppointmentQuickAddModal 
                    onClose={() => setShowApptModal(false)} 
                    auth={auth} 
                    patientId={patient.patient_id} 
                    onRefresh={fetchPatientHistory} 
                />
            )}
            {showDocModal && (
                <DocumentQuickUploadModal 
                    onClose={() => setShowDocModal(false)} 
                    auth={auth} 
                    patientId={patient.patient_id} 
                    onRefresh={fetchPatientHistory} 
                />
            )}
        </div>
    );
};

// --- Helper Components and Styles (Unchanged) ---
const Section = ({ title, children, style }) => (
    <div style={{ ...styles.section, ...style }}>
        <h2 style={styles.sectionTitle}>{title}</h2>
        <div style={styles.sectionContent}>{children}</div>
    </div>
);

const getStatusColor = (status) => {
    switch (status) {
        case 'Completed': return '#28a745'; // Green
        case 'Cancelled': return '#dc3545'; // Red
        case 'Scheduled': return '#007bff'; // Blue (Upcoming)
        default: return '#6c757d'; 
    }
};

const styles = {
    padding: { padding: '20px' },
    backButton: { marginBottom: '20px', padding: '8px 15px', background: '#f8f9fa', border: '1px solid #ccc', cursor: 'pointer' },
    header: { fontSize: '2.5em', marginBottom: '5px' },
    subheader: { fontSize: '1.1em', color: '#666', marginBottom: '20px' },
    quickActions: { display: 'flex', gap: '15px', marginBottom: '30px' },
    actionButton: { padding: '10px 20px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px' },
    section: { border: '1px solid #ddd', borderRadius: '8px', padding: '20px' },
    sectionLarge: { gridColumn: 'span 2' },
    sectionSmall: { gridColumn: 'span 2' },
    sectionTitle: { fontSize: '1.4em', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' },
    sectionContent: { display: 'flex', flexDirection: 'column', gap: '10px' },
    apptItem: { display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px dotted #f0f0f0' },
    apptTime: { fontWeight: 'bold', minWidth: '150px' },
    docItem: { borderBottom: '1px dotted #f0f0f0', paddingBottom: '5px' }
};

export default PatientProfilePage;