// src/controllers/dashboardController.js

const db = require('../db/db.config');

exports.getDashboardSummary = async (req, res) => {
    try {
        // --- 1. Total Counts ---
        const [patientsCount] = await db.query('SELECT COUNT(*) AS total FROM patient');
        const [doctorsCount] = await db.query('SELECT COUNT(*) AS total FROM doctor');
        
        // --- 2. Appointments (Today & Upcoming) ---
        const TODAY = new Date().toISOString().split('T')[0];
        
        // Upcoming: Scheduled appointments starting today or later
        const [upcomingAppointments] = await db.query(
            'SELECT COUNT(*) AS total FROM appointment WHERE appointment_time >= ? AND status = "Scheduled"',
            [TODAY]
        );

        // Today's: Appointments scheduled for TODAY
        const [todayAppointments] = await db.query(
            'SELECT COUNT(*) AS total FROM appointment WHERE DATE(appointment_time) = ? AND status = "Scheduled"',
            [TODAY]
        );

        // --- 3. Recent Activity (Last 5 Appointments) ---
        // Fetch last 5 scheduled appointments with patient/doctor names
        const [recentAppointments] = await db.query(`
            SELECT 
                a.appointment_time, 
                p.first_name AS patient_fname, 
                p.last_name AS patient_lname,
                d.last_name AS doctor_lname
            FROM appointment a
            JOIN patient p ON a.patient_id = p.patient_id
            JOIN doctor d ON a.doctor_id = d.doctor_id
            ORDER BY a.appointment_time DESC
            LIMIT 5
        `);
        
        // --- 4. Get Admin Name (for greeting) ---
        // The adminId is attached to req.adminId by the 'protect' middleware (Step 3)
        const [admin] = await db.query('SELECT username FROM admin WHERE admin_id = ?', [req.adminId]);
        const adminName = admin.length > 0 ? admin[0].username : 'Admin';


        res.status(200).json({
            adminName,
            summary: {
                totalPatients: patientsCount[0].total,
                totalDoctors: doctorsCount[0].total,
                totalAppointmentsToday: todayAppointments[0].total,
                totalAppointmentsUpcoming: upcomingAppointments[0].total,
            },
            recentActivity: recentAppointments,
        });

    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({ message: 'Error fetching dashboard data.' });
    }
};