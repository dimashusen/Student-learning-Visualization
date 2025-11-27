import { getStudentData } from '../../user-data.js';

// Minimal modules mapping used to display module lists for courses.
// For now it uses some of the module titles the customer provided.
const MODULES = {
  'Belajar Dasar AI': [
    'Taksonomi AI',
    '[Story] Machine Learning: Harapan menjadi kenyataan',
    'Rangkuman Kelas',
    'Tipe-Tipe Machine Learning',
    'Forum Diskusi',
    'Kriteria Data untuk AI',
    'Latihan Membuat Model Deep Learning',
    'AI Workflow',
    'Rangkuman Pengantar Machine Learning',
    'Ujian Akhir',
    'Machine Learning Workflow',
    'Glosarium',
    '[Story] Apa yang Diperlukan untuk Membuat AI?',
    'Persetujuan Hak Cipta',
    'Proses di Balik Deep Learning',
    '[Story] Belajar Mempermudah Pekerjaan dengan AI',
    'Kuis Pengantar Machine Learning',
    'Daftar Referensi',
    'Infrastruktur Data di Industri',
    'Model Maintenance',
    'Rangkuman Data untuk AI',
    'Prasyarat Kemampuan',
    '[Story] Hidup Semakin Mudah dengan Bantuan Mesin',
    'Rangkuman Berkenalan dengan Artificial Intelligence (AI)',
    'Pengenalan Deep Learning',
    'Penerapan AI dalam Dunia Nyata',
    'Machine Learning di Industri',
    'Rangkuman Deep Learning untuk Semua Orang',
    'Kuis Data untuk AI',
    'Prasyarat Tools',
    'Kuis Berkenalan dengan Artificial Intelligence (AI)',
    'Mengenal Artificial Neural Network',
    'Pengenalan AI',
    'Batasan Machine Learning',
    'Kuis Deep Learning untuk Semua Orang',
    'Pengenalan Machine Learning',
    'Mekanisme Belajar',
    'Pengenalan Data',
    'Gambaran Penerapan Deep Learning di Industri',
    'Glossarium',
    'Pra-pemrosesan Data Gambar',
    'Pengantar Deep Learning',
    'Proyek Klasifikasi Gambar',
    'Pengenalan TensorFlow.js',
    'Ekstraksi Fitur',
    'Rangkuman Reinforcement Learning',
    'Pengumpulan Data',
    'Kuis Berkenalan dengan Time Series',
    'Plot Loss dan Akurasi dari Trained Model',
    'Image Generation',
    'Komponen-komponen Utama RL',
    'Penggunaan Batch Loading',
    'Policies and Value Functions',
    'Persetujuan Hak Cipta',
    '[Story] Dari Daun Tomat ke Teknologi, Kok Bisa?',
    'Memonitor Model',
    'Pra-pemrosesan Data untuk Model',
    'Kuis Konversi Model Machine Learning',
    'Latihan Membangun Sistem Rekomendasi',
    'Pengenalan Convolutional Neural Network',
    'Beberapa Model untuk Transfer Learning',
    'Pengenalan Time Series',
    'Federated Learning',
    'Rangkuman Natural Language Processing (NLP) dengan Tensorflow',
    'Proyek Pertama : Membuat Model NLP dengan TensorFlow',
    'Daftar Referensi',
    'Pembuatan Model Klasifikasi Gambar dengan CNN',
    '[Story] Komputer Memahami Bahasa Manusia, Kok Bisa?',
    'Proyek Analisis Sentimen',
    'Latihan: Deploy Model ML Menggunakan TensorFlow.js',
    'Latihan Ekstraksi Fitur pada Teks',
    'Dasar-Dasar Neural Network',
    'Kuis Reinforcement Learning',
    'Rangkuman Sistem Rekomendasi',
    'Mencegah Overfitting dengan Dropout dan Batch Normalization',
    'Text Generation',
    '[Story] Bukan Sembarang Kue Lapis',
    'Rangkuman Membuat dan Melatih Neural Network dengan TensorFlow dan Keras',
    'Exploration vs Exploration pada Markov Decision Processes (MDPs)',
    'Pendahuluan Kelas',
    'Pengenalan Klasifikasi Gambar',
    'Memperbarui Model yang Telah Di-deploy',
    'Menggunakan Model untuk Melakukan Prediksi',
    '[Story] Akhir yang Menjadi Awal dari Perjalanan Panjang',
    'Proyek Kedua : Membuat Model Machine Learning dengan Data Time Series',
    'Pengenalan Recurrent Neural Network',
    'Latihan Klasifikasi Gambar',
    'Machine Learning pada Time Series',
    'Data Pipelines dengan TensorFlow Data Services',
    'Kuis Natural Language Processing (NLP) dengan TensorFlow',
    'Pendahuluan Sistem Rekomendasi',
    'Format Penyimpanan Model',
    'Compile dan Fit Model',
    'Pengenalan Natural Language Processing',
    'Ujian Akhir',
    'Pengenalan TensorFlow Lite',
    'Binary vs Multiclass vs Multilabel Classification pada Text',
    '[Story] Awal Bertemu dengan Deep Learning',
    '[Story] Optimalkan Aksesibilitas, Emangnya Bisa?',
    'Proyek Akhir : Image Classification Model Deployment',
    'Kuis Sistem Rekomendasi',
    'Optimasi Pelatihan Menggunakan Callbacks',
    'Multimodal Model',
    'Metode Markov Decision Process',
    'Kuis Membuat dan Melatih Neural Network dengan TensorFlow dan Keras',
    'Contoh Sederhana Markov Decision Process',
    'Pendahuluan Deep Learning',
    'Dasar-Dasar Convolutional Neural Networks (CNNs)',
    'Model Sekuensial dengan Beberapa Layer',
    'Pengenalan Generative AI',
    'Pendahuluan Reinforcement Learning',
    '[Story] Ooh Ini Toh yang Namanya Deep Learning!',
    'Rangkuman Klasifikasi Gambar',
    'Tipe-Tipe Time Series',
    'Export Data ke Training Pipelines',
    'Metrik Evaluasi untuk Time Series',
    'Pengenalan Sistem Rekomendasi',
    'Pengenalan Arsitektur Deep Learning yang Populer',
    'Evaluasi Model',
    '[Story] Siap-Siap!',
    'Latihan: Deploy Model ML Menggunakan TensorFlow Lite',
    '[Story] Hai, Perkenalkan Ini RNN!',
    '[Story] Tak Kenal Maka Kenalan!',
    '[Story] TensorFlow, Si Penyelamat ML Engineer',
    'Mekanisme Belajar',
    'Rangkuman Kelas',
    'Menggunakan Dataset dari TensorFlow',
    'Rangkuman The Game Changer: Generative AI',
    'Pendahuluan Konversi Model Machine Learning',
    'Latihan Pra-pemrosesan Teks',
    'Latihan Implementasi Reinforcement Learning',
    '[Story] Hi, Neural Network!',
    '[Story] Nice to Meet You, Klasifikasi Gambar',
    'Latihan: Time Series 101',
    'Membuat Model untuk Klasifikasi Dua Kelas',
    'Discriminative AI vs Generative AI',
    '[Story] Time to Play!',
    'Rangkuman Pengenalan Deep Learning',
    'Kuis Klasifikasi Gambar',
    'Data Preprocessing untuk Time Series',
    'Mempublikasi Model Anda ke TF-Hub',
    'Collaborative Filtering',
    'Pengenalan TensorFlow Serving',
    'Penanganan Overfitting dalam Klasifikasi Gambar',
    'Text Preprocessing',
    'Arsitektur Deep Learning',
    'Algoritma RNN (Recurrent Neural Network)',
    '[Story] Semakin Tahu Semakin Penasaran',
    '[Story] Akhirnya Bisa Publish!',
    'Forum Diskusi',
    'Pemisahan Data (Data Splitting)',
    'Pendahuluan Natural Language Processing (NLP) dengan Tensorflow',
    'Kuis The Game Changer: Generative AI',
    'Pengenalan Deployment',
    '[Story] Ekstraksi Fitur!',
    '[Story] Datezone = Reinforcement Learning?',
    'Tahapan Klasifikasi Gambar',
    'Rangkuman Berkenalan dengan Time Series',
    'Membuat dan Melatih Model untuk Klasifikasi Banyak Kelas',
    'Penerapan Generative AI',
    'Pengenalan Reinforcement Learning',
    'Kuis Pengenalan Deep Learning',
    'Q-Learning',
    'Pendahuluan Klasifikasi Gambar'
  ],
  'Belajar Fundamental Deep Learning': [
    'Pengenalan Deep Learning',
    'Latihan Klasifikasi Gambar',
    'Arsitektur Deep Learning',
    'Training & Evaluasi Model',
  ],
  'Belajar Machine Learning untuk Pemula': [
    'Pengantar Machine Learning',
    'Latihan Data Preparation',
    'Model Sederhana',
    'Evaluasi Model'
  ],
  'Memulai Pemrograman dengan Python': [
    'Pengantar Python',
    'Struktur Data',
    'Kontrol Alur',
    'Fungsi & Modul',
  ],
  'Belajar Dasar Pemrograman JavaScript': [
    'Dasar JS',
    'DOM dan Event',
    'Asynchronous JavaScript',
    'Fetch API'
  ],
  'Belajar Fundamental Aplikasi Android': [
    'Pengantar Android',
    'Create Project',
    'UI & Layout',
    'Lifecycle',
  ],
};

