// server.js

const express = require('express');
require('dotenv').config(); 
// Ensure db.config is loaded to initialize the connection pool
const db = require('./src/db/db.config'); 
const apiRoutes = require('./src/routes/api.routes');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

//Enable static serving of uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// This configuration allows requests from http://localhost:5173 (your Vite frontend)
const corsOptions = {
    origin: 'http://localhost:5173', // Only allow this specific origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow all necessary HTTP methods
    credentials: true, // Allow cookies/headers if needed later (good practice)
};
app.use(cors(corsOptions)); // Apply the CORS middleware

// API Routes
app.use('/api', apiRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on port http://localhost:${PORT}`);
});