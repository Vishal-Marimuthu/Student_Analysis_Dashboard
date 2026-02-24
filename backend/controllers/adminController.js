const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Mark = require('../models/Mark');

// GET /api/admin/students
const getAllStudents = async (req, res) => {
    try {
        const students = await Student.getAllStudents();
        res.json(students);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

// GET /api/admin/students/:id
const getStudentById = async (req, res) => {
    try {
        const student = await Student.getStudentById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found.' });
        res.json(student);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// POST /api/admin/students — create user + student profile in one step
const addStudent = async (req, res) => {
    const { name, email, password, departmentId, currentSemester } = req.body;
    if (!name || !email || !password || !departmentId || !currentSemester)
        return res.status(400).json({ message: 'All fields are required.' });

    try {
        const existing = await User.findByEmail(email);
        if (existing) return res.status(409).json({ message: 'Email already in use.' });

        const hash = await bcrypt.hash(password, 10);
        const userId = await User.createUser({ name, email, password: hash, role: 'student' });
        const studentId = await Student.createStudent({
            userId,
            studentName: name,
            departmentId,
            currentSemester,
        });

        res.status(201).json({ message: 'Student added successfully.', studentId });
    } catch (err) {
        console.error('addStudent error:', err);
        if (err.code === 'ER_NO_REFERENCED_ROW_2')
            return res.status(400).json({ message: 'Invalid department or semester.' });
        res.status(500).json({ message: 'Server error.' });
    }
};

// GET /api/admin/students/:id/marks
const getStudentMarks = async (req, res) => {
    try {
        const marks = await Mark.getMarksByStudentId(req.params.id);
        res.json(marks);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// POST /api/admin/marks — add/update marks for a student
const addMarks = async (req, res) => {
    const { studentId, marks } = req.body;
    // marks = [{ subjectId, marks }, ...]
    if (!studentId || !Array.isArray(marks) || marks.length === 0)
        return res.status(400).json({ message: 'studentId and marks array are required.' });

    try {
        for (const m of marks) {
            if (!m.subjectId || m.marks === undefined)
                return res.status(400).json({ message: 'Each mark must have subjectId and marks.' });
            await Mark.upsertMark(studentId, m.subjectId, m.marks);
        }
        res.json({ message: 'Marks saved successfully.' });
    } catch (err) {
        console.error('addMarks error:', err);
        if (err.code === 'ER_NO_REFERENCED_ROW_2')
            return res.status(400).json({ message: 'Invalid student or subject reference.' });
        res.status(500).json({ message: 'Server error.' });
    }
};

// GET /api/admin/departments
const getDepartments = async (req, res) => {
    try {
        const depts = await Subject.getAllDepartments();
        res.json(depts);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// GET /api/admin/subjects?departmentId=X&semesterId=Y
const getSubjects = async (req, res) => {
    const { departmentId, semesterId } = req.query;
    if (!departmentId || !semesterId)
        return res.status(400).json({ message: 'departmentId and semesterId are required.' });
    try {
        const subjects = await Subject.getSubjectsByDeptAndSem(departmentId, semesterId);
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

// GET /api/admin/semesters
const getSemesters = async (req, res) => {
    try {
        const sems = await Subject.getAllSemesters();
        res.json(sems);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = {
    getAllStudents,
    getStudentById,
    addStudent,
    getStudentMarks,
    addMarks,
    getDepartments,
    getSubjects,
    getSemesters,
};
