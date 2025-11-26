import { getStudentData } from '../../user-data.js';

const DashboardPage = {
  async render() {
    // 1. AMBIL DATA USER DARI LOCALSTORAGE
    const userStr = localStorage.getItem('userInfo');
    const user = userStr ? JSON.parse(userStr) : { name: "Guest", email: "" };
    
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
                <a href="#/my-progress" class="menu-item">My Progress</a>
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
                        <div class="stats-big-num" id="total-study-time">0 hrs</div>
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
                        <div class="timeline-container">
                            <div class="tl-item done">
                                <div class="tl-dot"></div>
                                <div class="tl-content">
                                    <h4>Web Dasar</h4>
                                    <p>HTML, CSS, Layouting</p>
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
                        </div>
                    </div>

                </div> 
            </div>
            
            <footer>© 2025 Dicoding Indonesia</footer>
        </main>
      </div>
    `;
  },

  async afterRender() {
    // 1. LOGOUT LOGIC
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

    // 2. AMBIL DATA USER & CSV
    const userStr = localStorage.getItem('userInfo');
    const user = userStr ? JSON.parse(userStr) : null;

    if(!user || !user.email) return;

    try {
        const studentCourses = await getStudentData(user.email);
        
        // --- HITUNG STATISTIK ---
        
        // A. Total Study Time
        const totalTutorials = studentCourses.reduce((acc, curr) => acc + curr.tutorials, 0);
        const totalHours = (totalTutorials * 0.5).toFixed(1);
        document.getElementById('total-study-time').innerText = `${totalHours} hrs`;

        // B. Average Grade (LOGIKA DIPERBAIKI)
        // Filter hanya kursus yang MEMILIKI nilai (score > 0)
        const gradedCourses = studentCourses.filter(c => c.score && c.score > 0);
        
        let avgScore = 0;
        if (gradedCourses.length > 0) {
            const totalScore = gradedCourses.reduce((acc, c) => acc + c.score, 0);
            avgScore = Math.round(totalScore / gradedCourses.length);
        }
        
        // Update Angka dan Lingkaran Grafik
        document.getElementById('avg-grade-text').innerText = avgScore;
        const ring = document.getElementById('avg-grade-ring');
        if(ring) ring.setAttribute('stroke-dasharray', `${avgScore}, 100`);
        
        // Update Teks Status (Verdict)
        let verdict = "Start Learning";
        let verdictColor = "text-slate-500"; // Warna default abu-abu

        if (avgScore >= 90) {
            verdict = "Excellent!";
            verdictColor = "text-green-600"; // Hijau
        } else if (avgScore >= 80) {
            verdict = "Very Good!";
            verdictColor = "text-blue-600"; // Biru
        } else if (avgScore >= 60) {
            verdict = "Good";
            verdictColor = "text-yellow-600"; // Kuning/Orange
        } else if (avgScore > 0) {
            verdict = "Fair";
            verdictColor = "text-orange-500"; 
        }

        const verdictEl = document.getElementById('grade-verdict');
        if(verdictEl) {
            verdictEl.innerText = verdict;
            // Hapus class lama dan tambahkan warna baru
            verdictEl.className = `text-lg font-bold ${verdictColor}`;
        }

        // C. Current Modules
        const inProgress = studentCourses.filter(c => !c.isCompleted);
        const modulesToShow = inProgress.length > 0 ? inProgress.slice(0, 3) : studentCourses.slice(0, 3);
        
        const moduleContainer = document.getElementById('module-list-container');
        let moduleHtml = '';
        
        modulesToShow.forEach((mod, index) => {
            const progress = mod.isCompleted ? 100 : Math.floor(Math.random() * 80) + 10;
            const barColor = progress === 100 ? 'green' : 'blue';
            const iconColor = progress === 100 ? 'green' : 'blue-solid';
            
            moduleHtml += `
            <div class="module-row ${index === modulesToShow.length -1 ? 'border-none' : ''}">
                <div class="mod-icon" style="background:${progress === 100 ? '#003e52' : '#005060'};"></div>
                <div class="mod-details">
                    <div class="mod-top">
                        <h4>${mod.title}</h4>
                        ${mod.score > 0 ? `<span class="score">${mod.score}</span>` : ''}
                    </div>
                    <div class="mod-sub">Academy Course</div>
                    <div class="progress-track"><div class="progress-bar ${barColor}" style="width: ${progress}%;"></div></div>
                </div>
                <div class="mod-status-icon ${iconColor}">
                    ${progress === 100 ? '<i class="fa-solid fa-circle-check"></i>' : ''}
                </div>
            </div>`;
        });
        moduleContainer.innerHTML = moduleHtml || '<p style="color:#999; font-size:12px;">Tidak ada data modul.</p>';

        // D. SKILL RADAR CHART
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