// src/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    // Check for 'Bearer <token>' in the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (removes 'Bearer ')
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach admin_id to the request
            req.adminId = decoded.id;

            next();
        } catch (error) {
            console.error(error);
            // Respond with 401 Unauthorized if verification fails
            res.status(401).json({ message: 'Not authorized, token failed.' });
        }
    }

    if (!token) {
        // Respond with 401 Unauthorized if no token is present
        res.status(401).json({ message: 'Not authorized, no token.' });
    }
};

module.exports = { protect };