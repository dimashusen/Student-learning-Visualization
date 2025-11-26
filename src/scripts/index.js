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


/**
 * SCRIPT.JS - ALL IN ONE
 * Mengatur logika Dashboard, Notifikasi, Profil, dan Tema dalam satu file.
 */

// =========================================
// 1. KONFIGURASI & STATE GLOBAL
// =========================================
const CHECKIN_STORAGE_KEY = 'dicoding_checkins_v1';
const THEME_STORAGE_KEY = 'theme';

let state = {
    darkMode: localStorage.getItem(THEME_STORAGE_KEY) === 'dark',
    expandedModuleId: null,
    isChartVisible: false,
    checkins: JSON.parse(localStorage.getItem(CHECKIN_STORAGE_KEY)) || {}
};

// Helper untuk mengambil elemen
const el = id => document.getElementById(id);

// Variabel Chart Global
let skillRadarChartInstance = null;
let studyChartInstance = null;


// =========================================
// 2. INISIALISASI (ROUTER)
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // A. Init Icon Lucide (Wajib)
    if (window.lucide) lucide.createIcons();

    // B. Fitur Global (Tema & Navigasi)
    setupDarkMode();
    setupGlobalInteractions();
    updateGlobalBadge(); // Update angka notif di sidebar

    // C. Cek Halaman Apa yang Aktif?
    
    // -> Jika Halaman Dashboard (Ada Chart)
    if (document.getElementById('skillRadarChart')) {
        initDashboard();
    }

    // -> Jika Halaman Notifikasi (Ada List Notif)
    if (document.getElementById('notif-list')) {
        initNotificationPage();
    }

    // -> Jika Halaman Profil (Ada Container Kursus)
    if (document.getElementById('courseContainer')) {
        initProfilePage();
    }
});


// =========================================
// 3. FITUR GLOBAL (TEMA & NAVBAR)
// =========================================

function setupDarkMode() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    
    // 1. Terapkan tema saat load
    if (state.darkMode) {
        htmlElement.classList.add('dark');
    } else {
        htmlElement.classList.remove('dark');
    }

    // 2. Handle Klik Tombol
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            state.darkMode = !state.darkMode;
            htmlElement.classList.toggle('dark');

            // Simpan State
            localStorage.setItem(THEME_STORAGE_KEY, state.darkMode ? 'dark' : 'light');

            // Update Chart Warna (Jika di dashboard)
            if (typeof updateChartTheme === 'function') updateChartTheme();
            
            // Refresh Icon (Matahari/Bulan)
            if (window.lucide) lucide.createIcons();
        });
    }
}

function setupGlobalInteractions() {
    // Dropdown Notifikasi & Profil di Navbar
    const notifBtn = document.getElementById('notif-menu-btn');
    const notifDrop = document.getElementById('notif-dropdown');
    const profileBtn = document.getElementById('profile-menu-btn');
    const profileDrop = document.getElementById('profile-dropdown');

    // Klik tombol notif
    if (notifBtn && notifDrop) {
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notifDrop.classList.toggle('hidden');
            if (profileDrop) profileDrop.classList.add('hidden');
        });
    }

    // Klik tombol profil
    if (profileBtn && profileDrop) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDrop.classList.toggle('hidden');
            if (notifDrop) notifDrop.classList.add('hidden');
        });
    }

    // Klik di luar (Tutup semua)
    document.addEventListener('click', (e) => {
        if (notifBtn && notifDrop && !notifBtn.contains(e.target) && !notifDrop.contains(e.target)) {
            notifDrop.classList.add('hidden');
        }
        if (profileBtn && profileDrop && !profileBtn.contains(e.target) && !profileDrop.contains(e.target)) {
            profileDrop.classList.add('hidden');
        }
    });
}

