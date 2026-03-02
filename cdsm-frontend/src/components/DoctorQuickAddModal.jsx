// src/components/DoctorQuickAddModal.jsx

import React, { useState } from 'react';
import axios from 'axios';
import '../index.css'; // Global styles are available via import

const API_URL = 'http://localhost:5000/api/doctors';

const DoctorQuickAddModal = ({ onClose, auth, onRefresh }) => {
    const [newDoctor, setNewDoctor] = useState({ 
        first_name: '', 
        last_name: '', 
        specialization: '', 
        email: '', 
        phone: '' 
    });
    const [statusMessage, setStatusMessage] = useState('');

    const handleInputChange = (e) => {
        setNewDoctor({ ...newDoctor, [e.target.name]: e.target.value });
    };

    const handleCreateDoctor = async (e) => {
        e.preventDefault();
        setStatusMessage('Saving...');

        try {
            await axios.post(API_URL, newDoctor, {
                headers: { 
                    Authorization: `Bearer ${auth.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            setStatusMessage('Doctor added successfully!');
            onRefresh(); // Refresh the dashboard summary
            setTimeout(onClose, 1500); // Close modal after success
            
        } catch (err) {
            console.error(err.response?.data);
            const errorMsg = err.response?.data?.message || JSON.stringify(err.response?.data?.errors) || 'An error occurred.';
            setStatusMessage(`Failed: ${errorMsg}`);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content card-shadow">
                
                <div className="modal-header">
                    <h3>Quick Add Doctor</h3>
                    
                    <button onClick={onClose} className="modal-close-btn">X</button>
                </div>
                
                <form onSubmit={handleCreateDoctor} className="modal-form">
                    
                    <input name="first_name" placeholder="First Name" value={newDoctor.first_name} onChange={handleInputChange} required className="form-control" />
                    <input name="last_name" placeholder="Last Name" value={newDoctor.last_name} onChange={handleInputChange} required className="form-control" />
                    <input name="specialization" placeholder="Specialization" value={newDoctor.specialization} onChange={handleInputChange} required className="form-control" />
                    <input name="email" type="email" placeholder="Email" value={newDoctor.email} onChange={handleInputChange} required className="form-control" />
                    <input name="phone" placeholder="Phone" value={newDoctor.phone} onChange={handleInputChange} className="form-control" />
                    
                    <button type="submit" className="btn btn-primary">Save Doctor</button>

                    {statusMessage && <p style={{ color: statusMessage.startsWith('Failed') ? 'var(--color-danger)' : 'var(--color-success)', marginTop: '10px' }}>{statusMessage}</p>}
                </form>
            </div>
        </div>
    );
};

export default DoctorQuickAddModal;