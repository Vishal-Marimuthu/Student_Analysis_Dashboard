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

module.exports = { getMyProfile, getMySubjects, getMyMarks, getSemesters };
