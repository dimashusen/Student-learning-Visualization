// --- MOCK DEPENDENCIES (SIMULASI '../../user-data.js') ---

// Mock data berdasarkan Ari Gunawan
const MOCK_STUDENT_COURSES = [
    // Completed courses with score
    { title: "Belajar Dasar Pemrograman Web", isCompleted: "1", active_tutorials: "131", completed_tutorials: "131", score: "100" }, // Completed: 100%
    { title: "Belajar Fundamental Aplikasi Android", isCompleted: "1", active_tutorials: "107", completed_tutorials: "214", score: "100" }, 
    { title: "Belajar Membuat Aplikasi Back-End untuk Pemula dengan Google Cloud", isCompleted: "1", active_tutorials: "108", completed_tutorials: "110", score: "90" },
    
    // Courses with completion but no score (score 0 in CSV) or in progress
    { title: "Belajar Pengembangan Aplikasi Android Intermediate", isCompleted: "1", active_tutorials: "115", completed_tutorials: "115", score: "0" }, 
    { title: "Belajar Fundamental Deep Learning", isCompleted: "0", active_tutorials: "131", completed_tutorials: "67", score: "0" }, // In Progress: 51%
    
    // Placeholder courses for React Milestone 
    { title: "Belajar Dasar Pemrograman JavaScript", isCompleted: "1", active_tutorials: "12", completed_tutorials: "12", score: "88" }, // Completed: 100%
    { title: "Belajar Membuat Aplikasi Front-End Pemula", isCompleted: "0", active_tutorials: "10", completed_tutorials: "7", score: "78" }, // In Progress: 70%
    { title: "Belajar Fundamental Aplikasi React", isCompleted: "0", active_tutorials: "10", completed_tutorials: "1", score: "0" }, // In Progress: 10%
    { title: "Menjadi React Web Developer Expert", isCompleted: "0", active_tutorials: "15", completed_tutorials: "0", score: "0" }, // Not Started: 0%
];

const getStudentData = async (email) => {
    // Simulasikan pemrosesan data dan parsing
    return MOCK_STUDENT_COURSES.map(course => ({
        ...course,
        isCompleted: course.isCompleted === "1",
        score: parseInt(course.score, 10) || 0,
        active_tutorials: parseInt(course.active_tutorials, 10) || 1,
        completed_tutorials: parseInt(course.completed_tutorials, 10) || 0,
    }));
};

const getUsers = async () => {
    // Mock user list untuk enrichment nama
    return [
        { name: "Ari Gunawan", email: "ari.gunawan93@example.com" },
        { name: "Budi Santoso", email: "budi.santoso@example.com" },
    ];
};

