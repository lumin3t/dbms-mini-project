// src/controllers/appointmentController.js

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

// CREATE Appointment (POST /api/appointments)
exports.createAppointment = async (req, res) => {
    const validationErrors = handleValidationErrors(req, res);
    if (validationErrors) return validationErrors;

    const { patient_id, doctor_id, appointment_time, reason, status } = req.body;
    const sql = 'INSERT INTO appointment (patient_id, doctor_id, appointment_time, reason, status) VALUES (?, ?, ?, ?, ?)';
    const values = [patient_id, doctor_id, appointment_time, reason, status || 'Scheduled']; // Default status

    try {
        const [result] = await db.query(sql, values);
        res.status(201).json({ id: result.insertId, message: 'Appointment created successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Database error creating appointment.' });
    }
};

// READ All Appointments (GET /api/appointments)
exports.getAllAppointments = async (req, res) => {
    try {
        const [appointments] = await db.query('SELECT appointment_id, patient_id, doctor_id, appointment_time, reason, status FROM appointment');
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Database error fetching appointments.' });
    }
};

// READ Single Appointment (GET /api/appointments/:id)
exports.getAppointmentById = async (req, res) => {
    const { id } = req.params;
    try {
        const [appointment] = await db.query('SELECT * FROM appointment WHERE appointment_id = ?', [id]);
        if (appointment.length === 0) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }
        res.status(200).json(appointment[0]);
    } catch (error) {
        res.status(500).json({ message: 'Database error fetching appointment.' });
    }
};
// READ Appointments by Patient ID (GET /api/patients/:id/appointments)
exports.getAppointmentsByPatientId = async (req, res) => {
    const patientId = req.params.id;
    
    const sql = `
        SELECT 
            a.appointment_id, 
            a.appointment_time, 
            a.reason, 
            a.status,
            d.first_name AS doctor_first_name,
            d.last_name AS doctor_last_name
        FROM appointment a
        JOIN doctor d ON a.doctor_id = d.doctor_id
        WHERE a.patient_id = ?
        ORDER BY a.appointment_time DESC`;

    try {
        const [appointments] = await db.query(sql, [patientId]);
        res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching patient appointments:", error);
        res.status(500).json({ message: 'Database error fetching appointments.' });
    }
};

// UPDATE Appointment (PUT /api/appointments/:id)
exports.updateAppointment = async (req, res) => {
    const { id } = req.params;
    const fields = req.body;

    const updates = Object.keys(fields).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(fields), id];

    if (updates.length === 0) {
        return res.status(400).json({ message: 'No fields provided for update.' });
    }

    const sql = `UPDATE appointment SET ${updates} WHERE appointment_id = ?`;

    try {
        const [result] = await db.query(sql, values);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Appointment not found or no change made.' });
        }
        res.status(200).json({ message: 'Appointment updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Database error updating appointment.' });
    }
};

// DELETE Appointment (DELETE /api/appointments/:id)
exports.deleteAppointment = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM appointment WHERE appointment_id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }
        res.status(200).json({ message: 'Appointment deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Database error deleting appointment.' });
    }
};
