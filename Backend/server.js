const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import Model
const Student = require('./models/Student');
const Course = require('./models/Course');
const LearningPath = require('./models/LearningPath');
const Tutorial = require('./models/Tutorial');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// --- KONFIGURASI CORS (PENTING) ---
// Mengizinkan Frontend (Netlify/Localhost) mengambil data
app.use(cors({
    origin: '*', // Setelah deploy sukses, bisa diganti dengan URL Netlify Anda agar lebih aman
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// --- DATABASE CONNECT ---
if (!MONGO_URI) {
    console.error("❌ FATAL: MONGO_URI tidak ditemukan di Environment Variables.");
} else {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('✅ Connected to MongoDB Atlas'))
        .catch(err => console.error('❌ MongoDB Error:', err));
}

// --- API ENDPOINTS ---

app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/paths', async (req, res) => {
    try {
        const paths = await LearningPath.find();
        res.json(paths);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/tutorials', async (req, res) => {
    try {
        const tutorials = await Tutorial.find();
        res.json(tutorials);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Route Default untuk Cek Server
app.get('/', (req, res) => {
    res.send('Backend API Running... Silakan akses frontend via Netlify.');
});

app.listen(PORT, () => {
    console.log(`Server API berjalan di port ${PORT}`);
});