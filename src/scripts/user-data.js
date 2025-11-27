// --- FUNGSI AMBIL USER UNTUK LOGIN ---
export async function getUsers() {
    const usersMap = new Map();
    // Default Admin
    usersMap.set('haechan@dicoding.com', { name: "Haechan (Admin)", email: "haechan@dicoding.com" });

    try {
        // Fetch ke SERVER LOKAL (bukan file CSV langsung)
        const response = await fetch('http://localhost:3000/api/students');
        if (!response.ok) throw new Error("Gagal mengambil data dari server");
        
        const allStudents = await response.json();

        allStudents.forEach(student => {
            if (student.email) {
                const email = student.email.toLowerCase().trim();
                const name = student.name ? student.name.trim() : "Student";
                usersMap.set(email, { name, email });
            }
        });
    } catch (error) {
        console.error("❌ Gagal memuat data user:", error);
    }
    return Array.from(usersMap.values());
}

// --- FUNGSI PENGAMBIL DATA KURSUS LENGKAP ---
export async function getStudentData(targetEmail) {
    try {
        const response = await fetch('http://localhost:3000/api/students');
        if (!response.ok) throw new Error("Gagal mengambil data dari server");
        
        const allStudents = await response.json(); 

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
                tutorials: parseInt(student.completed_tutorials) || 0
            }));

    } catch (error) {
        console.error("Error fetching student data from API:", error);
        return [];
    }
}