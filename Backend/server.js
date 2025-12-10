const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Import Model (Pastikan nama file di folder models sudah benar)
const Student = require('./models/Student');
const Course = require('./models/Course');
const LearningPath = require('./models/LearningPath');
const Tutorial = require('./models/Tutorial');

const app = express();
const PORT = 3000;

// GANTI PASSWORD DAN URI SESUAI DATABASE ANDA
const MONGO_URI = 'mongodb+srv://msadan:474747@students.jpwpnl5.mongodb.net/dicoding_db?retryWrites=true&w=majority&appName=Students';

app.use(cors());
app.use(express.json());

// --- SAJIKAN FRONTEND ---
app.use(express.static(path.join(__dirname, '../Frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB Error:', err));

// --- API ENDPOINTS ---

// 1. Get All Students
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Get All Courses
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Get All Learning Paths
app.get('/api/paths', async (req, res) => {
    try {
        const paths = await LearningPath.find();
        res.json(paths);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Get All Tutorials
app.get('/api/tutorials', async (req, res) => {
    try {
        const tutorials = await Tutorial.find();
        res.json(tutorials);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});