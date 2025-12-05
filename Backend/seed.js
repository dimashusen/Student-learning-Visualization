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
const CourseLevel = require('./models/CourseLevel');
const LPCourse = require('./models/LPCourse');

async function connectDB() {
  try { await mongoose.connect(MONGO_URI); console.log('✅ Terhubung ke MongoDB Atlas'); }
  catch (err) { console.error('❌ Gagal koneksi database:', err); process.exit(1); }
}

function importCSV(fileName, Model) {
  return new Promise((resolve, reject) => {
    const results = [];
    const filePath = path.join(__dirname, `../Frontend/public/data/${fileName}`);
    console.log(`\n📂 Membaca file: ${fileName} ...`);
    if (!fs.existsSync(filePath)) { console.warn(`⚠️  File TIDAK DITEMUKAN: ${filePath}`); return resolve(); }

    fs.createReadStream(filePath)
      .pipe(csv({ separator: CSV_SEPARATOR, mapHeaders: ({ header }) => header.trim().replace(/^\ufeff/, ''), mapValues: ({ value }) => value ? value.trim() : null }))
      .on('data', (data) => { if (Object.keys(data).length > 0) results.push(data); })
      .on('end', async () => {
        try { if (results.length > 0) { await Model.deleteMany({}); await Model.insertMany(results); console.log(`   ✅ SUKSES: ${results.length} data masuk ke '${Model.modelName}'`); } else { console.warn(`   ⚠️  KOSONG: Tidak ada data di ${fileName}`); } resolve(); }
        catch (err) { console.error(`   ❌ Gagal insert DB (${fileName}):`, err.message); resolve(); }
      })
      .on('error', (err) => { console.error(`   ❌ Error stream file ${fileName}:`, err.message); reject(err); });
  });
}

function importLpCourse(fileName, Model) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, `../Frontend/public/data/${fileName}`);
    console.log(`\n📂 Membaca file: ${fileName} ...`);
    if (!fs.existsSync(filePath)) { console.warn(`⚠️  File TIDAK DITEMUKAN: ${filePath}`); return resolve(); }

    const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const batch = [];
    const BATCH_SIZE = 1000;
    const parser = csv({ separator: CSV_SEPARATOR, mapValues: ({ value }) => value ? value.trim() : null });

    stream.pipe(parser)
      .on('data', async (row) => {
        const lp = row.learning_path_name || row['learning_path_name'] || row[Object.keys(row)[0]];
        const courseName = row.course_name || row['course_name'] || row[Object.keys(row)[1]];
        const level = row.course_level_str || row['course_level_str'] || row[Object.keys(row)[2]];
        const tut = row.tutorial_title || row['tutorial_title'] || row[Object.keys(row)[3]];
        batch.push({ learning_path_name: lp, course_name: courseName, course_level_str: level, tutorial_title: tut });
        if (batch.length >= BATCH_SIZE) { parser.pause(); try { await Model.insertMany(batch.splice(0)); parser.resume(); } catch (err) { parser.destroy(err); } }
      })
      .on('end', async () => { try { if (batch.length) await Model.insertMany(batch); console.log(`   ✅ SUKSES: data masuk ke ${Model.modelName}`); resolve(); } catch (err) { reject(err); } })
      .on('error', (err) => reject(err));
  });
}

async function runSeeding() {
  try {
    await connectDB();
    console.log('🚀 Memulai proses seeding data...');

    await importCSV('course level.csv', CourseLevel);
    await importCSV('learing path.csv', LearningPath);
    await importCSV('course.csv', Course);
    await importCSV('tutorial.csv', Tutorial);

    await LPCourse.deleteMany({});
    await importLpCourse('lp+course.csv', LPCourse);

    await importCSV('students.csv', Student);

    console.log('\n🎉 SELESAI!');
  } catch (err) {
    console.error('❌ Terjadi kesalahan:', err);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Koneksi ditutup.');
    process.exit();
  }
}

runSeeding();
