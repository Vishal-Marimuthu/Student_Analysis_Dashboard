const db = require('../config/db');

const getMarksByStudentId = async (studentId) => {
    const [rows] = await db.query(`
    SELECT sm.id, sm.marks, sm.student_id, sm.subject_id,
           sub.subject_name, sub.subject_code,
           sem.semester_number,
           d.department_name
    FROM student_marks sm
    JOIN subjects sub ON sm.subject_id = sub.id
    JOIN semesters sem ON sub.semester_id = sem.id
    JOIN departments d ON sub.department_id = d.id
    WHERE sm.student_id = ?
    ORDER BY sem.semester_number, sub.subject_code
  `, [studentId]);
    return rows;
};

const upsertMark = async (studentId, subjectId, marks) => {
    // Insert or update if already exists
    const [result] = await db.query(`
    INSERT INTO student_marks (student_id, subject_id, marks)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE marks = VALUES(marks)
  `, [studentId, subjectId, marks]);
    return result;
};

const deleteMarksByStudentId = async (studentId) => {
    await db.query('DELETE FROM student_marks WHERE student_id = ?', [studentId]);
};

module.exports = { getMarksByStudentId, upsertMark, deleteMarksByStudentId };
