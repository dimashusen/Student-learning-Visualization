// --- FUNGSI AMBIL USER UNTUK LOGIN ---

// Helper: fallback CSV parser (semicolons)
function parseCsvText(csvText) {
    const lines = csvText.split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) return [];
    const header = lines[0].split(';').map(h => h.trim());
    const rows = lines.slice(1);
    return rows.map(line => {
        const cols = line.split(';');
        const obj = {};
        header.forEach((h,i) => obj[h] = cols[i] ? cols[i].trim() : '');
        return obj;
    });
}

// --- KONFIGURASI URL API (OTOMATIS) ---
function getApiUrl() {
    const hostname = window.location.hostname;
    
    // 1. Jika dibuka di Localhost (Laptop), gunakan server lokal
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000';
    }

    // 2. Jika dibuka di Netlify (Production), gunakan server Railway
    // ⚠️ PENTING: Ganti URL di bawah ini dengan URL Backend Railway Anda setelah deploy!
    return 'https://GANTI-DENGAN-URL-RAILWAY-ANDA.up.railway.app'; 
}

async function fetchStudentsFromAPI() {
    const BASE_URL = getApiUrl(); // Otomatis pilih Local atau Railway
    // console.log(`Menghubungkan ke server: ${BASE_URL}`); // Uncomment jika ingin debugging

    const response = await fetch(`${BASE_URL}/api/students`);
    if (!response.ok) throw new Error('Gagal mengambil data dari server');
    return response.json();
}

async function fetchStudentsFromCSV() {
    // Mencoba mengambil CSV langsung dari folder public
    const paths = ['./public/data/students.csv', './data/students.csv', '/public/data/students.csv', '/src/public/data/students.csv'];
    for (const p of paths) {
        try {
            const resp = await fetch(p);
            if (!resp.ok) continue;
            const text = await resp.text();
            const parsed = parseCsvText(text);
            return parsed;
        } catch (_) { /* try next path */ }
    }
    throw new Error('CSV not accessible via relative path');
}

export async function getUsers() {
    const usersMap = new Map();
    // Default Admin
    usersMap.set('haechan@dicoding.com', { name: "Haechan (Admin)", email: "haechan@dicoding.com" });
    try {
        let allStudents = [];
        try {
            // Prioritas 1: Coba ambil dari API (Railway/Localhost)
            allStudents = await fetchStudentsFromAPI();
        } catch (errApi) {
            // Prioritas 2: Jika API mati/gagal, ambil dari file CSV (Fallback)
            console.warn('API Error, mencoba Fallback CSV...', errApi);
            try {
                allStudents = await fetchStudentsFromCSV();
            } catch (errCsv) {
                console.warn('No API and CSV fallback failed:', errCsv);
            }
        }

        allStudents.forEach(student => {
            if (student.email && student.name) {
                const email = student.email.toLowerCase().trim();
                const name = student.name.trim();
                // include learning_path_id if available so login can persist it
                const learning_path_id = student.learning_path_id ? String(student.learning_path_id).trim() : '';
                usersMap.set(email, { name: name, email, learning_path_id });
            }
        });
    } catch (error) {
        console.error("❌ Gagal memuat data user (getUsers):", error);
    }
    return Array.from(usersMap.values());
}

// --- FUNCTIONS TO ACCESS RAW STUDENT RECORDS AND LEARNING PATHS ---
export async function getStudentRecord(targetEmail) {
    try {
        let allStudents = [];
        try {
            allStudents = await fetchStudentsFromAPI();
        } catch (errApi) {
            try {
                allStudents = await fetchStudentsFromCSV();
            } catch (errCsv) {
                console.warn('Failed to fetch student data for record lookup', errCsv);
            }
        }

        if (!targetEmail) return null;
        const lower = targetEmail.toLowerCase();
        const found = allStudents.find(s => s.email && s.email.toLowerCase().trim() === lower);
        return found || null;
    } catch (error) {
        console.error('Error in getStudentRecord:', error);
        return null;
    }
}

