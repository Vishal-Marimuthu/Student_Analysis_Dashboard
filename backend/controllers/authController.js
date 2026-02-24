const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: 'Email and password are required.' });

    try {
        const user = await User.findByEmail(email);
        if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Invalid credentials.' });

        const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

        // If student, attach student profile id
        let studentId = null;
        if (user.role === 'student') {
            const profile = await Student.getStudentByUserId(user.id);
            if (profile) studentId = profile.id;
        }

        res.json({ token, user: { ...payload, studentId } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Admin registers a new student account
const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
        return res.status(400).json({ message: 'Name, email, and password are required.' });

    try {
        const existing = await User.findByEmail(email);
        if (existing) return res.status(409).json({ message: 'Email already in use.' });

        const hash = await bcrypt.hash(password, 10);
        const userId = await User.createUser({ name, email, password: hash, role: 'student' });
        res.status(201).json({ message: 'Student account created.', userId });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { login, register };
