// src/controllers/dashboardController.js (UPDATED)

const db = require('../db/db.config');
const { calculateRiskScore, getAdherenceStatus } = require('../utils/synthesis.utils');

// Helper function to fetch full history needed for risk calculation
const fetchPatientHistory = async (id) => {
    // This is a simplified version just to get data required for synthesis
    const [appointments] = await db.query('SELECT status FROM appointment WHERE patient_id = ?', [id]);
    const [conditions] = await db.query('SELECT severity FROM medical_condition WHERE patient_id = ?', [id]);
    const [patient] = await db.query('SELECT patient_id FROM patient WHERE patient_id = ?', [id]);
    return { patient: patient[0], appointments, conditions };
};


exports.getDashboardSummary = async (req, res) => {
    try {
        // --- 1. Total Counts ---
        const [patientsCount] = await db.query('SELECT COUNT(*) AS total FROM patient');
        const [doctorsCount] = await db.query('SELECT COUNT(*) AS total FROM doctor');
        
        // --- 2. Appointments (Today & Upcoming) ---
        const TODAY = new Date().toISOString().split('T')[0];
        const [upcomingAppointments] = await db.query(
            'SELECT COUNT(*) AS total FROM appointment WHERE appointment_time >= ? AND status = "Scheduled"',
            [TODAY]
        );
        const [todayAppointments] = await db.query(
            'SELECT COUNT(*) AS total FROM appointment WHERE DATE(appointment_time) = ? AND status = "Scheduled"',
            [TODAY]
        );

        // --- 3. High-Risk Synthesis (NEW) ---
        const [allPatients] = await db.query('SELECT patient_id, first_name, last_name FROM patient');
        let highRiskCount = 0;
        
        for (const p of allPatients) {
            const history = await fetchPatientHistory(p.patient_id);
            const riskScore = calculateRiskScore(history);
            if (riskScore >= 70) { // Define high risk as score >= 70
                highRiskCount++;
            }
        }
        
        // --- 4. Recent Activity (Fetch risk score for display) ---
        const [recentAppointments] = await db.query(`
            SELECT 
                a.appointment_time, a.patient_id,
                p.first_name AS patient_fname, p.last_name AS patient_lname,
                d.last_name AS doctor_lname
            FROM appointment a
            JOIN patient p ON a.patient_id = p.patient_id
            JOIN doctor d ON a.doctor_id = d.doctor_id
            ORDER BY a.appointment_time DESC
            LIMIT 5
        `);
        
        // Enhance recent appointments with calculated risk score
        const recentActivityWithRisk = await Promise.all(
            recentAppointments.map(async (appt) => {
                const history = await fetchPatientHistory(appt.patient_id);
                return {
                    ...appt,
                    riskScore: calculateRiskScore(history)
                };
            })
        );
        
        const [admin] = await db.query('SELECT username FROM admin WHERE admin_id = ?', [req.adminId]);
        const adminName = admin.length > 0 ? admin[0].username : 'Admin';


        res.status(200).json({
            adminName,
            summary: {
                totalPatients: patientsCount[0].total,
                totalDoctors: doctorsCount[0].total,
                totalAppointmentsToday: todayAppointments[0].total,
                totalAppointmentsUpcoming: upcomingAppointments[0].total,
                totalHighRiskPatients: highRiskCount, 
            },
            recentActivity: recentActivityWithRisk,
        });

    } catch (error) {
        console.error("Dashboard synthesis error:", error);
        res.status(500).json({ message: 'Error fetching dashboard data.' });
    }
};