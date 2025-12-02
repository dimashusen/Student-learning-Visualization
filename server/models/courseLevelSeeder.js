const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CourseLevel = require('../models/course level');

// Muat variabel lingkungan dari file .env
// Pastikan Anda memiliki file .env di root project dengan MONGO_URI
dotenv.config({ path: './config/config.env' });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Terhubung untuk proses seeding...');
    } catch (err) {
        console.error('Koneksi MongoDB gagal:', err.message);
        process.exit(1);
    }
};

const courseLevels = [
    { level_id: 1, name: 'Dasar' },
    { level_id: 2, name: 'Pemula' },
    { level_id: 3, name: 'Menengah' },
    { level_id: 4, name: 'Mahir' },
    { level_id: 5, name: 'Profesional' }
];

const seedData = async () => {
    await connectDB();

    try {
        // Hapus data lama
        await CourseLevel.deleteMany();
        console.log('Data CourseLevel lama berhasil dihapus.');

        // Masukkan data baru
        await CourseLevel.insertMany(courseLevels);
        console.log('Data CourseLevel baru berhasil dimasukkan (seeded).');

        process.exit();
    } catch (err) {
        console.error('Error saat seeding data:', err);
        process.exit(1);
    }
};

seedData();