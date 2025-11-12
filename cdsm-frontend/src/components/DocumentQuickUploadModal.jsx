// src/components/DocumentQuickUploadModal.jsx

import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/upload';

const DocumentQuickUploadModal = ({ onClose, auth, patientId, onRefresh }) => {
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [documentType, setDocumentType] = useState('Lab Report');
    const [statusMessage, setStatusMessage] = useState('');

    const handleFileUpload = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setStatusMessage('Uploading...');

        if (!file || !title) {
            setStatusMessage('❌ Title and file are required.');
            return;
        }

        const formData = new FormData();
        formData.append('documentFile', file); // Must match the multer field name!
        formData.append('patient_id', patientId);
        formData.append('title', title);
        formData.append('document_type', documentType);

        try {
            await axios.post(API_URL, formData, {
                headers: { 
                    'Authorization': `Bearer ${auth.token}`,
                    // Axios automatically sets Content-Type to multipart/form-data with correct boundary
                },
            });

            setStatusMessage('✅ File uploaded and saved successfully!');
            onRefresh(); // Refresh the Patient Profile Page history
            setTimeout(onClose, 1500);
            
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'An upload error occurred.';
            setStatusMessage(`❌ Failed: ${errorMsg}`);
            console.error(err.response || err);
        }
    };

    return (
        <div style={styles.backdrop}>
            <div style={styles.modal}>
                <div style={styles.modalHeader}>
                    <h3>Upload Document for Patient ID {patientId}</h3>
                    <button onClick={onClose} style={styles.closeButton}>X</button>
                </div>
                
                <form onSubmit={handleUpload} style={styles.form}>
                    <input 
                        name="title" 
                        placeholder="Document Title (e.g., Blood Test Results)" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        required 
                        style={styles.input} 
                    />
                    
                    <select 
                        name="documentType" 
                        value={documentType} 
                        onChange={(e) => setDocumentType(e.target.value)} 
                        style={styles.input}
                    >
                        <option value="Lab Report">Lab Report</option>
                        <option value="Prescription">Prescription</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Other">Other</option>
                    </select>

                    <input 
                        type="file" 
                        onChange={handleFileUpload} 
                        required 
                        style={{ ...styles.input, border: 'none' }} 
                    />
                    
                    <button type="submit" style={styles.saveButton}>Upload File</button>
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
export default DocumentQuickUploadModal;