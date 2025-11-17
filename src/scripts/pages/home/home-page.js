// src/scripts/pages/home/home-page.js

const Home = {
  async render() {
    return `
      <section class="hero-section">
        <div class="hero-text">
          <h1>Selamat datang</h1>
          <p>Kembangkan dirimu menjadi profesional</p>
        </div>
        <div class="hero-image">
          </div>
      </section>

      <section class="features-section">
        <div class="features-text">
          <h2>Wujudkan Mimpi Mu!!</h2>
          <p>Semoga aktifitas belajarmu menyenangkan</p>
          <div class="social-icons">
            <a href="#" aria-label="Email"><i class="fas fa-envelope"></i></a>
            <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
            <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
          </div>
        </div>
        <div class="features-cards">
          <div class="card">
            <i class="fas fa-graduation-cap card-icon"></i>
            <h3>Program Akademik</h3>
          </div>
          <div class="card">
            <i class="fas fa-book-open card-icon"></i>
            <h3>Aktivitas Belajar</h3>
          </div>
          <div class="card">
            <i class="fas fa-calendar-alt card-icon"></i>
            <h3>Aktivitas Lain</h3>
          </div>
        </div>
      </section>
    `;
  },

  async afterRender() {
    // Fungsi ini akan dipanggil setelah render()
    // Tempat untuk menambahkan event listener jika ada
    console.log('Home page rendered');

    // P.S. Anda perlu memuat Font Awesome untuk ikon-ikon di atas.
    // Tambahkan di <head> pada index.html Anda:
    // <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  },
};

export default Home;