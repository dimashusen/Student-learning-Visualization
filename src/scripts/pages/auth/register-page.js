const RegisterPage = {
  async render() {
    return `
      <div class="modal" id="authModal">
        <div class="modal-content">
          <span class="close-btn" id="closeModal">&times;</span>
          
          <h3>Daftar akun Dicoding</h3>
          <br>
          
          <form id="registerForm">
            <div class="form-group">
              <label>Nama Lengkap</label>
              <input type="text" class="form-input" placeholder="Nama Lengkap" required>
              <small style="font-size:0.6rem; color:#888;">Gunakan nama asli pada sertifikat</small>
            </div>

            <div class="form-group">
              <label>Email</label>
              <input type="email" class="form-input" placeholder="Alamat Email" required>
            </div>

            <div class="form-group">
              <label>Password</label>
              <input type="password" class="form-input" placeholder="Masukan password baru" required>
              <small style="font-size:0.6rem; color:#888;">Minimal 8 karakter kombinasi huruf & angka</small>
            </div>

            <div class="form-group">
              <label>Kode Referral (opsional)</label>
              <input type="text" class="form-input" placeholder="Masukan kode referral jika ada">
            </div>

            <button type="submit" class="btn-primary">Daftar</button>
            
            <div style="margin: 15px 0; border-bottom: 1px solid #ccc; line-height:0.1em;">
                <span style="background:#fff; padding:0 10px; color:#777;">atau</span>
            </div>

            <button type="button" class="btn-google">
              <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="G"> Masuk dengan Google
            </button>
          </form>
        </div>
      </div>
    `;
  },

  async afterRender() {
    const modal = document.getElementById('authModal');
    const closeBtn = document.getElementById('closeModal');
    
    closeBtn.addEventListener('click', () => {
      modal.remove();
    });
    
    // Tambahkan logika submit form di sini jika diperlukan
  }
};

export default RegisterPage;