// src/components/PatientQuickAddModal.jsx

import React, { useState } from 'react';
import axios from 'axios';
import '../index.css'; // Global styles import

const API_URL = 'http://localhost:5000/api/patients';

const PatientQuickAddModal = ({ onClose, auth, onRefresh }) => {
    const [newPatient, setNewPatient] = useState({ 
        first_name: '', 
        last_name: '', 
        date_of_birth: '', 
        email: '', 
        phone: '' 
    });
    const [statusMessage, setStatusMessage] = useState('');

    const handleInputChange = (e) => {
        setNewPatient({ ...newPatient, [e.target.name]: e.target.value });
    };

    const handleCreatePatient = async (e) => {
        e.preventDefault();
        setStatusMessage('Saving...');

        try {
            await axios.post(API_URL, newPatient, {
                headers: { 
                    Authorization: `Bearer ${auth.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            setStatusMessage('✅ Patient added successfully!');
            onRefresh(); // Refresh the dashboard summary
            setTimeout(onClose, 1500); // Close modal after success
            
        } catch (err) {
            console.error(err.response?.data);
            const errorMsg = err.response?.data?.message || JSON.stringify(err.response?.data?.errors) || 'An error occurred.';
            setStatusMessage(`❌ Failed: ${errorMsg}`);
        }
    };

    return (
        // 🚨 FIX 1: Use className="modal-backdrop" 🚨
        <div className="modal-backdrop">
            
            {/* 🚨 FIX 2: Use className="modal-content card-shadow" 🚨 */}
            <div className="modal-content card-shadow">
                
                {/* 🚨 FIX 3: Use className="modal-header" 🚨 */}
                <div className="modal-header">
                    <h3>Quick Add Patient</h3>
                    {/* 🚨 FIX 4: Use className="modal-close-btn" */}
                    <button onClick={onClose} className="modal-close-btn">X</button>
                </div>
                
                {/* 🚨 FIX 5: Use className="modal-form" */}
                <form onSubmit={handleCreatePatient} className="modal-form">
                    
                    {/* 🚨 FIX 6: Use className="form-control" for all inputs */}
                    <input name="first_name" placeholder="First Name" value={newPatient.first_name} onChange={handleInputChange} required className="form-control" />
                    <input name="last_name" placeholder="Last Name" value={newPatient.last_name} onChange={handleInputChange} required className="form-control" />
                    <input name="date_of_birth" type="date" placeholder="DOB (YYYY-MM-DD)" value={newPatient.date_of_birth} onChange={handleInputChange} required className="form-control" />
                    <input name="email" type="email" placeholder="Email" value={newPatient.email} onChange={handleInputChange} className="form-control" />
                    <input name="phone" placeholder="Phone" value={newPatient.phone} onChange={handleInputChange} className="form-control" />
                    
                    {/* 🚨 FIX 7: Use className="btn btn-primary" */}
                    <button type="submit" className="btn btn-primary">Save Patient</button>
                    
                    {/* Status message remains inline for dynamic coloring */}
                    {statusMessage && <p style={{ color: statusMessage.startsWith('❌') ? 'var(--color-danger)' : 'var(--color-success)', marginTop: '10px' }}>{statusMessage}</p>}
                </form>
            </div>
        </div>
    );
};

export default PatientQuickAddModal;