function updateGlobalBadge() {
    // Update badge merah di sidebar jika ada notif unread
    const badge = document.getElementById('sidebar-badge');
    // Hitung jumlah .unread di halaman notifikasi (jika ada) atau pakai dummy
    const count = document.querySelectorAll('.notif-item.unread').length || 3; 
    if (badge) {
        badge.innerText = count;
        badge.style.display = count === 0 ? 'none' : 'inline-block';
    }
}


// =========================================
// 4. HALAMAN DASHBOARD
// =========================================

function initDashboard() {
    // Render Komponen
    renderMilestones();
    renderModules();
    renderCheckinGrid();
    renderSkillBreakdown();
    initCharts();

    // Listener Modal Check-in
    if(el('close-checkin-modal')) el('close-checkin-modal').addEventListener('click', closeCheckinModal);
    if(el('checkin-backdrop')) el('checkin-backdrop').addEventListener('click', closeCheckinModal);
    if(el('view-checkin-btn')) el('view-checkin-btn').addEventListener('click', () => openCheckinModal(new Date().toISOString().split('T')[0]));
    if(el('reset-checkin-btn')) el('reset-checkin-btn').addEventListener('click', () => { 
        if(confirm("Reset data check-in?")) { localStorage.removeItem(CHECKIN_STORAGE_KEY); state.checkins = {}; renderCheckinGrid(); } 
    });
}

// --- DATA DUMMY DASHBOARD ---
const milestones = [
    { title: "Web Dasar", desc: "HTML, CSS, Layouting", status: "completed" },
    { title: "JavaScript Core", desc: "ES6, DOM, Async", status: "completed" },
    { title: "Front-End Expert", desc: "React, PWA, Testing", status: "current" },
    { title: "Back-End Basics", desc: "NodeJS, Hapi, REST API", status: "locked" },
    { title: "Capstone Project", desc: "Final Application", status: "locked", isLast: true }
];

const modulesData = [
    { id: 1, title: "Fundamental Front-End Web Development", score: 98, category: "Core Path", progress: 100, status: "Completed", colorClass: "bg-green-500", lessons: [{ title: "HTML5 & Semantic Elements", type: "video" }, { title: "CSS3 Flexbox Layouts", type: "quiz" }, { title: "Submission: Landing Page", type: "code" }] },
    { id: 2, title: "Building Interactive Apps with React", score: null, category: "Specialization", progress: 75, status: "In Progress", colorClass: "bg-blue-500", lessons: [{ title: "React Component Lifecycle", type: "video" }, { title: "State Management (Hooks)", type: "video" }, { title: "Submission: Bookshelf App", type: "code" }] },
    { id: 3, title: "Automated Testing & CI/CD Pipelines", score: null, category: "DevOps", progress: 0, status: "Locked", colorClass: "bg-slate-400", lessons: [] }
];

const skillDetails = [
    { name: 'HTML & CSS', score: 92, avg: 75, level: 'Expert', icon: 'layout' },
    { name: 'JavaScript', score: 88, avg: 70, level: 'Advanced', icon: 'file-code-2' },
    { name: 'React', score: 85, avg: 60, level: 'Advanced', icon: 'atom' },
    { name: 'Testing', score: 65, avg: 50, level: 'Intermediate', icon: 'test-tube-2' },
    { name: 'DevOps', score: 55, avg: 45, level: 'Intermediate', icon: 'git-merge' },
    { name: 'Soft Skills', score: 80, avg: 75, level: 'Advanced', icon: 'users' }
];

