// server.js

const express = require('express');
require('dotenv').config(); 
// Ensure db.config is loaded to initialize the connection pool
const db = require('./src/db/db.config'); 
const apiRoutes = require('./src/routes/api.routes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

//Enable static serving of uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api', apiRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on port http://localhost:${PORT}`);
});