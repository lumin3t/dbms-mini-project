// src/controllers/testController.js

exports.testBackend = (req, res) => {
    res.status(200).json({ message: "Backend running." });
};