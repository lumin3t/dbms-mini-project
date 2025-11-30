// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PatientQuickAddModal from '../components/PatientQuickAddModal'; 
import DoctorQuickAddModal from '../components/DoctorQuickAddModal'; 
import '../index.css'; // Global styles import
import { Users, AlertCircle, Stethoscope, Calendar, Plus } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/dashboard/summary';

// Helper function to get color based on risk score
const getRiskColor = (score) => {
    if (score >= 70) return '#ef4444'; // High Risk (Red)
    if (score >= 40) return '#f59e0b'; // Moderate Risk (Yellow/Orange)
    return '#10b981'; // Low Risk (Green)
};

// --- Dashboard Component ---
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
            setError('');
        } catch (err) {
            setError('Failed to fetch dashboard data. Check backend status or token.');
            setLoading(false);
            console.error(err.response?.data);
        }
    };

    const formatTime = (isoString) => new Date(isoString).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' });

    // Renders loading/error state with modern styling
    if (loading) return (
        <div className="container" style={{textAlign: 'center', padding: '60px 20px'}}>
            <div style={{fontSize: '1.1em', color: '#64748b'}}>Loading Dashboard...</div>
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
                <AlertCircle size={24} style={{marginBottom: '10px'}} />
                <div>Error: {error}</div>
            </div>
        </div>
    );

    const { summary, recentActivity, adminName } = data;
    
    return (
        <div className="container"> 
            {/* Header */}
            <div style={{marginBottom: '40px'}}>
                <h1 className="dashboard-greeting">Welcome back, {adminName}</h1>
                <p style={{color: 'var(--color-text-light)', fontSize: '1.1em', margin: 0}}>
                    Here's your practice overview
                </p>
            </div>
            
            {/* Quick Actions */}
            <div className="dashboard-quick-actions">
                <button 
                    onClick={() => setShowPatientModal(true)} 
                    className="btn btn-primary"
                    style={{display: 'flex', alignItems: 'center', gap: '8px'}}
                >
                    <Plus size={18} />
                    Add Patient
                </button>
                <button 
                    onClick={() => setShowDoctorModal(true)} 
                    className="btn btn-secondary"
                    style={{display: 'flex', alignItems: 'center', gap: '8px'}}
                >
                    <Plus size={18} />
                    Add Doctor
                </button>
            </div>
            
            {/* Summary Cards */}
            <div className="summary-grid">
                <Card 
                    title="Total Patients" 
                    value={summary.totalPatients} 
                    icon={<Users size={24} />} 
                    color="#6366f1" 
                />
                <Card 
                    title="High-Risk Patients" 
                    value={summary.totalHighRiskPatients} 
                    icon={<AlertCircle size={24} />} 
                    color="#ef4444" 
                    isHighlight={summary.totalHighRiskPatients > 0}
                />
                <Card 
                    title="Total Doctors" 
                    value={summary.totalDoctors} 
                    icon={<Stethoscope size={24} />} 
                    color="#10b981" 
                />
                <Card 
                    title="Upcoming Appointments" 
                    value={summary.totalAppointmentsUpcoming} 
                    icon={<Calendar size={24} />} 
                    color="#f59e0b" 
                />
            </div>

            {/* Recent Activity */}
            <div style={{marginTop: '60px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                    <h2 className="recent-activity-header">Recent Appointments</h2>
                    <span style={{color: 'var(--color-text-light)', fontSize: '0.9em'}}>
                        {recentActivity.length} appointments
                    </span>
                </div>
                
                <div className="activity-container">
                    {recentActivity.length > 0 ? (
                        <div className="activity-list">
                            {recentActivity.map((a, index) => (
                                <div key={index} className="activity-item">
                                    <div className="activity-time">
                                        {formatTime(a.appointment_time)}
                                    </div>
                                    <div className="activity-patient">
                                        <strong>{a.patient_fname} {a.patient_lname}</strong>
                                    </div>
                                    <div style={{ 
                                        color: getRiskColor(a.riskScore),
                                        fontWeight: '600',
                                        fontSize: '0.9em',
                                        padding: '4px 12px',
                                        background: getRiskColor(a.riskScore) + '15',
                                        borderRadius: '20px',
                                        minWidth: '80px',
                                        textAlign: 'center'
                                    }}>
                                        Risk: {a.riskScore}
                                    </div>
                                    <div className="activity-doctor">
                                        Dr. {a.doctor_lname}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: 'var(--color-text-light)'
                        }}>
                            <Calendar size={48} style={{marginBottom: '16px', opacity: 0.5}} />
                            <div>No recent appointments found</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals for Quick Add */}
            {showPatientModal && (
                <PatientQuickAddModal 
                    onClose={() => setShowPatientModal(false)} 
                    auth={auth} 
                    onRefresh={fetchDashboardData} 
                />
            )}
            {showDoctorModal && (
                <DoctorQuickAddModal 
                    onClose={() => setShowDoctorModal(false)} 
                    auth={auth} 
                    onRefresh={fetchDashboardData} 
                />
            )}
        </div>
    );
};

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
            <h3 className="card-value">{value}</h3>
        </div>
    </div>
);

export default DashboardPage;