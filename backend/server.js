require('dotenv').config();
const express = require('express');
const cors = require('cors');
const seed = require('./config/seed');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/student');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// 404
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

// Start: seed DB then listen
seed()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`\n✅ Server running at http://localhost:${PORT}`);
            console.log(`   Admin login: admin@university.edu / admin123\n`);
        });
    })
    .catch((err) => {
        console.error('❌ Failed to start server:', err.message);
        process.exit(1);
    });
