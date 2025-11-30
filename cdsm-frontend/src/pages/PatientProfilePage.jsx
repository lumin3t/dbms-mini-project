// src/pages/PatientProfilePage.jsx

import '../index.css';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    ArrowLeft, 
    CalendarPlus, 
    Upload, 
    Activity, 
    CheckCircle,
    AlertTriangle,
    Stethoscope,
    FileText,
    Clock
} from 'lucide-react';
import AppointmentQuickAddModal from '../components/AppointmentQuickAddModal';
import DocumentQuickUploadModal from '../components/DocumentQuickUploadModal';

const API_BASE = 'http://localhost:5000/api/patients';

// Helper to determine color based on risk level
const getRiskColor = (score) => {
    if (score >= 70) return '#ef4444'; // High Risk (Red)
    if (score >= 40) return '#f59e0b'; // Moderate Risk (Yellow/Orange)
    return '#10b981'; // Low Risk (Green)
};

const getAdherenceColor = (status) => {
    if (status === 'Poor') return '#ef4444';
    if (status === 'Moderate') return '#f59e0b';
    return '#10b981';
};

const getStatusColor = (status) => {
    switch (status) {
        case 'Completed': return '#10b981'; // Green
        case 'Cancelled': return '#ef4444'; // Red
        case 'Scheduled': return '#3b82f6'; // Blue (Upcoming)
        default: return '#64748b'; 
    }
};

