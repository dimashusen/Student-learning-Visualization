// --- VARIABEL GLOBAL ---
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const checkinModal = document.getElementById('checkinModal'); // Tambahkan
const loginBtnNav = document.getElementById('loginLink');
let selectedMood = ''; // Pindahkan inisialisasi ke atas

// --- FUNGSI UTAMA (Diakses di Global) ---

/**
 * Fungsi 2: Logout User
 */
function logoutUser() {
    // Hapus data login dari memori
    localStorage.removeItem('statusLogin');
    alert("Anda telah keluar.");
    // Reload halaman untuk mereset tampilan
    window.location.reload(); 
}

/**
 * Fungsi 3: Login Google (Simulasi)
 */
function handleGoogleLogin(buttonId) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;

    const btnSpan = btn.querySelector('span');
    const originalText = btnSpan ? btnSpan.innerText : 'Login with Google';

    btn.disabled = true;
    btn.style.opacity = "0.7";
    btn.style.cursor = "not-allowed";
    if (btnSpan) btnSpan.innerText = "Menghubungkan...";

    setTimeout(() => {
        // SIMPAN STATUS LOGIN KE BROWSER
        localStorage.setItem('statusLogin', 'true');

        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
        if (btnSpan) btnSpan.innerText = originalText;

        // Redirect ke dashboard
        window.location.href = "profile.html"; 
    }, 1500);
}

/**
 * Fungsi 4: Navigasi Modal Login/Register
 */
function openLoginModal() {
    if (registerModal) registerModal.style.display = "none";
    if (loginModal) loginModal.style.display = "flex";
    if (loginBtnNav) loginBtnNav.classList.add('nav-active');
    clearErrors();
}

function switchToRegister() {
    if (loginModal) loginModal.style.display = "none";
    if (registerModal) registerModal.style.display = "flex";
    if (loginBtnNav) loginBtnNav.classList.add('nav-active');
    clearErrors();
}

function closeAllModals() {
    if (loginModal) loginModal.style.display = "none";
    if (registerModal) registerModal.style.display = "none";
    if (loginBtnNav) loginBtnNav.classList.remove('nav-active');
    clearErrors();
}

/**
 * Fungsi 5: Validasi/Utility (Clear Errors)
 */
function clearErrors() {
    const inputs = document.querySelectorAll('.input-group-reg input');
    inputs.forEach(input => input.classList.remove('input-error'));
    const msgs = document.querySelectorAll('.error-msg');
    msgs.forEach(msg => msg.style.display = 'none');
}

/**
 * Fungsi Check-in 1 & 2: Buka/Tutup Modal Check-in
 */
function openCheckin() {
    const today = new Date().toISOString().split('T')[0];
    if (localStorage.getItem('checkin_' + today)) {
        alert("Anda sudah melakukan daily check-in hari ini. Tidak bisa mengisi lagi.");
        return;
    }
    if (checkinModal) checkinModal.style.display = 'flex';
}

function closeCheckin() {
    if (checkinModal) checkinModal.style.display = 'none';
    resetForm(); // Reset pilihan saat ditutup
}

/**
 * Fungsi Check-in 3: Pilih Mood (Emoji)
 */
function selectMood(element, mood) {
    // Hapus kelas 'selected' dari semua emoji
    document.querySelectorAll('.emoji-item').forEach(el => el.classList.remove('selected'));
    
    // Tambah kelas 'selected' ke elemen yang diklik
    element.classList.add('selected');
    selectedMood = mood;
}

/**
 * Fungsi Check-in 4: Submit Data (Diperbarui/Diperbaiki)
 */
