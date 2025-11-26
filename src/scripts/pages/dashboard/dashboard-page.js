const DashboardPage = {
  async render() {
    // 1. AMBIL DATA USER DARI LOCALSTORAGE
    // Jika tidak ada data (misal akses paksa), gunakan default "Guest"
    const userStr = localStorage.getItem('userInfo');
    const user = userStr ? JSON.parse(userStr) : { name: "Guest" };
    
    // Format nama menjadi kapital agar terlihat bagus di header
    const displayName = user.name ? user.name.toUpperCase() : "GUEST";

    return `
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
                <a href="#" class="menu-item">My Progress</a>
                <a href="#" class="menu-item">Dicoding Mentoring</a>
            </div>

            <div class="menu-group">
                <div class="menu-category">DOCUMENT</div>
                <a href="#" class="menu-item">Student Portal</a>
                <a href="#" class="menu-item">Announcement</a>
                <a href="#" class="menu-item">Capstone Project</a>
                <a href="#" class="menu-item">Newsletter</a>
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
                            <p>Berdasarkan hasil kuis Modul 3, Anda siap untuk materi lanjutan. Tingkatkan skill manajemen state Anda sekarang.</p>
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
                        
                        <div class="card">
                            <div class="card-header-row">
                                <h3>Daily Check-in</h3>
                                <span class="week-label">Week 1</span>
                            </div>
                            <p class="sub-date">November 2025</p>
                            <div class="checkin-pills-container">
                                <div class="day-pill-vertical done"><span class="pill-day">Senin</span><span class="pill-num">1</span></div>
                                <div class="day-pill-vertical done"><span class="pill-day">Selasa</span><span class="pill-num">2</span></div>
                                <div class="day-pill-vertical done"><span class="pill-day">Rabu</span><span class="pill-num">3</span></div>
                                <div class="day-pill-vertical missed"><span class="pill-day">Kamis</span><span class="pill-num">4</span></div>
                                <div class="day-pill-vertical future"><span class="pill-day">Jumat</span><span class="pill-num">5</span></div>
                            </div>
                        </div>

                        <div class="card">
                            <div class="card-header-row">
                                <h3>My Schedule</h3>
                                <a href="#" class="link-view-all">View all</a>
                            </div>
                            <p class="sub-date">Today, 4 November 2025</p>
                            
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

                        <div class="module-row">
                            <div class="mod-icon" style="background:#003e52;"></div>
                            <div class="mod-details">
                                <div class="mod-top">
                                    <h4>Fundamental Front-End Web Development</h4>
                                    <span class="score">98</span>
                                </div>
                                <div class="mod-sub">Core Path</div>
                                <div class="progress-track"><div class="progress-bar green" style="width: 100%;"></div></div>
                            </div>
                            <div class="mod-status-icon green"><i class="fa-solid fa-circle-check"></i></div>
                        </div>

                        <div class="module-row">
                            <div class="mod-icon" style="background:#005060;"></div>
                            <div class="mod-details">
                                <div class="mod-top">
                                    <h4>Building Interactive Apps with React</h4>
                                </div>
                                <div class="mod-sub">Specialization</div>
                                <div class="progress-track"><div class="progress-bar blue" style="width: 70%;"></div></div>
                            </div>
                            <div class="mod-status-icon blue-solid"></div>
                        </div>

                        <div class="module-row border-none">
                            <div class="mod-icon" style="background:#333;"></div>
                            <div class="mod-details">
                                <div class="mod-top">
                                    <h4>Automated Testing & CI/CD Pipelines</h4>
                                    <span class="badge-locked">Locked</span>
                                </div>
                                <div class="mod-sub">DevOps</div>
                                <div class="progress-track"><div class="progress-bar grey" style="width: 0%;"></div></div>
                            </div>
                            <div class="mod-status-icon grey-circle"></div>
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
                        <div class="stats-big-num">42.5 hrs</div>
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
                                <path class="circle" stroke-dasharray="89, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <text x="18" y="20.35" class="percentage">89</text>
                            </svg>
                        </div>
                        <div class="grade-text">
                            <span class="label-gray">Avg. Grade</span>
                            <h4>Excellent!</h4>
                            <p>You are in top 10% of class.</p>
                        </div>
                    </div>

                    <div class="card milestone-card">
                        <h3>Learning Milestone</h3>
                        <div class="timeline-container">
                            <div class="tl-item done">
                                <div class="tl-dot"></div>
                                <div class="tl-content">
                                    <h4>Web Dasar</h4>
                                    <p>HTML, CSS, Layouting</p>
                                </div>
                            </div>
                            <div class="tl-item done">
                                <div class="tl-dot"></div>
                                <div class="tl-content">
                                    <h4>JavaScript Core</h4>
                                    <p>ES6, DOM, Async</p>
                                </div>
                            </div>
                            <div class="tl-item current">
                                <div class="tl-dot-ring"></div>
                                <div class="tl-content">
                                    <h4 class="text-blue">Front-End Expert</h4>
                                    <p>React, PWA, Testing</p>
                                </div>
                            </div>
                            <div class="tl-item future">
                                <div class="tl-dot-hollow"></div>
                                <div class="tl-content">
                                    <h4>Back-End Basics</h4>
                                    <p>NodeJS, Hapi, REST API</p>
                                </div>
                            </div>
                            <div class="tl-item future">
                                <div class="tl-dot-hollow"></div>
                                <div class="tl-content">
                                    <h4>Capstone Project</h4>
                                    <p>Final Application</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="insight-box-blue">
                        <div class="insight-icon"><i class="fa-solid fa-chart-line"></i> <strong>Insight</strong></div>
                        <p>You are 20% faster than the class average in the "Front-End Expert" milestone. Keep it up!</p>
                    </div>

                </div> 
            </div>
            
            <footer>© 2025 Dicoding Indonesia</footer>
        </main>
      </div>
    `;
  },

  async afterRender() {
    // 1. LOGIKA LOGOUT
    const logoutBtn = document.getElementById('logoutDashBtn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
             const confirmLogout = confirm("Yakin ingin logout?");
             if(confirmLogout) {
                 // Hapus semua sesi
                 localStorage.removeItem('statusLogin');
                 localStorage.removeItem('userInfo');
                 
                 // Redirect ke Home
                 window.location.hash = '/';
             }
        });
    }

    // 2. RENDER CHART (CHART.JS)
    const ctxRadar = document.getElementById('radarChart');
    if (ctxRadar) {
        new Chart(ctxRadar.getContext('2d'), {
            type: 'radar',
            data: {
                labels: ['HTML/CSS', 'JavaScript', 'React', 'Testing', 'DevOps', 'Soft Skills'],
                datasets: [{
                    label: 'You', 
                    data: [90, 85, 88, 60, 40, 75],
                    backgroundColor: 'rgba(33, 150, 243, 0.2)', 
                    borderColor: '#2196f3', 
                    borderWidth: 2,
                    pointBackgroundColor: '#2196f3'
                }, {
                    label: 'Class Avg', 
                    data: [70, 75, 60, 50, 45, 65],
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
                        ticks: { display: false }, 
                        grid: { color: '#f0f0f0' }, 
                        pointLabels: { font: { size: 9 } } 
                    } 
                },
                maintainAspectRatio: false
            }
        });
    }
  }
};

export default DashboardPage;