// --- PatientProfilePage Component ---
const PatientProfilePage = ({ auth }) => {
    const { id } = useParams();
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

    // Renders loading/error state
    if (loading) return (
        <div className="container" style={{textAlign: 'center', padding: '60px 20px'}}>
            <div style={{fontSize: '1.1em', color: '#64748b'}}>Loading Patient Profile...</div>
        </div>
    );
    
    if (error) return (
        <div className="container">
            <div className="error-message" style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '12px',
                padding: '20px',
                color: '#ef4444',
                textAlign: 'center',
                margin: '20px 0'
            }}>
                <AlertTriangle size={24} style={{marginBottom: '10px'}} />
                <div>Error: {error}</div>
            </div>
        </div>
    );
    
    if (!history) return (
        <div className="container" style={{textAlign: 'center', padding: '60px 20px'}}>
            <div style={{fontSize: '1.1em', color: '#64748b'}}>Patient data not available.</div>
        </div>
    );

    // Safely destructure synthesis with a default structure
    const { 
        patient, 
        appointments, 
        documents, 
        conditions, 
        synthesis = { riskScore: 'N/A', adherenceStatus: 'N/A' }
    } = history;

    const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString() : 'N/A';
    const formatTime = (dateStr) => dateStr ? new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';

    return (
        <div className="container">
            {/* Back Button */}
            <button 
                onClick={() => navigate('/patients')} 
                className="btn btn-secondary"
                style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '30px'}}
            >
                <ArrowLeft size={18} />
                Back to Patient List
            </button>
            
            {/* Patient Header */}
            <div style={{marginBottom: '40px'}}>
                <h1 className="profile-header">{patient.first_name} {patient.last_name}</h1>
                <p className="profile-subheader">
                    Patient ID: {patient.patient_id} • DOB: {formatDate(patient.date_of_birth)}
                </p>
            </div>

            {/* Synthesis Metrics Display */}
            <div className="summary-grid" style={{ marginBottom: '40px', gridTemplateColumns: '1fr 1fr' }}>
                <Card 
                    title="Risk Assessment Score" 
                    value={synthesis.riskScore} 
                    icon={<Activity size={24} />} 
                    color={getRiskColor(synthesis.riskScore || 0)}
                    isHighlight={synthesis.riskScore >= 40}
                />
                
                <Card 
                    title="Adherence Status" 
                    value={synthesis.adherenceStatus} 
                    icon={<CheckCircle size={24} />} 
                    color={getAdherenceColor(synthesis.adherenceStatus)}
                    isHighlight={synthesis.adherenceStatus === 'Poor'}
                />
            </div>

            {/* Quick Actions */}
            <div className="profile-quick-actions">
                <button 
                    onClick={() => setShowApptModal(true)} 
                    className="btn btn-primary"
                    style={{display: 'flex', alignItems: 'center', gap: '8px'}}
                >
                    <CalendarPlus size={18} />
                    New Appointment
                </button>
                <button 
                    onClick={() => setShowDocModal(true)} 
                    className="btn btn-highlight"
                    style={{display: 'flex', alignItems: 'center', gap: '8px'}}
                >
                    <Upload size={18} />
                    Upload Document
                </button>
            </div>
            
            {/* Grid Container for History Sections */}
            <div className="profile-grid-container">
                {/* Medical Conditions */}
                <Section title="Medical Conditions" icon={<Stethoscope size={20} />} className="section-large">
                    {conditions.length > 0 ? conditions.map((c, i) => (
                        <div key={i} className="section-content-item">
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%'}}>
                                <div>
                                    <strong style={{color: 'var(--color-text-primary)'}}>{c.condition_name}</strong>
                                    <div style={{fontSize: '0.9em', color: 'var(--color-text-light)', marginTop: '4px'}}>
                                        Severity: {c.severity} • Diagnosed: {formatDate(c.diagnosis_date)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div style={{textAlign: 'center', padding: '20px', color: 'var(--color-text-light)'}}>
                            No recorded medical conditions
                        </div>
                    )}
                </Section>

                {/* Appointments List */}
                <Section title={`Appointments (${appointments.length})`} icon={<Clock size={20} />} className="section-large">
                    {appointments.length > 0 ? appointments.map(a => (
                        <div key={a.appointment_id} className="appt-item">
                            <div className="appt-time">
                                {formatDate(a.appointment_time)}
                                <div style={{fontSize: '0.85em', color: 'var(--color-text-light)'}}>
                                    {formatTime(a.appointment_time)}
                                </div>
                            </div>
                            <span 
                                style={{ 
                                    color: getStatusColor(a.status), 
                                    fontWeight: '600',
                                    fontSize: '0.9em',
                                    padding: '4px 12px',
                                    background: getStatusColor(a.status) + '15',
                                    borderRadius: '20px'
                                }}
                            >
                                {a.status}
                            </span>
                            <div className="appt-doctor">
                                <div style={{fontWeight: '600', color: 'var(--color-text-primary)'}}>
                                    Dr. {a.doctor_lname}
                                </div>
                                <div style={{fontSize: '0.85em', color: 'var(--color-text-light)'}}>
                                    {a.reason}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div style={{textAlign: 'center', padding: '20px', color: 'var(--color-text-light)'}}>
                            No appointment history
                        </div>
                    )}
                </Section>
                
                {/* Uploaded Files */}
                <Section title={`Documents (${documents.length})`} icon={<FileText size={20} />} className="section-small">
                    {documents.length > 0 ? documents.map(d => (
                        <div key={d.document_id} className="section-content-item doc-item">
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                                <div>
                                    <strong style={{color: 'var(--color-text-primary)'}}>{d.title}</strong>
                                    <div style={{fontSize: '0.85em', color: 'var(--color-text-light)', marginTop: '2px'}}>
                                        {d.document_type}
                                    </div>
                                </div>
                                <a 
                                    href={`http://localhost:5000/${d.file_path}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="btn btn-secondary"
                                    style={{padding: '6px 12px', fontSize: '0.85em'}}
                                >
                                    View
                                </a>
                            </div>
                        </div>
                    )) : (
                        <div style={{textAlign: 'center', padding: '20px', color: 'var(--color-text-light)'}}>
                            No files uploaded
                        </div>
                    )}
                </Section>
            </div>

            {/* Modals */}
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

// Section Component with Icon Support
const Section = ({ title, children, className, icon }) => ( 
    <div className={`profile-section ${className}`}> 
        <h2 className="section-title" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            {icon}
            {title}
        </h2>
        <div className="section-content">{children}</div>
    </div>
);

// Updated Card Component for Light Theme
const Card = ({ title, value, icon, color, isHighlight }) => (
    <div className={`summary-card ${isHighlight ? 'highlight-card' : ''}`}>
        <div 
            className="card-icon-container" 
            style={{ 
                background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`
            }}
        >
            {icon}
        </div>
        <div className="card-content">
            <p className="card-title">{title}</p>
            <h3 
                className="card-value" 
                style={{ 
                    color: color,
                    fontSize: typeof value === 'number' ? '2.5em' : '1.8em'
                }}
            >
                {value}
                {typeof value === 'number' && title.includes('Score') && (
                    <span style={{fontSize: '0.6em', color: 'var(--color-text-light)', marginLeft: '4px'}}>/100</span>
                )}
            </h3>
        </div>
    </div>
);

export default PatientProfilePage;