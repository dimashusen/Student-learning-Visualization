/* File: src/scripts/index.js */

// 1. Import halaman Home
// Pastikan path ini benar. Dari folder scripts, masuk ke pages -> home -> home-page.js
import HomePage from './pages/home/home-page.js';

const main = async () => {
  try {
    const contentContainer = document.querySelector('#app');
    
    // Cek apakah container ketemu
    if (!contentContainer) {
      console.error("Error: Elemen <div id='app'> tidak ditemukan di index.html");
      return;
    }

    // 2. Render HTML
    contentContainer.innerHTML = await HomePage.render();
    
    // 3. Jalankan logika tambahan (tombol login, dll)
    await HomePage.afterRender();
    
    console.log("Halaman berhasil dimuat!");
    
  } catch (error) {
    console.error("Gagal merender halaman:", error);
    alert("Terjadi error pada JavaScript. Cek Console (F12) untuk detailnya.");
  }
};

// Jalankan main() saat browser selesai memuat HTML
window.addEventListener('DOMContentLoaded', main);