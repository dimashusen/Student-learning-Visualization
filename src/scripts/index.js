// --- VARIABEL GLOBAL ---
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginBtnNav = document.getElementById('loginLink');

// --- 1. LOGIKA CEK STATUS LOGIN (JALAN OTOMATIS SAAT WEB DIBUKA) ---
document.addEventListener("DOMContentLoaded", function() {
    const isLoggedIn = localStorage.getItem('statusLogin') === 'true';

    if (isLoggedIn) {
        // Jika user SUDAH login:
        if (loginBtnNav) {
            loginBtnNav.innerText = "Logout";       // Ubah teks jadi Logout
            loginBtnNav.classList.remove('nav-active'); // Hapus style biru jika ada
            loginBtnNav.style.color = "red";        // (Opsional) Beri warna merah
            
            // Ubah fungsi tombol menjadi Logout
            loginBtnNav.onclick = function() {
                logoutUser();
            };
            
            // Opsional: Aktifkan link Dashboard agar bisa diklik
            const dashboardLink = document.querySelector('nav a[href="#"]'); 
            if(dashboardLink && dashboardLink.innerText === "Dashboard") {
                dashboardLink.href = "profile.html";
            }
        }
    } else {
        // Jika user BELUM login:
        if (loginBtnNav) {
            loginBtnNav.innerText = "Login";
            loginBtnNav.onclick = function() {
                if (loginModal.style.display === "flex" || registerModal.style.display === "flex") {
                    closeAllModals();
                } else {
                    openLoginModal();
                }
            };
        }
    }
    // Add event listener for login form submission
    const loginForm = document.querySelector('#loginModal form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent form default submit behavior

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
});

// --- 2. FUNGSI LOGOUT ---
function logoutUser() {
    // Hapus data login dari memori
    localStorage.removeItem('statusLogin');
    alert("Anda telah keluar.");
    // Reload halaman untuk mereset tampilan
    window.location.reload(); 
}


// --- 3. FUNGSI LOGIN GOOGLE (SIMULASI) ---
function handleGoogleLogin(buttonId) {
    const btn = document.getElementById(buttonId);
    const originalText = btn.querySelector('span').innerText;

    btn.disabled = true;
    btn.style.opacity = "0.7";
    btn.style.cursor = "not-allowed";
    btn.querySelector('span').innerText = "Menghubungkan...";

    setTimeout(() => {
        // SIMPAN STATUS LOGIN KE BROWSER
        localStorage.setItem('statusLogin', 'true');

        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
        btn.querySelector('span').innerText = originalText;

        // Redirect ke dashboard
        window.location.href = "profile.html"; 
    }, 1500);
}


// --- 4. FUNGSI NAVIGASI MODAL (TETAP SAMA) ---
function openLoginModal() {
    registerModal.style.display = "none";
    loginModal.style.display = "flex";
    if(loginBtnNav) loginBtnNav.classList.add('nav-active');
    clearErrors();
}

function switchToRegister() {
    loginModal.style.display = "none";
    registerModal.style.display = "flex";
    if(loginBtnNav) loginBtnNav.classList.add('nav-active');
    clearErrors();
}

function closeAllModals() {
    loginModal.style.display = "none";
    registerModal.style.display = "none";
    if(loginBtnNav) loginBtnNav.classList.remove('nav-active');
    clearErrors();
}

// --- 5. FUNGSI VALIDASI REGISTER (TETAP SAMA) ---
// (Pastikan kode validasi form Anda sebelumnya tetap ada di bawah sini jika ingin dipakai)
function clearErrors() {
    const inputs = document.querySelectorAll('.input-group-reg input');
    inputs.forEach(input => input.classList.remove('input-error'));
    const msgs = document.querySelectorAll('.error-msg');
    msgs.forEach(msg => msg.style.display = 'none');
}


/* --- LOGIKA DAILY CHECK-IN --- */
    
    // 1. Buka Modal
    function openCheckin() {
        const today = new Date().toISOString().split('T')[0];
        if (localStorage.getItem('checkin_' + today)) {
            alert("Anda sudah melakukan daily check-in hari ini. Tidak bisa mengisi lagi.");
            return;
        }
        document.getElementById('checkinModal').style.display = 'flex';
    }

    // 2. Tutup Modal
    function closeCheckin() {
        document.getElementById('checkinModal').style.display = 'none';
        resetForm(); // Reset pilihan saat ditutup
    }

    // 3. Pilih Mood (Emoji)
    let selectedMood = '';

    function selectMood(element, mood) {
        // Hapus kelas 'selected' dari semua emoji
        document.querySelectorAll('.emoji-item').forEach(el => el.classList.remove('selected'));
        
        // Tambah kelas 'selected' ke elemen yang diklik
        element.classList.add('selected');
        selectedMood = mood;
    }

    // 4. Submit Data

function submitCheckin() {
    // Cek apakah hari ini sudah daily check-in (green)
    const today = new Date().toISOString().split('T')[0];
    if (localStorage.getItem('checkin_' + today)) {
        alert("Anda sudah melakukan daily check-in hari ini. Tidak bisa mengisi lagi.");
        return;
    }

    const text = document.getElementById('progressText').value;

    if (!selectedMood) {
        alert("Silakan pilih mood Anda hari ini (Emoji)!");
        return;
    }
    if (text.trim() === "") {
        alert("Silakan isi progres Anda!");
        return;
    }

    // Simpan ke localStorage agar kotak berubah hijau
    const data = {
        date: today,
        mood: selectedMood,
        progress: text,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('checkin_' + today, JSON.stringify(data));

    alert(`Check-in Berhasil!\nMood: ${selectedMood}\nProgress: ${text}`);

    closeCheckin();

    // Update tampilan kalender jadi hijau untuk hari ini
    renderWeeklyCheckin();
}

    // 5. Reset Form Helper
    function resetForm() {
        document.querySelectorAll('.emoji-item').forEach(el => el.classList.remove('selected'));
        document.getElementById('progressText').value = "";
        selectedMood = '';
    }

    // Tutup modal jika klik di luar kotak (area gelap)
    window.onclick = function(event) {
        const modal = document.getElementById('checkinModal');
        if (event.target == modal) {
            closeCheckin();
        }
    }

    // --- LOGIKA CERDAS DAILY CHECK-IN ---

    document.addEventListener("DOMContentLoaded", function() {
        renderWeeklyCheckin();
    });

    // 1. Fungsi Render Kalender Mingguan
    function renderWeeklyCheckin() {
        const container = document.getElementById('checkinContainer');
        const statusBtn = document.getElementById('checkinStatusBtn');
        const monthLabel = document.getElementById('currentMonthYear');
        
        container.innerHTML = ""; // Bersihkan isi lama
        
        const today = new Date();
        today.setHours(0,0,0,0); // Reset jam agar perbandingan tanggal akurat

        // Update Label Bulan & Tahun
        const options = { year: 'numeric', month: 'long' };
        monthLabel.innerText = today.toLocaleDateString('id-ID', options);

        // Cari hari Senin minggu ini
        const currentDay = today.getDay(); // 0=Minggu, 1=Senin, ...
        const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
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
            
            if (checkinData) {
                // KASUS 1: SUDAH DIISI (Apapun harinya) -> HIJAU
                statusClass = 'done';
                if (loopDate.getTime() === today.getTime()) isTodayDone = true;
            } 
            else if (loopDate.getTime() < today.getTime()) {
                // KASUS 2: HARI SUDAH LEWAT & BELUM ISI -> MERAH
                statusClass = 'missed';
            } 
            else if (loopDate.getTime() === today.getTime()) {
                // KASUS 3: HARI INI & BELUM ISI -> AKTIF (Bisa diklik)
                statusClass = 'today-active';
                onclickAttr = 'openCheckin()'; // Hanya hari ini yang bisa buka modal
            } 
            else {
                // KASUS 4: HARI ESOK -> NORMAL (Abu-abu)
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
        if (isTodayDone) {
            statusBtn.className = "btn-pill success";
            statusBtn.innerText = "Completed ✔";
            // Matikan fungsi klik di card utama jika sudah selesai
            document.querySelector('.checkin-card').removeAttribute('onclick');
        } else {
            statusBtn.className = "btn-pill";
            statusBtn.innerText = "Click to fill";
            statusBtn.onclick = openCheckin;
        }
    }

    // 2. Logika Submit (Update)
    // Pastikan fungsi submitCheckin Anda diupdate seperti ini:
    function submitCheckin() {
        const text = document.getElementById('progressText').value;
        
        // Validasi (Pastikan selectedMood didefinisikan di script global Anda)
        if (typeof selectedMood === 'undefined' || !selectedMood) {
            alert("Silakan pilih mood Anda hari ini!");
            return;
        }
        if (text.trim() === "") {
            alert("Silakan isi progres Anda!");
            return;
        }

        // --- SIMPAN KE LOCAL STORAGE ---
        const today = new Date();
        const dateKey = today.toISOString().split('T')[0]; // Key: "2025-11-24"
        
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

    // --- (Fungsi Modal Bawaan Anda Tetap Sama) ---
    function openCheckin() { document.getElementById('checkinModal').style.display = 'flex'; }
    function closeCheckin() { document.getElementById('checkinModal').style.display = 'none'; resetForm(); }
    
    let selectedMood = '';
    function selectMood(element, mood) {
        document.querySelectorAll('.emoji-item').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
        selectedMood = mood;
    }
    
    function resetForm() {
        document.querySelectorAll('.emoji-item').forEach(el => el.classList.remove('selected'));
        document.getElementById('progressText').value = "";
        selectedMood = '';
