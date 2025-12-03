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

async function fetchStudentsFromAPI() {
    const response = await fetch('http://localhost:3000/api/students');
    if (!response.ok) throw new Error('Gagal mengambil data dari server');
    return response.json();
}

async function fetchStudentsFromCSV() {
    // Try to fetch the CSV directly from public folder.
    // When served via a static server, the path is '/public/data/students.csv' from the 'src' folder.
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
            allStudents = await fetchStudentsFromAPI();
        } catch (errApi) {
            // If API fails, fallback to CSV in public folder
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
    // Try common locations for the learning path CSV (note the repo file is named 'learing path.csv')
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

        // Mapping data API ke struktur aplikasi
        return allStudents
            .filter(s => s.email && s.email.toLowerCase() === targetEmail.toLowerCase())
            .map(student => ({
                title: student.course_name,
                // Logika konversi '1' menjadi true untuk status lulus
                isCompleted: student.is_graduated === '1',
                date: student.started_learning_at || "",
                score: parseFloat(student.exam_score) || 0,
                active_tutorials: parseInt(student.active_tutorials) || 0,
                completed_tutorials: parseInt(student.completed_tutorials) || 0,
                tutorials: parseInt(student.completed_tutorials) || 0,
                // Additional fields to support final submission and rating
                final_submission_id: student.final_submission_id || '',
                submission_rating: student.submission_rating ? parseInt(student.submission_rating, 10) : 0
            }));

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
            // Build two structures:
            // 1) courseMap: course_name -> { learning_path_name, course_level_str, tutorials }
            // 2) lpCourseOrder: learning_path_name -> [ course_name (in file order) ]
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