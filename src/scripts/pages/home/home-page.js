const HomePage = {
  async render() {
    return `
      <nav class="app-bar">
        <a href="#/home" class="nav-link active">Home</a>
        <a href="#/dashboard" class="nav-link">Dashboard</a>
        <a href="#/academy" class="nav-link">Academy</a>
        <button id="loginBtn" class="nav-link" style="border:none; background:transparent; cursor:pointer;">Login</button>
      </nav>

      <main>
        <section class="hero">
          <div class="hero-content">
            <h1 class="hero-title">Selamat datang</h1>
            <p class="hero-subtitle">Kembangkan dirimu menjadi profesional</p>
          </div>
          <div class="hero-image-container">
            </div>
        </section>

        <section class="features">
          <div class="feature-text-area">
            <h2 class="hero-title">Wujudkan Mimpi Mu!!</h2>
            <p>Semoga aktifitas belajarmu menyenangkan</p>
            <div style="margin-top: 20px; font-size: 1.5rem;">
                <span>📧</span> <span>📍</span> <span>📷</span>
            </div>
          </div>

          <div class="feature-cards">
            <div class="card">
              <span>🎓</span> <h4>Program Akademik</h4>
            </div>
            <div class="card">
              <span>📚</span>
              <h4>Aktivitas Belajar</h4>
            </div>
            <div class="card">
              <span>📅</span>
              <h4>Aktivitas Lain</h4>
            </div>
          </div>
        </section>
      </main>

      <footer style="text-align: center; padding: 20px; color: #777;">
        © 2025 Dicoding Indonesia
      </footer>
      
      <div id="modal-container"></div>
    `;
  },

  async afterRender() {
    // Logika tombol Login untuk memunculkan Modal
    const loginBtn = document.getElementById('loginBtn');
    const modalContainer = document.getElementById('modal-container');
    
    // Import dinamis login page jika diperlukan, atau panggil fungsi render
    // Untuk simpelnya, kita asumsikan logika pemanggilan modal ada di sini
    loginBtn.addEventListener('click', async () => {
        // Disini kita akan memanggil konten Login Page
        const { default: LoginPage } = await import('../auth/login-page.js');
        modalContainer.innerHTML = await LoginPage.render();
        await LoginPage.afterRender();
    });
  },
};

export default HomePage;