// --- RENDERER DASHBOARD ---
function renderMilestones() {
    const container = el('milestone-container');
    if(!container) return;
    container.innerHTML = milestones.map(m => {
        const isCompleted = m.status === 'completed';
        const isCurrent = m.status === 'current';
        const isLocked = m.status === 'locked';
        let dotClass = isCompleted ? 'bg-green-500 border-green-500 shadow-[0_0_0_4px_rgba(34,197,94,0.2)]' : isCurrent ? 'bg-white border-dicodingBlue shadow-[0_0_0_4px_rgba(37,99,235,0.2)] scale-110' : (state.darkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200');
        let textClass = isCurrent ? 'text-dicodingBlue' : isCompleted ? (state.darkMode ? 'text-white' : 'text-slate-800') : 'text-slate-400';
        return `<div class="relative group cursor-pointer ${isLocked ? 'opacity-50' : 'opacity-100'}"><div class="absolute -left-[25px] top-0 w-3 h-3 rounded-full border-2 z-10 transition-all duration-300 ${dotClass}"></div><div class="flex flex-col ${!m.isLast ? 'mb-2' : ''}"><h4 class="text-xs font-bold transition-colors ${textClass}">${m.title}</h4><p class="text-[10px] text-slate-500">${m.desc}</p></div></div>`;
    }).join('');
}

function renderModules() {
    const container = el('modules-dynamic-container');
    if(!container) return;
    container.innerHTML = modulesData.map(m => {
        const isExpanded = state.expandedModuleId === m.id;
        const isLocked = m.status === 'Locked';
        const expandClass = isExpanded ? 'slide-down' : 'slide-up';
        const containerClass = isExpanded ? 'bg-slate-50 dark:bg-slate-800/50 ring-2 ring-blue-100 dark:ring-slate-700' : 'bg-white dark:bg-slate-800 hover:shadow-md';
        
        // Lessons HTML
        const lessonsHtml = m.lessons.map(l => `<div class="flex items-center justify-between p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"><div class="flex items-center gap-3"><i data-lucide="${l.type === 'video' ? 'play-circle' : 'file-code'}" class="w-4 h-4 text-slate-400"></i><span class="text-xs font-medium text-slate-700 dark:text-slate-300">${l.title}</span></div>${m.status === 'Completed' ? '<i data-lucide="check" class="w-3 h-3 text-green-500"></i>' : ''}</div>`).join('');

        return `<div class="rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-all duration-300 ${containerClass}"><div class="p-4 flex items-center gap-4 cursor-pointer" onclick="toggleModule(${m.id})"><div class="w-12 h-12 bg-navy rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-xs shadow-sm">${m.title.substring(0,2).toUpperCase()}</div><div class="flex-1 min-w-0"><div class="flex justify-between mb-1"><h4 class="text-sm font-bold text-navy dark:text-white truncate ${m.status === 'In Progress' ? 'text-blue-600 dark:text-blue-400' : ''}">${m.title}</h4><div class="flex items-center gap-2">${m.score ? `<span class="font-bold text-navy dark:text-white">${m.score}</span>` : ''}<i data-lucide="${isLocked ? 'lock' : (m.score ? 'check-circle-2' : 'play-circle')}" class="w-4 h-4 ${isLocked ? 'text-slate-300' : (m.score ? 'text-green-500' : 'text-blue-500')}"></i></div></div><p class="text-[10px] text-slate-400 mb-2">${m.category} ${isExpanded ? '' : '• Click to expand'}</p><div class="flex items-center gap-3"><div class="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div class="h-full ${m.colorClass} rounded-full transition-all duration-1000" style="width: ${m.progress}%"></div></div><span class="text-xs font-bold text-slate-400">${m.progress}%</span></div></div></div><div class="${expandClass} bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700"><div class="p-4 space-y-3"><p class="text-xs font-bold text-slate-500 uppercase">Syllabus</p>${lessonsHtml}<div class="pt-2 flex justify-end"><button class="px-4 py-2 bg-dicodingBlue hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2">Lanjut Belajar <i data-lucide="arrow-right" class="w-3 h-3"></i></button></div></div></div></div>`;
    }).join('');
    if(window.lucide) lucide.createIcons();
}

function renderSkillBreakdown() {
    const container = el('skill-breakdown-container');
    if(!container) return;
    container.innerHTML = skillDetails.map(skill => {
        let colorClass = skill.score >= 80 ? 'bg-dicodingBlue' : skill.score >= 70 ? 'bg-pinkText' : 'bg-yellow-500';
        let badgeClass = skill.level === 'Expert' ? 'badge-expert' : skill.level === 'Advanced' ? 'badge-advanced' : 'badge-intermediate';
        return `<div class="group p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-all hover:shadow-sm"><div class="flex justify-between items-start mb-2"><div class="flex items-center gap-3"><div class="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-slate-500 dark:text-slate-300"><i data-lucide="${skill.icon}" class="w-4 h-4"></i></div><div><h4 class="text-sm font-bold text-navy dark:text-white leading-none mb-1">${skill.name}</h4><span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${badgeClass}">${skill.level}</span></div></div><div class="text-right"><span class="text-lg font-extrabold text-navy dark:text-white">${skill.score}</span><span class="text-[10px] text-slate-400 block">/ 100</span></div></div><div class="space-y-1.5"><div class="flex items-center gap-2"><span class="text-[10px] font-bold text-slate-500 w-6">You</span><div class="flex-1 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden"><div class="h-full ${colorClass} rounded-full skill-bar-fill" style="width: ${skill.score}%"></div></div></div><div class="flex items-center gap-2"><span class="text-[10px] font-bold text-slate-400 w-6">Avg</span><div class="flex-1 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden"><div class="h-full bg-slate-400 rounded-full" style="width: ${skill.avg}%"></div></div></div></div></div>`;
    }).join('');
    if(window.lucide) lucide.createIcons();
}

function renderCheckinGrid() {
    const container = el('daily-checkin-grid');
    if(!container) return;
    const today = new Date();
    const getMonday = (d) => { d = new Date(d); var day = d.getDay(), diff = d.getDate() - day + (day == 0 ? -6 : 1); return new Date(d.setDate(diff)); }
    const monday = getMonday(new Date());
    const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    let html = '';
    
    for (let i = 0; i < 5; i++) {
        const currentDay = new Date(monday);
        currentDay.setDate(monday.getDate() + i);
        const dateKey = currentDay.toISOString().split('T')[0];
        const isToday = today.toISOString().split('T')[0] === dateKey;
        const isPast = currentDay < today && !isToday;
        const isCheckedIn = state.checkins[dateKey];
        let containerClass = "bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 opacity-60 cursor-default";
        let textClass = "text-slate-500 dark:text-slate-400";
        let numberClass = "text-slate-600 dark:text-slate-400";
        let onclick = "";

        if (isCheckedIn) {
            containerClass = "bg-greenAccent border-green-200 cursor-default"; textClass = "text-greenText"; numberClass = "text-greenText";
        } else if (isToday) {
            containerClass = "bg-pinkAccent border-2 border-pinkText shadow-sm transform scale-105 cursor-pointer hover:shadow-md transition-all"; textClass = "text-pinkText"; numberClass = "text-pinkText"; onclick = `openCheckinModal('${dateKey}')`;
        } else if (isPast) {
            containerClass = "bg-red-50 border border-red-200 opacity-80 cursor-default"; textClass = "text-red-500"; numberClass = "text-red-500";
        }
        html += `<div class="flex flex-col items-center p-3 rounded-2xl border ${containerClass}" onclick="${onclick}"><span class="text-[10px] font-bold ${textClass} mb-1">${dayNames[i]}</span><span class="text-xl font-bold ${numberClass}">${currentDay.getDate()}</span>${isCheckedIn ? '<i data-lucide="check" class="w-3 h-3 mt-1 text-green-600"></i>' : ''}</div>`;
    }
    container.innerHTML = html;
    const dateDisplay = el('current-date-display');
    if(dateDisplay) dateDisplay.innerHTML = `<span class="block font-bold text-navy dark:text-slate-300">${today.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span><span class="text-right block text-xs opacity-70">Week ${Math.ceil((((today - new Date(Date.UTC(today.getFullYear(),0,1))) / 86400000) + 1)/7)}</span>`;
    if(window.lucide) lucide.createIcons();
}

function initCharts() {
    if (!el('skillRadarChart')) return;
    const ctxSkill = el('skillRadarChart').getContext('2d');
    const isDark = state.darkMode;
    
    skillRadarChartInstance = new Chart(ctxSkill, {
        type: 'radar',
        data: {
            labels: skillDetails.map(s => s.name),
            datasets: [
                { label: 'You', data: skillDetails.map(s => s.score), backgroundColor: 'rgba(0, 102, 255, 0.4)', borderColor: '#0066FF', borderWidth: 2 },
                { label: 'Avg', data: skillDetails.map(s => s.avg), backgroundColor: 'rgba(203, 213, 225, 0.3)', borderColor: '#94a3b8', borderWidth: 2, borderDash: [5, 5] }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: isDark ? '#334155' : '#E2E8F0' },
                    grid: { color: isDark ? '#334155' : '#E2E8F0' },
                    pointLabels: { color: isDark ? '#cbd5e1' : '#64748B', font: { size: 10, weight: '700' } },
                    ticks: { display: false, backdropColor: 'transparent' }
                }
            },
            plugins: { legend: { display: false } }
        }
    });

    if(el('studyActivityChart')) {
        const ctxStudy = el('studyActivityChart').getContext('2d');
        studyChartInstance = new Chart(ctxStudy, {
            type: 'bar',
            data: {
                labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
                datasets: [{ label: 'Hours', data: [2, 4.5, 3, 6, 4, 8, 2], backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 4, barThickness: 12 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { display: false } } }
        });
    }
}

