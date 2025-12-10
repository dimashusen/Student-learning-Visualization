import { getUsers } from '../../user-data.js';

const LoginPage = {
  async render() {
    return `
      <div class="modal-overlay" id="authModal">
        <div class="modal-content">
          <span class="close-btn" id="closeModal">&times;</span>
          <h2 class="auth-title">Masuk</h2>
          
          <form id="loginForm" class="auth-form">
            <div class="form-group">
              <input type="email" id="inputEmail" class="form-input" placeholder="Email (ex: citra.wibowo173@example.com)" required>
            </div>
            <div class="form-group">
              <input type="password" id="inputPassword" class="form-input" placeholder="Password (Default: 123456)" required>
            </div>
            <div class="form-options">
              <label class="remember-me"><input type="checkbox"> Remember Me</label>
              <a href="#" class="forgot-pass" id="forgotPassBtn">Lupa Password ?</a>
            </div>
            <button type="submit" class="btn-login-submit">Login</button>
            <div class="auth-divider"><span>atau</span></div>
            <button type="button" class="btn-google" id="googleLoginBtn">
              <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="G"> 
              <span>Masuk dengan Google</span>
            </button>
            <div class="auth-footer-link">Belum punya akun? <a href="#" id="goToRegister">Daftar</a></div>
            <p class="legal-text">Dengan melakukan Login, Anda setuju dengan Syarat & Ketentuan.</p>
          </form>
        </div>
      </div>
    `;
  },

  async afterRender() {
    const modal = document.getElementById('authModal');
    const closeBtn = document.getElementById('closeModal');
    if (closeBtn) closeBtn.addEventListener('click', () => modal.remove());
    window.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    // Pindah ke Register
    const goToReg = document.getElementById('goToRegister');
    if (goToReg) {
        goToReg.addEventListener('click', async (e) => {
            e.preventDefault(); modal.remove();
            try {
                const { default: RegPage } = await import('./register-page.js');
                document.getElementById('modal-container').innerHTML = await RegPage.render();
                await RegPage.afterRender();
            } catch (err) { console.error(err); }
        });
    }

    // Google Login
    const googleBtn = document.getElementById('googleLoginBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            googleBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Menghubungkan...`;
            setTimeout(() => {
                localStorage.setItem('statusLogin', 'true');
                localStorage.setItem('userInfo', JSON.stringify({ name: "Haechan (Google)", email: "haechan@google.com" }));
                window.location.hash = '/dashboard'; window.location.reload();
            }, 1000);
        });
    }

    // --- LOGIKA LOGIN (REVISI) ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          
          // AMBIL INPUT & BERSIHKAN
          const rawEmail = document.getElementById('inputEmail').value;
          const emailInput = rawEmail.trim().toLowerCase();
          
          const passInput = document.getElementById('inputPassword').value.trim();
          const btn = document.querySelector('.btn-login-submit');
          const originalText = btn.innerText;

          // 1. Cek Password
          if (passInput !== '123456') {
              alert("Password salah! (Hint: 123456)");
              return;
          }

          // Efek Loading
          btn.innerText = "Mengecek Data...";
          btn.style.opacity = "0.7";
          btn.disabled = true;

          try {
              // 2. Ambil Data (Selalu ambil baru)
              const users = await getUsers();
              
              // 3. Pencocokan
              const foundUser = users.find(u => u.email === emailInput);

              if (!foundUser) {
                  // LOG ERROR DI CONSOLE AGAR MUDAH DILACAK
                  console.warn(`User tidak ditemukan: "${emailInput}"`);
                  console.log("Total user di sistem:", users.length);
                  
                    // Provide clearer guidance to the developer/user
                    console.log('Daftar Email Terdaftar:', users.map(u => u.email));
                    if (users.length <= 1) {
                      alert("Login Gagal! Data pengguna tidak tersedia (server API mungkin tidak berjalan atau CSV tidak ditemukan).\nJalankan server API (jalankan `npm run server` di terminal) atau pastikan anda membuka folder `src/` melalui Live Server.\nLihat Console (F12) untuk daftar email yang terdaftar.");
                    } else {
                      alert("Login Gagal! Email tidak ditemukan di daftar pengguna.\nLihat Console (F12) untuk daftar email yang terdaftar dan detail error.");
                    }
                  
                  btn.innerText = originalText;
                  btn.style.opacity = "1";
                  btn.disabled = false;
                  return;
              }

              // 4. Sukses
              btn.innerText = "Sukses!";
              setTimeout(() => {
                  localStorage.setItem('statusLogin', 'true');
                  localStorage.setItem('userInfo', JSON.stringify(foundUser));
                  alert(`Selamat datang, ${foundUser.name}!`);
                  window.location.hash = '/dashboard';
                  window.location.reload();
                  modal.remove();
              }, 800);

          } catch (err) {
              console.error(err);
              alert("Terjadi kesalahan sistem saat membaca CSV.");
              btn.innerText = originalText;
              btn.disabled = false;
          }
        });
    }
  }
};

export default LoginPage;