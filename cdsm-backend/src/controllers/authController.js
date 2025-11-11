// src/controllers/authController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/db.config'); // Database pool from Step 1

// Helper function to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d', // Token expires in 1 day
    });
};

// 1. /api/admin/register
exports.registerAdmin = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please include all fields: username, email, and password.' });
    }

    try {
        // Check if admin already exists
        const [existing] = await db.query('SELECT admin_id FROM admin WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Admin with this email already exists.' });
        }

        // Hash the password (cost factor 10)
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert new admin into DB
        const [result] = await db.query(
            'INSERT INTO admin (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, password_hash]
        );

        const newAdminId = result.insertId;

        res.status(201).json({
            admin_id: newAdminId,
            username,
            token: generateToken(newAdminId),
            message: 'Admin registered successfully.'
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

// 2. /api/admin/login
exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password.' });
    }

    try {
        // Find admin by email
        const [admins] = await db.query('SELECT admin_id, username, password_hash FROM admin WHERE email = ?', [email]);

        if (admins.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials (Admin not found).' });
        }

        const admin = admins[0];

        // Compare provided password with hashed password
        if (await bcrypt.compare(password, admin.password_hash)) {
            res.status(200).json({
                admin_id: admin.admin_id,
                username: admin.username,
                token: generateToken(admin.admin_id),
                message: 'Login successful.'
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials (Password mismatch).' });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

// Example protected route handler (for testing middleware)
exports.getAdminProfile = (req, res) => {
    // req.adminId is available here due to authMiddleware
    res.status(200).json({
        admin_id: req.adminId,
        message: 'Admin profile data accessed successfully (PROTECTED ROUTE).'
    });
};