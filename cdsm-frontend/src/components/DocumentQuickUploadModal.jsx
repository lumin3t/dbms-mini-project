// src/components/DocumentQuickUploadModal.jsx

import React, { useState } from 'react';
import axios from 'axios';
import '../index.css';

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

    // src/components/DocumentQuickUploadModal.jsx (Updated return block)

// ... (component logic and imports above)

    return (
        // 🚨 FIX 1: Use className="modal-backdrop" 🚨
        <div className="modal-backdrop">
            
            {/* 🚨 FIX 2: Use className="modal-content card-shadow" 🚨 */}
            <div className="modal-content card-shadow">
                
                {/* 🚨 FIX 3: Use className="modal-header" 🚨 */}
                <div className="modal-header">
                    <h3>Upload Document for Patient ID {patientId}</h3>
                    
                    {/* 🚨 FIX 4: Use className="modal-close-btn" */}
                    <button onClick={onClose} className="modal-close-btn">X</button>
                </div>
                
                {/* 🚨 FIX 5: Use className="modal-form" */}
                <form onSubmit={handleUpload} className="modal-form">
                    
                    {/* 🚨 FIX 6: Use className="form-control" */}
                    <input 
                        name="title" 
                        placeholder="Document Title (e.g., Blood Test Results)" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        required 
                        className="form-control"
                    />
                    
                    {/* 🚨 FIX 7: Use className="form-control" */}
                    <select 
                        name="documentType" 
                        value={documentType} 
                        onChange={(e) => setDocumentType(e.target.value)} 
                        className="form-control"
                    >
                        <option value="Lab Report">Lab Report</option>
                        <option value="Prescription">Prescription</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Other">Other</option>
                    </select>

                    {/* 🚨 FIX 8: Use className="form-control" (Note: Border removed via inline style for file input clarity) */}
                    <input 
                        type="file" 
                        onChange={handleFileUpload} 
                        required 
                        className="form-control"
                        style={{ border: 'none', paddingLeft: 0 }} /* Adjusting style for file input */
                    />
                    
                    {/* 🚨 FIX 9: Use className="btn btn-primary" */}
                    <button type="submit" className="btn btn-primary">Upload File</button>
                    
                    {/* Status message remains inline for dynamic coloring */}
                    {statusMessage && <p style={{ color: statusMessage.startsWith('❌') ? 'var(--color-danger)' : 'var(--color-success)', marginTop: '10px' }}>{statusMessage}</p>}
                </form>
            </div>
        </div>
    );
};
/*const styles = {
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
};*/
export default DocumentQuickUploadModal;