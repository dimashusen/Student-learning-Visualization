const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const open = require('open').default || require('open');

// Import Model
const Student = require('./models/Student');
const Course = require('./models/Course');
const LearningPath = require('./models/LearningPath');
const Tutorial = require('./models/Tutorial');

const app = express();
const PORT = process.env.PORT || 3000;

// --- CORS CONFIGURATION ---
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://my-visualization.vercel.app',
        'https://student-learning-visualization.netlify.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// URI MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://msadan:474747@students.jpwpnl5.mongodb.net/dicoding_db?retryWrites=true&w=majority&appName=Students';

// Serve Static Files dari Frontend folder
app.use(express.static(path.join(__dirname, '../Frontend')));

// --- DATABASE CONNECTION ---
// Kita bungkus agar koneksi reused di lingkungan serverless
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        await mongoose.connect(MONGO_URI);
        isConnected = true;
        console.log('✅ Connected to MongoDB Atlas');
    } catch (err) {
        console.error('❌ MongoDB Error:', err);
    }
};
// Panggil koneksi awal
connectDB();

// --- API ENDPOINTS ---

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

app.get('/api/students', async (req, res) => {
    await connectDB(); // Pastikan koneksi db aktif sebelum query
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/courses', async (req, res) => {
    await connectDB();
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/paths', async (req, res) => {
    await connectDB();
    try {
        const paths = await LearningPath.find();
        res.json(paths);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/tutorials', async (req, res) => {
    await connectDB();
    try {
        const tutorials = await Tutorial.find();
        res.json(tutorials);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- PENTING UNTUK VERCEL ---
// Export app agar Vercel bisa menjalankannya sebagai serverless function
module.exports = app;

// --- PENTING UNTUK LOCALHOST ---
// Kode ini hanya jalan jika file dijalankan langsung (node server.js), bukan diimport Vercel
if (require.main === module) {
    app.listen(PORT, async () => {
        const url = `http://localhost:${PORT}`;
        console.log(`Server berjalan di ${url}`);
        console.log('Opening browser...');
        await open(url);
    });
}