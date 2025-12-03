# Update My Progress - Data Synchronization

## Ringkasan Perubahan

Halaman "My Progress" telah diperbarui untuk menampilkan data yang lebih lengkap dan tersinkronisasi dengan CSV files. Berikut adalah perubahan yang dilakukan:

## Fitur Baru

### 1. **Sinkronisasi Course Level**
- Membaca `course level.csv` untuk mapping level ID (1,2,3,4,5) ke nama level (Dasar, Pemula, Menengah, Mahir, Profesional)
- Membaca `course.csv` untuk mapping `course_name` ke `course_level_str` (ID level)
- Menampilkan level course di bagian In Progress

### 2. **Perhitungan Progress Otomatis**
- Progress percentage dihitung berdasarkan perbandingan `completed_tutorials` / `active_tutorials`
- Formula: `Math.round((completed_tutorials / active_tutorials) * 100)`

### 3. **Informasi Tutorial Terperinci**
Bagian In Progress kini menampilkan:
```
Tutorial: X/Y
```
Dimana:
- `X` = Jumlah tutorial yang sudah diselesaikan (`completed_tutorials`)
- `Y` = Total tutorial yang aktif (`active_tutorials`)

### 4. **Penghapusan Placeholder Course**
- Menghapus hardcoded list DEFAULT_IN_PROGRESS_COURSES
- Hanya menampilkan course yang benar-benar ada di data student

## Struktur Data yang Digunakan

### Dari `students.csv`:
- `course_name`: Nama course
- `is_graduated`: Status kelulusan (1 = completed, 0 = in progress)
- `active_tutorials`: Jumlah tutorial aktif
- `completed_tutorials`: Jumlah tutorial yang sudah diselesaikan
- `exam_score`: Skor ujian akhir

### Dari `course.csv`:
- `course_name`: Nama course
- `course_level_str`: ID level course (1-5)

### Dari `course level.csv`:
- `id`: ID level (1-5)
- `course_level`: Nama level (Dasar, Pemula, Menengah, Mahir, Profesional)

## Visualisasi di UI

### In Progress Course Item:
```
┌─────────────────────────────────────────────┐
│ 📖 Course Title [Level Badge]               │
│    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 65%     │
│    Tutorial: 45/70                          │
│                              [Continue ▶]  │
└─────────────────────────────────────────────┘
```

## File yang Diubah

### `/src/scripts/pages/my-progress/my-progress-page.js`

**Fungsi Baru:**
- `parseCsvText()`: Helper untuk parse CSV dengan delimiter semicolon
- `getCourseLevels()`: Mengambil data dari course level.csv
- `getCourseData()`: Mengambil data mapping course dengan level

**Perubahan di `afterRender()`:**
1. Load course level mappings
2. Enhance course data dengan level information
3. Calculate progress berdasarkan tutorial data
4. Simplified rendering tanpa placeholder

**Perubahan di `renderInProgress()`:**
1. Tampilkan level badge
2. Tampilkan progress bar
3. **NEW**: Tampilkan tutorial info (completed/active)

## Cara Kerja Sinkronisasi

```
1. User membuka My Progress
   ↓
2. Ambil data student dari students.csv (via getStudentData)
   - course_name
   - is_graduated
   - active_tutorials
   - completed_tutorials
   ↓
3. Ambil mapping course level dari course.csv
   - course_name → course_level_str (ID)
   ↓
4. Ambil mapping level ID ke nama level dari course level.csv
   - ID (1,2,3,4,5) → nama level
   ↓
5. Enhance data dengan level dan calculated progress
   ↓
6. Pisahkan ke In Progress dan Completed
   ↓
7. Render di UI dengan informasi lengkap
```

## Testing

Untuk memverifikasi data synchronization:

1. Buka halaman My Progress
2. Periksa tab "In Progress" menampilkan course dengan:
   - ✅ Nama course yang benar
   - ✅ Level badge yang sesuai
   - ✅ Progress percentage yang dihitung dengan benar
   - ✅ Tutorial info (X/Y)
3. Periksa tab "Completed" menampilkan course yang is_graduated = 1

## Notes

- File CSV harus memiliki format yang tepat (delimiter = semicolon)
- Path CSV file dicoba dari multiple locations untuk compatibility
- Jika course_level_str tidak ditemukan, default level = "Dasar"
- Data real-time diambil dari CSV, bukan hardcoded
