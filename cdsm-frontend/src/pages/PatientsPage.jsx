import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../index.css';

const API_URL = 'http://localhost:5000/api/patients';

const PatientsPage = ({ auth }) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State for Editing
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({ first_name: '', last_name: '', email: '' });

    useEffect(() => {
        if (auth.token) {
            fetchPatients();
        }
    }, [auth.token]);

    const fetchPatients = async () => {
        try {
            const response = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${auth.token}` }
            });
            setPatients(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch patients.');
            setLoading(false);
        }
    };

    // --- DELETE HANDLER ---
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this patient?")) {
            try {
                await axios.delete(`${API_URL}/${id}`, {
                    headers: { Authorization: `Bearer ${auth.token}` }
                });
                // Filter out the deleted patient from UI immediately
                setPatients(patients.filter(p => p.patient_id !== id));
            } catch (err) {
                alert("Failed to delete patient.");
            }
        }
    };

    // --- EDIT HANDLERS ---
    const startEdit = (patient) => {
        setEditingId(patient.patient_id);
        setEditFormData({ 
            first_name: patient.first_name, 
            last_name: patient.last_name, 
            email: patient.email 
        });
    };

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const saveEdit = async (id) => {
        try {
            await axios.put(`${API_URL}/${id}`, editFormData, {
                headers: { Authorization: `Bearer ${auth.token}` }
            });
            setEditingId(null);
            fetchPatients(); // Refresh list
        } catch (err) {
            alert("Failed to update patient.");
        }
    };

    if (loading) return <div className="container">Loading Patients...</div>;

    return (
        <div className="container">
            <h1>Patient Management</h1>
            <Link to="/dashboard" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                    + Add New Patient
            </Link>

            {error && <div className="error-msg">{error}</div>}

            <h3 style={{ marginTop: '30px' }}>Registered Patients ({patients.length})</h3>
            
            <table className="data-table card-shadow">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {patients.map(p => (
                        <tr key={p.patient_id}>
                            <td>{p.patient_id}</td>
                            <td>
                                {editingId === p.patient_id ? (
                                    <>
                                        <input name="first_name" value={editFormData.first_name} onChange={handleEditChange} style={{width: '80px'}} />
                                        <input name="last_name" value={editFormData.last_name} onChange={handleEditChange} style={{width: '80px'}} />
                                    </>
                                ) : (
                                    <Link to={`/patients/${p.patient_id}`} className="table-link">
                                        {p.first_name} {p.last_name}
                                    </Link>
                                )}
                            </td>
                            <td>
                                {editingId === p.patient_id ? (
                                    <input name="email" value={editFormData.email} onChange={handleEditChange} />
                                ) : (
                                    p.email
                                )}
                            </td>
                            <td>
                                {editingId === p.patient_id ? (
                                    <>
                                        <button onClick={() => saveEdit(p.patient_id)} className="btn-small">Save</button>
                                        <button onClick={() => setEditingId(null)} className="btn-small">Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => startEdit(p)} className="btn-small">Edit</button>
                                        <button onClick={() => handleDelete(p.patient_id)} className="btn-small">Delete</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PatientsPage;