export async function getLearningPaths() {
    const pathsToTry = ['./public/data/learing path.csv', './public/data/LP.csv', '/public/data/learing path.csv', './data/learing path.csv'];
    for (const p of pathsToTry) {
        try {
            const resp = await fetch(p);
            if (!resp.ok) continue;
            const text = await resp.text();
            const parsed = parseCsvText(text);
            return parsed.map(r => ({ learning_path_id: r.learning_path_id ? String(r.learning_path_id).trim() : '', learning_path_name: r.learning_path_name || '' }));
        } catch (err) { /* try next */ }
    }
    console.warn('getLearningPaths: CSV not found in known locations');
    return [];
}

export async function getStudentRecords(targetEmail) {
    try {
        let allStudents = [];
        try {
            allStudents = await fetchStudentsFromAPI();
        } catch (errApi) {
            try {
                allStudents = await fetchStudentsFromCSV();
            } catch (errCsv) {
                console.warn('Failed to fetch student data for records lookup', errCsv);
            }
        }

        if (!targetEmail) return [];
        const lower = targetEmail.toLowerCase();
        const found = allStudents.filter(s => s.email && s.email.toLowerCase().trim() === lower);
        return found;
    } catch (error) {
        console.error('Error in getStudentRecords:', error);
        return [];
    }
}

// --- FUNGSI PENGAMBIL METADATA COURSE ---
async function getCourseMeta() {
    const pathsToTry = ['./public/data/course.csv', './data/course.csv', '/public/data/course.csv'];
    for (const p of pathsToTry) {
        try {
            const resp = await fetch(p);
            if (!resp.ok) continue;
            const text = await resp.text();
            const parsed = parseCsvText(text);
            const courseMap = {};
            parsed.forEach(row => {
                const name = (row.course_name || '').trim();
                const hours = parseFloat(row.hours_to_study) || 0;
                const level = (row.course_level_str || '').trim();
                if (name) courseMap[name] = { hours_to_study: hours, course_level_str: level };
            });
            return courseMap;
        } catch (err) {
            /* try next path */
        }
    }
    return {};
}

// --- FUNGSI PENGAMBIL LEVEL MAPPING ---
async function getCourseLevels() {
    const pathsToTry = ['./public/data/course level.csv', './data/course level.csv', '/public/data/course level.csv'];
    for (const p of pathsToTry) {
        try {
            const resp = await fetch(p);
            if (!resp.ok) continue;
            const text = await resp.text();
            const parsed = parseCsvText(text);
            const levelMap = {};
            parsed.forEach(row => {
                const id = (row.id || '').trim();
                const name = (row.course_level || '').trim();
                if (id && name) levelMap[id] = name;
            });
            return levelMap;
        } catch (err) {
            /* try next path */
        }
    }
    return { '1': 'Dasar', '2': 'Pemula', '3': 'Menengah', '4': 'Mahir', '5': 'Profesional' };
}

