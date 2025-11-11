// src/controllers/doctorController.js

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

// CREATE Doctor (POST /api/doctors)
exports.createDoctor = async (req, res) => {
    const validationErrors = handleValidationErrors(req, res);
    if (validationErrors) return validationErrors;

    const { first_name, last_name, specialization, phone, email } = req.body;
    const sql = 'INSERT INTO doctor (first_name, last_name, specialization, phone, email) VALUES (?, ?, ?, ?, ?)';
    const values = [first_name, last_name, specialization, phone, email];

    try {
        const [result] = await db.query(sql, values);
        res.status(201).json({ id: result.insertId, message: 'Doctor created successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Database error creating doctor.' });
    }
};

// READ All Doctors (GET /api/doctors)
exports.getAllDoctors = async (req, res) => {
    try {
        const [doctors] = await db.query('SELECT doctor_id, first_name, last_name, specialization, email FROM doctor');
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: 'Database error fetching doctors.' });
    }
};

// READ Single Doctor (GET /api/doctors/:id)
exports.getDoctorById = async (req, res) => {
    const { id } = req.params;
    try {
        const [doctor] = await db.query('SELECT * FROM doctor WHERE doctor_id = ?', [id]);
        if (doctor.length === 0) {
            return res.status(404).json({ message: 'Doctor not found.' });
        }
        res.status(200).json(doctor[0]);
    } catch (error) {
        res.status(500).json({ message: 'Database error fetching doctor.' });
    }
};

// UPDATE Doctor (PUT /api/doctors/:id)
exports.updateDoctor = async (req, res) => {
    const { id } = req.params;
    const fields = req.body;

    const updates = Object.keys(fields).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(fields), id];

    if (updates.length === 0) {
        return res.status(400).json({ message: 'No fields provided for update.' });
    }

    const sql = `UPDATE doctor SET ${updates} WHERE doctor_id = ?`;

    try {
        const [result] = await db.query(sql, values);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Doctor not found or no change made.' });
        }
        res.status(200).json({ message: 'Doctor updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Database error updating doctor.' });
    }
};

// DELETE Doctor (DELETE /api/doctors/:id)
exports.deleteDoctor = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM doctor WHERE doctor_id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Doctor not found.' });
        }
        res.status(200).json({ message: 'Doctor deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Database error deleting doctor.' });
    }
};
