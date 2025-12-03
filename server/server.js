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
app.use(express.static(path.join(__dirname, '../src')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/index.html'));
});

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB Error:', err));

// --- AI Recommendation Endpoint ---
// POST /api/recommend-next
// Body: { email: string, useAI?: boolean }
app.post('/api/recommend-next', async (req, res) => {
    try {
        const { email, useAI = true } = req.body || {};
        if (!email) return res.status(400).json({ error: 'Missing email in request body' });

        // Load student records from DB
        const studentRecords = await Student.find({ email: new RegExp(`^${email}$`, 'i') }).lean();

        // Determine active course (first non-graduated) or most recent
        let active = null;
        if (studentRecords && studentRecords.length > 0) {
            active = studentRecords.find(s => String(s.is_graduated) !== '1') || studentRecords[0];
        }

        // Build learning-path -> course order map from DB
        const allCourses = await Course.find().lean();
        const allLPs = await LearningPath.find().lean();
        const allTutorials = await Tutorial.find().lean();

        // Map LP id/name
        const lpById = {};
        allLPs.forEach(lp => { lpById[String(lp.learning_path_id)] = lp.learning_path_name || lp.learning_path_id; });

        // Build order: group courses by learning_path_id preserving DB order by course_id if available
        const lpCourseOrder = {};
        allCourses.forEach(c => {
            const lpName = lpById[String(c.learning_path_id)] || String(c.learning_path_id) || 'Unknown';
            if (!lpCourseOrder[lpName]) lpCourseOrder[lpName] = [];
            lpCourseOrder[lpName].push(c.course_name);
        });

        // Base recommendation logic (server-side fallback)
        let baseRecommendation = { title: null, reason: null };
        if (active && active.course_name) {
            const courseName = active.course_name;
            // find LP for this course
            const matchingCourse = allCourses.find(cc => cc.course_name === courseName) || null;
            if (matchingCourse) {
                const lpName = lpById[String(matchingCourse.learning_path_id)] || null;
                const order = lpName ? (lpCourseOrder[lpName] || []) : [];
                const idx = order.indexOf(courseName);
                if (idx >= 0 && idx < order.length - 1) {
                    baseRecommendation.title = order[idx + 1];
                    baseRecommendation.reason = `Next course in learning path ${lpName}`;
                } else {
                    // fallback: recommend first tutorial of current course
                    const tut = allTutorials.find(t => t.course_id === matchingCourse.course_id);
                    if (tut) {
                        baseRecommendation.title = courseName;
                        baseRecommendation.reason = `Continue with tutorial: ${tut.tutorial_title}`;
                    } else {
                        baseRecommendation.title = courseName;
                        baseRecommendation.reason = 'Continue current course';
                    }
                }
            } else {
                baseRecommendation.title = courseName;
                baseRecommendation.reason = 'Course found in student record but not in course catalog';
            }
        } else {
            baseRecommendation.title = null;
            baseRecommendation.reason = 'No active course found for student';
        }

        // If AI not requested or API config missing, return base recommendation
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        const GEMINI_API_URL = process.env.GEMINI_API_URL; // e.g. https://your-gemini-endpoint
        if (!useAI || !GEMINI_API_KEY || !GEMINI_API_URL) {
            return res.json({ success: true, source: 'rule-based', recommendation: baseRecommendation });
        }

        // Build prompt for AI using studentRecords and lpCourseOrder context
        const prompt = [];
        prompt.push(`You are an assistant that recommends the next learning step for a student.`);
        prompt.push(`Student email: ${email}`);
        if (active && active.course_name) prompt.push(`Currently taking: ${active.course_name}`);
        prompt.push(`Student records (summary): ${JSON.stringify(studentRecords.slice(0,10))}`);
        prompt.push(`Learning path course orders: ${JSON.stringify(lpCourseOrder)}`);
        prompt.push(`Based on the data above, suggest a single best next course or module (be concise).`);
        const promptText = prompt.join('\n');

        // Call Gemini (flexible parsing of common responses)
        const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GEMINI_API_KEY}` };
        const body = JSON.stringify({ prompt: promptText, max_output_tokens: 256 });

        const aiResp = await fetch(GEMINI_API_URL, { method: 'POST', headers, body });
        const aiJson = await aiResp.json();

        // Try to robustly extract text from known response shapes
        let aiText = null;
        if (!aiText && aiJson.output && aiJson.output[0] && aiJson.output[0].content) {
            // e.g. { output: [ { content: [ { text: '...' } ] } ] }
            const c = aiJson.output[0].content[0];
            if (c && c.text) aiText = c.text;
        }
        if (!aiText && aiJson.candidates && aiJson.candidates[0] && aiJson.candidates[0].content) {
            aiText = aiJson.candidates[0].content;
        }
        if (!aiText && aiJson.choices && aiJson.choices[0] && aiJson.choices[0].message) {
            aiText = aiJson.choices[0].message.content;
        }
        if (!aiText && aiJson.result) aiText = JSON.stringify(aiJson.result);

        return res.json({ success: true, source: 'ai+rule', recommendation: baseRecommendation, ai: aiText, raw: aiJson });
    } catch (err) {
        console.error('Error /api/recommend-next', err);
        res.status(500).json({ error: err.message || String(err) });
    }
});

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