const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

const requireRole = (role) => (req, res, next) => {
    if (req.user.role !== role) {
        return res.status(403).json({ message: `Access denied. Requires ${role} role.` });
    }
    next();
};

module.exports = { authenticate, requireRole };
