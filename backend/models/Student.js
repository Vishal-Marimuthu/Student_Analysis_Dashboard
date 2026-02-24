const db = require('../config/db');

const getAllStudents = async () => {
    const [rows] = await db.query(`
    SELECT s.id, s.student_name, s.current_semester, s.department_id,
           d.department_name, u.email, u.id AS user_id
    FROM students s
    JOIN departments d ON s.department_id = d.id
    JOIN users u ON s.user_id = u.id
    ORDER BY s.id DESC
  `);
    return rows;
};

const getStudentByUserId = async (userId) => {
    const [rows] = await db.query(`
    SELECT s.id, s.student_name, s.current_semester, s.department_id,
           d.department_name, u.email, u.name
    FROM students s
    JOIN departments d ON s.department_id = d.id
    JOIN users u ON s.user_id = u.id
    WHERE s.user_id = ?
  `, [userId]);
    return rows[0];
};

const getStudentById = async (studentId) => {
    const [rows] = await db.query(`
    SELECT s.id, s.student_name, s.current_semester, s.department_id,
           d.department_name, u.email
    FROM students s
    JOIN departments d ON s.department_id = d.id
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ?
  `, [studentId]);
    return rows[0];
};

const createStudent = async ({ userId, studentName, departmentId, currentSemester }) => {
    const [result] = await db.query(
        'INSERT INTO students (user_id, student_name, department_id, current_semester) VALUES (?, ?, ?, ?)',
        [userId, studentName, departmentId, currentSemester]
    );
    return result.insertId;
};

module.exports = { getAllStudents, getStudentByUserId, getStudentById, createStudent };
