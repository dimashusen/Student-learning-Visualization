const HomePage = {
  async render() {
    // 1. Cek apakah user sudah login
    const isLoggedIn = localStorage.getItem('statusLogin') === 'true';

    // 2. Siapkan tombol Login/Logout
    let authBtnHtml = '';
    if (isLoggedIn) {
        authBtnHtml = `<li><a href="#" id="logoutBtn" class="nav-item" style="color: #ef5350;">Logout</a></li>`;
    } else {
        authBtnHtml = `<li><a href="#" id="loginBtn" class="nav-item">Login</a></li>`;
    }

    // 3. Menu Navigasi
    const navItemsHtml = `
        <li><a href="#" class="nav-item active">Home</a></li>
        <li><a href="javascript:void(0)" id="navDashboard" class="nav-item">Dashboard</a></li>
        <li><a href="javascript:void(0)" id="navAcademy" class="nav-item"></>dicoding</a></li>
        ${authBtnHtml}
    `;

    // 4. Render HTML Utuh
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
              <a href="mailto:info@dicoding.com" title="Email">
                <i class="fas fa-envelope"></i>
              </a>
              <a href="https://www.youtube.com/@DicodingIndonesia" target="_blank" title="YouTube Dicoding">
                <i class="fab fa-youtube"></i>
              </a>
              <a href="https://www.instagram.com/dicoding/" target="_blank" title="Instagram Dicoding">
                <i class="fab fa-instagram"></i>
              </a>
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

    // --- FUNGSI HELPER: BUKA LOGIN MODAL ---
    const openLoginModal = async () => {
        try {
            const { default: LoginPage } = await import('../../pages/auth/login-page.js');
            modalContainer.innerHTML = await LoginPage.render();
            await LoginPage.afterRender();
        } catch (error) {
            console.error("Gagal memuat login page:", error);
        }
    };

    // --- 1. EVENT HANDLER TOMBOL AUTH (LOGIN / LOGOUT) ---
    if (isLoggedIn) {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const confirmLogout = confirm("Apakah Anda yakin ingin keluar?");
                if (confirmLogout) {
                    localStorage.removeItem('statusLogin');
                    window.location.reload(); 
                }
            });
        }
    } else {
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openLoginModal();
            });
        }
    }

    // --- 2. LOGIKA NAVIGASI ---
    const navDashboard = document.getElementById('navDashboard');
    const navAcademy = document.getElementById('navAcademy');

    // Fungsi proteksi: Jika belum login, minta login dulu
    const handleRestrictedAccess = (e, targetHash) => {
        e.preventDefault();
        if (isLoggedIn) {
            if (targetHash) {
                window.location.hash = targetHash; 
            }
        } else {
            alert("Silakan login terlebih dahulu untuk mengakses halaman ini.");
            openLoginModal();
        }
    };

    // A. DASHBOARD -> Menuju Dashboard (Butuh Login)
    if (navDashboard) {
        navDashboard.addEventListener('click', (e) => {
            handleRestrictedAccess(e, "/dashboard"); 
        });
    }

    // B. ACADEMY -> Placeholder / Katalog (TIDAK KE MY PROGRESS)
    if (navAcademy) {
        navAcademy.addEventListener('click', (e) => {
            e.preventDefault();
            // REVISI: Jangan ke My Progress. Tampilkan alert saja.
            alert("Halaman Academy (Katalog Kelas) akan segera hadir!");
        });
    }
  },
};

export default HomePage;