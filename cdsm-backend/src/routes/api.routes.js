// src/routes/api.routes.js (FIXED VERSION)

const express = require('express');
const router = express.Router();
// Auth/Middleware
const { protect } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');
const { validateResult, patientValidation, doctorValidation, appointmentValidation, conditionValidation } = require('../validators/crudValidators'); // Validators

// Controllers
const testController = require('../controllers/testController');
const patientController = require('../controllers/patientController');
const doctorController = require('../controllers/doctorController');
const appointmentController = require('../controllers/appointmentController');
const conditionController = require('../controllers/conditionController');
const documentController = require('../controllers/documentController'); 
const dashboardController = require('../controllers/dashboardController'); 

// Test Route (Public)
router.get('/test', testController.testBackend);

// --- Admin Auth Routes (Public) ---
router.post('/admin/register', authController.registerAdmin);
router.post('/admin/login', authController.loginAdmin);

// --- PROTECTED CRUD ROUTES ---

// Patient Routes (/api/patients) - (OK)
router.post('/patients', protect, patientValidation, validateResult, patientController.createPatient);
router.get('/patients', protect, patientController.getAllPatients);
router.get('/patients/:id', protect, patientController.getPatientById);
router.put('/patients/:id', protect, patientController.updatePatient);
router.delete('/patients/:id', protect, patientController.deletePatient);
router.get('/patients/:id/history', protect, patientController.getPatientHistory);
router.get('/patients/:id/appointments', protect, appointmentController.getAppointmentsByPatientId); // Existing route remains

// Doctor Routes (/api/doctors) - (OK)
router.post('/doctors', protect, doctorValidation, validateResult, doctorController.createDoctor);
router.get('/doctors', protect, doctorController.getAllDoctors);
router.get('/doctors/:id', protect, doctorController.getDoctorById);
router.put('/doctors/:id', protect, doctorController.updateDoctor);
router.delete('/doctors/:id', protect, doctorController.deleteDoctor);

// Appointment Routes (/api/appointments) - 🚨 FIXED 🚨
router.post('/appointments', protect, appointmentValidation, validateResult, appointmentController.createAppointment);
router.get('/appointments', protect, appointmentController.getAllAppointments);
router.get('/appointments/:id', protect, appointmentController.getAppointmentById);
router.put('/appointments/:id', protect, appointmentController.updateAppointment);
router.delete('/appointments/:id', protect, appointmentController.deleteAppointment);

// Medical Condition Routes (/api/conditions) - 🚨 FIXED 🚨
router.post('/conditions', protect, conditionValidation, validateResult, conditionController.createCondition);
router.get('/conditions', protect, conditionController.getAllConditions);
router.get('/conditions/:id', protect, conditionController.getConditionById);
router.put('/conditions/:id', protect, conditionController.updateCondition);
router.delete('/conditions/:id', protect, conditionController.deleteCondition);
// NEW: Fetch all appointments for a specific patient
router.get('/patients/:id/appointments', protect, appointmentController.getAppointmentsByPatientId);
// ... (Existing Imports)
router.get('/dashboard/summary', protect, dashboardController.getDashboardSummary);

// --- PROTECTED FILE UPLOAD ROUTE --- (OK)
router.post('/upload', protect, documentController.uploadMiddleware, documentController.uploadDocument);


module.exports = router;