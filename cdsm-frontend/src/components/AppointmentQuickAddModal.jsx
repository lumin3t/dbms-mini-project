// src/components/AppointmentQuickAddModal.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../index.css'; // Make sure this is imported

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
            setStatusMessage('Failed: Doctor and Time are required.');
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
            
            setStatusMessage('Appointment scheduled successfully!');
            onRefresh(); // Refresh the Patient Profile Page history
            setTimeout(onClose, 1500);
            
        } catch (err) {
            const errorMsg = err.response?.data?.message || JSON.stringify(err.response?.data?.errors) || 'An error occurred.';
            setStatusMessage(`Failed: ${errorMsg}`);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content card-shadow">
                <div className="modal-header">
                    <h3>New Appointment for Patient ID {patientId}</h3>
                    <button onClick={onClose} className="modal-close-btn">X</button>
                </div>
                <form onSubmit={handleCreateAppt} className="modal-form">
    
                    <select 
                        name="doctor_id" 
                        value={newAppt.doctor_id} 
                        onChange={handleInputChange} 
                        required 
                        className="form-control"
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
                        className="form-control"
                    />
                    
                
                    <textarea 
                        name="reason" 
                        placeholder="Reason for appointment" 
                        value={newAppt.reason} 
                        onChange={handleInputChange} 
                        className="form-control" 
                    />
                
                    <button type="submit" className="btn btn-primary">Schedule Appointment</button>
                    {statusMessage && <p style={{ color: statusMessage.startsWith('Failed') ? 'red' : 'green', marginTop: '10px' }}>{statusMessage}</p>}
                </form>
            </div>
        </div>
    );
};

export default AppointmentQuickAddModal;