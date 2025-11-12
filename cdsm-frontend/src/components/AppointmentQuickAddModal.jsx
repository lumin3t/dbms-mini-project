// src/components/AppointmentQuickAddModal.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_APPOINTMENTS = 'http://localhost:5000/api/appointments';
const API_DOCTORS = 'http://localhost:5000/api/doctors';

const AppointmentQuickAddModal = ({ onClose, auth, patientId, onRefresh }) => {
    const [doctors, setDoctors] = useState([]);
    const [newAppt, setNewAppt] = useState({
        doctor_id: '',
        appointment_time: '',
        reason: '',
    });
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        // Fetch all doctors when the modal opens
        const fetchDoctors = async () => {
            try {
                const res = await axios.get(API_DOCTORS, { 
                    headers: { Authorization: `Bearer ${auth.token}` } 
                });
                setDoctors(res.data);
            } catch (error) {
                setStatusMessage('Failed to load doctors list.');
            }
        };
        fetchDoctors();
    }, [auth.token]);

    const handleInputChange = (e) => {
        setNewAppt({ ...newAppt, [e.target.name]: e.target.value });
    };

    const handleCreateAppt = async (e) => {
        e.preventDefault();
        setStatusMessage('Scheduling...');

        if (!newAppt.doctor_id || !newAppt.appointment_time) {
            setStatusMessage('❌ Doctor and Time are required.');
            return;
        }

        try {
            await axios.post(API_APPOINTMENTS, {
                ...newAppt,
                patient_id: patientId, // Automatically use the profile's patientId
            }, {
                headers: { 
                    Authorization: `Bearer ${auth.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            setStatusMessage('✅ Appointment scheduled successfully!');
            onRefresh(); // Refresh the Patient Profile Page history
            setTimeout(onClose, 1500);
            
        } catch (err) {
            const errorMsg = err.response?.data?.message || JSON.stringify(err.response?.data?.errors) || 'An error occurred.';
            setStatusMessage(`❌ Failed: ${errorMsg}`);
        }
    };

    return (
        <div style={styles.backdrop}>
            <div style={styles.modal}>
                <div style={styles.modalHeader}>
                    <h3>New Appointment for Patient ID {patientId}</h3>
                    <button onClick={onClose} style={styles.closeButton}>X</button>
                </div>
                
                <form onSubmit={handleCreateAppt} style={styles.form}>
                    <select 
                        name="doctor_id" 
                        value={newAppt.doctor_id} 
                        onChange={handleInputChange} 
                        required 
                        style={styles.input}
                    >
                        <option value="">Select Doctor (Required)</option>
                        {doctors.map(d => (
                            <option key={d.doctor_id} value={d.doctor_id}>
                                Dr. {d.last_name} ({d.specialization})
                            </option>
                        ))}
                    </select>

                    <input 
                        name="appointment_time" 
                        type="datetime-local" 
                        value={newAppt.appointment_time} 
                        onChange={handleInputChange} 
                        required 
                        style={styles.input} 
                    />
                    
                    <textarea 
                        name="reason" 
                        placeholder="Reason for appointment" 
                        value={newAppt.reason} 
                        onChange={handleInputChange} 
                        style={styles.input} 
                    />
                    
                    <button type="submit" style={styles.saveButton}>Schedule Appointment</button>
                    {statusMessage && <p style={{ color: statusMessage.startsWith('❌') ? 'red' : 'green', marginTop: '10px' }}>{statusMessage}</p>}
                </form>
            </div>
        </div>
    );
};
// Shared Styles for Modals

const styles = {
    backdrop: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
        width: '90%',
        maxWidth: '450px',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '1px solid #eee',
        paddingBottom: '10px',
    },
    closeButton: {
        background: 'none',
        border: 'none',
        fontSize: '1.2em',
        cursor: 'pointer',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    input: {
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
    },
    saveButton: {
        padding: '10px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};
export default AppointmentQuickAddModal;