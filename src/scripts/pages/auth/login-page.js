const LoginPage = {
  async render() {
    return `
      <div class="modal" id="authModal">
        <div class="modal-content">
          <span class="close-btn" id="closeModal">&times;</span>
          
          <h2>Masuk</h2>
          <br>
          
          <form id="loginForm">
            <div class="form-group">
              <input type="text" class="form-input" placeholder="Username, email & phone number" required>
            </div>
            <div class="form-group">
              <input type="password" class="form-input" placeholder="Password" required>
            </div>
            
            <div style="display:flex; justify-content:space-between; font-size: 0.85rem; margin-bottom:20px;">
                <label><input type="checkbox"> Remember Me</label>
                <a href="#" style="color: var(--primary-color); text-decoration:none; font-weight:bold;">Lupa Password?</a>
            </div>

            <button type="submit" class="btn-primary">Login</button>
            
            <div style="margin: 15px 0; border-bottom: 1px solid #ccc; line-height:0.1em;">
                <span style="background:#fff; padding:0 10px; color:#777;">atau</span>
            </div>

            <button type="button" class="btn-google">
              <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="G"> Masuk dengan Google
            </button>

            <p class="text-small">Belum punya akun? <a href="#" id="goToRegister" style="color:blue;">Daftar</a></p>
            
            <p class="text-small" style="font-size: 0.6rem; margin-top: 20px; color: #999;">
              Dengan melakukan Login, Anda setuju dengan syarat & ketentuan...
            </p>
          </form>
        </div>
      </div>
    `;
  },

  async afterRender() {
    // Tutup Modal
    const modal = document.getElementById('authModal');
    const closeBtn = document.getElementById('closeModal');
    
    closeBtn.addEventListener('click', () => {
      modal.remove(); // Hapus modal dari DOM
    });

    // Pindah ke Register
    const goToRegister = document.getElementById('goToRegister');
    goToRegister.addEventListener('click', async (e) => {
        e.preventDefault();
        modal.remove(); // Hapus login modal
        // Load Register Page
        const { default: RegisterPage } = await import('./register-page.js');
        const container = document.getElementById('modal-container');
        container.innerHTML = await RegisterPage.render();
        await RegisterPage.afterRender();
    });
  }
};

export default LoginPage;