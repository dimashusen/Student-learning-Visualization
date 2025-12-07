const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Import Model
const Student = require('./models/Student');
const Course = require('./models/Course');
const LearningPath = require('./models/LearningPath');
const Tutorial = require('./models/Tutorial');

const app = express();
// PENTING: Railway akan memberikan PORT otomatis ke process.env.PORT
const PORT = process.env.PORT || 3000;

// PENTING: Gunakan Environment Variable untuk URI, fallback ke string hardcode untuk lokal
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://msadan:474747@students.jpwpnl5.mongodb.net/dicoding_db?retryWrites=true&w=majority&appName=Students';

app.use(cors()); // Mengizinkan akses dari semua domain (termasuk Netlify nanti)
app.use(express.json());

// --- API ENDPOINTS ---

app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/paths', async (req, res) => {
    try {
        const paths = await LearningPath.find();
        res.json(paths);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/tutorials', async (req, res) => {
    try {
        const tutorials = await Tutorial.find();
        res.json(tutorials);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route default untuk cek server menyala
app.get('/', (req, res) => {
    res.send('Server Backend Berjalan! Silakan akses endpoint API.');
});

app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});