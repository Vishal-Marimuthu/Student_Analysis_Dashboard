const db = require('../config/db');

const getSubjectsByDeptAndSem = async (departmentId, semesterId) => {
    const [rows] = await db.query(`
    SELECT sub.id, sub.subject_name, sub.subject_code
    FROM subjects sub
    WHERE sub.department_id = ? AND sub.semester_id = ?
    ORDER BY sub.subject_code
  `, [departmentId, semesterId]);
    return rows;
};

const getAllDepartments = async () => {
    const [rows] = await db.query('SELECT * FROM departments ORDER BY id');
    return rows;
};

const getAllSemesters = async () => {
    const [rows] = await db.query(
        'SELECT MIN(id) AS id, semester_number FROM semesters GROUP BY semester_number ORDER BY semester_number'
    );
    return rows;
};

module.exports = { getSubjectsByDeptAndSem, getAllDepartments, getAllSemesters };
