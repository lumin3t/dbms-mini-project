// src/pages/AppointmentsPage.jsx (Appointments Visualization)

import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

    useEffect(() => {
        if (auth.token) {
            fetchInitialData();
        }
    }, [auth.token]);

    useEffect(() => {
        applyFilters();
    }, [allAppointments, filters]); // Re-filter whenever source data or filters change

    const fetchInitialData = async () => {
        try {
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

    if (loading) return <div style={styles.padding}>Loading Appointments...</div>;

    return (
        <div style={styles.padding}>
            <h1>📅 Appointments Calendar</h1>
            
            {/* --- Filtering Controls --- */}
            <div style={styles.filtersContainer}>
                <input 
                    type="date" 
                    name="date" 
                    value={filters.date} 
                    onChange={handleFilterChange} 
                    style={styles.input}
                />

                <select name="doctorId" value={filters.doctorId} onChange={handleFilterChange} style={styles.input}>
                    <option value="">Filter by Doctor</option>
                    {doctors.map(d => (
                        <option key={d.doctor_id} value={d.doctor_id}>Dr. {d.last_name} ({d.specialization})</option>
                    ))}
                </select>

                <select name="status" value={filters.status} onChange={handleFilterChange} style={styles.input}>
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
                    style={styles.input}
                />
            </div>

            {/* --- Appointments List/Timeline --- */}
            <h3 style={{ marginTop: '30px' }}>Showing {filteredAppointments.length} Appointments</h3>
            <div style={styles.timeline}>
                {filteredAppointments.length > 0 ? (
                    filteredAppointments.map(appt => (
                        <AppointmentCard key={appt.appointment_id} appt={appt} />
                    ))
                ) : (
                    <p>No appointments match the current filters.</p>
                )}
            </div>
        </div>
    );
};

// --- Appointment Card Component ---
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
        <div style={{ ...styles.card, borderLeft: `5px solid ${statusColor}` }}>
            <div style={styles.cardTime}>
                <strong>{time}</strong> <span style={{ color: '#888' }}>({date})</span>
            </div>
            <div style={styles.cardDetails}>
                <p>Patient: **{appt.patient_first_name} {appt.patient_last_name}**</p>
                <p>Doctor: Dr. {appt.doctor_last_name}</p>
                <p style={{ color: statusColor, fontWeight: 'bold', marginTop: '5px' }}>Status: {appt.status}</p>
                <p style={{ fontSize: '0.9em', color: '#666' }}>Reason: {appt.reason}</p>
            </div>
        </div>
    );
};

const styles = {
    padding: { padding: '20px' },
    filtersContainer: { display: 'flex', gap: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px' },
    input: { padding: '8px', border: '1px solid #ccc', borderRadius: '4px' },
    timeline: { display: 'flex', flexDirection: 'column', gap: '15px' },
    card: { padding: '15px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', backgroundColor: '#fff' },
    cardTime: { fontSize: '1.1em', marginBottom: '10px', paddingBottom: '5px', borderBottom: '1px dashed #eee' },
    cardDetails: { fontSize: '0.95em' }
};

export default AppointmentsPage;