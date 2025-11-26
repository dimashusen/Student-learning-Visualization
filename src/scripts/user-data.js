// Database Siswa dari CSV
export async function getUsers() {
    const usersMap = new Map();
    // User Default (Admin)
    usersMap.set('haechan@dicoding.com', { name: "Haechan (Admin)", email: "haechan@dicoding.com" });

    try {
        console.log("🔄 Mengambil data CSV terbaru...");
        // Tambahkan timestamp (?v=...) agar browser TIDAK menggunakan cache lama
        const response = await fetch(`./public/data/students.csv?v=${new Date().getTime()}`);
        
        if (!response.ok) throw new Error(`Gagal akses CSV: ${response.status}`);

        const csvText = await response.text();
        const rows = csvText.split(/\r?\n/);

        if (rows.length === 0) throw new Error("File CSV kosong!");

        // --- 1. DETEKSI PEMISAH (Koma atau Titik Koma?) ---
        const firstLine = rows[0];
        const delimiter = firstLine.includes(';') ? ';' : ',';
        console.log(`ℹ️ Terdeteksi pemisah CSV: "${delimiter}"`);

        // --- 2. CARI INDEKS KOLOM ---
        // Kita cari kolom mana yang berisi 'name' dan 'email'
        const headers = firstLine.toLowerCase().split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
        
        // Cari index kolom yang mengandung kata 'email' dan 'name'/'nama'
        const emailIdx = headers.findIndex(h => h.includes('email'));
        const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('nama'));

        if (emailIdx === -1) {
            console.error("❌ Kolom EMAIL tidak ditemukan di Header CSV!", headers);
        } else {
            // --- 3. PARSING BARIS DEMI BARIS ---
            // Mulai dari baris ke-1 (baris 0 adalah header)
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i].trim();
                if (!row) continue;

                // Split data menggunakan fungsi aman (menangani tanda kutip)
                const cols = parseCSVLine(row, delimiter);

                if (cols.length > emailIdx) {
                    const rawEmail = cols[emailIdx];
                    const rawName = nameIdx !== -1 ? cols[nameIdx] : "Student";

                    // Bersihkan data
                    const email = rawEmail.replace(/["']/g, '').trim().toLowerCase();
                    const name = rawName.replace(/["']/g, '').trim();

                    if (email && email.includes('@')) {
                        usersMap.set(email, { name, email });
                    }
                }
            }
        }

        console.log(`✅ SUKSES MEMUAT: ${usersMap.size} user.`);
        
        // DEBUG: Cetak semua email ke console agar bisa dicek manual
        console.groupCollapsed("📋 Daftar Email Terdaftar (Klik untuk buka)");
        console.table(Array.from(usersMap.keys()));
        console.groupEnd();

    } catch (error) {
        console.error("❌ Gagal memuat CSV:", error);
    }

    return Array.from(usersMap.values());
}

// Fungsi Pembantu: Memecah baris CSV dengan aman (menangani koma dalam kutip)
function parseCSVLine(text, delimiter) {
    const result = [];
    let current = '';
    let inQuote = false;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === delimiter && !inQuote) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}