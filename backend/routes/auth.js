const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

// Public
router.post('/login', login);

// Admin only — create a student user account
router.post('/register', authenticate, requireRole('admin'), register);

module.exports = router;
