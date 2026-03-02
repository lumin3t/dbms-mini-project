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
            setStatusMessage('Failed: Title and file are required.');
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

            setStatusMessage('File uploaded and saved successfully!');
            onRefresh(); // Refresh the Patient Profile Page history
            setTimeout(onClose, 1500);
            
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'An upload error occurred.';
            setStatusMessage(`Failed: ${errorMsg}`);
            console.error(err.response || err);
        }
    };

    // src/components/DocumentQuickUploadModal.jsx (Updated return block)

// ... (component logic and imports above)

    return (
        <div className="modal-backdrop">
            <div className="modal-content card-shadow">
                <div className="modal-header">
                    <h3>Upload Document for Patient ID {patientId}</h3>
                    <button onClick={onClose} className="modal-close-btn">X</button>
                </div>
                <form onSubmit={handleUpload} className="modal-form">
                    <input 
                        name="title" 
                        placeholder="Document Title (e.g., Blood Test Results)" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        required 
                        className="form-control"
                    />
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

                    <input 
                        type="file" 
                        onChange={handleFileUpload} 
                        required 
                        className="form-control"
                        style={{ border: 'none', paddingLeft: 0 }} 
                    />
                
                    <button type="submit" className="btn btn-primary">Upload File</button>
                    
                    {/* Status message remains inline for dynamic coloring */}
                    {statusMessage && <p style={{ color: statusMessage.startsWith('Failed') ? 'var(--color-danger)' : 'var(--color-success)', marginTop: '10px' }}>{statusMessage}</p>}
                </form>
            </div>
        </div>
    );
};

export default DocumentQuickUploadModal;