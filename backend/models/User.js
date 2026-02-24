const db = require('../config/db');

const findByEmail = async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

const createUser = async ({ name, email, password, role = 'student' }) => {
    const [result] = await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, password, role]
    );
    return result.insertId;
};

module.exports = { findByEmail, createUser };
