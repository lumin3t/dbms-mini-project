import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, ExternalLink, User, Calendar } from 'lucide-react';
import '../index.css';

const API_DOCS = 'http://localhost:5000/api/documents'; // Ensure this route exists in your backend

const UploadsPage = ({ auth }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllDocs = async () => {
            try {
                const res = await axios.get(API_DOCS, {
                    headers: { Authorization: `Bearer ${auth.token}` }
                });
                setDocuments(res.data);
            } catch (err) {
                console.error("Error fetching documents", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllDocs();
    }, [auth.token]);

    return (
        <div className="container">
            <h1>Document Repository</h1>
            <p className="profile-subheader">Centralized management for all S3-hosted patient records.</p>
            
            <div className="card-shadow" style={{ marginTop: '20px', overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Document Name</th>
                            <th>Patient</th>
                            <th>Type</th>
                            <th>Date Uploaded</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map((doc) => (
                            <tr key={doc.document_id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <FileText size={18} color="#3b82f6" />
                                        <strong>{doc.title}</strong>
                                    </div>
                                </td>
                                <td><User size={14} /> {doc.patient_name || `ID: ${doc.patient_id}`}</td>
                                <td><span className="badge">{doc.document_type}</span></td>
                                <td><Calendar size={14} /> {new Date(doc.upload_date).toLocaleDateString()}</td>
                                <td>
                                    <a 
                                        href={doc.file_path} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="btn-edit"
                                        style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                    >
                                        View <ExternalLink size={14} />
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {documents.length === 0 && !loading && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        No documents found in S3 storage.
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadsPage;