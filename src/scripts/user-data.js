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
            if (student.email) {
                const email = student.email.toLowerCase().trim();
                const name = student.name || student.fullname || (student.name && student.name.trim()) || (student.title || 'Student');
                usersMap.set(email, { name: name.trim ? name.trim() : name, email });
            }
        });
    } catch (error) {
        console.error("❌ Gagal memuat data user (getUsers):", error);
    }
    return Array.from(usersMap.values());
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