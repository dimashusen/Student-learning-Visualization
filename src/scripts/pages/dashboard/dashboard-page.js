// --- MOCK DATA & HELPERS (Simulasi Backend/API - Internal) ---

const getStudentData = async (email) => {
    // Mock Data: Progress Ari Gunawan
    const rawData = [
        { 
            title: "Belajar Dasar Pemrograman Web", 
            isCompleted: "1", 
            active_tutorials: "131", 
            completed_tutorials: "131", 
            score: "100", 
            level: "Dasar", 
            hours: 46, 
            rating: 4.8, 
            startDate: "2025-01-10", 
            endDate: "2025-02-15", 
            description: "Pelajari dasar pembuatan website dengan HTML, CSS, dan teknik layouting modern." 
        },
        { 
            title: "Belajar Fundamental Aplikasi Android", 
            isCompleted: "1", 
            active_tutorials: "107", 
            completed_tutorials: "107", 
            score: "100", 
            level: "Menengah", 
            hours: 140, 
            rating: 4.9, 
            startDate: "2025-03-01", 
            endDate: "2025-04-20", 
            description: "Kuasai fundamental pembuatan aplikasi Android dengan Android Studio dan Kotlin." 
        }, 
        { 
            title: "Belajar Membuat Aplikasi Back-End untuk Pemula dengan Google Cloud", 
            isCompleted: "1", 
            active_tutorials: "108", 
            completed_tutorials: "110", 
            score: "90", 
            level: "Pemula", 
            hours: 45, 
            rating: 4.7, 
            startDate: "2025-05-05", 
            endDate: "2025-05-30", 
            description: "Belajar membuat RESTful API sederhana dan deploy ke Google Cloud Platform." 
        },
        { 
            title: "Belajar Pengembangan Aplikasi Android Intermediate", 
            isCompleted: "1", 
            active_tutorials: "115", 
            completed_tutorials: "115", 
            score: "0", 
            level: "Mahir", 
            hours: 150, 
            rating: 4.8, 
            startDate: "2025-06-01", 
            endDate: "2025-08-10", 
            description: "Tingkatkan skill Android Developer kamu dengan materi advanced seperti Testing dan Performance." 
        }, 
        { 
            title: "Belajar Fundamental Deep Learning", 
            isCompleted: "0", 
            active_tutorials: "131", 
            completed_tutorials: "67", 
            score: "0", 
            level: "Menengah", 
            hours: 110, 
            rating: 4.9, 
            startDate: "2025-09-01", 
            endDate: "-", 
            description: "Pelajari konsep Deep Learning dan Neural Network menggunakan TensorFlow." 
        }, 
        { 
            title: "Belajar Dasar Pemrograman JavaScript", 
            isCompleted: "1", 
            active_tutorials: "12", 
            completed_tutorials: "12", 
            score: "88", 
            level: "Dasar", 
            hours: 46, 
            rating: 4.8, 
            startDate: "2024-12-01", 
            endDate: "2024-12-25", 
            description: "Fondasi utama untuk menjadi Web Developer handal dengan menguasai JavaScript." 
        }, 
        { 
            title: "Belajar Membuat Aplikasi Front-End Pemula", 
            isCompleted: "0", 
            active_tutorials: "10", 
            completed_tutorials: "7", 
            score: "78", 
            level: "Pemula", 
            hours: 45, 
            rating: 4.7, 
            startDate: "2025-10-01", 
            endDate: "-", 
            description: "Langkah awal membuat aplikasi web interaktif dengan manipulasi DOM dan Web Storage." 
        },
        { 
            title: "Belajar Fundamental Aplikasi React", 
            isCompleted: "0", 
            active_tutorials: "10", 
            completed_tutorials: "1", 
            score: "0", 
            level: "Menengah", 
            hours: 100, 
            rating: 4.9, 
            startDate: "-", 
            endDate: "-", 
            description: "Bangun aplikasi web modern yang cepat dan modular menggunakan library React." 
        },
        { 
            title: "Menjadi React Web Developer Expert", 
            isCompleted: "0", 
            active_tutorials: "15", 
            completed_tutorials: "0", 
            score: "0", 
            level: "Mahir", 
            hours: 110, 
            rating: 4.9, 
            startDate: "-", 
            endDate: "-", 
            description: "Kuasai teknik advanced React seperti Automation Testing, CI/CD, dan State Management." 
        }, 
    ];

    return rawData.map(course => ({
        ...course,
        isCompleted: course.isCompleted === "1",
        score: parseInt(course.score, 10) || 0,
        active_tutorials: parseInt(course.active_tutorials, 10) || 1,
        completed_tutorials: parseInt(course.completed_tutorials, 10) || 0,
    }));
};

