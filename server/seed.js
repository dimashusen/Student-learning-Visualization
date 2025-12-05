const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// --- KONFIGURASI ---
const CSV_SEPARATOR = ';'; 

// URI Database
const MONGO_URI = 'mongodb+srv://msadan:474747@students.jpwpnl5.mongodb.net/dicoding_db?retryWrites=true&w=majority&appName=Students';

// --- IMPORT MODEL ---
const Student = require('./models/Student');
const Course = require('./models/Course');
const LearningPath = require('./models/LearningPath');
const Tutorial = require('./models/Tutorial');
const CourseLevel = require('./models/CourseLevel'); 

// Koneksi ke Database
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Terhubung ke MongoDB Atlas'))
    .catch(err => { 
        console.error('❌ Gagal koneksi:', err); 
        process.exit(1); 
    });

// Fungsi Import Generic
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
                mapHeaders: ({ header }) => header.trim().replace(/^\ufeff/, ''), 
                mapValues: ({ value }) => value ? value.trim() : null
            }))
            .on('data', (data) => {
                if (Object.keys(data).length > 0) {
                    results.push(data);
                }
            })
            .on('end', async () => {
                try {
                    if (results.length > 0) {
                        await Model.deleteMany({});
                        await Model.insertMany(results);
                        console.log(`   ✅ SUKSES: ${results.length} data masuk ke '${Model.modelName}'`);
                    } else {
                        console.warn(`   ⚠️  KOSONG: Tidak ada data di ${fileName}`);
                    }
                    resolve();
                } catch (error) {
                    console.error(`   ❌ Gagal simpan DB (${fileName}):`, error.message);
                    reject(error);
                }
            })
            .on('error', (err) => {
                console.error(`   ❌ Error baca file ${fileName}:`, err.message);
                reject(err);
            });
    });
};

// Fungsi Eksekusi Utama
const runSeeding = async () => {
    try {
        console.log('🚀 Memulai proses seeding data...');
        
        await importCSV('learing path.csv', LearningPath); 
        await importCSV('course level.csv', CourseLevel);
        await importCSV('course.csv', Course);
        await importCSV('tutorial.csv', Tutorial);
        await importCSV('LP.csv', Student);
        
        console.log('\n🎉 SEMUA PROSES SELESAI! Tekan Ctrl + C untuk keluar.');
        process.exit();
    } catch (error) {
        console.error('❌ Terjadi kesalahan fatal:', error);
        process.exit(1);
    }
};

runSeeding();