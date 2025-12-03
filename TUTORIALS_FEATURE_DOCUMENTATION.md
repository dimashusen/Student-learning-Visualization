# Dokumentasi Fitur Tutorials Page

## Perubahan yang Dilakukan (Update v2.0)

### 1. **File Baru: `tutorials-page.js`** (Updated)
**Lokasi:** `/workspaces/Student-learning-Visualization/src/scripts/pages/tutorials/tutorials-page.js`

Halaman yang menampilkan daftar tutorial untuk kursus yang sedang diambil dengan data **sinkron dari CSV**. Fitur:
- **Tab "Active Tutorials"**: Menampilkan tutorial yang masih dalam progress
- **Tab "Completed Tutorials"**: Menampilkan tutorial yang sudah selesai
- **Real Data Integration**: Menggunakan data tutorial aktual dari `lp+course.csv`
- Setiap tutorial menampilkan:
  - Icon status (play icon untuk active, check icon untuk completed)
  - Nama tutorial (dari CSV, bukan generated)
  - Status (In Progress / Completed)
  - Tombol "Continue" untuk active tutorials atau "Review" untuk completed tutorials

### 2. **Function Baru di `user-data.js`**
**Function:** `getTutorialsByCourseName(courseName)`

```javascript
export async function getTutorialsByCourseName(courseName) {
    try {
        const { courseMap } = await getLpCourse();
        if (!courseMap || !courseMap[courseName]) {
            console.warn(`Course "${courseName}" not found in courseMap`);
            return [];
        }
        return courseMap[courseName].tutorials || [];
    } catch (error) {
        console.error('Error in getTutorialsByCourseName:', error);
        return [];
    }
}
```

**Fungsi:**
- Mengambil daftar tutorial dari course name yang diberikan
- Menggunakan data dari `lp+course.csv` yang sudah di-parse menjadi `courseMap`
- Return array tutorial titles yang sesuai dengan course

### 3. **Sinkronisasi Data Tutorial**

#### Alur Data:
```
CSV File (lp+course.csv)
    ↓
getLpCourse() - Parse dan build courseMap
    ↓
courseMap { course_name -> { tutorials: [...] } }
    ↓
getTutorialsByCourseName(courseName)
    ↓
Tutorial titles array
    ↓
tutorials-page.js renders dengan active/completed split
```

#### Mapping Tutorial:
- `active_tutorials`: Jumlah tutorial yang masih dalam progress
- `completed_tutorials`: Jumlah tutorial yang sudah selesai
- Tutorial diambil dari `lp+course.csv` sesuai urutan
- Pembagian: completed pertama, active sisanya

**Contoh:**
```
Course: "Belajar Dasar AI"
Total tutorials di CSV: 39 tutorial
Student data: active_tutorials=5, completed_tutorials=3

Maka:
- Completed tutorials (pertama 3): 
  1. Taksonomi AI
  2. [Story] Machine Learning: Harapan menjadi kenyataan
  3. Rangkuman Kelas

- Active tutorials (3 selanjutnya):
  4. Tipe-Tipe Machine Learning
  5. Forum Diskusi
  6. Kriteria Data untuk AI
  (dst sampai 5 tutorial)
```

### 4. **Update `index.html`**
- Import `TutorialsPage` component
- Menambahkan route `/tutorials`

### 5. **Update `my-progress-page.js`**
- Tombol "Continue" mengarah ke `#/tutorials?title=...`

### 6. **Update `course-page.js`**
- Tombol "Continue Learning" mengarah ke `#/tutorials?title=...`

## Keunggulan Implementasi v2.0

1. ✅ **Real Data Synchronization**: Tutorial names sesuai dengan data di CSV
2. ✅ **Course-Tutorial Mapping**: Setiap course memiliki tutorial list yang tepat
3. ✅ **Dynamic Content**: Tidak ada hardcoded tutorial names, semua dari CSV
4. ✅ **Active/Completed Split**: Menggunakan data `active_tutorials` dan `completed_tutorials` dari student record
5. ✅ **Scalable**: Mudah menambah/mengubah tutorials di CSV tanpa update code
6. ✅ **Consistent**: Tutorial order sama dengan CSV source

## Data Flow Diagram

```
1. User Login
   ↓
2. Navigate to My Progress
   ↓
3. Click "Continue" on Course
   ↓
4. Load Tutorials Page
   - Fetch student data (active_tutorials, completed_tutorials)
   - Fetch tutorials from getTutorialsByCourseName()
   ↓
5. Render Tabs
   - Active Tutorials Tab (dari index active_tutorials ke depan)
   - Completed Tutorials Tab (dari awal sampai completed_tutorials)
   ↓
6. Display Real Tutorial Names from CSV
```

## Testing Checklist

Untuk testing, lakukan:
1. ✅ Buka aplikasi di `http://localhost:3000`
2. ✅ Login dengan salah satu akun student dari CSV
3. ✅ Pergi ke **Dashboard → My Progress**
4. ✅ Klik **"Continue"** pada salah satu kursus
5. ✅ Verifikasi halaman Tutorials muncul
6. ✅ Verifikasi tutorial names sesuai dengan lp+course.csv
7. ✅ Verifikasi Active Tutorials menampilkan sejumlah `active_tutorials`
8. ✅ Verifikasi Completed Tutorials menampilkan sejumlah `completed_tutorials`
9. ✅ Alternatif: Buka halaman Course detail dan klik **"Continue Learning"**
10. ✅ Verifikasi tutorial list sama

## Contoh Output di Browser

**Course: "Memulai Pemrograman dengan Python"**
- Active tutorials: 91
- Completed tutorials: 91

Tab "Active Tutorials" akan kosong (0 tutorials)
Tab "Completed Tutorials" akan menampilkan 91 tutorial pertama

**Course: "Belajar Dasar AI"**
- Active tutorials: 39
- Completed tutorials: 0

Tab "Active Tutorials" akan menampilkan 39 tutorial
Tab "Completed Tutorials" akan kosong (0 tutorials)



