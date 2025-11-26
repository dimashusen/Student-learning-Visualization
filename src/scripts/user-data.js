// Database Siswa dari CSV
export async function getUsers() {
    const usersMap = new Map();
    // User Default (Admin)
    usersMap.set('haechan@dicoding.com', { name: "Haechan (Admin)", email: "haechan@dicoding.com" });

    try {
        // Fetch data dengan timestamp agar tidak cache
        const response = await fetch(`./public/data/students.csv?v=${new Date().getTime()}`);
        if (!response.ok) throw new Error(`Gagal akses CSV: ${response.status}`);

        const csvText = await response.text();
        const rows = csvText.split(/\r?\n/);

        if (rows.length === 0) throw new Error("File CSV kosong!");

        const firstLine = rows[0];
        const delimiter = firstLine.includes(';') ? ';' : ',';
        const headers = firstLine.toLowerCase().split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
        
        const emailIdx = headers.findIndex(h => h.includes('email'));
        const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('nama'));

        if (emailIdx !== -1) {
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i].trim();
                if (!row) continue;
                const cols = parseCSVLine(row, delimiter);
                if (cols.length > emailIdx) {
                    const rawEmail = cols[emailIdx];
                    const rawName = nameIdx !== -1 ? cols[nameIdx] : "Student";
                    
                    const email = rawEmail.replace(/["']/g, '').trim().toLowerCase();
                    const name = rawName.replace(/["']/g, '').trim();

                    if (email && email.includes('@')) {
                        usersMap.set(email, { name, email });
                    }
                }
            }
        }
    } catch (error) {
        console.error("❌ Gagal memuat CSV:", error);
    }
    return Array.from(usersMap.values());
}

// --- FUNGSI PENGAMBIL DATA LENGKAP PER SISWA ---
export async function getStudentData(targetEmail) {
    try {
        const response = await fetch(`./public/data/students.csv?v=${new Date().getTime()}`);
        if (!response.ok) return [];
        
        const csvText = await response.text();
        const rows = csvText.split(/\r?\n/);
        if (rows.length === 0) return [];

        const firstLine = rows[0];
        const delimiter = firstLine.includes(';') ? ';' : ',';
        const headers = firstLine.toLowerCase().split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));

        // Index Kolom Penting
        const emailIdx = headers.findIndex(h => h.includes('email'));
        const courseIdx = headers.findIndex(h => h.includes('course_name'));
        const gradIdx = headers.findIndex(h => h.includes('is_graduated')); // 1 = lulus
        const dateIdx = headers.findIndex(h => h.includes('started_learning_at'));
        const scoreIdx = headers.findIndex(h => h.includes('exam_score'));
        const tutorIdx = headers.findIndex(h => h.includes('completed_tutorials'));

        if (emailIdx === -1 || courseIdx === -1) return [];

        const studentCourses = [];

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i].trim();
            if (!row) continue;
            
            const cols = parseCSVLine(row, delimiter);
            const rowEmail = cols[emailIdx]?.replace(/["']/g, '').trim().toLowerCase();

            // Filter hanya data milik user yang sedang login
            if (rowEmail === targetEmail.toLowerCase()) {
                const title = cols[courseIdx]?.replace(/["']/g, '').trim();
                const isCompleted = cols[gradIdx]?.trim() === '1';
                const dateRaw = dateIdx !== -1 ? cols[dateIdx]?.replace(/["']/g, '').trim() : "";
                
                // Parsing Nilai & Tutorial
                let score = 0;
                if(scoreIdx !== -1) {
                    const s = cols[scoreIdx]?.replace(/["']/g, '').trim();
                    score = parseFloat(s) || 0;
                }

                let tutorials = 0;
                if(tutorIdx !== -1) {
                    const t = cols[tutorIdx]?.replace(/["']/g, '').trim();
                    tutorials = parseInt(t) || 0;
                }

                studentCourses.push({
                    title: title,
                    isCompleted: isCompleted,
                    date: dateRaw,
                    score: score,
                    tutorials: tutorials
                });
            }
        }
        return studentCourses;

    } catch (error) {
        console.error("Error fetching student data:", error);
        return [];
    }
}

// Helper Parsing CSV
function parseCSVLine(text, delimiter) {
    const result = [];
    let current = '';
    let inQuote = false;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') { inQuote = !inQuote; }
        else if (char === delimiter && !inQuote) { result.push(current); current = ''; }
        else { current += char; }
    }
    result.push(current);
    return result;
}