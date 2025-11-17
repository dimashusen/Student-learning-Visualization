const HomePage = {
  async render() {
    return `
      <header class="navbar-area">
        <div class="container nav-container">
          <div class="logo">
            <a href="#/">Student Learning</a>
          </div>
          <nav class="nav-menu">
            <ul>
              <li><a href="#/home" class="nav-link active">Home</a></li>
              <li><a href="#/dashboard" class="nav-link">Dashboard</a></li>
              <li><a href="#/academy" class="nav-link">Academy</a></li>
            </ul>
            <a href="#/login" id="loginBtn" class="btn-login">Login</a>
          </nav>
        </div>
      </header>

      <main>
        <section class="hero-section">
          <div class="container hero-grid">
            
            <div class="hero-content">
              <h1>Selamat datang</h1>
              <p>Kembangkan dirimu menjadi profesional</p>
            </div>

            <div class="hero-image">
              <img src="./public/images/siswa.png" alt="Siswa Belajar">
            </div>
            
          </div>
        </section>

        <section class="info-section">
          <div class="container">
            
            <div class="info-grid">
              
              <div class="info-text">
                <h2>Wujudkan Mimpi Mu!!</h2>
                <p>Semoga aktifitas belajarmu menyenangkan</p>
                <div class="social-icons">
                  <a href="#"><i class="fas fa-envelope"></i></a>
                  <a href="#"><i class="fas fa-map-marker-alt"></i></a>
                  <a href="#"><i class="fab fa-instagram"></i></a>
                </div>
              </div>

              <div class="cards-wrapper">
                <div class="feature-card">
                  <div class="icon-box">
                    <i class="fas fa-graduation-cap"></i>
                  </div>
                  <h3>Program Akademik</h3>
                </div>

                <div class="feature-card">
                  <div class="icon-box">
                    <i class="fas fa-book-open"></i>
                  </div>
                  <h3>Aktivitas Belajar</h3>
                </div>

                <div class="feature-card">
                  <div class="icon-box">
                    <i class="fas fa-calendar-alt"></i>
                  </div>
                  <h3>Aktivitas Lain</h3>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      <footer class="app-footer">
        <p>© 2025 Dicoding Indonesia</p>
      </footer>
      
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