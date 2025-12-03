# 📚 CSV Data Structure Reference

## Overview

Di halaman My Progress, ada 3 CSV files utama yang digunakan untuk sinkronisasi data:

---

## 1. 📋 `students.csv` - Student Learning Data

**Lokasi**: `src/public/data/students.csv`

### Struktur:
```csv
name;email;course_name;learning_path_id;active_tutorials;completed_tutorials;is_graduated;...
```

### Field Penting untuk My Progress:
| Field | Type | Deskripsi | Contoh |
|-------|------|-----------|---------|
| `email` | string | Email student (unique identifier) | `ari.agustina15@example.com` |
| `course_name` | string | Nama course | `Belajar Fundamental Deep Learning` |
| `active_tutorials` | number | Total tutorial yang aktif | `131` |
| `completed_tutorials` | number | Tutorial yang sudah selesai | `67` |
| `is_graduated` | 0/1 | Status kelulusan (0=In Progress, 1=Completed) | `1` |
| `exam_score` | number | Skor ujian akhir | `85` |
| `started_learning_at` | date | Tanggal mulai belajar | `4/15/2025 19:40:26` |

### Contoh Data:
```csv
name;email;course_name;learning_path_id;active_tutorials;completed_tutorials;is_graduated;...
Ari Agustina;ari.agustina15@example.com;Belajar Fundamental Deep Learning;1;131;67;1;...
Ari Utama;ari.utama255@example.com;Memulai Pemrograman dengan Python;1;91;91;1;...
```

### Usage di My Progress:
```javascript
const courses = await getStudentData(user.email);
// Returns array of student's courses dengan field di atas
```

---

## 2. 📚 `course.csv` - Course Level Mapping

**Lokasi**: `src/public/data/course.csv`

### Struktur:
```csv
course_id;learning_path_id;course_name;course_level_str;hours_to_study
```

### Field Penting untuk My Progress:
| Field | Type | Deskripsi | Contoh |
|-------|------|-----------|---------|
| `course_name` | string | Nama course (key untuk mapping) | `Belajar Dasar AI` |
| `course_level_str` | number | ID level course (1-5) | `1` |
| `hours_to_study` | number | Jam yang diperlukan | `10` |

### Contoh Data:
```csv
course_id;learning_path_id;course_name;course_level_str;hours_to_study
1;1;Belajar Dasar AI;1;10
2;1;Belajar Fundamental Deep Learning;3;110
3;1;Belajar Machine Learning untuk Pemula;2;90
4;1;Machine Learning Terapan;4;80
```

### Level ID Mapping:
| ID | Level | Deskripsi |
|----|-------|-----------|
| 1 | Dasar | Pemula/Fundamental |
| 2 | Pemula | Beginner Level |
| 3 | Menengah | Intermediate |
| 4 | Mahir | Advanced |
| 5 | Profesional | Expert Level |

### Usage di My Progress:
```javascript
const courseNameToLevelId = await getCourseData();
// Returns: { 'Belajar Dasar AI': '1', 'Belajar Fundamental Deep Learning': '3', ... }
```

---

## 3. 🏷️ `course level.csv` - Level Name Reference

**Lokasi**: `src/public/data/course level.csv`

### Struktur:
```csv
id;course_level
```

### Fields:
| Field | Type | Deskripsi | Contoh |
|-------|------|-----------|---------|
| `id` | number | Level ID (1-5) | `1` |
| `course_level` | string | Nama level | `Dasar` |

### Contoh Data:
```csv
id;course_level
1;Dasar
2;Pemula
3;Menengah
4;Mahir
5;Profesional
```

### Usage di My Progress:
```javascript
const courseLevels = await getCourseLevels();
// Returns: { '1': 'Dasar', '2': 'Pemula', '3': 'Menengah', '4': 'Mahir', '5': 'Profesional' }
```

---

## 🔄 Data Mapping Process

### Flow:

```
Step 1: Get Student Course
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
students.csv (filter by email)
  ↓
  {
    course_name: "Belajar Dasar AI",
    active_tutorials: 39,
    completed_tutorials: 39,
    is_graduated: 1,
    ...
  }

Step 2: Get Level ID for This Course
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
course.csv (lookup by course_name)
  ↓
  course_level_str: "1"

Step 3: Convert Level ID to Level Name
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
course level.csv (lookup by id)
  ↓
  course_level: "Dasar"

Step 4: Calculate Progress
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
progress = (39 / 39) * 100 = 100%

Step 5: Enhanced Course Object
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  title: "Belajar Dasar AI",
  level: "Dasar",
  progress: 100,
  active_tutorials: 39,
  completed_tutorials: 39,
  isCompleted: true,
  exam_score: 80,
  ...
}
```

---

## 📊 Complete Course Example

### Input dari 3 CSV:

**students.csv:**
```
Juno Wibowo;juno.wibowo253@example.com;Belajar Dasar AI;1;39;39;1;...
```

**course.csv:**
```
course_id;...;course_name;course_level_str;...
27;...;Belajar Dasar AI;1;...
```

**course level.csv:**
```
id;course_level
1;Dasar
```

### Output di My Progress UI:

```
┌───────────────────────────────────────────────────┐
│ 📖 Belajar Dasar AI [Dasar]                       │
│    ████████████████████████████████████ 100%     │
│    Tutorial: 39/39                                │
│                                  [Continue ▶]    │
└───────────────────────────────────────────────────┘
```

---

## 🔍 Key Points

### ✅ Delimiter: Semicolon (;)
```javascript
// NOT comma
line.split(';')  // Correct
line.split(',')  // Wrong
```

### ✅ Case Sensitivity
- Course names harus exact match antara students.csv dan course.csv
- Contoh: "Belajar Dasar AI" ≠ "belajar dasar ai"

### ✅ Level ID Range
- Valid: 1, 2, 3, 4, 5
- Default (jika tidak ditemukan): "Dasar"

### ✅ Tutorial Count
- `active_tutorials`: Harus > 0 untuk perhitungan progress
- `completed_tutorials`: Tidak boleh > active_tutorials
- Format: integer (bukan string)

---

## 🚨 Common Issues & Solutions

### Issue 1: Level tidak tampak
**Penyebab**: course_name di students.csv tidak match dengan course.csv
**Solusi**: Pastikan spelling course_name persis sama

### Issue 2: Progress 0%
**Penyebab**: active_tutorials = 0
**Solusi**: Pastikan active_tutorials > 0 di students.csv

### Issue 3: Course tidak muncul
**Penyebab**: Email student tidak match atau format CSV salah
**Solusi**: 
- Verifikasi email di students.csv
- Pastikan delimiter adalah semicolon (;)

---

## 📋 Validation Checklist

Sebelum go-live, pastikan:

- [ ] Semua 3 CSV file ada di `/src/public/data/`
- [ ] Delimiter di semua file adalah semicolon (;)
- [ ] Course name di students.csv match dengan course.csv
- [ ] Level ID di course.csv ada di course level.csv (1-5)
- [ ] Email student di students.csv valid dan unique
- [ ] active_tutorials > 0 untuk all courses
- [ ] completed_tutorials ≤ active_tutorials
- [ ] is_graduated field ada (0 atau 1)

---

**Date**: December 3, 2025  
**Version**: 1.0