const getUsers = async () => {
    return [
        { name: "Ari Gunawan", email: "ari.gunawan93@example.com" },
        { name: "Guest User", email: "guest@example.com" }
    ];
};

// Helper Modal (Pengganti alert/confirm)
const createCustomModal = (title, body, footerContent) => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay show';
    modal.innerHTML = `
        <div class="modal-content" style="width: 350px; text-align: center;">
            <div class="modal-header" style="justify-content: center;">
                <h3>${title}</h3>
            </div>
            <div class="modal-body">${body}</div>
            <div class="modal-footer" style="text-align: center;">${footerContent}</div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
};

// --- DASHBOARD PAGE MODULE ---

const DashboardPage = {
    async render() {
        // 1. AMBIL DATA USER DARI LOCALSTORAGE
        const userStr = localStorage.getItem('userInfo');
        const user = userStr ? JSON.parse(userStr) : { name: "Guest", email: "" };

        // Default displayName
        let displayName = user.name ? user.name.toUpperCase() : "GUEST";

        // Enrich name jika email cocok (Simulasi)
        if (user && user.email) {
            try {
                const allUsers = await getUsers();
                const matched = allUsers.find(u => u.email && u.email.toLowerCase() === user.email.toLowerCase());
                if (matched && matched.name) {
                    displayName = matched.name.toUpperCase();
                }
            } catch (err) {
                console.warn('Gagal mengambil daftar user:', err);
            }
        }

        // --- LOGIKA TANGGAL & CHECK-IN ---
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dayOfWeek = today.getDay(); 
        const dayAdjusted = dayOfWeek === 0 ? 7 : dayOfWeek;
        const monday = new Date(today);
        monday.setDate(today.getDate() - (dayAdjusted - 1));

        const storedCheckins = localStorage.getItem('dailyCheckins');
        const checkinData = storedCheckins ? JSON.parse(storedCheckins) : {};

        // Mock data checkin hari Selasa agar terlihat ada isinya
        const tuesday = new Date(today);
        tuesday.setDate(today.getDate() - 2);
        const tuesdayKey = tuesday.toISOString().split('T')[0];
        if (!checkinData[tuesdayKey]) checkinData[tuesdayKey] = { emoji: 'Great', note: 'Done' };

        const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
        
        const checkinPillsHTML = days.map((dayName, index) => {
            const currentLoopDate = new Date(monday);
            currentLoopDate.setDate(monday.getDate() + index);
            currentLoopDate.setHours(0, 0, 0, 0);

            const dateKey = currentLoopDate.toISOString().split('T')[0];
            
            let statusClass = 'future'; 
            let isClickable = false;
            const isDone = checkinData[dateKey];

            if (isDone) {
                statusClass = 'done'; 
            } else {
                if (currentLoopDate.getTime() < today.getTime()) {
                    statusClass = 'missed'; 
                } else if (currentLoopDate.getTime() === today.getTime()) {
                    statusClass = 'active-today'; 
                    isClickable = true;
                }
            }

            const clickAttr = isClickable ? `onclick="window.handleCheckinClick('${dateKey}')"` : '';
            const cursorStyle = isClickable ? 'cursor: pointer;' : '';
            
            return `
                <div class="day-pill-vertical ${statusClass}" ${clickAttr} style="${cursorStyle}" id="pill-${dateKey}" data-date="${dateKey}">
                    <span class="pill-day">${dayName}</span>
                    <span class="pill-num">${currentLoopDate.getDate()}</span>
                </div>
            `;
        }).join('');

        const todayLocalized = new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'});
        const endOfWeek = new Date(monday.getTime() + 4 * 24 * 60 * 60 * 1000);
        const weekRange = `${monday.getDate()} - ${endOfWeek.getDate()} ${new Date().toLocaleString('default', { month: 'long' })}`;

        return `
            <style>
                /* ... (Style tetap sama agar rapi) ... */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 9999; display: flex; justify-content: center; align-items: center; opacity: 0; visibility: hidden; transition: all 0.3s ease; }
                .modal-overlay.show { opacity: 1; visibility: visible; }
                .modal-content { background: white; width: 450px; max-width: 90%; border-radius: 12px; padding: 24px; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.2); font-family: 'Poppins', sans-serif; }
                
                /* Module Detail Styles */
                .module-detail-header { display: flex; align-items: center; margin-bottom: 20px; }
                .module-detail-icon { width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 30px; color: white; margin-right: 15px; flex-shrink: 0; }
                .module-detail-title h2 { font-size: 18px; color: #333; margin: 0 0 5px 0; }
                .module-detail-badge { font-size: 11px; padding: 4px 8px; border-radius: 12px; font-weight: 600; display: inline-block; }
                .badge-dasar { background: #e3f2fd; color: #1976d2; }
                .badge-pemula { background: #e8f5e9; color: #2e7d32; }
                .badge-menengah { background: #fff3e0; color: #f57c00; }
                .badge-mahir { background: #ffebee; color: #c62828; }
                
                .module-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; background: #f9f9f9; padding: 15px; border-radius: 10px; }
                .meta-item { display: flex; flex-direction: column; }
                .meta-label { font-size: 11px; color: #888; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
                .meta-value { font-size: 13px; font-weight: 600; color: #333; }
                .module-description { font-size: 13px; color: #555; line-height: 1.6; margin-bottom: 20px; border-top: 1px solid #eee; padding-top: 15px; }
                .module-action-btn { width: 100%; padding: 12px; border-radius: 8px; border: none; background: #2196f3; color: white; font-weight: 600; cursor: pointer; font-size: 14px; transition: background 0.2s; }
                .module-action-btn:hover { background: #1976d2; }
                .close-modal { position: absolute; right: 20px; top: 20px; font-size: 24px; cursor: pointer; color: #999; }

                /* Other styles needed for the layout */
                .dashboard-body { display: flex; min-height: 100vh; font-family: 'Poppins', sans-serif; background: #f4f6f9; }
                .sidebar { width: 220px; background-color: #2d3e50; color: white; padding: 20px 0; }
                .sidebar-header { padding: 0 20px 30px; }
                .menu-group { padding: 10px 0; }
                .menu-category { font-size: 10px; color: #a0a8b3; padding: 8px 20px; margin-top: 15px; font-weight: 600; }
                .menu-item { display: block; padding: 12px 20px; color: #d0d7e0; }
                .menu-item.active { background-color: #1976d2; color: white; border-left: 4px solid white; }
                .main-content { flex-grow: 1; padding: 30px; }
                .dash-header { display: flex; justify-content: space-between; margin-bottom: 25px; }
                .dashboard-grid { display: grid; grid-template-columns: 3fr 1fr; gap: 20px; }
                .left-column { display: flex; flex-direction: column; gap: 20px; }
                .right-column { display: flex; flex-direction: column; gap: 20px; }
                .card { background: white; border-radius: 12px; padding: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .middle-row-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .hero-card { background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%); color: white; display: flex; justify-content: space-between; }
                .checkin-pills-container { display: flex; justify-content: space-between; gap: 8px; margin-top: 15px; }
                .day-pill-vertical { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px 5px; border-radius: 30px; border: 1px solid #eee; }
                .day-pill-vertical.done { background-color: #e8f5e9; color: #2e7d32; border-color: #c8e6c9; }
                .day-pill-vertical.active-today { background-color: #fce4ec; color: #d81b60; border: 1px solid #f8bbd0; }
                
                /* Module List Style */
                .module-row { display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #eee; cursor: pointer; transition: background 0.2s; }
                .module-row:hover { background: #f9f9f9; }
                .mod-icon-wrapper { width: 46px; height: 46px; border-radius: 12px; margin-right: 16px; display: flex; align-items: center; justify-content: center; font-size: 22px; color: white; flex-shrink: 0; }
                .mod-details { flex-grow: 1; }
                .mod-top { display: flex; justify-content: space-between; margin-bottom: 6px; }
                .mod-progress-container { width: 100%; background: #f0f0f0; height: 6px; border-radius: 3px; }
                .mod-progress-bar { height: 100%; border-radius: 3px; }
            </style>

            <div class="dashboard-body">
                <aside class="sidebar">
                    <div class="sidebar-header"><div class="brand-logo"><i class="fa-solid fa-code"></i> dicoding</div></div>
                    <div class="menu-group">
                        <div class="menu-category">LEARNING</div>
                        <a href="#/dashboard" class="menu-item active">Dashboard</a>
                        <a href="#/my-progress" class="menu-item">My Progress</a>
                        <a href="#" class="menu-item">Dicoding Mentoring</a>
                    </div>
                     <div class="menu-group" style="margin-top:auto;">
                        <a href="javascript:void(0)" id="logoutDashBtn" class="menu-item" style="color:#ef5350;">Logout</a>
                    </div>
                </aside>

                <main class="main-content">
                    <header class="dash-header">
                        <div class="header-left">
                            <h1>HALLO ${displayName}</h1>
                            <p>Let's continue your learning journey today.</p>
                        </div>
                    </header>

                    <div class="dashboard-grid">
                        <div class="left-column">
                            <div class="card hero-card">
                                <div class="hero-text-content">
                                    <h2>Mastering React Hooks</h2>
                                    <button class="btn-primary" style="padding:8px 16px; border-radius:20px; border:none; cursor:pointer; font-weight:bold;">Lanjut Belajar</button>
                                </div>
                            </div>

                            <div class="middle-row-grid">
                                <div class="card">
                                    <h3>Daily Check-in</h3>
                                    <p class="sub-date">Minggu Ini (${weekRange})</p>
                                    <div class="checkin-pills-container">${checkinPillsHTML}</div>
                                    <button id="btn-open-modal" style="margin-top:10px; width:100%; padding:8px; border:none; background:#e3f2fd; color:#1976d2; border-radius:8px; cursor:pointer;">Check In Manual</button>
                                </div>
                                <div class="card">
                                    <h3>My Schedule</h3>
                                    <p class="sub-date">Today, ${todayLocalized}</p>
                                    <div style="background:#f0f4f8; padding:10px; border-radius:8px;">
                                        <h4 style="font-size:12px;">ILT-FB1- Front-End Web Dasar</h4>
                                        <span style="font-size:11px; color:#666;">08.00 s.d 10.00 WIB</span>
                                    </div>
                                </div>
                            </div>

                            <div class="card">
                                <h3>Current Modules</h3>
                                <div id="module-list-container">Loading modules...</div>
                            </div>
                        </div>
                        
                        <div class="right-column">
                             <div class="card stats-dark-card" style="background:#005060; color:white;">
                                <span>TOTAL STUDY TIME</span>
                                <div id="total-study-time" style="font-size:32px; font-weight:bold;">...</div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <!-- MODALS -->
            <div class="modal-overlay" id="checkinModal">
                <div class="modal-content">
                    <div class="modal-header"><h3>Daily Check-in</h3><span class="close-modal" id="closeModal">&times;</span></div>
                    <div class="modal-body">
                        <input type="hidden" id="activeCheckinDate">
                        <textarea id="checkinNotes" class="checkin-textarea" placeholder="Apa yang kamu pelajari?"></textarea>
                    </div>
                    <div class="modal-footer"><button class="btn-submit-checkin" id="submitCheckin" style="width:100%; padding:10px; background:#0e677d; color:white; border:none; border-radius:20px;">Submit</button></div>
                </div>
            </div>

            <div class="modal-overlay" id="moduleDetailModal">
                <div class="modal-content">
                    <div class="modal-header" style="border:none;"><span class="close-modal" id="closeModuleModal">&times;</span></div>
                    <div class="modal-body" id="moduleDetailBody"></div>
                </div>
            </div>
        `;
    },

    async afterRender() {
        // -- EVENT LISTENERS --
        const checkinModal = document.getElementById('checkinModal');
        const closeModalBtn = document.getElementById('closeModal');
        const submitCheckinBtn = document.getElementById('submitCheckin');
        const openCheckinBtn = document.getElementById('btn-open-modal');
        
        const moduleModal = document.getElementById('moduleDetailModal');
        const closeModuleBtn = document.getElementById('closeModuleModal');
        const logoutBtn = document.getElementById('logoutDashBtn');

        // Helper Functions
        window.handleCheckinClick = (dateStr) => {
            document.getElementById('activeCheckinDate').value = dateStr;
            document.getElementById('checkinNotes').value = "";
            checkinModal.classList.add('show');
        };

        // Dynamic Content Injection for Module Detail
        window.openModuleDetail = (modTitle, modLevel, modHours, modRating, modStatus, modStartDate, modEndDate, modScore, modDesc, iconColor, iconHtml) => {
            const bodyEl = document.getElementById('moduleDetailBody');
            const levelBadgeColor = modLevel === 'Dasar' ? 'badge-dasar' : modLevel === 'Pemula' ? 'badge-pemula' : modLevel === 'Menengah' ? 'badge-menengah' : 'badge-mahir';

            bodyEl.innerHTML = `
                <div class="module-detail-header">
                    <div class="module-detail-icon" style="background-color: ${iconColor}">${iconHtml}</div>
                    <div class="module-detail-title">
                        <h2>${modTitle}</h2>
                        <span class="module-detail-badge ${levelBadgeColor}">${modLevel}</span>
                    </div>
                </div>
                <div class="module-meta-grid">
                    <div class="meta-item"><span class="meta-label">Jam Belajar</span><span class="meta-value">${modHours} Jam</span></div>
                    <div class="meta-item"><span class="meta-label">Rating</span><span class="meta-value">⭐ ${modRating}</span></div>
                    <div class="meta-item"><span class="meta-label">Status</span><span class="meta-value" style="color:${modStatus === 'Completed' ? '#2e7d32' : '#1976d2'}">${modStatus}</span></div>
                    <div class="meta-item"><span class="meta-label">Nilai Akhir</span><span class="meta-value">${modScore > 0 ? modScore : '-'}</span></div>
                    <div class="meta-item"><span class="meta-label">Mulai Belajar</span><span class="meta-value">${modStartDate}</span></div>
                    <div class="meta-item"><span class="meta-label">Selesai Belajar</span><span class="meta-value">${modEndDate}</span></div>
                </div>
                <div class="module-description"><p>${modDesc}</p></div>
                <button class="module-action-btn">${modStatus === 'Completed' ? 'Lihat Sertifikat' : 'Lanjutkan Belajar'}</button>
            `;
            moduleModal.classList.add('show');
        };

        // Bind Listeners
        if(closeModalBtn) closeModalBtn.addEventListener('click', () => checkinModal.classList.remove('show'));
        if(closeModuleBtn) closeModuleBtn.addEventListener('click', () => moduleModal.classList.remove('show'));
        if(openCheckinBtn) openCheckinBtn.addEventListener('click', () => window.handleCheckinClick(new Date().toISOString().split('T')[0]));

        if(submitCheckinBtn) {
            submitCheckinBtn.addEventListener('click', () => {
                const notes = document.getElementById('checkinNotes').value;
                if(!notes.trim()) {
                    const footer = `<button class="btn-submit-checkin" onclick="this.closest('.modal-overlay').remove()">OK</button>`;
                    createCustomModal("Perhatian", "Isi catatan dulu ya!", footer);
                    return;
                }
                checkinModal.classList.remove('show');
                const footer = `<button class="btn-submit-checkin" onclick="this.closest('.modal-overlay').remove()">Mantap!</button>`;
                createCustomModal("Berhasil", "Check-in berhasil disimpan!", footer);
            });
        }

        if(logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                 const footer = `
                    <button class="btn-submit-checkin" style="background-color: #ef5350;" onclick="localStorage.removeItem('userInfo'); window.location.hash='/'; this.closest('.modal-overlay').remove();">Ya</button>
                    <button class="btn-submit-checkin" style="background-color: #ccc; margin-left: 10px;" onclick="this.closest('.modal-overlay').remove()">Tidak</button>
                `;
                createCustomModal("Logout", "Yakin ingin keluar?", footer);
            });
        }

        // --- LOAD DATA ---
        setTimeout(async () => {
            try {
                const userStr = localStorage.getItem('userInfo');
                const user = userStr ? JSON.parse(userStr) : { email: 'ari.gunawan93@example.com' };
                const courses = await getStudentData(user.email);
                
                // Render Modules List
                const moduleContainer = document.getElementById('module-list-container');
                let moduleHtml = '';

                const getModuleIcon = (title) => {
                    const t = title.toLowerCase();
                    if (t.includes('web') || t.includes('front-end') || t.includes('javascript')) return '<i class="fa-solid fa-code"></i>';
                    if (t.includes('android') || t.includes('kotlin')) return '<i class="fa-brands fa-android"></i>';
                    if (t.includes('back-end') || t.includes('cloud')) return '<i class="fa-solid fa-server"></i>';
                    if (t.includes('ai') || t.includes('python')) return '<i class="fa-solid fa-brain"></i>';
                    if (t.includes('react')) return '<i class="fa-brands fa-react"></i>';
                    return '<i class="fa-solid fa-book"></i>';
                };

                courses.forEach(mod => {
                    const pct = Math.round((mod.completed_tutorials / mod.active_tutorials) * 100) || 0;
                    const progressPct = Math.min(100, pct);
                    const safeTitle = mod.title.replace(/'/g, "\\'");
                    const statusStr = mod.isCompleted ? 'Completed' : 'In Progress';
                    
                    const barColor = progressPct === 100 ? 'green' : 'blue';
                    const iconBgColor = progressPct === 100 ? '#2e7d32' : '#005060';
                    const moduleIcon = getModuleIcon(mod.title);
                    
                    // Escape quotes for HTML attributes
                    const safeDesc = (mod.description || "").replace(/'/g, "\\'");
                    const safeIconHtml = moduleIcon.replace(/"/g, "&quot;");

                    moduleHtml += `
                    <div class="module-row" onclick="window.openModuleDetail('${safeTitle}', '${mod.level}', ${mod.hours}, ${mod.rating}, '${statusStr}', '${mod.startDate}', '${mod.endDate}', ${mod.score}, '${safeDesc}', '${iconBgColor}', '${safeIconHtml}')">
                        <div class="mod-icon-wrapper" style="background-color: ${iconBgColor}">
                            ${moduleIcon}
                        </div>
                        <div class="mod-details">
                            <div class="mod-top">
                                <h4>${mod.title}</h4>
                                <span class="pct-text">${progressPct}%</span>
                            </div>
                            <span class="mod-sub">Academy Course</span>
                            <div class="mod-progress-container">
                                <div class="mod-progress-bar ${barColor}" style="width: ${progressPct}%;"></div>
                            </div>
                        </div>
                    </div>`;
                });
                moduleContainer.innerHTML = moduleHtml;

                // Calc Study Time
                let totalStudyHours = 0;
                courses.forEach(c => {
                    const ratio = c.completed_tutorials / c.active_tutorials;
                    totalStudyHours += (ratio > 1 ? 1 : ratio) * c.hours;
                });
                document.getElementById('total-study-time').innerText = `${Math.round(totalStudyHours)} hrs`;

            } catch (err) {
                console.error(err);
            }
        }, 100);
    }
};

export default DashboardPage;