const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Mark = require('../models/Mark');

// GET /api/student/profile
const getMyProfile = async (req, res) => {
    try {
        const profile = await Student.getStudentByUserId(req.user.id);
        if (!profile) return res.status(404).json({ message: 'Student profile not found.' });
        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// GET /api/student/subjects?semesterId=X
// Returns subjects for the student's department + the given semester
const getMySubjects = async (req, res) => {
    const { semesterId } = req.query;
    if (!semesterId) return res.status(400).json({ message: 'semesterId is required.' });

    try {
        const profile = await Student.getStudentByUserId(req.user.id);
        if (!profile) return res.status(404).json({ message: 'Student profile not found.' });

        const subjects = await Subject.getSubjectsByDeptAndSem(profile.department_id, semesterId);
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// GET /api/student/marks — returns all marks for this student (grouped by semester in frontend)
const getMyMarks = async (req, res) => {
    try {
        const profile = await Student.getStudentByUserId(req.user.id);
        if (!profile) return res.status(404).json({ message: 'Student profile not found.' });

        const marks = await Mark.getMarksByStudentId(profile.id);
        res.json(marks);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// GET /api/student/semesters
const getSemesters = async (req, res) => {
    try {
        const sems = await Subject.getAllSemesters();
        res.json(sems);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// GET /api/student/rank — this student's rank in their department
const getMyRank = async (req, res) => {
    try {
        const profile = await Student.getStudentByUserId(req.user.id);
        if (!profile) return res.status(404).json({ message: 'Student profile not found.' });

        const db = require('../config/db');
        // Rank all students in this dept by avg marks, find this student's position
        const [rows] = await db.query(`
            SELECT ranked.rank_pos, ranked.avg_marks, ranked.total_students
            FROM (
                SELECT
                    s.id,
                    ROUND(AVG(sm.marks), 1) AS avg_marks,
                    RANK() OVER (ORDER BY AVG(sm.marks) DESC) AS rank_pos,
                    COUNT(DISTINCT s.id) OVER () AS total_students
                FROM students s
                LEFT JOIN student_marks sm ON sm.student_id = s.id
                WHERE s.department_id = ?
                GROUP BY s.id
                HAVING COUNT(sm.id) > 0
            ) AS ranked
            WHERE ranked.id = ?
        `, [profile.department_id, profile.id]);

        if (rows.length === 0) {
            return res.json({ rank: null, avg_marks: null, total_students: 0 });
        }
        res.json({
            rank: rows[0].rank_pos,
            avg_marks: rows[0].avg_marks,
            total_students: rows[0].total_students,
        });
    } catch (err) {
        console.error('getMyRank error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { getMyProfile, getMySubjects, getMyMarks, getSemesters, getMyRank };

