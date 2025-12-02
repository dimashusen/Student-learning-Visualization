const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// --- KONFIGURASI ---
// Cek file CSV Anda di Notepad/Excel. Jika pemisahnya koma, gunakan ','. Jika titik koma, gunakan ';'.
const CSV_SEPARATOR = ';'; // <--- GANTI INI JIKA MASIH GAGAL (Coba ',' atau ';')

// Koneksi ke MongoDB Atlas
const MONGO_URI = 'mongodb+srv://msadan:474747@students.jpwpnl5.mongodb.net/dicoding_db?retryWrites=true&w=majority&appName=Students';

// Import Model
const Student = require('./models/Student');
const Course = require('./models/Course');
const LearningPath = require('./models/LearningPath');
const Tutorial = require('./models/Tutorial');

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Terhubung ke MongoDB Atlas'))
    .catch(err => { console.error('❌ Gagal koneksi:', err); process.exit(1); });

const importCSV = (fileName, Model) => {
    return new Promise((resolve, reject) => {
        const results = [];
        const filePath = path.join(__dirname, `../src/public/data/${fileName}`);

        console.log(`\n📂 Membaca file: ${fileName} ...`);

        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️  File TIDAK DITEMUKAN: ${filePath}`);
            resolve();
            return;
        }

        fs.createReadStream(filePath)
            .pipe(csv({
                separator: CSV_SEPARATOR,
                mapHeaders: ({ header }) => header.trim().replace(/^\ufeff/, ''), // Hapus BOM & Spasi
                mapValues: ({ value }) => value ? value.trim() : null // Bersihkan spasi di data
            }))
            .on('data', (data) => {
                results.push(data);
            })
            .on('end', async () => {
                try {
                    // --- DIAGNOSTIK: LOG DATA PERTAMA ---
                    if (results.length > 0) {
                        console.log(`   🔍 Cek Sampel Data Pertama (${Model.modelName}):`);
                        console.log(JSON.stringify(results[0], null, 2)); // Tampilkan data agar Anda bisa cek
                    }
                    
                    if (results.length === 0) {
                        console.warn(`   ⚠️  PERINGATAN: Tidak ada data terbaca! Coba ganti separator di kodingan.`);
                    } else if (Object.keys(results[0]).length <= 1) {
                        console.warn(`   ⚠️  PERINGATAN: Kolom tidak terdeteksi dengan benar! Data terlihat menyatu. Ganti CSV_SEPARATOR.`);
                    } else {
                        // Hapus data lama & Insert baru
                        await Model.deleteMany({});
                        await Model.insertMany(results);
                        console.log(`   ✅ SUKSES: ${results.length} data masuk ke ${Model.modelName}`);
                    }
                    resolve();
                } catch (error) {
                    console.error(`   ❌ Gagal menyimpan ke DB:`, error.message);
                    reject(error);
                }
            })
            .on('error', (err) => {
                console.error(`   ❌ Error membaca file:`, err.message);
                reject(err);
            });
    });
};

const runSeeding = async () => {
    try {
        console.log('🚀 Memulai proses seeding data...');
        
        // Pastikan nama file di sini SAMA PERSIS dengan nama file di folder Anda
        // Gunakan seeder gabungan lp+course untuk membuat LearningPath, Course, Tutorial dari satu CSV
        const seedLpCourse = require('./lp+course');
        await seedLpCourse();

        // Jika Anda masih punya file tutorial.csv terpisah, Anda bisa mengimportnya juga.
        // Namun lp+course.csv sudah menyertakan tutorial, jadi kita lanjut ke students.
        await importCSV('students.csv', Student);
        
        console.log('\n🎉 SELESAI! Tekan Ctrl + C untuk keluar jika tidak otomatis.');
        process.exit();
    } catch (error) {
        console.error('❌ Terjadi kesalahan fatal:', error);
        process.exit(1);
    }
};

runSeeding();