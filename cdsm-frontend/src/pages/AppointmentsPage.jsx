// src/pages/AppointmentsPage.jsx (Appointments Visualization)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../index.css'; // Global styles import

const API_APPOINTMENTS = 'http://localhost:5000/api/appointments';
const API_DOCTORS = 'http://localhost:5000/api/doctors';
const API_PATIENTS = 'http://localhost:5000/api/patients';

const AppointmentsPage = ({ auth }) => {
    const [allAppointments, setAllAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        searchPatient: '',
        doctorId: '',
        status: 'Scheduled', // Default to showing only upcoming appointments
        date: new Date().toISOString().split('T')[0] // Default to Today
    });
    // State to hold any network/data error message
    const [networkError, setNetworkError] = useState(null);

    useEffect(() => {
        if (auth.token) {
            fetchInitialData();
        }
    }, [auth.token]);

    useEffect(() => {
        applyFilters();
    }, [allAppointments, filters]); // Re-filter whenever source data or filters change

    const fetchInitialData = async () => {
        setNetworkError(null);
        try {
            // Using Promise.all to fetch all necessary data concurrently
            const [apptsRes, docsRes, patientsRes] = await Promise.all([
                axios.get(API_APPOINTMENTS, { headers: { Authorization: `Bearer ${auth.token}` } }),
                axios.get(API_DOCTORS, { headers: { Authorization: `Bearer ${auth.token}` } }),
                axios.get(API_PATIENTS, { headers: { Authorization: `Bearer ${auth.token}` } })
            ]);

            setAllAppointments(apptsRes.data);
            setDoctors(docsRes.data);
            setPatients(patientsRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setNetworkError('Failed to load initial data. Check API endpoints or token.');
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let tempAppts = allAppointments;

        // 1. Filter by Status
        if (filters.status) {
            tempAppts = tempAppts.filter(a => a.status === filters.status);
        }
        
        // 2. Filter by Doctor ID
        if (filters.doctorId) {
            tempAppts = tempAppts.filter(a => String(a.doctor_id) === filters.doctorId);
        }

        // 3. Filter by Date (Exact Day Match)
        if (filters.date) {
            tempAppts = tempAppts.filter(a => a.appointment_time.startsWith(filters.date));
        }

        // 4. Filter by Patient Name Search (Simple client-side search)
        if (filters.searchPatient) {
            const searchLower = filters.searchPatient.toLowerCase();
            tempAppts = tempAppts.filter(a => 
                // Assumes appointments data has patient_first_name and patient_last_name joined in the backend
                (a.patient_first_name + ' ' + a.patient_last_name).toLowerCase().includes(searchLower)
            );
        }

        // Sort by time for timeline view
        tempAppts.sort((a, b) => new Date(a.appointment_time) - new Date(b.appointment_time));
        
        setFilteredAppointments(tempAppts);
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    // 🚨 FIX: Replace styles.padding with className="container" and use loading state 🚨
    if (loading) return <div className="container">Loading Appointments...</div>;
    // Handle network errors
    if (networkError) return <div className="container login-error">Error: {networkError}</div>;


    return (
        // 🚨 FIX: Replace styles.padding with className="container" 🚨
        <div className="container">
            <h1>Appointments Calendar</h1>
            
            {/* --- Filtering Controls --- */}
            {/* 🚨 FIX: Replace styles.filtersContainer, styles.input with classNames 🚨 */}
            <div className="filters-container card-shadow">
                <input 
                    type="date" 
                    name="date" 
                    value={filters.date} 
                    onChange={handleFilterChange} 
                    className="form-control"
                />

                <select name="doctorId" value={filters.doctorId} onChange={handleFilterChange} className="form-control">
                    <option value="">Filter by Doctor</option>
                    {doctors.map(d => (
                        <option key={d.doctor_id} value={d.doctor_id}>Dr. {d.last_name} ({d.specialization})</option>
                    ))}
                </select>

                <select name="status" value={filters.status} onChange={handleFilterChange} className="form-control">
                    <option value="">All Statuses</option>
                    <option value="Scheduled">Scheduled (Upcoming)</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
                
                <input 
                    type="text"
                    name="searchPatient"
                    placeholder="Search Patient Name..."
                    value={filters.searchPatient}
                    onChange={handleFilterChange}
                    className="form-control"
                />
            </div>

            {/* --- Appointments List/Timeline --- */}
            {/* 🚨 FIX: Remove timeline style and add margin 🚨 */}
            <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Showing {filteredAppointments.length} Appointments</h3>
            
            {/* 🚨 FIX: Use a class for the timeline wrapper 🚨 */}
            <div className="appointment-timeline"> 
                {filteredAppointments.length > 0 ? (
                    filteredAppointments.map(appt => (
                        <AppointmentCard key={appt.appointment_id} appt={appt} />
                    ))
                ) : (
                    <p style={{color: 'var(--color-secondary)'}}>No appointments match the current filters.</p>
                )}
            </div>
        </div>
    );
};

// --- Appointment Card Component (Logic remains external and correct) ---
const getStatusColor = (status) => {
    switch (status) {
        case 'Completed': return '#28a745'; // Green
        case 'Cancelled': return '#dc3545'; // Red
        case 'Scheduled': return '#007bff'; // Blue (Upcoming)
        default: return '#6c757d'; 
    }
};

const AppointmentCard = ({ appt }) => {
    const time = new Date(appt.appointment_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const date = new Date(appt.appointment_time).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    const statusColor = getStatusColor(appt.status);

    return (
        <div 
            className="appointment-card card-shadow" 
            style={{ borderLeft: `5px solid ${statusColor}` }}
        >
            <div className="card-time">
                <strong>{time}</strong> <span style={{ color: '#888' }}>({date})</span>
            </div>
            <div className="card-details">
                <p>Patient: **{appt.patient_first_name} {appt.patient_last_name}**</p>
                <p>Doctor: Dr. {appt.doctor_last_name}</p>
                
                <p style={{ color: statusColor, fontWeight: 'bold', marginTop: '5px' }}>Status: {appt.status}</p>
                
                <p className="card-details-reason">Reason: {appt.reason}</p>
            </div>
        </div>
    );
};

export default AppointmentsPage;