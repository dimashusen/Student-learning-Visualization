// src/scripts/pages/auth/register-page.js

const Register = {
  async render() {
    return `
      <div class="modal-overlay">
        <div class="modal-content">
          <a href="#/" class="close-modal">&times;</a>
          <h2>Daftar akun Dicoding</h2>
          <form id="registerForm">
            <div class="form-group">
              <label for="fullName">Nama Lengkap</label>
              <input type="text" id="fullName" name="fullName" required>
              <small>Gunakan nama asli Anda, nama akan digunakan pada data sertifikat</small>
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" required>
              <small>Gunakan alamat email aktif Anda</small>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" required>
              <small>Gunakan minimal 8 karakter dengan kombinasi huruf dan angka</small>
            </div>
             <div class="form-group">
              <label for="referral">Kode Referral (opsional)</label>
              <input type="text" id="referral" name="referral">
              <small>Masukan kode referral pengguna lain jika ada</small>
            </div>
            <button type="submit" class="btn btn-primary">Daftar</button>
            <div class="separator">atau</div>
            <button type="button" class="btn btn-google">
              <img src="httpssmall" alt="Google icon"> Masuk dengan Google
            </button>
          </form>
        </div>
      </div>
    `;
  },

  async afterRender() {
    // Tambahkan event listener untuk form register di sini
    document.getElementById('registerForm').addEventListener('submit', (e) => {
      e.preventDefault();
      // Logika registrasi
      console.log('Register form submitted');
      // Contoh: Pindah ke halaman login setelah daftar
      // window.location.hash = '/login';
    });
  },
};

export default Register;