function submitCheckin() {
    const textElement = document.getElementById('progressText');

    if (!textElement) {
        console.error("progressText element not found.");
        return;
    }
    const text = textElement.value;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateKey = today.toISOString().split('T')[0]; // Key: "YYYY-MM-DD"
    
    // Cek apakah hari ini sudah daily check-in
    if (localStorage.getItem('checkin_' + dateKey)) {
        alert("Anda sudah melakukan daily check-in hari ini. Tidak bisa mengisi lagi.");
        closeCheckin();
        return;
    }

    if (!selectedMood) {
        alert("Silakan pilih mood Anda hari ini (Emoji)!");
        return;
    }
    if (text.trim() === "") {
        alert("Silakan isi progres Anda!");
        return;
    }

    // SIMPAN KE LOCAL STORAGE
    const data = {
        date: dateKey,
        mood: selectedMood,
        progress: text,
        timestamp: new Date().toISOString()
    };

    localStorage.setItem('checkin_' + dateKey, JSON.stringify(data));

    // Notifikasi & Refresh Tampilan
    alert("Check-in berhasil! Tetap semangat! 🔥");
    closeCheckin();
    renderWeeklyCheckin(); // Refresh kotak-kotak jadi hijau
}

/**
 * Fungsi Check-in 5: Reset Form Helper
 */
function resetForm() {
    document.querySelectorAll('.emoji-item').forEach(el => el.classList.remove('selected'));
    const progressTextElement = document.getElementById('progressText');
    if (progressTextElement) progressTextElement.value = "";
    selectedMood = '';
}

/**
 * Logika Cerdas Check-in 1: Render Kalender Mingguan
 */
function renderWeeklyCheckin() {
    const container = document.getElementById('checkinContainer');
    const statusBtn = document.getElementById('checkinStatusBtn');
    const monthLabel = document.getElementById('currentMonthYear');
    
    if (!container || !statusBtn || !monthLabel) return;
    
    container.innerHTML = ""; // Bersihkan isi lama
    
    const today = new Date();
    today.setHours(0,0,0,0); // Reset jam agar perbandingan tanggal akurat

    // Update Label Bulan & Tahun
    const options = { year: 'numeric', month: 'long' };
    monthLabel.innerText = today.toLocaleDateString('id-ID', options);

    // Cari hari Senin minggu ini
    const currentDay = today.getDay(); // 0=Minggu, 1=Senin, ...
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay; // Koreksi untuk Minggu (0)
    const mondayDate = new Date(today);
    mondayDate.setDate(today.getDate() + distanceToMonday);

    let isTodayDone = false;

    // Loop 5 Hari (Senin - Jumat)
    for (let i = 0; i < 5; i++) {
        const loopDate = new Date(mondayDate);
        loopDate.setDate(mondayDate.getDate() + i);
        
        // Format tanggal untuk ID Storage (YYYY-MM-DD)
        const dateKey = loopDate.toISOString().split('T')[0];
        
        // Cek Data di LocalStorage
        const checkinData = localStorage.getItem('checkin_' + dateKey);
        
        // Buat Elemen HTML
        const pill = document.createElement('div');
        pill.className = 'day-pill';
        
        // Nama Hari (Senin, Selasa...)
        const dayName = loopDate.toLocaleDateString('id-ID', { weekday: 'long' });
        const dayNum = loopDate.getDate();

        let statusClass = '';
        let onclickAttr = '';

        // --- LOGIKA PENENTUAN WARNA ---
        
        const isSameDay = loopDate.getTime() === today.getTime();

        if (checkinData) {
            // KASUS 1: SUDAH DIISI (Apapun harinya) -> HIJAU
            statusClass = 'done';
            if (isSameDay) isTodayDone = true;
        } 
        else if (loopDate.getTime() < today.getTime()) {
            // KASUS 2: HARI SUDAH LEWAT & BELUM ISI -> MERAH
            statusClass = 'missed';
        } 
        else if (isSameDay) {
            // KASUS 3: HARI INI & BELUM ISI -> AKTIF (Bisa diklik)
            statusClass = 'today-active';
            onclickAttr = 'openCheckin()'; // Hanya hari ini yang bisa buka modal
        } 
        else {
            // KASUS 4: HARI ESOK/MASA DEPAN -> NORMAL (Abu-abu)
            statusClass = ''; 
        }

        // Pasang Class & Konten
        pill.className = `day-pill ${statusClass}`;
        pill.innerHTML = `
            <span class="day-name">${dayName}</span>
            <span class="day-num">${dayNum}</span>
        `;
        
        // Pasang Event Klik (Jika boleh diklik)
        if (onclickAttr) {
            pill.setAttribute('onclick', onclickAttr);
            pill.style.cursor = 'pointer';
        }

        container.appendChild(pill);
    }

    // Update Tombol Status di Pojok Kanan
    const checkinCard = document.querySelector('.checkin-card');
    if (isTodayDone) {
        statusBtn.className = "btn-pill success";
        statusBtn.innerText = "Completed ✔";
        // Matikan fungsi klik di card utama jika sudah selesai
        if (checkinCard) checkinCard.removeAttribute('onclick');
    } else {
        statusBtn.className = "btn-pill";
        statusBtn.innerText = "Click to fill";
        statusBtn.onclick = openCheckin;
        // Pastikan card utama bisa diklik jika belum check-in
        if (checkinCard) checkinCard.setAttribute('onclick', 'openCheckin()');
    }
}