// --- UTILITY FUNCTIONS (GANTI alert/confirm bawaan browser) ---
const createCustomModal = (title, body, footer) => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay show';
    modal.innerHTML = `
        <div class="modal-content" style="width: 350px; text-align: center;">
            <div class="modal-header" style="justify-content: center;">
                <h3>${title}</h3>
            </div>
            <div class="modal-body">${body}</div>
            <div class="modal-footer" style="text-align: center;">${footer}</div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
};

const customAlert = (title, message) => {
    const footer = `<button class="btn-submit-checkin" onclick="this.closest('.modal-overlay').remove()">OK</button>`;
    createCustomModal(title, message, footer);
};

// --- DEFINISI MODULE SPA ---

const DashboardPage = {
    async render() {
        // 1. AMBIL DATA USER DARI LOCALSTORAGE & ENRICH NAMA
        const userStr = localStorage.getItem('userInfo');
        const user = userStr ? JSON.parse(userStr) : { name: "Guest", email: "" };

        let displayName = user.name ? user.name.toUpperCase() : "GUEST";

        if (user && user.email) {
            try {
                const allUsers = await getUsers();
                const matched = allUsers.find(u => u.email && u.email.toLowerCase() === user.email.toLowerCase());
                if (matched && matched.name) {
                    displayName = matched.name.toUpperCase();
                    // Simpan kembali ke localStorage (membutuhkan implementasi yang aman di afterRender jika ini adalah kode yang dieksekusi)
                }
            } catch (err) {
                console.warn('Gagal mengambil daftar user untuk enrich nama:', err);
            }
        }

        // --- LOGIKA TANGGAL & CHECK-IN (REAL-TIME) ---
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dayOfWeek = today.getDay(); 
        const dayAdjusted = dayOfWeek === 0 ? 7 : dayOfWeek;
        const monday = new Date(today);
        monday.setDate(today.getDate() - (dayAdjusted - 1));

        const storedCheckins = localStorage.getItem('dailyCheckins');
        const checkinData = storedCheckins ? JSON.parse(storedCheckins) : {};

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

        // MOCK SCHEDULE DATA for the modal
        const mockSchedule = [
            { time: "08.00 - 10.00", title: "ILT-FB1- Front-End Web Dasar", type: "Live Session", link: "#" },
            { time: "10.30 - 12.00", title: "Mentoring Session Group A", type: "Mentoring", link: "#" },
            { time: "13.00 - 15.00", title: "Module: React Hooks Deep Dive", type: "Self Study", link: "#" },
            { time: "16.00 - 17.00", title: "Quiz: Fundamental JavaScript", type: "Assessment", link: "#" },
            { time: "19.00 - 21.00", title: "Project: Building Interactive Apps (Deadline Today)", type: "Project Work", link: "#" },
            { time: "21.00 - 22.00", title: "Reading: Clean Code Principles", type: "Self Study", link: "#" },
            { time: "22.00 - 23.00", title: "Review: Project Backend Fundamentals", type: "Project Review", link: "#" },
        ];

        const scheduleListHTML = mockSchedule.map(item => `
            <div class="schedule-list-item">
                <span class="schedule-time">${item.time}</span>
                <div class="schedule-details">
                    <h4>${item.title}</h4>
                    <p>${item.type}</p>
                </div>
            </div>
        `).join('');


        return `
            <!-- INJECT CSS -->
            <style>
                /* Global Styles */
                body { margin: 0; padding: 0; font-family: 'Poppins', sans-serif; background: #f4f6f9; color: #333; }
                a { text-decoration: none; color: inherit; }
                h1, h2, h3, h4 { margin: 0; font-weight: 700; }
                
                /* --- Layout --- */
                .dashboard-body { display: flex; min-height: 100vh; }
                .sidebar { width: 220px; background-color: #2d3e50; color: white; padding: 20px 0; display: flex; flex-direction: column; flex-shrink: 0; }
                .sidebar-header { padding: 0 20px 30px; }
                .brand-logo { font-size: 20px; font-weight: 800; }
                .brand-logo i { color: #1976d2; margin-right: 10px; }
                .menu-group { padding: 10px 0; }
                .menu-category { font-size: 10px; color: #a0a8b3; padding: 8px 20px; margin-top: 15px; text-transform: uppercase; font-weight: 600; }
                .menu-item { display: block; padding: 12px 20px; color: #d0d7e0; transition: background-color 0.2s; }
                .menu-item:hover { background-color: #3b5065; color: white; }
                .menu-item.active { background-color: #1976d2; color: white; border-left: 4px solid #fff; padding-left: 16px; }
                .menu-item i { margin-right: 10px; }

                .main-content { flex-grow: 1; padding: 30px; }
                .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
                .header-left h1 { font-size: 24px; color: #1976d2; font-weight: 800; }
                .header-left p { font-size: 14px; color: #666; margin-top: 5px; }
                .header-right { display: flex; align-items: center; gap: 20px; }
                .search-wrapper { position: relative; }
                .search-wrapper input { padding: 8px 12px 8px 35px; border: 1px solid #ddd; border-radius: 20px; width: 200px; font-size: 14px; }
                .search-wrapper i { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #999; font-size: 14px; }
                .notif-btn { width: 40px; height: 40px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); cursor: pointer; color: #666; }
                
                .dashboard-grid { display: grid; grid-template-columns: 3fr 1fr; gap: 20px; }
                @media (max-width: 1024px) {
                    .dashboard-grid { grid-template-columns: 1fr; }
                    .right-column { min-width: auto; }
                    .middle-row-grid { grid-template-columns: 1fr; }
                }

                /* --- Cards --- */
                .card { background: white; border-radius: 12px; padding: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-bottom: 20px; position: relative; }
                .card-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
                .card-header-row h3 { font-size: 16px; font-weight: 700; color: #2d3e50; }
                .sub-date { font-size: 11px; color: #999; margin-bottom: 15px; display: block; }
                .link-view-all, .link-text { font-size: 12px; color: #1976d2; font-weight: 600; }
                .mb-20 { margin-bottom: 20px; }

                /* Hero Card */
                .hero-card { background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%); color: white; display: flex; justify-content: space-between; align-items: center; padding: 30px; overflow: hidden; height: 180px; }
                .hero-text-content h2 { font-size: 22px; margin: 10px 0; max-width: 80%; }
                .hero-text-content p { font-size: 13px; opacity: 0.9; margin-bottom: 20px; }
                .tag-blue { background: rgba(255, 255, 255, 0.2); padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; }
                .btn-primary { background: #0e677d; color: white; border: none; padding: 10px 20px; border-radius: 20px; font-weight: 600; cursor: pointer; font-size: 13px; transition: background-color 0.2s; }
                .btn-primary:hover { background: #094a5a; }
                .react-icon-3d { font-size: 100px; color: rgba(255, 255, 255, 0.5); transform: rotate(10deg); text-shadow: 0 0 10px rgba(0,0,0,0.3); }

                /* Schedule Card */
                .schedule-box-blue { background-color: #f0f4f8; border-radius: 10px; padding: 15px; color: #2d3e50; }
                .sched-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #e0e7ed; }
                .sched-time { font-size: 11px; color: #555; display: block; margin-top: 3px; }
                .sched-actions button { margin-left: 8px; font-size: 11px; padding: 5px 10px; border-radius: 15px; cursor: pointer; font-weight: 600; }
                .btn-outline-white { background: transparent; border: 1px solid #2196f3; color: #2196f3; }
                .btn-solid-white { background: #2196f3; border: 1px solid #2196f3; color: white; }
                .sched-deadline-row { display: flex; justify-content: space-between; align-items: center; }
                .deadline-text { font-size: 12px; color: #555; }
                .btn-pilled-white { background: #ff7043; color: white; border: none; padding: 5px 12px; border-radius: 15px; font-size: 11px; cursor: pointer; }
                
                /* Stats Card */
                .stats-dark-card { background-color: #005060; color: white; position: relative; overflow: hidden; height: 160px; }
                .stats-top { display: flex; justify-content: space-between; align-items: center; font-size: 12px; opacity: 0.8; }
                .stats-big-num { font-size: 48px; font-weight: 700; margin-top: 10px; z-index: 10; position: relative; }
                .wave-wrapper { position: absolute; bottom: 0; left: 0; width: 100%; height: 100px; opacity: 0.1; }

                /* Grade Card */
                .grade-card { display: flex; align-items: center; justify-content: center; text-align: center; flex-direction: column; height: 200px; }
                .grade-circle-wrapper { width: 100px; height: 100px; margin-bottom: 10px; }
                .circular-chart { display: block; max-width: 100%; }
                .circle-bg { fill: none; stroke: #eee; stroke-width: 3; }
                .circle { fill: none; stroke: #2196f3; stroke-width: 3; stroke-linecap: round; transform: rotate(-90deg); transform-origin: center; }
                /* Placeholder for loading state */
                .percentage { fill: #333; font-family: 'Poppins', sans-serif; font-size: 0.6em; text-anchor: middle; dominant-baseline: central; font-weight: 800; }
                .label-gray { font-size: 12px; color: #999; }
                
                /* Milestone Card (Timeline) */
                .timeline-container { border-left: 2px solid #e0e0e0; padding-left: 15px; margin-left: 20px; }
                .tl-item { position: relative; padding-bottom: 20px; }
                .tl-dot, .tl-dot-ring, .tl-dot-hollow { position: absolute; left: -18px; top: 0px; width: 12px; height: 12px; border-radius: 50%; }
                .tl-dot { background-color: #2e7d32; }
                .tl-dot-ring { border: 2px solid #2196f3; background: white; }
                .tl-dot-hollow { border: 2px solid #bdbdbd; background: white; }
                .tl-item.current .tl-content h4 { color: #1976d2; font-weight: 700; }
                .tl-content h4 { font-size: 14px; margin: 0; }
                .tl-content p { font-size: 11px; color: #888; margin-top: 2px; }

                /* Module List */
                .module-row { 
                    display: flex; 
                    align-items: center; 
                    padding: 10px; 
                    margin: 0;
                    border-bottom: 1px solid #eee;
                    transition: background-color 0.2s; 
                    background: white; 
                    cursor: pointer;
                    min-height: 50px; 
                }
                .module-row:last-child { border-bottom: none; }
                .module-row:hover { background-color: #f5f5f5; } 

                /* --- CIRCULAR PROGRESS FOR MODULES --- */
                .module-progress-wrapper { 
                    width: 46px; 
                    height: 46px; 
                    position:relative; 
                    flex-shrink: 0; 
                    margin-right: 15px;
                }
                .progress-ring-module { 
                    transform: rotate(-90deg); 
                    display: block;
                }
                .progress-ring-module circle { 
                    transition: stroke-dashoffset 0.8s ease-in-out, stroke 0.4s ease; 
                }
                .progress-ring-text-module { 
                    position: absolute; 
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 11px; 
                    font-weight: 700; 
                    color: #333; 
                }
                .mod-details { flex-grow: 1; }
                .mod-top { display: flex; justify-content: space-between; align-items: flex-start; }
                .mod-details h4 { font-size: 13px; font-weight: 600; color: #444; }
                .mod-sub { font-size: 11px; color: #999; margin-bottom: 5px; }
                
                /* Hide redundant elements now using ring */
                .progress-track { display: none; } 
                .mod-status-icon { display: none; } 
                .pct-text { display: none; } 

                /* Adjusted container */
                #module-list-container { 
                    max-height: 280px; 
                    overflow-y: auto; 
                    padding-right: 5px;
                    padding-left: 10px;
                    padding-top: 5px;
                    padding-bottom: 5px; 
                }

                /* Footer */
                footer { margin-top: 20px; text-align: center; font-size: 11px; color: #aaa; padding-top: 10px; }

                /* --- MODAL STYLES (Shared) --- */
                .modal-overlay {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0, 0, 0, 0.5); z-index: 9999;
                    display: flex; justify-content: center; align-items: center;
                    opacity: 0; visibility: hidden; transition: all 0.3s ease;
                }
                .modal-overlay.show { opacity: 1; visibility: visible; }
                .modal-content {
                    background: white; width: 450px; max-width: 90%;
                    border-radius: 12px; padding: 24px; position: relative;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                    font-family: 'Poppins', sans-serif;
                }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .modal-header h3 { margin: 0; font-size: 18px; color: #333; font-weight: 700; }
                .close-modal { cursor: pointer; font-size: 24px; color: #999; }
                
                /* --- MODULE DETAIL MODAL --- */
                .detail-row { margin-bottom: 15px; display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; }
                .detail-label { font-weight: 600; color: #555; font-size: 13px; }
                .detail-value { font-weight: 400; color: #333; font-size: 13px; }
                .score-badge { background: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 4px; font-weight: bold; }
                .status-badge-done { background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 12px; font-size: 11px; }
                .status-badge-progress { background: #fff3e0; color: #f57c00; padding: 2px 8px; border-radius: 12px; font-size: 11px; }
                
                /* --- DAILY CHECKIN STYLES --- */
                .emoji-container { display: flex; gap: 15px; margin-bottom: 20px; justify-content: space-between; }
                .emoji-btn { flex: 1; border: 1px solid #e0e0e0; border-radius: 10px; padding: 10px; cursor: pointer; text-align: center; transition: all 0.2s; background: white; }
                .emoji-btn:hover { border-color: #2d3e50; }
                .emoji-btn.selected { border-color: #2d3e50; background-color: #f0f4f8; border-width: 2px; }
                .emoji-icon { font-size: 28px; display: block; margin-bottom: 5px; }
                .emoji-label { font-size: 12px; color: #666; font-weight: 500; }
                .input-group label { display: block; font-size: 12px; color: #333; margin-bottom: 8px; font-weight: 600; }
                .checkin-textarea { width: 100%; height: 120px; padding: 12px; border: 1px solid #ccc; border-radius: 8px; resize: none; font-family: inherit; font-size: 14px; }
                .checkin-textarea:focus { outline: none; border-color: #2d3e50; }
                .modal-footer { margin-top: 20px; text-align: right; }
                .btn-submit-checkin { background-color: #0e677d; color: white; border: none; padding: 10px 24px; border-radius: 20px; font-weight: 600; cursor: pointer; font-size: 14px; }
                .btn-submit-checkin:hover { background-color: #094a5a; }
                
                .btn-add-checkin { background: #e3f2fd; color: #1976d2; border: none; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; margin-left: auto; }

                /* --- CHECK-IN PILLS STYLES --- */
                .checkin-pills-container { display: flex; justify-content: space-between; gap: 8px; margin-top: 15px; }
                .day-pill-vertical { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px 5px; border-radius: 30px; border: 1px solid transparent; transition: transform 0.2s; }
                .day-pill-vertical .pill-day { font-size: 10px; font-weight: 600; margin-bottom: 4px; text-transform: uppercase; }
                .day-pill-vertical .pill-num { font-size: 14px; font-weight: 700; }
                .day-pill-vertical.done { background-color: #e8f5e9; color: #2e7d32; border-color: #c8e6c9; }
                .day-pill-vertical.missed { background-color: #ffebee; color: #c62828; border-color: #ffcdd2; opacity: 0.7; }
                .day-pill-vertical.future { background-color: #f5f5f5; color: #9e9e9e; border-color: #eeeeee; }
                .day-pill-vertical.active-today { background-color: #fce4ec; color: #d81b60; border: 1px solid #f8bbd0; box-shadow: 0 4px 6px rgba(233, 30, 99, 0.2); animation: pulse 2s infinite; }
                .day-pill-vertical.active-today:hover { transform: translateY(-2px); background-color: #f8bbd0; }
                @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(233, 30, 99, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(233, 30, 99, 0); } 100% { box-shadow: 0 0 0 0 rgba(233, 30, 99, 0); } }

                /* --- SCHEDULE MODAL SPECIFIC STYLES --- */
                .modal-content.schedule-content { max-width: 600px; } /* Wider content for schedule list */
                .schedule-list-item { 
                    display: flex; 
                    align-items: center; 
                    margin-bottom: 15px; 
                    padding: 10px; 
                    border-radius: 8px; 
                    background: #f8f9fa;
                    border-left: 4px solid #1976d2;
                }
                .schedule-time { 
                    font-size: 12px; 
                    font-weight: 600; 
                    color: #1976d2; 
                    flex-shrink: 0;
                    width: 80px;
                }
                .schedule-details { 
                    flex-grow: 1; 
                    padding-left: 10px; 
                    border-left: 1px solid #e0e0e0; 
                    margin-left: 10px;
                }
                .schedule-details h4 { 
                    font-size: 14px; 
                    margin-bottom: 2px;
                    color: #2d3e50;
                }
                .schedule-details p { 
                    font-size: 11px; 
                    color: #888; 
                    margin: 0;
                }
                .schedule-list-container {
                    max-height: 400px;
                    overflow-y: auto;
                    padding-right: 10px;
                }
            </style>

            <div class="dashboard-body">
                
                <aside class="sidebar">
                    <div class="sidebar-header">
                        <div class="brand-logo">
                            <i class="fa-solid fa-code"></i> dicoding
                        </div>
                    </div>

                    <div class="menu-group">
                        <div class="menu-category">LEARNING</div>
                        <a href="#/dashboard" class="menu-item active">Dashboard</a>
                        <a href="#/my-progress" class="menu-item">My Progress</a>
                        <a href="#" class="menu-item">Dicoding Mentoring</a>
                    </div>
                    
                    <div class="menu-group" style="margin-top:auto;">
                        <a href="javascript:void(0)" id="logoutDashBtn" class="menu-item" style="color:#ef5350;">
                            <i class="fa-solid fa-arrow-right-from-bracket"></i> Logout
                        </a>
                    </div>
                </aside>

                <main class="main-content">
                    
                    <header class="dash-header">
                        <div class="header-left">
                            <h1>HALLO ${displayName}</h1>
                            <p>Let's continue your learning journey today.</p>
                        </div>
                        <div class="header-right">
                            <div class="search-wrapper">
                                <i class="fa-solid fa-magnifying-glass"></i>
                                <input type="text" placeholder="Search course">
                            </div>
                            <div class="notif-btn">
                                <i class="fa-regular fa-bell"></i>
                            </div>
                        </div>
                    </header>

                    <div class="dashboard-grid">
                        
                        <div class="left-column">
                            
                            <div class="card hero-card">
                                <div class="hero-text-content">
                                    <span class="tag-blue">Recommended Next Step</span>
                                    <h2>Mastering React Hooks & Custom Logic</h2>
                                    <p>Berdasarkan hasil kuis Modul 3, Anda siap untuk materi lanjutan.</p>
                                    <button class="btn-primary">
                                        <i class="fa-solid fa-play"></i> Lanjut Belajar
                                    </button>
                                    <span class="time-left" style="margin-left:10px; font-size:11px;">~45 min left</span>
                                </div>
                                <div class="hero-image-container">
                                        <i class="fa-brands fa-react react-icon-3d"></i>
                                </div>
                            </div>

                            <div class="middle-row-grid">
                                <!-- Daily Check-in Card -->
                                <div class="card">
                                    <div class="card-header-row">
                                        <h3>Daily Check-in</h3>
                                        <button id="btn-open-modal" class="btn-add-checkin" title="Manual Check-in">
                                            <i class="fa-solid fa-plus" style="font-size: 12px;"></i>
                                        </button>
                                    </div>
                                    <p class="sub-date">Minggu Ini (${weekRange})</p>
                                    
                                    <div class="checkin-pills-container">
                                        ${checkinPillsHTML}
                                    </div>
                                </div>

                                <div class="card">
                                    <div class="card-header-row">
                                        <h3>My Schedule</h3>
                                        <!-- Added ID for listener -->
                                        <a href="#" class="link-view-all" id="viewAllSchedule">View all</a>
                                    </div>
                                    <p class="sub-date">Today, ${todayLocalized}</p>
                                    
                                    <div class="schedule-box-blue">
                                        <div class="sched-row">
                                            <div>
                                                <h4 style="font-size:12px;">ILT-FB1- Front-End Web Dasar</h4>
                                                <span class="sched-time">08.00 s.d 10.00 WIB</span>
                                            </div>
                                            <div class="sched-actions">
                                                <button class="btn-outline-white">View</button>
                                                <button class="btn-solid-white">Join Session</button>
                                            </div>
                                        </div>
                                        <div class="sched-deadline-row">
                                            <div class="deadline-text">
                                                <strong>Deadline:</strong><br>Building Interactive Apps
                                            </div>
                                            <button class="btn-pilled-white">Selesaikan</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="card modules-section">
                                <div class="card-header-row mb-20">
                                    <h3>Current Modules</h3>
                                    <a href="#" class="link-text">View curriculum</a>
                                </div>
                                
                                <!-- Container modul dengan ID untuk scroll -->
                                <div id="module-list-container">
                                    <p style="color:#888; font-size:12px;">Loading modules...</p>
                                </div>
                            </div>

                            <div class="card skill-section">
                                <div class="card-header-row mb-20">
                                    <h3>Visualisasi Progres (Progress Visualization)</h3>
                                </div>
                                <div class="radar-wrapper">
                                    <div id="overallProgressWrapper" style="display:flex; align-items:center; gap:20px; flex-direction:column; justify-content:center;">
                                        <div style="position:relative; width:240px; height:240px; margin: 0 auto;">
                                            <svg id="overallProgressSvg" width="240" height="240" viewBox="0 0 240 240">
                                                <circle cx="120" cy="120" r="96" stroke="#f0f0f0" stroke-width="16" fill="transparent" />
                                                <circle id="overallProgressRing" class="progress-ring" cx="120" cy="120" r="96" stroke="#2196f3" stroke-width="16" stroke-linecap="round" fill="transparent" stroke-dasharray="603" stroke-dashoffset="603" transform="rotate(-90 120 120)" />
                                            </svg>
                                            <div id="overallProgressText" style="position:absolute; left:0; right:0; top:0; bottom:0; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:700;">0%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div> 
                        
                        <div class="right-column">
                            
                            <div class="card stats-dark-card">
                                <div class="stats-top">
                                    <span>TOTAL STUDY TIME</span>
                                    <i class="fa-regular fa-clock"></i>
                                </div>
                                <div class="stats-big-num" id="total-study-time">...</div>
                                <div class="wave-wrapper">
                                    <svg viewBox="0 0 1440 320" style="width:100%; height:100px; opacity:0.3; position:absolute; bottom:-20px; left:0;">
                                        <path fill="#ffffff" fill-opacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                                    </svg>
                                </div>
                            </div>

                            <div class="card grade-card">
                                <div class="grade-circle-wrapper">
                                    <svg viewBox="0 0 36 36" class="circular-chart">
                                        <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        <path class="circle" id="avg-grade-ring" stroke-dasharray="0, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        <text x="18" y="20.35" class="percentage" id="avg-grade-text">0</text> <!-- Default to 0, will be updated by JS -->
                                    </svg>
                                </div>
                                <div class="grade-text">
                                    <span class="label-gray">Avg. Grade</span>
                                    <h4 id="grade-verdict" class="text-lg font-bold text-slate-700">Computing...</h4>
                                    <p>Based on your exams.</p>
                                </div>
                            </div>

                            <div class="card milestone-card">
                                <h3>Learning Milestone</h3>
                                <div class="timeline-container" id="milestone-container">
                                    <p style="color:#888; font-size:12px;">Loading milestones...</p>
                                </div>
                            </div>

                        </div> 
                    </div>
                    
                    <footer>© 2025 Dicoding Indonesia</footer>

                    <!-- MODAL CHECK-IN -->
                    <div class="modal-overlay" id="checkinModal">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h3>Daily Check-in</h3>
                                <span class="close-modal" id="closeModal">&times;</span>
                            </div>
                            <div class="modal-body">
                                <input type="hidden" id="activeCheckinDate" value="">
                                <div class="emoji-container">
                                    <div class="emoji-btn" data-value="bad">
                                        <span class="emoji-icon">🤯</span>
                                        <span class="emoji-label">Bad</span>
                                    </div>
                                    <div class="emoji-btn selected" data-value="neutral">
                                        <span class="emoji-icon">🙂</span>
                                        <span class="emoji-label">Netral</span>
                                    </div>
                                    <div class="emoji-btn" data-value="great">
                                        <span class="emoji-icon">🤩</span>
                                        <span class="emoji-label">Great</span>
                                    </div>
                                </div>
                                <div class="input-group">
                                    <label>Apa yang kamu pelajari?</label>
                                    <textarea class="checkin-textarea" id="checkinNotes" placeholder="Tulis progres belajarmu hari ini..."></textarea>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button class="btn-submit-checkin" id="submitCheckin">Submit</button>
                            </div>
                        </div>
                    </div>

                    <!-- MODAL MODULE DETAIL (NEW) -->
                    <div class="modal-overlay" id="moduleDetailModal">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h3 id="md-title">Course Title</h3>
                                <span class="close-modal" id="closeModuleModal">&times;</span>
                            </div>
                            <div class="modal-body">
                                <div class="detail-row">
                                    <span class="detail-label">Status</span>
                                    <span class="detail-value" id="md-status">-</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Progress</span>
                                    <span class="detail-value" id="md-progress">0%</span>
                                </div>
                                <div style="width:100%; background:#f0f0f0; height:8px; border-radius:4px; margin-bottom:15px;">
                                    <div id="md-progress-bar" style="width:0%; height:100%; background:#2196f3; border-radius:4px; transition:width 0.5s;"></div>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Exam Score</span>
                                    <span class="detail-value" id="md-score">-</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Tutorials Completed</span>
                                    <span class="detail-value" id="md-tutorials">0 / 0</span>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button class="btn-submit-checkin" onclick="document.getElementById('moduleDetailModal').classList.remove('show')">Close</button>
                            </div>
                        </div>
                    </div>

                    <!-- MODAL SCHEDULE (NEW) -->
                    <div class="modal-overlay" id="scheduleModal">
                        <div class="modal-content schedule-content">
                            <div class="modal-header">
                                <h3>Full Weekly Schedule</h3>
                                <span class="close-modal" id="closeScheduleModal">&times;</span>
                            </div>
                            <div class="modal-body schedule-list-container">
                                <!-- Schedule List Content -->
                                ${scheduleListHTML}
                            </div>
                            <div class="modal-footer">
                                <button class="btn-submit-checkin" onclick="document.getElementById('scheduleModal').classList.remove('show')">Close</button>
                            </div>
                        </div>
                    </div>

                </main>
            </div>
        `;
    },

    async afterRender() {
        // Custom Alert/Confirm Logic (replaces browser's alert/confirm)
        const customAlert = (title, message) => {
            const alertModal = document.createElement('div');
            alertModal.className = 'modal-overlay show';
            alertModal.innerHTML = `
                <div class="modal-content" style="width: 300px; text-align: center;">
                    <div class="modal-header" style="justify-content: center;">
                        <h3>${title}</h3>
                    </div>
                    <div class="modal-body">${message}</div>
                    <div class="modal-footer" style="text-align: center;">
                        <button class="btn-submit-checkin" onclick="this.closest('.modal-overlay').remove()">OK</button>
                    </div>
                </div>
            `;
            document.body.appendChild(alertModal);
        };

        // 1. MODAL LOGIC FOR CHECK-IN
        const checkinModal = document.getElementById('checkinModal');
        const openCheckinBtn = document.getElementById('btn-open-modal');
        const closeCheckinBtn = document.getElementById('closeModal');
        const submitCheckinBtn = document.getElementById('submitCheckin');
        const emojiBtns = document.querySelectorAll('.emoji-btn');

        window.handleCheckinClick = (dateStr) => {
            document.getElementById('activeCheckinDate').value = dateStr;
            document.getElementById('checkinNotes').value = ""; 
            
            emojiBtns.forEach(b => b.classList.remove('selected'));
            const neutralBtn = document.querySelector('.emoji-btn[data-value="neutral"]');
            if(neutralBtn) neutralBtn.classList.add('selected');

            checkinModal.classList.add('show');
        };

        if(openCheckinBtn) {
            openCheckinBtn.addEventListener('click', () => {
                const todayStr = new Date().toISOString().split('T')[0];
                window.handleCheckinClick(todayStr);
            });
        }

        if(closeCheckinBtn) {
            closeCheckinBtn.addEventListener('click', () => {
                checkinModal.classList.remove('show');
            });
        }

        emojiBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                emojiBtns.forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
            });
        });

        if(submitCheckinBtn) {
            submitCheckinBtn.addEventListener('click', () => {
                const selectedEmoji = document.querySelector('.emoji-btn.selected .emoji-label').innerText;
                const notes = document.getElementById('checkinNotes').value;
                const dateKey = document.getElementById('activeCheckinDate').value;
                
                if (!notes.trim()) {
                    customAlert("Perhatian!", "Tulis dulu apa yang kamu pelajari hari ini!");
                    return;
                }

                const storedCheckins = localStorage.getItem('dailyCheckins');
                const checkinData = storedCheckins ? JSON.parse(storedCheckins) : {};
                
                checkinData[dateKey] = {
                    emoji: selectedEmoji,
                    note: notes,
                    timestamp: new Date().toISOString()
                };
                
                localStorage.setItem('dailyCheckins', JSON.stringify(checkinData));

                const funnyMessages = [
                    "Mantap! Besok jangan lupa lagi ya!",
                    "Keren! Satu langkah lebih dekat jadi sepuh.",
                    "Gas pol rem blong! 🚀",
                    "Wah, produktif sekali hari ini!",
                    "Otak makin encer nih, nice progress!"
                ];
                const randomMsg = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
                
                customAlert("✅ Check-in Berhasil!", `"${randomMsg}"`);
                checkinModal.classList.remove('show');
                // Reload data by changing hash slightly
                setTimeout(() => window.location.hash = window.location.hash, 100); 
            });
        }

        // 2. MODAL LOGIC FOR MODULE DETAILS
        const moduleModal = document.getElementById('moduleDetailModal');
        const closeModuleBtn = document.getElementById('closeModuleModal');
        if(closeModuleBtn) {
            closeModuleBtn.addEventListener('click', () => {
                moduleModal.classList.remove('show');
            });
        }
        
        window.openModuleDetail = (modTitle, modStatus, modPct, modScore, modCompleted, modTotal) => {
            document.getElementById('md-title').innerText = modTitle;
            
            const statusEl = document.getElementById('md-status');
            if(modStatus === 'Graduated') {
                statusEl.innerHTML = '<span class="status-badge-done">Graduated</span>';
            } else {
                statusEl.innerHTML = '<span class="status-badge-progress">In Progress</span>';
            }
            
            document.getElementById('md-progress').innerText = modPct + '%';
            document.getElementById('md-progress-bar').style.width = modPct + '%';
            document.getElementById('md-progress-bar').style.backgroundColor = modPct === 100 ? '#2e7d32' : '#2196f3';
            
            document.getElementById('md-score').innerHTML = modScore > 0 ? `<span class="score-badge">${modScore}</span>` : '-';
            document.getElementById('md-tutorials').innerText = `${modCompleted} / ${modTotal}`;
            
            moduleModal.classList.add('show');
        };

        // 3. LOGOUT LOGIC (Using custom modal for confirm)
        const logoutBtn = document.getElementById('logoutDashBtn');
        if(logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                    const footer = `
                        <button class="btn-submit-checkin" style="background-color: #ef5350;" id="confirmLogoutYes">Ya</button>
                        <button class="btn-submit-checkin" style="background-color: #ccc; margin-left: 10px;" id="confirmLogoutNo">Tidak</button>
                    `;
                    const confirmModal = createCustomModal("Konfirmasi Logout", "Yakin ingin logout?", footer);

                    document.getElementById('confirmLogoutYes').addEventListener('click', () => {
                        localStorage.removeItem('statusLogin');
                        localStorage.removeItem('userInfo');
                        window.location.hash = '/';
                        confirmModal.remove();
                    });

                    document.getElementById('confirmLogoutNo').addEventListener('click', () => {
                        confirmModal.remove();
                    });
            });
        }

        // 4. SCHEDULE MODAL LOGIC 
        const scheduleModal = document.getElementById('scheduleModal');
        const openScheduleBtn = document.getElementById('viewAllSchedule');
        const closeScheduleBtn = document.getElementById('closeScheduleModal');

        if (openScheduleBtn) {
            openScheduleBtn.addEventListener('click', (e) => {
                e.preventDefault(); 
                if (scheduleModal) {
                    scheduleModal.classList.add('show');
                }
            });
        }

        if (closeScheduleBtn) {
            closeScheduleBtn.addEventListener('click', () => {
                if (scheduleModal) {
                    scheduleModal.classList.remove('show');
                }
            });
        }


        // 5. DATA PROCESSING 
        const userStr = localStorage.getItem('userInfo');
        const user = userStr ? JSON.parse(userStr) : null;

        if(!user || !user.email) return;

        // Menggunakan setTimeout untuk memastikan DOM fully loaded sebelum memanipulasi elemen SVG/Chart
        setTimeout(async () => {
            try {
                const studentCourses = await getStudentData(user.email);
                
                // --- A. HITUNG TOTAL STUDY TIME ---
                const courseHoursMap = {
                    "Belajar Dasar Pemrograman Web": 46,
                    "Belajar Dasar Pemrograman JavaScript": 46,
                    "Belajar Membuat Aplikasi Front-End Pemula": 45,
                    "Belajar Fundamental Aplikasi React": 100,
                    "Menjadi React Web Developer Expert": 110,
                    "Belajar Prinsip Pemrograman SOLID": 15,
                    "Belajar Dasar Google Cloud": 12,
                    "Belajar Membuat Aplikasi Back-End untuk Pemula dengan Google Cloud": 45,
                    "Belajar Fundamental Aplikasi Android": 140,
                    "Belajar Pengembangan Aplikasi Android Intermediate": 150,
                    "Memulai Pemrograman dengan Python": 60,
                    "Belajar Fundamental Aplikasi Flutter": 90,
                    "default": 40
                };

                let totalStudyHours = 0;
                studentCourses.forEach(course => {
                    const hours = courseHoursMap[course.title] || courseHoursMap["default"];
                    const totalTuts = course.active_tutorials || 1;
                    const completedTuts = course.completed_tutorials || 0;
                    
                    let ratio = completedTuts / totalTuts;
                    if (ratio > 1) ratio = 1; 
                    
                    totalStudyHours += (ratio * hours);
                });
                document.getElementById('total-study-time').innerText = `${Math.round(totalStudyHours)} hrs`;

                // --- B. HITUNG AVG GRADE & VERDICT ---
                const gradedCourses = studentCourses.filter(c => c.score > 0); 
                let avgScore = 0;
                if (gradedCourses.length > 0) {
                    const totalScore = gradedCourses.reduce((acc, c) => acc + c.score, 0);
                    avgScore = Math.round(totalScore / gradedCourses.length);
                }
                
                // Memastikan pembaruan teks dan SVG berhasil
                const avgGradeTextEl = document.getElementById('avg-grade-text');
                if(avgGradeTextEl) {
                    avgGradeTextEl.innerText = avgScore; // Should be 97
                }
                const ring = document.getElementById('avg-grade-ring');
                if(ring) ring.setAttribute('stroke-dasharray', `${avgScore}, 100`);
                
                let verdict = "Start Learning";
                let verdictColor = "#475569";
                
                if (avgScore >= 90) { 
                    verdict = "Excellent!"; 
                    verdictColor = "#16a34a"; // green-600
                } else if (avgScore >= 80) { 
                    verdict = "Very Good!"; 
                    verdictColor = "#2563eb"; // blue-600
                } else if (avgScore >= 60) { 
                    verdict = "Good"; 
                    verdictColor = "#ca8a04"; // yellow-600
                } else if (avgScore > 0) { 
                    verdict = "Fair"; 
                    verdictColor = "#f97316"; // orange-500
                }

                const verdictEl = document.getElementById('grade-verdict');
                if(verdictEl) {
                    verdictEl.innerText = verdict;
                    verdictEl.style.color = verdictColor;
                    verdictEl.className = `text-lg font-bold`; 
                }


                // --- C. DYNAMIC LEARNING MILESTONE (React Developer Path ID 13) ---
                const reactPath = [
                    { title: "Belajar Dasar Pemrograman Web", level: "Dasar" },
                    { title: "Belajar Dasar Pemrograman JavaScript", level: "Dasar" },
                    { title: "Belajar Membuat Aplikasi Front-End Pemula", level: "Pemula" },
                    { title: "Belajar Fundamental Aplikasi React", level: "Menengah" },
                    { title: "Menjadi React Web Developer Expert", level: "Mahir" }
                ];

                const milestoneContainer = document.getElementById('milestone-container');
                let milestonesHTML = '';

                reactPath.forEach(pathItem => {
                    const foundCourse = studentCourses.find(c => c.title === pathItem.title);
                    let status = 'future'; 

                    if (foundCourse) {
                        if (foundCourse.isCompleted) {
                            status = 'done';
                        } else {
                            if (foundCourse.completed_tutorials > 0) {
                                 status = 'current';
                            }
                        }
                    }

                    let dotClass = status === 'done' ? 'tl-dot' : (status === 'current' ? 'tl-dot-ring' : 'tl-dot-hollow');
                    let titleClass = status === 'current' ? 'text-blue' : '';

                    milestonesHTML += `
                        <div class="tl-item ${status}">
                            <div class="${dotClass}"></div>
                            <div class="tl-content">
                                <h4 class="${titleClass}">${pathItem.title}</h4>
                                <p>Level: ${pathItem.level}</p>
                            </div>
                        </div>
                    `;
                });
                
                if (milestoneContainer) {
                    milestoneContainer.innerHTML = milestonesHTML;
                }

                // --- D. CURRENT MODULES - MODIFIKASI CIRCULAR PROGRESS ---
                const modulesToShow = studentCourses.sort((a, b) => {
                    if (a.isCompleted === b.isCompleted) return 0;
                    return a.isCompleted ? 1 : -1;
                });
                
                const moduleContainer = document.getElementById('module-list-container');
                let moduleHtml = '';

                // Constants for module circular progress
                const CIRCLE_R = 18; 
                const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_R; 
                
                modulesToShow.forEach((mod) => {
                    const totalTuts = mod.active_tutorials || 1; 
                    const completedTuts = mod.completed_tutorials || 0;
                    
                    let progressPct = 0;
                    if (mod.isCompleted) {
                        progressPct = 100;
                    } else {
                        progressPct = Math.round((completedTuts / totalTuts) * 100);
                        if (progressPct > 100) progressPct = 100;
                    }

                    const safeTitle = mod.title.replace(/'/g, "\\'");
                    const statusStr = mod.isCompleted ? 'Graduated' : 'In Progress';

                    // Dynamic calculation for ring
                    const dashOffset = Math.round(CIRCUMFERENCE * (1 - progressPct / 100));
                    let ringStrokeColor = '#2196f3'; // Blue for in-progress
                    let ringStrokeWidth = 3;
                    
                    if (progressPct === 100) {
                        ringStrokeColor = '#2e7d32'; // Green for completed
                        ringStrokeWidth = 4; // Slightly thicker green ring
                    } else if (progressPct > 0) {
                        ringStrokeColor = '#ff9800'; // Orange for actively in progress
                    } else {
                        ringStrokeColor = '#ccc'; // Grey for 0%
                    }

                    moduleHtml += `
                    <div class="module-row" 
                        onclick="window.openModuleDetail('${safeTitle}', '${statusStr}', ${progressPct}, ${mod.score || 0}, ${completedTuts}, ${totalTuts})">
                        
                        <div class="module-progress-wrapper">
                            <svg class="progress-ring-module" width="46" height="46" viewBox="0 0 36 36">
                                <!-- Background track -->
                                <circle cx="18" cy="18" r="${CIRCLE_R}" stroke="#eee" stroke-width="3" fill="transparent" />
                                <!-- Progress ring -->
                                <circle cx="18" cy="18" r="${CIRCLE_R}" 
                                    stroke="${ringStrokeColor}" 
                                    stroke-width="${ringStrokeWidth}" 
                                    stroke-linecap="round" 
                                    fill="transparent" 
                                    stroke-dasharray="${CIRCUMFERENCE}" 
                                    stroke-dashoffset="${dashOffset}" 
                                    transform="rotate(-90 18 18)" 
                                />
                            </svg>
                            <div class="progress-ring-text-module">${progressPct}%</div>
                        </div>

                        <div class="mod-details" style="flex-grow: 1;">
                            <div class="mod-top">
                                <h4>${mod.title}</h4>
                            </div>
                            <div class="mod-sub">Academy Course</div>
                        </div>
                    </div>`;
                });
                moduleContainer.innerHTML = moduleHtml || '<p style="color:#999; font-size:12px;">Tidak ada data modul.</p>';

                // --- E. RADAR CHART ---
                const categories = {
                    'HTML/CSS': ['Web', 'HTML', 'CSS', 'Front-End'],
                    'JavaScript': ['JavaScript', 'JS', 'React', 'Vue'],
                    'React': ['React', 'Front-End'],
                    'Testing': ['Testing', 'TDD', 'QA'],
                    'DevOps': ['Cloud', 'AWS', 'Google', 'Azure', 'DevOps', 'Back-End'],
                    'Soft Skills': ['Soft', 'Manajemen', 'Proyek', 'Karier']
                };

                const skillScores = [0, 0, 0, 0, 0, 0];
                const skillCounts = [0, 0, 0, 0, 0, 0];
                const labels = ['HTML/CSS', 'JavaScript', 'React', 'Testing', 'DevOps', 'Soft Skills'];

                studentCourses.forEach(course => {
                    if (course.score > 0) {
                        labels.forEach((label, idx) => {
                            const keywords = categories[label];
                            const isMatch = keywords.some(kw => course.title.toLowerCase().includes(kw.toLowerCase()));
                            if (isMatch) {
                                skillScores[idx] += course.score;
                                skillCounts[idx]++;
                            }
                        });
                    }
                });

                const finalSkillData = skillScores.map((total, idx) => {
                    return skillCounts[idx] > 0 ? Math.round(total / skillCounts[idx]) : 50;
                });

                const ctxRadar = document.getElementById('radarChart');
                if (ctxRadar) {
                    new Chart(ctxRadar.getContext('2d'), {
                        type: 'radar',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'You', 
                                data: finalSkillData,
                                backgroundColor: 'rgba(33, 150, 243, 0.2)', 
                                borderColor: '#2196f3', 
                                borderWidth: 2,
                                pointBackgroundColor: '#2196f3'
                            }, {
                                label: 'Class Avg', 
                                data: [75, 70, 65, 60, 55, 80],
                                backgroundColor: 'rgba(200, 200, 200, 0.2)', 
                                borderColor: '#ccc', 
                                borderWidth: 1,
                                pointBackgroundColor: '#ccc'
                            }]
                        },
                        options: {
                            plugins: { legend: { display: false } },
                            scales: { 
                                r: { 
                                    ticks: { display: false, max: 100, min: 0 }, 
                                    grid: { color: '#f0f0f0' }, 
                                    pointLabels: { font: { size: 10, family: 'Poppins' } } 
                                } 
                            },
                            maintainAspectRatio: false
                        }
                    });
                }
                 // --- OVERALL PROGRESS RING UPDATE ---
                const totalTutorials = studentCourses.reduce((s, c) => s + (c.active_tutorials || 0), 0);
                const completedTutorials = studentCourses.reduce((s, c) => s + (c.completed_tutorials || 0), 0);
                const overallProgressPct = totalTutorials === 0 ? 0 : Math.round((completedTutorials / totalTutorials) * 100);
                const overallProgressPctClamped = Math.min(100, Math.max(0, overallProgressPct));

                const overallRing = document.getElementById('overallProgressRing');
                const overallText = document.getElementById('overallProgressText');
                if (overallRing && overallText) {
                    const r = parseFloat(overallRing.getAttribute('r'));
                    const circumference = 2 * Math.PI * r;
                    
                    overallRing.setAttribute('stroke-dasharray', circumference);
                    
                    const offset = Math.round(circumference * (1 - overallProgressPctClamped / 100));
                    overallRing.setAttribute('stroke-dashoffset', offset);
                    overallText.innerText = `${overallProgressPctClamped}%`;
                    
                    // Color logic for Overall Ring
                    if (overallProgressPctClamped === 100) {
                        overallRing.setAttribute('stroke', '#ffb400');
                        overallRing.setAttribute('stroke-width', 18);
                    } else {
                        overallRing.setAttribute('stroke', '#2196f3');
                        overallRing.setAttribute('stroke-width', 16);
                    }
                }

            } catch (err) {
                console.error("Error in afterRender:", err);
            }
        }, 50); 
    }
};

export default DashboardPage;