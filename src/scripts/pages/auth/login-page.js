// src/scripts/pages/auth/login-page.js

const Login = {
  async render() {
    return `
      <div class="modal-overlay">
        <div class="modal-content">
          <a href="#/" class="close-modal">&times;</a>
          <h2>Masuk</h2>
          <form id="loginForm">
            <div class="form-group">
              <label for="username">Username, email & phone number</label>
              <input type="text" id="username" name="username" required>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" required>
            </div>
            <div class="form-options">
              <label class="checkbox-label">
                <input type="checkbox" name="remember"> Remember Me
              </label>
              <a href="#" class="forgot-password">Lupa Password?</a>
            </div>
            <button type="submit" class="btn btn-primary">Login</button>
            <div class="separator">atau</div>
            <button type="button" class="btn btn-google">
              <img src="httpssmall" alt="Google icon"> Masuk dengan Google
            </button>
            <p class="auth-link">Belum punya akun? <a href="#/register">Daftar</a></p>
          </form>
          <p class="terms">
            Dengan melakukan Login, Anda setuju dengan <a href="#">syarat & ketentuan Dicoding</a>.
            This site is protected by reCAPTCHA and the Google <a href="#">Privacy Policy</a> and <a href="#">Terms of service apply</a>.
          </p>
        </div>
      </div>
    `;
  },

  async afterRender() {
    // Tambahkan event listener untuk form login di sini
    document.getElementById('loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      // Logika login
      console.log('Login form submitted');
      // Contoh: Pindah ke dashboard setelah login
      // window.location.hash = '/dashboard';
    });
  },
};

export default Login;