function parseHashQuery() {
  const hash = window.location.hash || '#/';
  const parts = hash.slice(1).split('?');
  const query = {};
  if (parts.length > 1) {
    const params = parts[1].split('&');
    params.forEach(p => {
      const [k, v] = p.split('=');
      if(k) query[k] = decodeURIComponent(v || '');
    });
  }
  return query;
}

const CoursePage = {
  async render() {
    const query = parseHashQuery();
    const title = query.title || 'Course';
    const modules = MODULES[title] || [];
    const total = modules.length;

    // Prepare demo per-module progress: mark first 4 modules completed for sample
    const modulesData = modules.map((m, idx) => {
      const isCompleted = idx < 4; // demo: first 4 completed
      const progress = isCompleted ? 100 : Math.round(Math.min(80, 20 + (idx % 5) * 15));
      const score = isCompleted ? 90 + (idx % 10) : null; // give sample score
      return { title: m, isCompleted, progress, score };
    });

    const overallProgress = modulesData.length === 0 ? 0 : Math.round(modulesData.reduce((s,m) => s + m.progress, 0)/modulesData.length);

    return `
      <div class="dashboard-body">
        <aside class="sidebar">
          <div class="sidebar-header"><div class="brand-logo"><span>9</span></div></div>
          <div class="menu-group">
            <div class="menu-category">LEARNING</div>
            <a href="#/home" class="menu-item">Home</a>
            <a href="#/dashboard" class="menu-item">Dashboard</a>
            <a href="#/my-progress" class="menu-item">My Progres</a>
          </div>
        </aside>
        <main class="main-content">
          <div class="card">
            <div class="card-header-row">
              <div>
                <h3 style="margin-bottom:6px;">${title}</h3>
                <p style="color:#666; font-size:13px;">${total} Modul</p>
              </div>
              <div>
                <a href="#/home" class="btn-outline-white" style="margin-right:8px;">Home</a>
                <a href="#/my-progress" class="btn-primary">Kembali</a>
              </div>
            </div>

            <div style="margin-top:20px; display:flex; gap:20px; align-items:flex-start;">
              <div style="flex:1">
                <div class="card" style="padding:18px;">
                  <h4 style="margin-bottom:10px;">Syllabus & Performance</h4>
                  <div id="module-list-container">
                    ${modulesData.map((m, idx) => `
                      <div class="module-row" style="display:flex; align-items:center; justify-content:space-between; padding:12px 10px; border-radius:8px; border:1px solid #eee; margin-bottom:10px; background:white;">
                        <div style="display:flex; gap:12px; align-items:center;">
                          <div class="module-status" style="width:40px; height:40px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:${m.isCompleted ? '#e8f5e9' : '#e9f7ff'}; color:${m.isCompleted ? '#2e7d32' : '#0288d1'}; font-weight:700;">${m.isCompleted ? '\u2713' : (idx+1)}</div>
                          <div>
                            <div style="font-weight:600;">${m.title}</div>
                            <div style="font-size:12px; color:#888; margin-top:3px;">${m.isCompleted ? 'Completed' : 'In progress'}</div>
                          </div>
                        </div>
                        <div style="display:flex; align-items:center; gap:14px;">
                          <div style="width:220px;">
                            <div style="height:6px; background:#f1f1f1; border-radius:6px; overflow:hidden;">
                              <div style="height:100%; width:${m.progress}%; background:${m.isCompleted ? '#4caf50' : '#ff9800'};"></div>
                            </div>
                          </div>
                          <div style="text-align:right; font-size:12px; color:#666; min-width:76px;">${m.score ? 'Score: ' + m.score + '/100' : ''}</div>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
              <aside style="width:310px;">
                <div class="card" style="padding:18px;">
                  <h4>Your Progress</h4>
                  <div style="margin:12px 0; height:10px; background:#eee; border-radius:6px; overflow:hidden;">
                    <div style="height:100%; width:${overallProgress}%; background:#ff9800;"></div>
                  </div>
                  <div style="text-align:right; font-weight:700; color:#555; margin-bottom:10px;">${overallProgress}%</div>
                  <a href="#/my-progress" class="btn-primary">Continue Learning</a>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    `;
  },
  async afterRender() {
    // nothing dynamic yet; modules are static for now
  }
};

export default CoursePage;
