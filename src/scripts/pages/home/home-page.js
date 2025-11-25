const HomePage = {
  async render() {
    return `
      <div class="app-container">
        <div class="main-card">

          <header class="header-section">
            <div class="brand-logo">Student Learning</div>
            <nav class="navbar">
              <ul>
                <li><a href="#/home" class="nav-link active">Home</a></li>
                <li><a href="#/dashboard" class="nav-link">Dashboard</a></li>
                <li><a href="#/academy" class="nav-link">Academy</a></li>
                <li><a href="#/login" id="loginBtn" class="btn-login">Login</a></li>
              </ul>
            </nav>
          </header>

          <section class="hero-split">
            <div class="hero-blue-block">
              <div class="hero-text">
                <span class="badge">🎓 E-Learning Platform</span>
                <h1>Selamat datang</h1>
                <p>Kembangkan dirimu menjadi profesional dengan kurikulum standar industri.</p>
                <a href="#/academy" class="cta-button">Mulai Belajar</a>
              </div>
            </div>
            
            <div class="hero-white-space"></div>
          </section>

          <div class="student-wrapper">
            <img src="./public/images/siswa.png" alt="Siswa Sukses" class="student-img">
          </div>

          <section class="bottom-blue-block">
            <div class="bottom-container">
              
              <div class="intro-text">
                <h2>Wujudkan Mimpi Mu!!</h2>
                <p>Semoga aktivitas belajarmu menyenangkan dan bermanfaat.</p>
                <div class="socials">
                  <a href="#"><i class="fas fa-envelope"></i></a>
                  <a href="#"><i class="fas fa-map-marker-alt"></i></a>
                  <a href="#"><i class="fab fa-instagram"></i></a>
                </div>
              </div>

              <div class="cards-container">
                <div class="info-card">
                  <div class="icon-wrap"><i class="fas fa-graduation-cap"></i></div>
                  <h3>Program Akademik</h3>
                </div>
                <div class="info-card">
                  <div class="icon-wrap"><i class="fas fa-book-open"></i></div>
                  <h3>Aktivitas Belajar</h3>
                </div>
                <div class="info-card">
                  <div class="icon-wrap"><i class="fas fa-calendar-alt"></i></div>
                  <h3>Aktivitas Lain</h3>
                </div>
              </div>

            </div>
          </section>

        </div>
        
        <footer class="footer-simple">
          © 2025 Dicoding Indonesia
        </footer>
      </div>
      
      <div id="modal-container"></div>
    `;
  },

  async afterRender() {
    const loginBtn = document.getElementById('loginBtn');
    const modalContainer = document.getElementById('modal-container');
    if (loginBtn) {
      loginBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const { default: LoginPage } = await import('../../pages/auth/login-page.js');
        modalContainer.innerHTML = await LoginPage.render();
        await LoginPage.afterRender();
      });
    }
  },
};

export default HomePage;