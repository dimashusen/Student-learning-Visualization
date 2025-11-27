const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors()); // Izinkan akses dari frontend

// Endpoint API untuk data siswa
app.get('/api/students', (req, res) => {
    const results = [];
    // Arahkan path ke lokasi file CSV yang ada di folder src/public/data
    const csvPath = path.join(__dirname, '../src/public/data/students.csv');

    fs.createReadStream(csvPath)
        .pipe(csv({ separator: ';' })) // PENTING: Gunakan titik koma sesuai format CSV Anda
        .on('data', (data) => results.push(data))
        .on('end', () => {
            res.json(results); // Kirim hasil sebagai JSON
        })
        .on('error', (err) => {
            console.error(err);
            res.status(500).json({ error: 'Gagal membaca data CSV' });
        });
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});