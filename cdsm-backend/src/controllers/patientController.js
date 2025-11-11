// src/controllers/patientController.js

const db = require('../db/db.config');
const { validationResult } = require('express-validator'); // Required for validation check

// Reusable validation checker
const handleValidationErrors = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    return null;
};

// CREATE Patient (POST /api/patients)
exports.createPatient = async (req, res) => {
    const validationErrors = handleValidationErrors(req, res);
    if (validationErrors) return validationErrors;

    const { first_name, last_name, date_of_birth, phone, email, address } = req.body;
    const sql = 'INSERT INTO patient (first_name, last_name, date_of_birth, phone, email, address) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [first_name, last_name, date_of_birth, phone, email, address];

    try {
        const [result] = await db.query(sql, values);
        res.status(201).json({ id: result.insertId, message: 'Patient created successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Database error creating patient.' });
    }
};

// READ All Patients (GET /api/patients)
exports.getAllPatients = async (req, res) => {
    try {
        const [patients] = await db.query('SELECT patient_id, first_name, last_name, email FROM patient');
        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json({ message: 'Database error fetching patients.' });
    }
};

// READ Single Patient (GET /api/patients/:id)
exports.getPatientById = async (req, res) => {
    const { id } = req.params;
    try {
        const [patient] = await db.query('SELECT * FROM patient WHERE patient_id = ?', [id]);
        if (patient.length === 0) {
            return res.status(404).json({ message: 'Patient not found.' });
        }
        res.status(200).json(patient[0]);
    } catch (error) {
        res.status(500).json({ message: 'Database error fetching patient.' });
    }
};

// UPDATE Patient (PUT /api/patients/:id)
exports.updatePatient = async (req, res) => {
    // Note: For simplicity, validation is minimal here, assuming only partial updates.
    // In a real app, you'd apply validation to all provided fields.
    const { id } = req.params;
    const fields = req.body;

    const updates = Object.keys(fields).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(fields), id];

    if (updates.length === 0) {
        return res.status(400).json({ message: 'No fields provided for update.' });
    }

    const sql = `UPDATE patient SET ${updates} WHERE patient_id = ?`;

    try {
        const [result] = await db.query(sql, values);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Patient not found or no change made.' });
        }
        res.status(200).json({ message: 'Patient updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Database error updating patient.' });
    }
};

// DELETE Patient (DELETE /api/patients/:id)
exports.deletePatient = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM patient WHERE patient_id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Patient not found.' });
        }
        res.status(200).json({ message: 'Patient deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Database error deleting patient.' });
    }
};