// src/controllers/documentController.js

const db = require('../db/db.config');
const multer = require('multer');
const path = require('path');

// --- 1. Multer Configuration ---

// Define storage location and filename
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Files will be stored in the 'uploads/' folder in the root directory
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        // Create a unique filename: fieldname-timestamp.ext (e.g., document-1700000000.pdf)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Create the Multer instance. 'documentFile' is the expected field name in the form.
const uploadMiddleware = multer({ storage: storage }).single('documentFile');

// --- 2. Controller Logic ---

/**
 * Handles the file upload and saves document metadata to the database.
 * POST /api/upload
 */
exports.uploadDocument = async (req, res) => {
    // Multer places the file info in req.file and other fields in req.body
    
    // Check if a file was uploaded by Multer
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    
    // Get metadata from the request body and file object
    const { title, patient_id, document_type } = req.body;
    const filePath = req.file.path; // e.g., 'uploads/documentFile-12345.pdf'
    
    if (!title || !patient_id) {
        // If mandatory fields are missing, delete the uploaded file and return error
        const fs = require('fs');
        fs.unlinkSync(filePath); 
        return res.status(400).json({ message: 'Title and patient_id are required fields.' });
    }

    // Save document metadata to the 'document' table
    const sql = `INSERT INTO document (patient_id, title, file_path, document_type) 
                 VALUES (?, ?, ?, ?)`;
    const values = [patient_id, title, filePath, document_type];

    try {
        const [result] = await db.query(sql, values);
        
        // Return the success message and the URL where the file can be accessed
        res.status(201).json({
            document_id: result.insertId,
            message: 'File uploaded and record created successfully.',
            fileName: req.file.filename,
            fileUrl: `http://localhost:${process.env.PORT}/${filePath}` // Fake S3 URL
        });

    } catch (error) {
        console.error("Database error saving document:", error);
        res.status(500).json({ message: 'Database error saving document metadata.' });
    }
};

// Export the middleware so it can be used in the routes file
exports.uploadMiddleware = uploadMiddleware;