// --- 1. LOGIKA CEK STATUS LOGIN & EVENT LISTENER (JALAN OTOMATIS SAAT WEB DIBUKA) ---
document.addEventListener("DOMContentLoaded", function() {
    const isLoggedIn = localStorage.getItem('statusLogin') === 'true';

    // --- LOGIKA STATUS LOGIN DI NAVBAR ---
    if (loginBtnNav) {
        if (isLoggedIn) {
            // Jika user SUDAH login:
            loginBtnNav.innerText = "Logout"; 
            loginBtnNav.classList.remove('nav-active'); 
            loginBtnNav.style.color = "red"; 
            
            // Ubah fungsi tombol menjadi Logout
            loginBtnNav.onclick = function() {
                logoutUser();
            };
            
            // Opsional: Aktifkan link Dashboard agar bisa diklik
            const dashboardLink = document.querySelector('nav a[data-link="dashboard"]'); 
            if(dashboardLink && dashboardLink.innerText === "Dashboard") {
                dashboardLink.href = "profile.html";
            }
        } else {
            // Jika user BELUM login:
            loginBtnNav.innerText = "Login";
            loginBtnNav.style.color = ""; // Reset warna
            loginBtnNav.onclick = function() {
                const isModalOpen = (loginModal && loginModal.style.display === "flex") || 
                                    (registerModal && registerModal.style.display === "flex");
                if (isModalOpen) {
                    closeAllModals();
                } else {
                    openLoginModal();
                }
            };
        }
    }

    // --- EVENT LISTENER UNTUK SUBMIT LOGIN FORM ---
    const loginForm = document.querySelector('#loginModal form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); 

            const usernameInput = loginForm.querySelector('input[type="text"]');
            const passwordInput = loginForm.querySelector('input[type="password"]');

            const username = usernameInput ? usernameInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value.trim() : '';

            if (!username) {
                alert('Username tidak boleh kosong.');
                if (usernameInput) usernameInput.focus();
                return;
            }
            if (!password) {
                alert('Password tidak boleh kosong.');
                if (passwordInput) passwordInput.focus();
                return;
            }
            // Simulate login success, save status
            localStorage.setItem('statusLogin', 'true');
            alert('Login berhasil!');

            // Close login modal
            closeAllModals();

            // Refresh login button state or reload page
            window.location.href = 'profile.html';
        });
    }

    // --- LOGIKA CERDAS DAILY CHECK-IN (PANGGIL SAAT DOM LOAD) ---
    renderWeeklyCheckin();

    // Tutup modal jika klik di luar kotak (area gelap)
    window.onclick = function(event) {
        const modalCheckin = document.getElementById('checkinModal');
        if (modalCheckin && event.target == modalCheckin) {
            closeCheckin();
        }
        const modalLogin = document.getElementById('loginModal');
        if (modalLogin && event.target == modalLogin) {
            closeAllModals();
        }
        const modalRegister = document.getElementById('registerModal');
        if (modalRegister && event.target == modalRegister) {
            closeAllModals();
        }
    }
});