// --- FUNGSI PENGAMBIL DATA KURSUS LENGKAP ---
export async function getStudentData(targetEmail) {
    try {
        let allStudents = [];
        try {
            allStudents = await fetchStudentsFromAPI();
        } catch (errApi) {
            try {
                allStudents = await fetchStudentsFromCSV();
            } catch (errCsv) {
                console.warn('Failed to fetch student data from API and CSV fallback', errCsv);
            }
        }

        // Load course metadata and levels
        const courseMeta = await getCourseMeta();
        const courseLevels = await getCourseLevels();
        const lpCourseData = await getLpCourse();
        const courseMap = (lpCourseData && lpCourseData.courseMap) || {};

        // Mapping data API ke struktur aplikasi dengan enrichment
        return allStudents
            .filter(s => s.email && s.email.toLowerCase() === targetEmail.toLowerCase())
            .map(student => {
                const courseName = student.course_name;
                const meta = courseMeta[courseName] || {};
                const lpMeta = courseMap[courseName] || {};
                
                // Resolve level: course.csv level_str -> courseLevels mapping -> default
                let level = meta.course_level_str || lpMeta.course_level_str || '1';
                level = courseLevels[level] || 'Dasar';
                
                // Resolve hours
                const hours = meta.hours_to_study || 0;
                
                // Rating: submission_rating from CSV, fallback to dummy calculation
                let rating = student.submission_rating ? parseInt(student.submission_rating, 10) : 0;
                if (!rating && student.exam_score) {
                    const score = parseFloat(student.exam_score);
                    rating = Math.min(5, Math.ceil(score / 20));
                }
                if (!rating) rating = 0;
                
                return {
                    title: courseName,
                    isCompleted: student.is_graduated === '1',
                    date: student.started_learning_at || "",
                    score: parseFloat(student.exam_score) || 0,
                    active_tutorials: parseInt(student.active_tutorials) || 0,
                    completed_tutorials: parseInt(student.completed_tutorials) || 0,
                    tutorials: parseInt(student.completed_tutorials) || 0,
                    level: level,
                    hours: hours,
                    rating: rating,
                    final_submission_id: student.final_submission_id || '',
                    submission_rating: rating,
                    startDate: student.started_learning_at || "",
                    endDate: ""
                };
            });

    } catch (error) {
        console.error("Error fetching student data (getStudentData):", error);
        return [];
    }
}

// --- FUNGSI UNTUK MEMBACA lp+course.csv DAN MENYUSUN STRUKTUR KURSUS ---
export async function getLpCourse() {
    const pathsToTry = ['./public/data/lp+course.csv', './public/data/lp%2Bcourse.csv', './data/lp+course.csv', '/public/data/lp+course.csv', '/src/public/data/lp+course.csv'];
    for (const p of pathsToTry) {
        try {
            const resp = await fetch(p);
            if (!resp.ok) continue;
            const text = await resp.text();
            const parsed = parseCsvText(text);
            
            const courseMap = new Map();
            const lpCourseOrder = new Map();

            parsed.forEach(row => {
                const lp = (row.learning_path_name || '').trim();
                const course = (row.course_name || '').trim();
                const level = (row.course_level_str || '').trim();
                const tut = (row.tutorial_title || '').trim();
                if (!course) return;

                if (!courseMap.has(course)) courseMap.set(course, { learning_path_name: lp, course_level_str: level, tutorials: [] });
                const entry = courseMap.get(course);
                if (tut && !entry.tutorials.includes(tut)) entry.tutorials.push(tut);

                if (lp) {
                    if (!lpCourseOrder.has(lp)) lpCourseOrder.set(lp, []);
                    const arr = lpCourseOrder.get(lp);
                    if (!arr.includes(course)) arr.push(course);
                }
            });

            const courseObj = {};
            for (const [k, v] of courseMap.entries()) courseObj[k] = v;

            const lpOrderObj = {};
            for (const [k, v] of lpCourseOrder.entries()) lpOrderObj[k] = v;

            return { courseMap: courseObj, lpCourseOrder: lpOrderObj };
        } catch (err) {
            /* try next path */
        }
    }
    console.warn('getLpCourse: lp+course.csv not found in known locations');
    return {};
}

// --- FUNGSI UNTUK MENGAMBIL TUTORIAL BERDASARKAN COURSE NAME ---
export async function getTutorialsByCourseName(courseName) {
    try {
        const { courseMap } = await getLpCourse();
        if (!courseMap || !courseMap[courseName]) {
            console.warn(`Course "${courseName}" not found in courseMap`);
            return [];
        }
        return courseMap[courseName].tutorials || [];
    } catch (error) {
        console.error('Error in getTutorialsByCourseName:', error);
        return [];
    }
}