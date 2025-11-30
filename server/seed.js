const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Import Semua Model
const Student = require('./models/Student');
const Course = require('./models/Course');
const LearningPath = require('./models/LearningPath');
const Tutorial = require('./models/Tutorial');

// Koneksi ke MongoDB Atlas
const MONGO_URI = 'mongodb+srv://msadan:474747@students.jpwpnl5.mongodb.net/dicoding_db?retryWrites=true&w=majority&appName=Students';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Terhubung ke MongoDB Atlas'))
  .catch(err => { console.error('❌ Gagal koneksi:', err); process.exit(1); });

// Fungsi Import CSV
const importCSV = (fileName, Model) => {
    return new Promise((resolve, reject) => {
        const results = [];
        const filePath = path.join(__dirname, `../src/public/data/${fileName}`);
        
        console.log(`📂 Membaca ${fileName}...`);

        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️  File ${fileName} tidak ditemukan di ${filePath}`);
            resolve();
            return;
        }

        fs.createReadStream(filePath)
            .pipe(csv({ separator: ';' })) // Menggunakan titik koma (;) sesuai file Anda
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    if (results.length > 0) {
                        await Model.deleteMany({}); // Hapus data lama agar bersih
                        await Model.insertMany(results); // Masukkan data baru
                        console.log(`✅ Sukses import ${results.length} data ke koleksi ${Model.modelName}`);
                    } else {
                        console.log(`⚠️  File ${fileName} kosong.`);
                    }
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
            .on('error', (err) => reject(err));
    });
};

const runSeeding = async () => {
    try {
        console.log('🚀 Memulai proses seeding data...');
        
        // Urutan Import
        await importCSV('learing path.csv', LearningPath); // Nama file sesuai upload
        await importCSV('course.csv', Course);
        await importCSV('tutorial.csv', Tutorial);         // Nama file sesuai upload (singular)
        await importCSV('students.csv', Student);          // Nama file sesuai upload (plural)
        
        console.log('🎉 SEMUA DATA BERHASIL DIIMPOR!');
        process.exit();
    } catch (error) {
        console.error('❌ Terjadi kesalahan seeding:', error);
        process.exit(1);
    }
};

runSeeding();