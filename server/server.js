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
    // Jika file CSV tidak ada, tangani lebih baik dan kembalikan JSON kosong
    if (!fs.existsSync(csvPath)) {
        console.warn('⚠️ CSV file not found at', csvPath);
        // Response with empty array so frontend can continue gracefully
        return res.json([]);
    }

    fs.createReadStream(csvPath, { encoding: 'utf8' })
        .pipe(csv({ separator: ';' })) // PENTING: Gunakan titik koma sesuai format CSV Anda
        .on('data', (data) => {
            // Bersihkan BOM jika ada di field name
            const cleanedData = {};
            for (let key in data) {
                let cleanKey = key.replace(/^\ufeff/, ''); // Hapus BOM
                cleanedData[cleanKey] = data[key];
            }
            results.push(cleanedData);
        })
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