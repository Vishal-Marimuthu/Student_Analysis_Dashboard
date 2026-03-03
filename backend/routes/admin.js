const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const {
    getAllStudents,
    getStudentById,
    addStudent,
    getStudentMarks,
    addMarks,
    getDepartments,
    getSubjects,
    getSemesters,
    getDepartmentRankings,
} = require('../controllers/adminController');

// Apply admin guard to all routes
router.use(authenticate, requireRole('admin'));

router.get('/departments', getDepartments);
router.get('/semesters', getSemesters);
router.get('/subjects', getSubjects); // ?departmentId=&semesterId=

router.get('/students', getAllStudents);
router.post('/students', addStudent);
router.get('/students/:id', getStudentById);
router.get('/students/:id/marks', getStudentMarks);

router.post('/marks', addMarks);

router.get('/rankings', getDepartmentRankings);

module.exports = router;
