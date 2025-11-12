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

// src/controllers/patientController.js (Modified getAllPatients)

// READ All Patients (GET /api/patients?search=...)
exports.getAllPatients = async (req, res) => {
    // 🚨 NEW: Get search query from URL parameters
    const search = req.query.search;
    
    let sql = 'SELECT patient_id, first_name, last_name, email FROM patient';
    let values = [];

    if (search) {
        // If search is provided, filter by first_name OR last_name
        sql += ' WHERE first_name LIKE ? OR last_name LIKE ?';
        const searchTerm = `%${search}%`; // Adds wildcards for partial match
        values = [searchTerm, searchTerm];
    }
    
    // Optional: Add ORDER BY clause for better display
    sql += ' ORDER BY last_name ASC';

    try {
        const [patients] = await db.query(sql, values);
        res.status(200).json(patients);
    } catch (error) {
        console.error("Error fetching patients:", error);
        res.status(500).json({ message: 'Database error fetching patients.' });
    }
};

// ... (Other CRUD functions)

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
exports.getPatientHistory = async (req, res) => {
    const { id } = req.params;
    
    try {
        // 1. Basic Details
        const [details] = await db.query('SELECT * FROM patient WHERE patient_id = ?', [id]);
        if (details.length === 0) {
            return res.status(404).json({ message: 'Patient not found.' });
        }

        // 2. Appointments List (Joined with Doctor Name)
        const [appointments] = await db.query(`
            SELECT 
                a.appointment_id, a.appointment_time, a.reason, a.status,
                d.first_name AS doctor_fname, d.last_name AS doctor_lname
            FROM appointment a
            JOIN doctor d ON a.doctor_id = d.doctor_id
            WHERE a.patient_id = ?
            ORDER BY a.appointment_time DESC
        `, [id]);

        // 3. Uploaded Files
        const [documents] = await db.query(
            'SELECT document_id, title, document_type, upload_date, file_path FROM document WHERE patient_id = ?', 
            [id]
        );

        // 4. Medical Conditions Summary
        const [conditions] = await db.query(
            'SELECT condition_name, diagnosis_date, severity FROM medical_condition WHERE patient_id = ?', 
            [id]
        );

        res.status(200).json({
            patient: details[0],
            appointments,
            documents,
            conditions
        });

    } catch (error) {
        console.error("Error fetching patient history:", error);
        res.status(500).json({ message: 'Database error fetching patient history.' });
    }
};