function updateChartTheme() {
    if (skillRadarChartInstance) {
        const isDark = document.documentElement.classList.contains('dark');
        const gridColor = isDark ? '#334155' : '#E2E8F0';
        const labelColor = isDark ? '#cbd5e1' : '#64748B';
        skillRadarChartInstance.options.scales.r.angleLines.color = gridColor;
        skillRadarChartInstance.options.scales.r.grid.color = gridColor;
        skillRadarChartInstance.options.scales.r.pointLabels.color = labelColor;
        skillRadarChartInstance.update();
    }
}

// --- ACTIONS DASHBOARD ---
window.toggleModule = function(id) { state.expandedModuleId = state.expandedModuleId === id ? null : id; renderModules(); };
window.toggleStudyChart = function() {
    state.isChartVisible = !state.isChartVisible;
    const sSummary = el('study-summary');
    const sChart = el('study-chart-container');
    if(sSummary && sChart) {
        if (state.isChartVisible) { sSummary.classList.add('opacity-0', 'scale-95'); sChart.classList.remove('opacity-0', 'pointer-events-none', 'scale-95'); sChart.classList.add('opacity-100', 'scale-100', 'pointer-events-auto'); }
        else { sSummary.classList.remove('opacity-0', 'scale-95'); sChart.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto'); sChart.classList.add('opacity-0', 'pointer-events-none', 'scale-95'); }
    }
};
window.openCheckinModal = function(dateKey) { const modal = el('checkin-modal'); if(modal) { modal.classList.remove('hidden'); setTimeout(() => modal.classList.add('opacity-100'), 10); } };
window.closeCheckinModal = function() { const modal = el('checkin-modal'); if(modal) { modal.classList.remove('opacity-100'); setTimeout(() => modal.classList.add('hidden'), 300); } };
window.selectMood = function(btn, color, bg) {
    document.querySelectorAll('.mood-btn').forEach(b => { b.classList.remove('border-red-400', 'bg-red-50', 'border-yellow-400', 'bg-yellow-50', 'border-green-400', 'bg-green-50', 'ring-2'); const e = b.querySelector('.emoji'); if(e) { e.style.filter = 'grayscale(100%)'; e.style.transform = 'scale(1)'; } });
    btn.classList.add('border-' + color, 'bg-' + bg.replace('bg-',''), 'ring-2'); const activeEmoji = btn.querySelector('.emoji'); if(activeEmoji) { activeEmoji.style.filter = 'grayscale(0%)'; activeEmoji.style.transform = 'scale(1.2)'; }
};


// =========================================
// 5. HALAMAN NOTIFIKASI
// =========================================

function initNotificationPage() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const emptyState = el('empty-state');
    const items = document.querySelectorAll('.notif-item');

    // 1. Filter Function
    window.filterNotifications = function(filter) {
        tabBtns.forEach(btn => {
            if(btn.dataset.filter === filter) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        let visibleCount = 0;
        items.forEach(item => {
            let show = false;
            if (filter === 'all') show = true;
            else if (filter === 'unread' && item.classList.contains('unread')) show = true;
            else if (filter === 'system' && item.classList.contains('system')) show = true;

            item.style.display = show ? 'flex' : 'none';
            if(show) visibleCount++;
        });

        if(emptyState) {
            emptyState.classList.toggle('hidden', visibleCount > 0);
            emptyState.style.display = visibleCount === 0 ? 'flex' : 'none';
        }
    };

    // 2. Mark Read Function
    window.markRead = function(element) {
        if (element.classList.contains('unread')) {
            element.classList.remove('unread');
            element.classList.add('read');
            const dot = element.querySelector('.unread-dot');
            if (dot) dot.remove();
            updateGlobalBadge();
        }
    };

    // 3. Mark All Read
    window.markAllRead = function() {
        document.querySelectorAll('.notif-item.unread').forEach(item => markRead(item));
    };

    // 4. Delete Function
    window.deleteNotif = function(event, btn) {
        event.stopPropagation();
        const item = btn.closest('.notif-item');
        item.style.transform = 'translateX(100%)';
        item.style.opacity = '0';
        setTimeout(() => {
            item.remove();
            updateGlobalBadge();
            const activeBtn = document.querySelector('.tab-btn.active');
            if(activeBtn) filterNotifications(activeBtn.dataset.filter);
        }, 300);
    };
}


// =========================================
// 6. HALAMAN PROFIL
// =========================================

function initProfilePage() {
    const courses = [
        { title: "Memulai Dasar Pemrograman untuk Menjadi Pengembang Software", image: "https://placehold.co/150x150/png?text=Software", hours: 9, rating: 4.88, level: "Dasar", status: "Lulus" },
        { title: "Belajar Dasar Cloud dan Gen AI di AWS", image: "https://placehold.co/150x150/png?text=AWS", hours: 10, rating: 4.82, level: "Dasar", status: "Lulus" },
        { title: "Belajar Fundamental Front-End Web Development", image: "https://placehold.co/150x150/png?text=FrontEnd", hours: 80, rating: 4.89, level: "Menengah", status: "Lulus" },
        { title: "Memulai Pemrograman dengan Python", image: "https://placehold.co/150x150/png?text=Python", hours: 60, rating: 4.82, level: "Dasar", status: "Lulus" }
    ];

    const courseContainer = el('courseContainer');
    if(courseContainer) {
        courseContainer.innerHTML = courses.map(course => `
            <div class="course-card">
                <div class="course-img"><img src="${course.image}" alt="${course.title}"></div>
                <div class="course-info">
                    <div><div class="status-badge status-passed"><i data-lucide="check-circle-2"></i><span class="status-text">${course.status}</span></div><h3 class="course-title">${course.title}</h3></div>
                    <div class="course-meta"><div class="meta-item"><i data-lucide="clock"></i> ${course.hours} Jam</div><div class="meta-item"><i data-lucide="star" style="color: #facc15; fill: currentColor;"></i> ${course.rating}</div><div class="meta-item tag-badge"><i data-lucide="bar-chart-2"></i> ${course.level}</div></div>
                </div>
            </div>
        `).join('');
    }

    // Tab Logic Profil
    const tabs = document.querySelectorAll('.tab-item');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    if(window.lucide) lucide.createIcons();
}










