# Student Learning Progress Visualization

**ID Tim:** A25-CS175  
**Kategori:** Capstone Project – Asah (Dicoding in association with Accenture)

---

## 📝 Deskripsi Proyek
Platform pembelajaran digital saat ini menghadapi tantangan berupa kurangnya kejelasan progres belajar siswa, rendahnya motivasi dalam menyelesaikan modul, serta minimnya panduan yang jelas mengenai langkah pembelajaran selanjutnya.

Melalui proyek **Student Learning Progress Visualization**, tim kami merancang sistem yang mampu:
- Menampilkan progres belajar siswa secara transparan,
- Menyediakan *milestone* capaian pembelajaran yang memotivasi,
- Memberikan rekomendasi langkah pembelajaran berikutnya secara terarah.

Solusi ini bertujuan untuk meningkatkan *engagement*, retensi pengguna, serta tingkat penyelesaian program (*completion rate*) pada platform pembelajaran digital.

**Status Proyek:** ✅ 100% Selesai  
**Deployment:** Backend menggunakan **Vercel**, Frontend menggunakan **Netlify**

---

## 🛠️ Teknologi yang Digunakan
Berdasarkan pengembangan dan hasil mentoring:

- **Frontend:** React.js (UI modern dan responsif)
- **Backend:** Node.js dengan Express.js / Hapi.js
- **Database:** MySQL / MongoDB
- **Deployment:**  
  - Backend: Vercel  
  - Frontend: Netlify  

---

## ⚙️ Cara Instalasi dan Penyiapan Proyek (Installation)

Ikuti langkah-langkah berikut untuk menjalankan proyek di lingkungan lokal:

### 1. Clone Repository
```bash
git clone [MASUKKAN_URL_GITHUB_ANDA_DISINI]
cd [NAMA_FOLDER_PROYEK]

## 2. Instalasi Dependensi

Proyek ini memisahkan **frontend** dan **backend**, sehingga instalasi dependensi dilakukan secara terpisah.

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd ../frontend
npm install
```

---

## 3. Konfigurasi Environment Variable

Buat file `.env` di folder **backend** (dan frontend jika diperlukan), lalu sesuaikan dengan konfigurasi lokal.

### Contoh Konfigurasi

```env
PORT=5000
DATABASE_URL=your_database_url
```

⚠️ **PERINGATAN KEAMANAN (WAJIB):**
Jangan mencantumkan credential asli seperti **password database, API key, token, atau data sensitif lainnya** ke dalam repository GitHub.
Pastikan file `.env` telah dimasukkan ke dalam `.gitignore`.

---

## 📖 Petunjuk Penggunaan Aplikasi (Usage)

### Menjalankan Aplikasi Secara Lokal

#### Menjalankan Backend

```bash
# di folder backend
npm start
```

#### Menjalankan Frontend

```bash
# di folder frontend
npm run start
```

#### Akses Aplikasi

```text
http://localhost:3000
```

> Sesuaikan dengan port yang muncul di terminal.

---

## ✨ Fitur Utama

* **Dashboard Progres**
  Menampilkan visualisasi capaian pembelajaran siswa.
* **Milestone Pembelajaran**
  Menunjukkan target pembelajaran yang telah diselesaikan.
* **Rekomendasi Pembelajaran**
  Memberikan saran modul selanjutnya berdasarkan progres belajar.

---

## 👥 Tim Pengembang (A25-CS175)

* **(F248D5Y0489)** – Dimas Husen – Front-End Web & Back-End with AI
* **(F248D5Y0589)** – Fardan Zaindi A – Front-End Web & Back-End with AI
* **(F248D5Y0579)** – Fajar Nugroho – Front-End Web & Back-End with AI
* **(F248D5X0395)** – Cinda Kamilah H – Front-End Web & Back-End with AI
* **(F248D5X0238)** – Anis Setiawati – Front-End Web & Back-End with AI

**Advisor:**
[A25-FB002] – Monterico Adrian

---

## 🔗 Tautan Penting

* **Video Pitching:** [https://youtu.be/la1l5-pr0Mc?si=y-YxuxSdZ5srNQfH)
* **Deployment Frontend:** [https://student-learning-visualization.netlify.app/ done]
* **Deployment Backend:** [https://my-visualization.vercel.app/]

---

## 📌 Catatan

* Proyek ini dikembangkan untuk keperluan edukasi dan **Capstone Project Asah by Dicoding**.



