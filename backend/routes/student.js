const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const { getMyProfile, getMySubjects, getMyMarks, getSemesters } = require('../controllers/studentController');

// All student routes require authentication + student role
router.use(authenticate, requireRole('student'));

router.get('/profile', getMyProfile);
router.get('/semesters', getSemesters);
router.get('/subjects', getMySubjects); // ?semesterId=
router.get('/marks', getMyMarks);

module.exports = router;
