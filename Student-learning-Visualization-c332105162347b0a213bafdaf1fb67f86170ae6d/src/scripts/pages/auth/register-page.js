const RegisterPage = {
  async render() {
    return `
      <div class="modal-overlay" id="authModal">
        <div class="modal-content">
          <span class="close-btn" id="closeModal">&times;</span>
          
          <h2 class="auth-title">Daftar Akun</h2>
          
          <form id="registerForm" class="auth-form">
            <div class="form-group">
              <input type="text" class="form-input" placeholder="Nama Lengkap" required>
            </div>

            <div class="form-group">
              <input type="email" class="form-input" placeholder="Email" required>
            </div>

            <div class="form-group">
              <input type="password" class="form-input" placeholder="Password (Min. 6 karakter)" required>
            </div>

            <div class="form-group">
              <input type="password" class="form-input" placeholder="Konfirmasi Password" required>
            </div>

            <button type="submit" class="btn-login-submit">Daftar Sekarang</button>
            
            <div class="auth-divider">
              <span>atau</span>
            </div>

            <button type="button" class="btn-google" id="googleRegBtn">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G"> 
              <span>Daftar dengan Google</span>
            </button>

            <div class="auth-footer-link">
               Sudah punya akun? <a href="#" id="goToLogin">Masuk</a>
            </div>
            
            <p class="legal-text">
              Dengan mendaftar, Anda setuju dengan <a href="#">syarat & ketentuan Dicoding</a>.
            </p>
          </form>
        </div>
      </div>
    `;
  },

  async afterRender() {
    const modal = document.getElementById('authModal');
    const closeBtn = document.getElementById('closeModal');
    
    // Tutup Modal
    closeBtn.addEventListener('click', () => modal.remove());
    window.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    // Pindah ke Login
    const goToLogin = document.getElementById('goToLogin');
    goToLogin.addEventListener('click', async (e) => {
        e.preventDefault();
        modal.remove();
        try {
            const { default: LoginPage } = await import('./login-page.js');
            const container = document.getElementById('modal-container');
            container.innerHTML = await LoginPage.render();
            await LoginPage.afterRender();
        } catch (err) { console.error(err); }
    });

    // --- LOGIKA GOOGLE REGISTER YANG DISEMPURNAKAN ---
    const googleBtn = document.getElementById('googleRegBtn');
    googleBtn.addEventListener('click', () => {
        googleBtn.disabled = true;
        googleBtn.style.opacity = "0.7";
        googleBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> &nbsp; Mendaftarkan...`;

        setTimeout(() => {
            // Sukses Daftar & Login Otomatis
            localStorage.setItem('statusLogin', 'true');
            window.location.reload();
        }, 1500);
    });

    // Submit Register Biasa
    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = document.querySelector('.btn-login-submit');
        btn.innerText = "Mendaftarkan...";
        
        setTimeout(() => {
            alert("Pendaftaran Berhasil! Silakan Login.");
            goToLogin.click();
        }, 1000);
    });
  }
};

export default RegisterPage;