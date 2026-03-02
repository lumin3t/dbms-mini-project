const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const db = require('../db/db.config'); // Points to src/db/db.config.js

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const patientId = req.body.patient_id || 'unassigned';
            cb(null, `patients/${patientId}/${Date.now()}-${file.originalname}`);
        }
    })
});

exports.uploadMiddleware = upload.single('documentFile'); 

exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded to S3' });
        }

        const { patient_id, title, document_type } = req.body;
        const file_path = req.file.location;

        // FIXED: Table name changed to 'document' (singular)
        const [result] = await db.execute(
            `INSERT INTO document (patient_id, title, document_type, file_path, upload_date) 
             VALUES (?, ?, ?, ?, NOW())`,
            [patient_id, title, document_type, file_path]
        );

        res.status(201).json({ 
            message: 'File uploaded successfully', 
            url: file_path,
            document_id: result.insertId 
        });
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ message: 'Server error during upload' });
    }
};

exports.getAllDocuments = async (req, res) => {
    try {
        // FIXED: Table names changed to 'document' and 'patient' (singular)
        const [docs] = await db.execute(`
            SELECT d.*, p.first_name, p.last_name 
            FROM document d
            JOIN patient p ON d.patient_id = p.patient_id
            ORDER BY d.upload_date DESC
        `);
        res.json(docs);
    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json({ message: 'Error fetching documents' });
    }
};