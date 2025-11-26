const HomePage = {
  async render() {
    // 1. Cek apakah user sudah login
    const isLoggedIn = localStorage.getItem('statusLogin') === 'true';

    // 2. Siapkan item menu navigasi berdasarkan status login
    let navItemsHtml = '';

    if (isLoggedIn) {
        // --- TAMPILAN SETELAH LOGIN ---
        // Munculkan Dashboard, Academy, dan tombol Logout
        navItemsHtml = `
            <li><a href="#" class="nav-item active">Home</a></li>
            <li><a href="javascript:void(0)" id="navDashboard" class="nav-item">Dashboard</a></li>
            <li><a href="javascript:void(0)" id="navAcademy" class="nav-item">Academy</a></li>
            <li><a href="#" id="logoutBtn" class="nav-item" style="color: #ef5350;">Logout</a></li>
        `;
    } else {
        // --- TAMPILAN SEBELUM LOGIN ---
        // Hanya Home dan Login
        navItemsHtml = `
            <li><a href="#" class="nav-item active">Home</a></li>
            <li><a href="#" id="loginBtn" class="nav-item">Login</a></li>
        `;
    }

    // 3. Render HTML Utuh
    return `
      <div class="home-container">
        
        <header class="home-nav">
          <nav>
            <ul>
              ${navItemsHtml}
            </ul>
          </nav>
        </header>

        <section class="hero-teal-top">
          <div class="hero-content">
            <h1>Selamat datang</h1>
            <p>Kembangkan dirimu menjadi profesional<br>dengan kurikulum standar industri.</p>
          </div>
          
          <div class="student-image-wrapper">
             <img src="./public/images/siswa.png" alt="Siswa Dicoding" class="student-img-home">
          </div>
        </section>

        <section class="info-teal-bottom">
          <div class="info-left">
            <h2>Wujudkan<br>Mimpi Mu!!</h2>
            <p>Semoga aktivitas<br>belajarmu menyenangkan<br>dan bermanfaat.</p>
            <div class="social-icons">
              <a href="#"><i class="fas fa-envelope"></i></a>
              <a href="#"><i class="fas fa-map-marker-alt"></i></a>
              <a href="#"><i class="fab fa-instagram"></i></a>
            </div>
          </div>

          <div class="info-right-cards">
            <div class="feature-card">
              <div class="icon-box"><i class="fas fa-graduation-cap"></i></div>
              <h3>Program Akademik</h3>
            </div>
            <div class="feature-card">
              <div class="icon-box"><i class="fas fa-book-open"></i></div>
              <h3>Aktivitas Belajar</h3>
            </div>
            <div class="feature-card">
              <div class="icon-box"><i class="far fa-calendar-alt"></i></div>
              <h3>Aktivitas Lain</h3>
            </div>
          </div>
        </section>

        <footer class="home-footer">
          © 2025 Dicoding Indonesia
        </footer>

      </div>
      
      <div id="modal-container"></div>
    `;
  },

  async afterRender() {
    const isLoggedIn = localStorage.getItem('statusLogin') === 'true';
    const modalContainer = document.getElementById('modal-container');

    if (isLoggedIn) {
        // --- LOGIKA JIKA SUDAH LOGIN ---
        
        // 1. Event Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const confirmLogout = confirm("Apakah Anda yakin ingin keluar?");
                if (confirmLogout) {
                    localStorage.removeItem('statusLogin');
                    window.location.reload(); // Refresh halaman untuk reset menu
                }
            });
        }

        // 2. Event Navigasi ke Dashboard (Manual Redirect)
        const navDashboard = document.getElementById('navDashboard');
        if (navDashboard) {
            navDashboard.addEventListener('click', () => {
                // Karena kita belum pakai router canggih, kita redirect manual
                // Pastikan file dashboard.html atau logika load dashboard Anda siap
                // Untuk sementara, kita alert atau reload ke hash dashboard jika ada router
                 window.location.href = "dashboard-view.html"; // Asumsi Anda punya file ini dari langkah awal
                 // Atau jika ingin load via JS: alert("Membuka Dashboard...");
            });
        }

        const navAcademy = document.getElementById('navAcademy');
        if (navAcademy) {
            navAcademy.addEventListener('click', () => {
                alert("Membuka Halaman Academy...");
            });
        }

    } else {
        // --- LOGIKA JIKA BELUM LOGIN ---
        
        // Event Buka Modal Login
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    const { default: LoginPage } = await import('../../pages/auth/login-page.js');
                    modalContainer.innerHTML = await LoginPage.render();
                    await LoginPage.afterRender();
                } catch (error) {
                    console.error("Gagal memuat login page:", error);
                }
            });
        }
    }
  },
};

export default HomePage;