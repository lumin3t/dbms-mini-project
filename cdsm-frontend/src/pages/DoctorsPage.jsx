import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../index.css';

const API_URL = 'http://localhost:5000/api/doctors';

const DoctorsPage = ({ auth }) => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- State for Editing ---
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({ 
        first_name: '', 
        last_name: '', 
        specialization: '' 
    });

    useEffect(() => {
        if (auth.token) {
            fetchDoctors();
        }
    }, [auth.token]);

    const fetchDoctors = async () => {
        try {
            const response = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${auth.token}` }
            });
            setDoctors(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch doctors. Check backend CRUD logic.');
            setLoading(false);
        }
    };

    // --- DELETE HANDLER ---
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this doctor? This may affect scheduled appointments.")) {
            try {
                await axios.delete(`${API_URL}/${id}`, {
                    headers: { Authorization: `Bearer ${auth.token}` }
                });
                // Update UI state immediately
                setDoctors(doctors.filter(d => d.doctor_id !== id));
            } catch (err) {
                alert("Error deleting doctor. They may be linked to active appointments.");
            }
        }
    };

    // --- EDIT HANDLERS ---
    const startEdit = (doctor) => {
        setEditingId(doctor.doctor_id);
        setEditFormData({ 
            first_name: doctor.first_name, 
            last_name: doctor.last_name, 
            specialization: doctor.specialization 
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
            fetchDoctors(); // Refresh the list
        } catch (err) {
            alert("Failed to update doctor details.");
        }
    };

    if (loading) return <div className="container">Loading Doctors...</div>;

    return (
        <div className="container"> 
            <h1>Doctor Management</h1>
          
            <Link to="/dashboard" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                    + Add New Doctor
            </Link>
            
            {error && <div className="error-msg" style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
            
            <h3 style={{ marginTop: '30px' }}>Registered Doctors ({doctors.length})</h3>
            
            <table className="data-table card-shadow">
                <thead>
                    <tr style={{ backgroundColor: '#e9ecef' }}>
                        <th className="data-table-header">ID</th>
                        <th className="data-table-header">Name</th>
                        <th className="data-table-header">Specialization</th>
                        <th className="data-table-header">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {doctors.map(d => (
                        <tr key={d.doctor_id}>
                            <td className="data-table-cell">{d.doctor_id}</td>
                            
                            {/* Name Column - Toggle Edit/View */}
                            <td className="data-table-cell">
                                {editingId === d.doctor_id ? (
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <input 
                                            name="first_name" 
                                            className="edit-input"
                                            value={editFormData.first_name} 
                                            onChange={handleEditChange} 
                                        />
                                        <input 
                                            name="last_name" 
                                            className="edit-input"
                                            value={editFormData.last_name} 
                                            onChange={handleEditChange} 
                                        />
                                    </div>
                                ) : (
                                    `${d.first_name} ${d.last_name}`
                                )}
                            </td>

                            {/* Specialization Column - Toggle Edit/View */}
                            <td className="data-table-cell">
                                {editingId === d.doctor_id ? (
                                    <input 
                                        name="specialization" 
                                        className="edit-input"
                                        value={editFormData.specialization} 
                                        onChange={handleEditChange} 
                                    />
                                ) : (
                                    d.specialization
                                )}
                            </td>

                            {/* Actions Column */}
                            <td className="data-table-cell">
                                {editingId === d.doctor_id ? (
                                    <>
                                        <button onClick={() => saveEdit(d.doctor_id)} className="btn-small">Save</button>
                                        <button onClick={() => setEditingId(null)} className="btn-small">Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => startEdit(d)} className="btn-small">Edit</button>
                                        <button onClick={() => handleDelete(d.doctor_id)} className="btn-small">Delete</button>
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

export default DoctorsPage;