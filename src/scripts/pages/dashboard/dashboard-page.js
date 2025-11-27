import { getStudentData } from '../../user-data.js';

const DashboardPage = {
  async render() {
    // 1. AMBIL DATA USER DARI LOCALSTORAGE
    const userStr = localStorage.getItem('userInfo');
    const user = userStr ? JSON.parse(userStr) : { name: "Guest", email: "" };
    const displayName = user.name ? user.name.toUpperCase() : "GUEST";

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

    return `
      <!-- INJECT CSS -->
      <style>
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

        /* --- SCROLLABLE MODULE LIST STYLES --- */
        #module-list-container { max-height: 280px; overflow-y: auto; padding-right: 5px; }
        #module-list-container::-webkit-scrollbar { width: 6px; }
        #module-list-container::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
        #module-list-container::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
        #module-list-container::-webkit-scrollbar-thumb:hover { background: #b3b3b3; }
        
        .module-row { cursor: pointer; transition: background-color 0.2s; }
        .module-row:hover { background-color: #f9f9f9; }
        .pct-text { font-size: 11px; color: #666; font-weight: 600; float: right; }
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
                <a href="#/dashboard" class="menu-item">Dashboard</a>
                <a href="#/my-progress" class="menu-item active">My Progres</a>
            </div>
            <!-- Document links removed as requested -->
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
                            <p class="sub-date">Minggu Ini (${monday.getDate()} - ${new Date(monday.getTime() + 4*24*60*60*1000).getDate()} ${new Date().toLocaleString('default', { month: 'long' })})</p>
                            
                            <div class="checkin-pills-container">
                                ${checkinPillsHTML}
                            </div>
                        </div>

                        <div class="card">
                            <div class="card-header-row">
                                <h3>My Schedule</h3>
                                <a href="#" class="link-view-all">View all</a>
                            </div>
                            <p class="sub-date">Today, ${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                            
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
                            <h3>Skill Analysis (Cohort vs You)</h3>
                            <div class="chart-legend">
                                <span class="legend-dot blue"></span> You
                                <span class="legend-dot grey"></span> Class Avg
                            </div>
                        </div>
                        <div class="radar-wrapper">
                            <canvas id="radarChart"></canvas>
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
                                <text x="18" y="20.35" class="percentage" id="avg-grade-text">0</text>
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

        </main>
      </div>
    `;
  },

  async afterRender() {
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
                alert("Tulis dulu apa yang kamu pelajari hari ini!");
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
            
            alert(`✅ Check-in Berhasil!\n\n"${randomMsg}"`);
            checkinModal.classList.remove('show');
            location.reload(); 
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

    // 3. LOGOUT LOGIC
    const logoutBtn = document.getElementById('logoutDashBtn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
             if(confirm("Yakin ingin logout?")) {
                 localStorage.removeItem('statusLogin');
                 localStorage.removeItem('userInfo');
                 window.location.hash = '/';
             }
        });
    }

    // 4. AMBIL DATA USER & CSV
    const userStr = localStorage.getItem('userInfo');
    const user = userStr ? JSON.parse(userStr) : null;

    if(!user || !user.email) return;

    try {
        const studentCourses = await getStudentData(user.email);
        
        // --- A. HITUNG TOTAL STUDY TIME (DATA CSV COMPREHENSIVE) ---
        // Mapping Jam lengkap sesuai Course.csv untuk akurasi
        const courseHoursMap = {
            // React / Web Path
            "Belajar Dasar Pemrograman Web": 46,
            "Belajar Dasar Pemrograman JavaScript": 46,
            "Belajar Membuat Aplikasi Front-End Pemula": 45,
            "Belajar Fundamental Aplikasi React": 100,
            "Menjadi React Web Developer Expert": 110,
            
            // SOLID Principle (Course ID 10 & 55 from snippets)
            "Belajar Prinsip Pemrograman SOLID": 15,

            // Google Cloud
            "Belajar Dasar Google Cloud": 12,
            "Belajar Membuat Aplikasi Back-End untuk Pemula dengan Google Cloud": 45,
            "Menjadi Google Cloud Architect": 35,
            "Menjadi Google Cloud Engineer": 42,

            // Android / Kotlin
            "Memulai Pemrograman dengan Kotlin": 50,
            "Belajar Membuat Aplikasi Android untuk Pemula": 60,
            "Belajar Fundamental Aplikasi Android": 140,
            "Belajar Pengembangan Aplikasi Android Intermediate": 150,
            "Menjadi Android Developer Expert": 90,

            // iOS / Swift
            "Memulai Pemrograman Dengan Swift": 40,
            "Belajar Membuat Aplikasi iOS untuk Pemula": 40,
            "Belajar Fundamental Aplikasi iOS": 70,
            "Menjadi iOS Developer Expert": 70,

            // Machine Learning / AI
            "Belajar Dasar AI": 10,
            "Memulai Pemrograman dengan Python": 60,
            "Belajar Machine Learning untuk Pemula": 90,
            "Belajar Fundamental Deep Learning": 110,
            "Machine Learning Terapan": 80,
            "Membangun Proyek Deep Learning Tingkat Mahir": 90,
            "Machine Learning Operations (MLOps)": 80,
            "Membangun Sistem Machine Learning": 90,

            // Back-End / AWS
            "Belajar Dasar Cloud dan Gen AI di AWS": 18,
            "Architecting on AWS (Membangun Arsitektur Cloud di AWS)": 40,
            "Belajar Back-End Pemula dengan JavaScript": 50,
            "Belajar Fundamental Back-End dengan JavaScript": 90,
            "Menjadi Back-End Developer Expert dengan JavaScript": 82,
            "Menjadi Node.js Application Developer": 57,

            // Multi-Platform
            "Belajar Fundamental Aplikasi Flutter": 90,
            "Belajar Membuat Aplikasi Flutter untuk Pemula": 35, // Estimasi berdasarkan data yang ada
            "Prompt Engineering untuk Software Developer": 16,

            // Fallback
            "default": 40
        };

        let totalStudyHours = 0;
        studentCourses.forEach(course => {
            const hours = courseHoursMap[course.title] || courseHoursMap["default"];
            // PASTIKAN PARSE INTEGER AGAR TIDAK TERBACA SEBAGAI STRING
            const totalTuts = parseInt(course.active_tutorials, 10) || 1;
            const completedTuts = parseInt(course.completed_tutorials, 10) || 0;
            
            let ratio = completedTuts / totalTuts;
            if (ratio > 1) ratio = 1; 
            
            totalStudyHours += (ratio * hours);
        });
        document.getElementById('total-study-time').innerText = `${Math.round(totalStudyHours)} hrs`;

        // --- B. HITUNG AVG GRADE & VERDICT ---
        const gradedCourses = studentCourses.filter(c => c.score && c.score > 0);
        let avgScore = 0;
        if (gradedCourses.length > 0) {
            const totalScore = gradedCourses.reduce((acc, c) => acc + parseInt(c.score, 10), 0);
            avgScore = Math.round(totalScore / gradedCourses.length);
        }
        
        document.getElementById('avg-grade-text').innerText = avgScore;
        const ring = document.getElementById('avg-grade-ring');
        if(ring) ring.setAttribute('stroke-dasharray', `${avgScore}, 100`);
        
        let verdict = "Start Learning";
        let verdictColor = "text-slate-500"; 
        
        // Logic Verdict untuk Tono (Excellent)
        if (avgScore >= 90) { 
            verdict = "Excellent!"; 
            verdictColor = "text-green-600"; 
        } else if (avgScore >= 80) { 
            verdict = "Very Good!"; 
            verdictColor = "text-blue-600"; 
        } else if (avgScore >= 60) { 
            verdict = "Good"; 
            verdictColor = "text-yellow-600"; 
        } else if (avgScore > 0) { 
            verdict = "Fair"; 
            verdictColor = "text-orange-500"; 
        }

        const verdictEl = document.getElementById('grade-verdict');
        if(verdictEl) {
            verdictEl.innerText = verdict;
            verdictEl.className = `text-lg font-bold ${verdictColor}`;
        }

        // --- C. DYNAMIC LEARNING MILESTONE (React Developer Path ID 13) ---
        // Path sesuai data Course CSV: Dasar Web -> JS -> FE Pemula -> React Fund -> React Expert
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
            // Cari apakah course ini ada di progress student
            const foundCourse = studentCourses.find(c => c.title === pathItem.title);
            let status = 'future'; // default

            if (foundCourse) {
                if (foundCourse.isCompleted) {
                    status = 'done';
                } else {
                    status = 'current';
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

        // --- D. CURRENT MODULES ---
        const modulesToShow = studentCourses.sort((a, b) => {
            if (!!a.isCompleted === !!b.isCompleted) return 0;
            return a.isCompleted ? 1 : -1;
        });
        
        const moduleContainer = document.getElementById('module-list-container');
        let moduleHtml = '';
        
        modulesToShow.forEach((mod, index) => {
            const totalTuts = parseInt(mod.active_tutorials, 10) || 1; 
            const completedTuts = parseInt(mod.completed_tutorials, 10) || 0;
            
            let progressPct = 0;
            if (mod.isCompleted) {
                progressPct = 100;
            } else {
                progressPct = Math.round((completedTuts / totalTuts) * 100);
                if (progressPct > 100) progressPct = 100;
            }

            const barColor = progressPct === 100 ? 'green' : 'blue';
            const iconColor = progressPct === 100 ? 'green' : 'blue-solid';
            
            const safeTitle = mod.title.replace(/'/g, "\\'");
            const statusStr = mod.isCompleted ? 'Graduated' : 'In Progress';
            
            moduleHtml += `
            <div class="module-row" style="margin-right: 5px;" 
                 onclick="window.openModuleDetail('${safeTitle}', '${statusStr}', ${progressPct}, ${mod.score || 0}, ${completedTuts}, ${totalTuts})">
                <div class="mod-icon" style="background:${progressPct === 100 ? '#003e52' : '#005060'};"></div>
                <div class="mod-details">
                    <div class="mod-top">
                        <h4>${mod.title}</h4>
                        <span class="pct-text">${progressPct}%</span>
                    </div>
                    <div class="mod-sub">Academy Course</div>
                    <div class="progress-track"><div class="progress-bar ${barColor}" style="width: ${progressPct}%;"></div></div>
                </div>
                <div class="mod-status-icon ${iconColor}">
                    ${progressPct === 100 ? '<i class="fa-solid fa-circle-check"></i>' : ''}
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
            'DevOps': ['Cloud', 'AWS', 'Google', 'Azure', 'DevOps'],
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
                        skillScores[idx] += parseInt(course.score, 10);
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
                            ticks: { display: false, max: 100 }, 
                            grid: { color: '#f0f0f0' }, 
                            pointLabels: { font: { size: 9 } } 
                        } 
                    },
                    maintainAspectRatio: false
                }
            });
        }

    } catch (err) {
        console.error(err);
    }
  }
};

export default DashboardPage;