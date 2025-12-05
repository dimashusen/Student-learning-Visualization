require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// --- KONFIGURASI ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://msadan:474747@students.jpwpnl5.mongodb.net/dicoding_db?retryWrites=true&w=majority&appName=Students';
const CSV_SEPARATOR = ';'; 

// --- IMPORT MODEL ---
const Student = require('./models/Student');
const Course = require('./models/Course');
const LearningPath = require('./models/LearningPath');
const Tutorial = require('./models/Tutorial');

// [BARU] Import Model untuk file baru
// Pastikan Anda sudah membuat file schema-nya di folder models!
const CourseLevel = require('./models/CourseLevel'); 
const LPCourse = require('./models/LPCourse'); // Model untuk file 'LP+course.csv'

// --- KONEKSI DATABASE ---
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Terhubung ke MongoDB Atlas');
    } catch (err) {
        console.error('❌ Gagal koneksi database:', err);
        process.exit(1);
    }
};

// --- FUNGSI IMPORT CSV ---
const importCSV = (fileName, Model) => {
    return new Promise((resolve, reject) => {
        const results = [];
        const filePath = path.join(__dirname, '../src/public/data', fileName);

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
                mapValues: ({ value }) => {
                    if (!value) return null;
                    const cleanValue = value.trim();
                    return isNaN(Number(cleanValue)) ? cleanValue : Number(cleanValue);
                }
            }))
            .on('data', (data) => {
                if (Object.keys(data).length > 0) results.push(data);
            })
            .on('end', async () => {
                try {
                    if (results.length > 0) {
                        await Model.deleteMany({}); // Reset collection
                        await Model.insertMany(results);
                        console.log(`   ✅ SUKSES: ${results.length} data masuk ke '${Model.modelName}'`);
                    } else {
                        console.warn(`   ⚠️  KOSONG: Tidak ada data di ${fileName}`);
                    }
                    resolve();
                } catch (error) {
                    console.error(`   ❌ Gagal insert DB (${fileName}):`, error.message);
                    resolve(); 
                }
            })
            .on('error', (err) => {
                console.error(`   ❌ Error stream file ${fileName}:`, err.message);
                reject(err);
            });
    });
};

// --- EKSEKUSI UTAMA ---
const runSeeding = async () => {
    await connectDB();

    console.log('🚀 Memulai proses seeding data...');

    try {
        // 1. Data Master / Referensi
        await importCSV('learing path.csv', LearningPath);
        await importCSV('course level.csv', CourseLevel); // [BARU] Course Level
        
        // 2. Data Utama
        await importCSV('course.csv', Course);
        await importCSV('tutorial.csv', Tutorial);
        
        // 3. Data Relasi / Mapping
        await importCSV('LP+course.csv', LPCourse); // [BARU] LP + Course mapping
        
        // 4. Data Transaksi / User
        // Menggunakan students.csv karena lebih sesuai untuk data user dibanding LP.csv
        await importCSV('students.csv', Student); 

        console.log('\n🎉 SEMUA PROSES SELESAI!');
    } catch (error) {
        console.error('❌ Terjadi kesalahan:', error);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Koneksi ditutup.');
        process.exit();
    }z
};

runSeeding();