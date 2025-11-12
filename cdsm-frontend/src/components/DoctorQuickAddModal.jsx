// src/components/DoctorQuickAddModal.jsx

import React, { useState } from 'react';
import axios from 'axios';

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
            
            setStatusMessage('✅ Doctor added successfully!');
            onRefresh(); // Refresh the dashboard summary
            setTimeout(onClose, 1500); // Close modal after success
            
        } catch (err) {
            console.error(err.response?.data);
            const errorMsg = err.response?.data?.message || JSON.stringify(err.response?.data?.errors) || 'An error occurred.';
            setStatusMessage(`❌ Failed: ${errorMsg}`);
        }
    };

    return (
        <div style={styles.backdrop}>
            <div style={styles.modal}>
                <div style={styles.modalHeader}>
                    <h3>Quick Add Doctor</h3>
                    <button onClick={onClose} style={styles.closeButton}>X</button>
                </div>
                
                <form onSubmit={handleCreateDoctor} style={styles.form}>
                    <input name="first_name" placeholder="First Name" value={newDoctor.first_name} onChange={handleInputChange} required style={styles.input} />
                    <input name="last_name" placeholder="Last Name" value={newDoctor.last_name} onChange={handleInputChange} required style={styles.input} />
                    <input name="specialization" placeholder="Specialization" value={newDoctor.specialization} onChange={handleInputChange} required style={styles.input} />
                    <input name="email" type="email" placeholder="Email" value={newDoctor.email} onChange={handleInputChange} required style={styles.input} />
                    <input name="phone" placeholder="Phone" value={newDoctor.phone} onChange={handleInputChange} style={styles.input} />
                    
                    <button type="submit" style={styles.saveButton}>Save Doctor</button>
                    {statusMessage && <p style={{ color: statusMessage.startsWith('❌') ? 'red' : 'green', marginTop: '10px' }}>{statusMessage}</p>}
                </form>
            </div>
        </div>
    );
};
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
        backgroundColor: '#fff',
        borderRadius: '8px',
        width: '400px',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
    },
    closeButton: {
        backgroundColor: 'transparent',
        border: 'none',
        fontSize: '16px',
        cursor: 'pointer',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    input: {
        marginBottom: '10px',
        padding: '8px',
        fontSize: '14px',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    saveButton: {
        padding: '10px',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};

export default DoctorQuickAddModal;

   