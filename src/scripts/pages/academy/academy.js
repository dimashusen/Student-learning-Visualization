// --- academy.js ---

// Fungsi Logout
function logoutUser() {
    // 1. Konfirmasi Logout (Opsional)
    const confirmLogout = confirm("Apakah Anda yakin ingin keluar?");
    
    if (confirmLogout) {
        // 2. Hapus data login dari penyimpanan browser
        localStorage.removeItem('statusLogin');
        
        // 3. Arahkan kembali ke halaman Home
        window.location.href = "index.html";
    }
}

// Animasi Progress Bar saat halaman dimuat
document.addEventListener("DOMContentLoaded", function() {
    const bar = document.querySelector('.big-progress-fill');
    if(bar) {
        // Simpan lebar asli
        const targetWidth = bar.style.width;
        // Set ke 0 dulu
        bar.style.width = '0%';
        bar.style.transition = 'width 1.5s ease-in-out';
        
        // Jalankan animasi
        setTimeout(() => {
            bar.style.width = targetWidth;
        }, 300);
    }
});