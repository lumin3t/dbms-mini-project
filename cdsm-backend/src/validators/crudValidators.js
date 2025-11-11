// src/validators/crudValidators.js

const { body , validationResult} = require('express-validator');

// --- Patient Validation ---
exports.patientValidation = [
    body('first_name').notEmpty().withMessage('First name is required.'),
    body('last_name').notEmpty().withMessage('Last name is required.'),
    body('date_of_birth').isDate().withMessage('Valid Date of Birth is required (YYYY-MM-DD).'),
    body('email').optional().isEmail().withMessage('Must be a valid email format.'),
];

// --- Doctor Validation ---
exports.doctorValidation = [
    body('first_name').notEmpty().withMessage('First name is required.'),
    body('last_name').notEmpty().withMessage('Last name is required.'),
    body('specialization').notEmpty().withMessage('Specialization is required.'),
    body('email').isEmail().withMessage('Must be a valid email format.'),
];

// --- Appointment Validation ---
exports.appointmentValidation = [
    body('patient_id').isInt().withMessage('Valid Patient ID is required.'),
    body('doctor_id').isInt().withMessage('Valid Doctor ID is required.'),
    body('appointment_time').isISO8601().toDate().withMessage('Valid ISO date/time (e.g., YYYY-MM-DDT HH:MM:SS) is required.'),
];

// --- Medical Condition Validation ---
exports.conditionValidation = [
    body('patient_id').isInt().withMessage('Valid Patient ID is required.'),
    body('condition_name').notEmpty().withMessage('Condition name is required.'),
    body('severity').isIn(['Mild', 'Moderate', 'Severe']).withMessage('Severity must be Mild, Moderate, or Severe.'),
];

// Reusable function to check validation results
exports.validateResult = (req, res, next) => {
    // validationResult is now defined here:
    const errors = validationResult(req); 
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};