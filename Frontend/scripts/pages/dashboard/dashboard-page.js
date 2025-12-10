import { getStudentRecord, getLearningPaths, getStudentData as fetchStudentData, getStudentRecords, getLpCourse } from '../../user-data.js';

// --- MOCK DATA & HELPERS (Simulasi Backend/API) ---

// Helper Modal
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
        // 1. User Info Logic
        const userStr = localStorage.getItem('userInfo');
        const user = userStr ? JSON.parse(userStr) : { name: "Guest", email: "" };
        let displayName = user.name ? user.name.toUpperCase() : "GUEST";

        // Try to resolve Learning Path name (from CSV/API) using student record or persisted user.learning_path_id
        let learningPathName = '';
        try {
            const studentRec = await getStudentRecord(user.email || '');
            const lps = await getLearningPaths();
            const lpId = (studentRec && studentRec.learning_path_id) ? String(studentRec.learning_path_id).trim() : (user.learning_path_id ? String(user.learning_path_id).trim() : '');
            if (lpId) {
                const found = lps.find(p => String(p.learning_path_id) === String(lpId));
                if (found && found.learning_path_name) learningPathName = found.learning_path_name;
            }
        } catch (err) {
            console.warn('Failed to load learning path name', err);
        }

        // --- Recommended Next Step: determine from student's active course and lp+course.csv
        let recommendedTitle = 'Mastering React Hooks';
        let recommendedNote = 'Berdasarkan hasil kuis Modul 3, Anda siap untuk materi lanjutan state management.';
        let recommendedLink = '#/course?title=' + encodeURIComponent('Mastering React Hooks');
        try {
            const studentCourses = await fetchStudentData(user.email || '');
            const activeCourse = (studentCourses && studentCourses.find(c => !c.isCompleted)) || (studentCourses && studentCourses[0]) || null;
            const lpCourseData = await getLpCourse();
            const courseMap = (lpCourseData && lpCourseData.courseMap) ? lpCourseData.courseMap : (lpCourseData || {});
            const lpOrder = (lpCourseData && lpCourseData.lpCourseOrder) ? lpCourseData.lpCourseOrder : {};

            if (activeCourse && activeCourse.title) {
                const courseName = activeCourse.title;
                // Try to find the course in courseMap
                const mapped = courseMap[courseName];
                if (mapped) {
                    const lpName = mapped.learning_path_name;
                    // Try to find ordered list for this learning path
                    const lpCourses = (lpOrder && lpOrder[lpName]) || [];
                    const idx = lpCourses.indexOf(courseName);
                    if (idx >= 0 && idx < lpCourses.length - 1) {
                        // Next course exists in same learning path
                        const nextCourse = lpCourses[idx + 1];
                        recommendedTitle = nextCourse;
                        recommendedLink = '#/course?title=' + encodeURIComponent(nextCourse);
                        recommendedNote = `Lanjutkan kursus berikutnya: ${nextCourse}`;
                    } else {
                        // No next course in LP -> fallback to first tutorial of current course
                        recommendedTitle = courseName;
                        recommendedLink = '#/course?title=' + encodeURIComponent(courseName);
                        if (mapped.tutorials && mapped.tutorials.length > 0) {
                            recommendedNote = `Lanjutkan modul: ${mapped.tutorials[0]}`;
                        } else {
                            recommendedNote = `Lanjutkan kursus: ${courseName}`;
                        }
                    }
                } else {
                    // Course not found in lp+course mapping: default to course itself
                    recommendedTitle = courseName;
                    recommendedLink = '#/course?title=' + encodeURIComponent(courseName);
                    recommendedNote = `Lanjutkan kursus: ${courseName}`;
                }
            }
        } catch (err) {
            console.warn('Failed to compute recommended next step', err);
        }

        // 2. Date Logic (Full Month)
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth(); 
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        const todayLocalized = new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'});
        const currentMonthName = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });

        // 3. Check-in Logic
        const storedCheckins = localStorage.getItem('dailyCheckins');
        const checkinData = storedCheckins ? JSON.parse(storedCheckins) : {};
        
        const tuesday = new Date(); 
        tuesday.setDate(today.getDate() - 2);
        const tuesdayKey = tuesday.toISOString().split('T')[0];
        if (!checkinData[tuesdayKey]) checkinData[tuesdayKey] = { emoji: 'Great', note: 'Done' };

        let checkinPillsHTML = '';
        
        for (let d = 1; d <= daysInMonth; d++) {
            const dateIter = new Date(currentYear, currentMonth, d);
            const dateKey = dateIter.toISOString().split('T')[0];
            const dayName = dateIter.toLocaleDateString('id-ID', { weekday: 'short' });
            
            let statusClass = 'future'; 
            let isClickable = false;
            const isDone = checkinData[dateKey];

            const dateIterTime = new Date(dateIter).setHours(0,0,0,0);
            const todayTime = new Date(today).setHours(0,0,0,0);

            if (isDone) {
                statusClass = 'done'; 
            } else if (dateIterTime < todayTime) {
                statusClass = 'missed'; 
            } else if (dateIterTime === todayTime) {
                statusClass = 'active-today'; 
                isClickable = true;
            }

            const clickAttr = isClickable ? `onclick="window.handleCheckinClick('${dateKey}')"` : '';
            const cursorStyle = isClickable ? 'cursor: pointer;' : (statusClass === 'done' || statusClass === 'missed' ? 'cursor: default;' : '');
            
            const scrollId = dateIterTime === todayTime ? 'id="scroll-to-today"' : `id="pill-${dateKey}"`;

            checkinPillsHTML += `
                <div class="day-pill-vertical ${statusClass}" ${clickAttr} style="${cursorStyle}" ${scrollId} data-date="${dateKey}">
                    <span class="pill-day">${dayName}</span>
                    <span class="pill-num">${d}</span>
                    ${isDone ? '<div class="dot-indicator"></div>' : ''}
                </div>
            `;
        }

        // 4. Mock Schedule Data
        const mockSchedule = [
            { time: "08.00 - 10.00", title: "ILT-FB1- Front-End Web Dasar", type: "Live Session" },
            { time: "10.30 - 12.00", title: "Mentoring Session Group A", type: "Mentoring" },
            { time: "13.00 - 15.00", title: "Module: React Hooks Deep Dive", type: "Self Study" },
            { time: "16.00 - 17.00", title: "Quiz: Fundamental JavaScript", type: "Assessment" },
            { time: "19.00 - 21.00", title: "Project: Building Interactive Apps", type: "Project Work" },
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

        const scheduleCardHTML = mockSchedule.map(item => `
            <div class="sched-row-item">
                <div class="sched-info">
                    <span class="sched-time">${item.time}</span>
                    <h4>${item.title}</h4>
                </div>
                <div class="sched-actions">
                    <button class="btn-icon-small"><i class="fa-solid fa-chevron-right"></i></button>
                </div>
            </div>
        `).join('');

        return `
            <style>
                /* --- MODERN RESET & TYPOGRAPHY --- */
                :root {
                    --primary: #0b66c3; /* refined blue */
                    --primary-dark: #084e97;
                    --accent: #06b6a4; /* teal accent for pills */
                    --secondary: #064d58; /* deep teal for stats */
                    --bg-body: #f5f7fb;
                    --bg-card: #ffffff;
                    --text-main: #0f1724; /* darker for contrast */
                    --text-muted: #64748b;
                    --border-light: #e6eef6;
                    --success: #16a34a;
                    --danger: #ef4444;
                    --shadow-sm: 0 6px 18px rgba(16,24,40,0.06);
                    --shadow-md: 0 18px 50px rgba(16,24,40,0.08);
                }
                
                body { margin: 0; padding: 0; font-family: 'Poppins', sans-serif; background: var(--bg-body); color: var(--text-main); -webkit-font-smoothing: antialiased; }
                a { text-decoration: none; color: inherit; transition: 0.2s; }
                h1, h2, h3, h4 { margin: 0; font-weight: 700; color: var(--text-main); }
                
                /* Layout */
                .dashboard-body { display: flex; min-height: 100vh; }
                
                /* --- SIDEBAR --- */
                .sidebar { width: 240px; background-color: #1e293b; color: white; padding: 25px 0; display: flex; flex-direction: column; flex-shrink: 0; position: fixed; height: 100vh; z-index: 100; transition: 0.3s; }
                .sidebar-header { padding: 0 24px 40px; }
               
                        .menu-group { padding: 10px 12px; }
                .menu-category { font-size: 11px; color: #94a3b8; padding: 8px 16px; margin-top: 10px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
                .menu-item { display: flex; align-items: center; padding: 12px 16px; color: #cbd5e1; border-radius: 8px; margin-bottom: 4px; font-size: 14px; font-weight: 500; }
                .menu-item:hover { background-color: rgba(255,255,255,0.05); color: white; }
                .menu-item.active { background: linear-gradient(90deg, rgba(56, 189, 248, 0.15) 0%, rgba(56, 189, 248, 0) 100%); color: #38bdf8; border-left: 3px solid #38bdf8; }
                .menu-item i { margin-right: 12px; width: 20px; text-align: center; }

                /* --- MAIN CONTENT --- */
                .main-content { flex-grow: 1; padding: 30px 40px; margin-left: 240px; max-width: 1400px; }
                
                /* Header */
                .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 35px; }
                .header-left h1 { font-size: 26px; color: var(--text-main); font-weight: 800; margin-bottom: 4px; }
                .header-left p { font-size: 14px; color: var(--text-muted); }
                /* Learning Path styling - highlighted pill */
                .lp-wrapper { margin-top: 8px; }
                .lp-pill { display: inline-flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 12px; background: linear-gradient(90deg, rgba(14,165,233,0.08), rgba(6,182,212,0.04)); box-shadow: 0 8px 22px rgba(2,6,23,0.06); border-left: 4px solid rgba(6,182,212,0.9); transition: transform 0.12s ease, box-shadow 0.12s ease; }
                .lp-pill:hover { transform: translateY(-3px); box-shadow: 0 14px 40px rgba(2,6,23,0.12); }
                .lp-icon { display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:8px; background: linear-gradient(180deg, rgba(6,182,212,0.12), rgba(3,105,161,0.04)); box-shadow: inset 0 -2px 6px rgba(2,6,23,0.02); }
                .lp-text { display:flex; flex-direction:column; }
                .lp-label { font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.6px; opacity: 0.85; }
                .lp-name { font-size: 17px; font-weight: 900; color: #035388; margin-top: 2px; line-height: 1; }
                @media (max-width: 900px) { .lp-name { font-size: 15px; } .lp-pill { padding: 8px 12px; gap:10px; } }
                
                .header-right { display: flex; align-items: center; gap: 18px; }
                
                /* -- SEARCH CONTAINER (MODERN DESIGN) -- */
                .search-container {
                    position: relative;
                    width: 360px;
                    display: flex;
                    align-items: center;
                }
                .search-icon-inline {
                    position: absolute;
                    left: 16px;
                    pointer-events: none;
                    flex-shrink: 0;
                    transition: color 0.2s ease;
                }
                .search-input {
                    width: 100%;
                    padding: 11px 16px 11px 50px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 28px;
                    font-size: 14px;
                    font-weight: 500;
                    outline: none;
                    background: #f8fafc;
                    color: #1e293b;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-sizing: border-box;
                }
                .search-input::placeholder {
                    color: #cbd5e1;
                    font-weight: 400;
                }
                .search-input:hover {
                    background: white;
                    border-color: #cbd5e1;
                }
                .search-input:focus {
                    background: white;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
                }
                .search-input:focus + .search-icon-inline,
                .search-container:has(.search-input:focus) .search-icon-inline {
                    color: var(--primary);
                }
                .notif-btn { 
                    width: 44px; 
                    height: 44px; 
                    background: white; 
                    border-radius: 50%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06); 
                    cursor: pointer; 
                    color: #64748b; 
                    border: 1.5px solid #e2e8f0; 
                    transition: all 0.2s ease;
                }
                .notif-btn:hover { 
                    background: #f8fafc; 
                    color: var(--primary);
                    border-color: #cbd5e1;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                }
                .notif-btn:hover { background: #f8fafc; color: var(--primary); }
                
                /* Grid System */
                .dashboard-grid { display: grid; grid-template-columns: 3fr 1.1fr; gap: 24px; }
                @media (max-width: 1200px) { .dashboard-grid { grid-template-columns: 1fr; } .main-content { margin-left: 0; padding: 20px; } .sidebar { transform: translateX(-100%); } }
                .middle-row-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }

                /* --- CARDS GLOBAL --- */
                .card { background: var(--bg-card); border-radius: 14px; padding: 24px; box-shadow: var(--shadow-sm); margin-bottom: 24px; position: relative; border: 1px solid var(--border-light); }
                .card-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
                .card-header-row h3 { font-size: 16px; font-weight: 700; color: var(--text-main); }
                .sub-date { font-size: 12px; color: var(--text-muted); margin-bottom: 16px; display: block; font-weight: 500; }
                .link-view-all, .link-text { font-size: 12px; color: var(--primary); font-weight: 600; padding: 4px 8px; border-radius: 6px; cursor: pointer;}
                .link-view-all:hover, .link-text:hover { background: #e3f2fd; }
                .mb-20 { margin-bottom: 20px; }

                /* Hero Card */
                .hero-card { background: linear-gradient(120deg, var(--primary-dark) 0%, var(--primary) 100%); color: white; display: flex; justify-content: space-between; align-items: center; padding: 28px; height: 150px; border: none; box-shadow: var(--shadow-md); border-radius: 14px; }
                .hero-text-content { z-index: 2; position: relative; }
                .hero-text-content h2 { font-size: 24px; margin: 8px 0 12px; color: white; }
                .hero-text-content p { font-size: 13px; opacity: 0.9; margin-bottom: 20px; max-width: 400px; line-height: 1.5; }
                .tag-blue { background: rgba(255, 255, 255, 0.2); padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; }
                .btn-primary { background: white; color: #1e3a8a; border: none; padding: 10px 24px; border-radius: 50px; font-weight: 700; cursor: pointer; font-size: 13px; transition: 0.2s; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(0,0,0,0.15); }
                .hero-image-container { position: relative; }
                .react-icon-3d { font-size: 140px; color: rgba(255, 255, 255, 0.15); position: absolute; right: -20px; bottom: -80px; animation: spin 20s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }

                /* --- CHECK-IN PILLS --- */
                .btn-add-checkin { background: #f1f5f9; border: none; width: 28px; height: 28px; border-radius: 8px; cursor: pointer; color: var(--text-main); transition: 0.2s; display: flex; align-items: center; justify-content: center; }
                .btn-add-checkin:hover { background: #e2e8f0; }
                
                .checkin-pills-container { 
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(45px, 1fr)); 
                    gap: 10px; 
                    max-height: 220px; 
                    overflow-y: auto; 
                    overflow-x: hidden;
                    padding: 5px 5px 15px 5px;
                    scrollbar-width: thin;
                    scrollbar-color: #cbd5e1 transparent;
                }
                .checkin-pills-container::-webkit-scrollbar { width: 5px; }
                .checkin-pills-container::-webkit-scrollbar-track { background: transparent; }
                .checkin-pills-container::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 20px; }
                .checkin-pills-container:hover::-webkit-scrollbar-thumb { background-color: #cbd5e1; }

                .day-pill-vertical { 
                    height: 75px;
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                    justify-content: center; 
                    border-radius: 24px; 
                    border: 1px solid var(--border-light); 
                    transition: all 0.2s ease; 
                    background: #fff;
                    position: relative;
                }
                .day-pill-vertical .pill-day { font-size: 10px; font-weight: 600; margin-bottom: 6px; text-transform: uppercase; color: var(--text-muted); }
                .day-pill-vertical .pill-num { font-size: 16px; font-weight: 700; color: var(--text-main); }
                .day-pill-vertical.done { background-color: #f0fdf4; color: var(--success); border-color: #dcfce7; }
                .day-pill-vertical.done .pill-num, .day-pill-vertical.done .pill-day { color: var(--success); }
                .day-pill-vertical.missed { background-color: #fef2f2; border-color: #fee2e2; opacity: 0.7; }
                .day-pill-vertical.missed .pill-num { color: var(--danger); }
                .day-pill-vertical.future { background-color: #f8fafc; border-color: #f1f5f9; }
                .day-pill-vertical.active-today { 
                    background-color: var(--primary); 
                    border-color: var(--primary); 
                    transform: scale(1.05); 
                    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
                    z-index: 10;
                }
                .day-pill-vertical.active-today .pill-day, .day-pill-vertical.active-today .pill-num { color: white; }
                .day-pill-vertical.active-today:hover { transform: translateY(-3px) scale(1.05); }
                .dot-indicator { width: 4px; height: 4px; background: currentColor; border-radius: 50%; position: absolute; bottom: 8px; }

                /* --- SCHEDULE --- */
                .schedule-box-blue { max-height: 240px; overflow-y: auto; padding-right: 5px; }
                .schedule-box-blue::-webkit-scrollbar { width: 4px; }
                .schedule-box-blue::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .sched-row-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-light); transition: 0.2s; }
                .sched-row-item:last-child { border-bottom: none; }
                .sched-row-item:hover { background-color: #f8fafc; padding-left: 8px; padding-right: 8px; border-radius: 8px; border-bottom-color: transparent; }
                .sched-info h4 { font-size: 13px; margin: 0; color: var(--text-main); line-height: 1.4; }
                .sched-info .sched-time { font-size: 11px; color: var(--primary); font-weight: 600; display: block; margin-bottom: 2px; }
                .btn-icon-small { border: none; background: transparent; color: #cbd5e1; cursor: pointer; }
                .sched-row-item:hover .btn-icon-small { color: var(--primary); }

                /* --- MODULES LIST --- */
                #module-list-container { max-height: 300px; overflow-y: auto; padding-right: 10px; }
                #module-list-container::-webkit-scrollbar { width: 5px; }
                #module-list-container::-webkit-scrollbar-track { background: transparent; }
                #module-list-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .module-row { display: flex; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--border-light); cursor: pointer; transition: 0.2s; }
                .module-row:hover { background-color: #f8fafc; padding-left: 10px; padding-right: 10px; border-radius: 10px; border-bottom-color: transparent; }
                .mod-icon-wrapper { width: 48px; height: 48px; border-radius: 12px; margin-right: 16px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: white; flex-shrink: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                .mod-details h4 { font-size: 14px; margin-bottom: 4px; font-weight: 600; }
                .mod-sub { font-size: 11px; color: #94a3b8; margin-bottom: 8px; display: block; }
                .mod-progress-container { width: 100%; background-color: #f1f5f9; height: 6px; border-radius: 10px; overflow: hidden; }
                .mod-progress-bar { height: 100%; border-radius: 10px; transition: width 0.6s ease; }
                .mod-right { margin-left: auto; text-align: right; }
                .pct-text { font-size: 12px; font-weight: 700; color: var(--text-main); }

                /* --- RIGHT COLUMN (STATS) --- */
                .stats-dark-card { background: linear-gradient(180deg, var(--secondary), #04444a); color: white; height: 150px; border: none; overflow: hidden; border-radius: 14px; box-shadow: var(--shadow-sm); }
                .stats-top { display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; letter-spacing: 1px; opacity: 0.9; text-transform: uppercase; }
                .stats-big-num { font-size: 46px; font-weight: 900; margin-top: 18px; position: relative; z-index: 2; color: #ffffff; }
                .btn-detail-stats { background: rgba(255,255,255,0.1); border: none; color: white; border-radius: 20px; padding: 2px 10px; font-size: 10px; cursor: pointer; transition: 0.2s; }
                .btn-detail-stats:hover { background: rgba(255,255,255,0.2); }
                
                .grade-card { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; height: 220px; }
                .grade-circle-wrapper { width: 120px; height: 120px; margin-bottom: 12px; position: relative; }
                .circular-chart { display: block; margin: 0 auto; max-width: 100%; max-height: 100%; }
                .circle-bg { fill: none; stroke: #eef6fb; stroke-width: 3; }
                .circle { fill: none; stroke-width: 3.5; stroke-linecap: round; animation: progress 1s ease-out forwards; stroke: var(--primary); }
                .percentage { fill: var(--text-main); font-family: 'Poppins', sans-serif; font-weight: 900; font-size: 0.62em; text-anchor: middle; dominant-baseline: central; }
                
                /* Milestone Timeline */
                .timeline-container { border-left: 2px solid #e2e8f0; padding-left: 20px; margin-left: 10px; padding-top: 5px; }
                .tl-item { position: relative; padding-bottom: 25px; }
                .tl-item:last-child { padding-bottom: 0; }
                .tl-dot, .tl-dot-ring, .tl-dot-hollow { position: absolute; left: -26px; top: 2px; width: 10px; height: 10px; border-radius: 50%; background: white; z-index: 2; }
                .tl-dot { background-color: var(--success); border: 2px solid var(--success); }
                .tl-dot-ring { border: 2px solid var(--primary); background: white; box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.2); }
                .tl-dot-hollow { border: 2px solid #cbd5e1; background: white; }
                .tl-content h4 { font-size: 13px; margin: 0; transition: 0.2s; }
                .text-blue { color: var(--primary); }
                .tl-content p { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

                /* --- MODALS --- */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 9999; display: flex; justify-content: center; align-items: center; opacity: 0; visibility: hidden; transition: all 0.3s ease; }
                .modal-overlay.show { opacity: 1; visibility: visible; }
                .modal-content { background: white; width: 450px; max-width: 90%; border-radius: 20px; padding: 30px; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 20px 40px rgba(0,0,0,0.2); font-family: 'Poppins', sans-serif; position: relative; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .modal-header h3 { margin: 0; font-size: 20px; color: #1e293b; font-weight: 700; }
                .close-modal { cursor: pointer; font-size: 24px; color: #94a3b8; }
                
                .checkin-textarea { width: 100%; height: 100px; border: 1px solid var(--border-light); background: #f8fafc; border-radius: 12px; padding: 15px; font-size: 14px; outline: none; transition: 0.2s; resize: none; font-family: inherit; }
                .checkin-textarea:focus { background: white; border-color: var(--primary); }
                .btn-submit-checkin { background: var(--secondary); color: white; border: none; padding: 12px 30px; font-size: 14px; box-shadow: 0 4px 12px rgba(0, 80, 96, 0.3); transition: 0.2s; border-radius: 50px; font-weight: 600; cursor: pointer; }
                .btn-submit-checkin:hover { background: #003d4a; transform: translateY(-1px); }

                /* Emoji Container */
                .emoji-container { display: flex; gap: 10px; justify-content: space-between; }
                .emoji-btn { flex: 1; border: 1px solid var(--border-light); border-radius: 12px; padding: 15px 10px; background: #f8fafc; text-align: center; cursor: pointer; transition: 0.2s; }
                .emoji-btn:hover { background: white; border-color: #cbd5e1; box-shadow: var(--shadow-sm); }
                .emoji-btn.selected { background: #e0f2fe; border-color: var(--primary); color: var(--primary); box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.3); }
                .emoji-icon { font-size: 24px; display: block; margin-bottom: 5px; }
                .emoji-label { font-size: 12px; font-weight: 500; }

                /* Module Detail Styles */
                .module-detail-header { display: flex; align-items: center; margin-bottom: 20px; }
                .module-detail-icon { width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: white; margin-right: 15px; flex-shrink: 0; }
                .module-detail-title h2 { font-size: 20px; font-weight: 800; color: #1e293b; margin: 0 0 5px 0; }
                .module-detail-badge { padding: 5px 10px; font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase; font-weight: 600; border-radius: 8px; display: inline-block; }
                .badge-dasar { background: #e3f2fd; color: #1976d2; }
                .badge-pemula { background: #e8f5e9; color: #2e7d32; }
                .badge-menengah { background: #fff3e0; color: #f57c00; }
                .badge-mahir { background: #ffebee; color: #c62828; }
                .module-meta-grid { background: #f8fafc; border: 1px solid var(--border-light); border-radius: 12px; padding: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
                .meta-item { display: flex; flex-direction: column; }
                .meta-label { font-size: 10px; font-weight: 700; color: #94a3b8; margin-bottom: 4px; text-transform: uppercase; }
                .meta-value { font-size: 14px; font-weight: 600; color: #334155; }
                .module-description { font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 25px; }
                .module-action-btn { background: var(--primary); padding: 14px; font-size: 15px; border-radius: 12px; box-shadow: 0 4px 15px rgba(25, 118, 210, 0.25); border: none; color: white; width: 100%; font-weight: 600; cursor: pointer; transition: 0.2s; }
                .module-action-btn:hover { background: var(--primary-dark); transform: translateY(-1px); }
                
                .schedule-list-item { display: flex; align-items: center; margin-bottom: 15px; padding: 15px; border-radius: 12px; background: #f8fafc; border-left: 4px solid var(--primary); }
                .schedule-time { font-size: 12px; font-weight: 700; color: var(--primary); flex-shrink: 0; width: 90px; }
                .schedule-details { flex-grow: 1; padding-left: 15px; border-left: 1px solid #e2e8f0; margin-left: 10px; }
                .schedule-details h4 { font-size: 14px; margin-bottom: 2px; color: #1e293b; }
                .schedule-details p { font-size: 12px; color: #64748b; margin: 0; }
                .schedule-list-container { max-height: 400px; overflow-y: auto; padding-right: 10px; }

                footer { text-align: center; font-size: 12px; color: #94a3b8; padding: 20px 0; margin-top: 20px; }
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
                <a href="#/home" class="menu-item">Home</a>
                <a href="#/dashboard" class="menu-item">Dashboard</a>
                <a href="#/my-progress" class="menu-item">My Progres</a>
            </div>
            <!-- Document links removed as requested -->
        </aside>
                <main class="main-content">
                    <header class="dash-header">
                        <div class="header-left">
                            <h1>Hello, ${displayName} 👋</h1>
                            ${learningPathName ? `
                                <div class="lp-wrapper">
                                    <div class="lp-pill" title="${learningPathName}">
                                        <span class="lp-icon" aria-hidden="true">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
                                                <path d="M12 2L15 8H9L12 2Z" fill="#06b6d4" />
                                                <path d="M4 10H20V20H4V10Z" fill="#0369a1" opacity="0.08" />
                                                <path d="M7 12H17V14H7V12Z" fill="#0369a1" />
                                            </svg>
                                        </span>
                                        <div class="lp-text">
                                            <span class="lp-label">Learning Path</span>
                                            <div class="lp-name">${learningPathName}</div>
                                        </div>
                                    </div>
                                </div>
                            ` : `<p>Let's continue your learning journey.</p>`}
                        </div>
                        <div class="header-right">
                            <div class="search-container">
                                <svg class="search-icon-inline" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
                                    <circle cx="11" cy="11" r="8" stroke="#94a3b8" stroke-width="2" />
                                    <path d="M17 17l5 5" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" />
                                </svg>
                                <input type="text" id="searchInput" placeholder="Search course, module..." class="search-input">
                            </div>
                            <button class="notif-btn" type="button"><i class="fa-regular fa-bell"></i></button>
                        </div>
                    </header>

                    <div class="dashboard-grid">
                        <div class="left-column">
                            <div class="card hero-card">
                                <div class="hero-text-content">
                                    <span class="tag-blue">Recommended Next Step</span>
                                    <h2>${recommendedTitle}</h2>
                                    <p>${recommendedNote}</p>
                                    <a href="${recommendedLink}" class="btn-primary"><i class="fa-solid fa-play"></i> Lanjut Belajar</a>
                                </div>
                                <div class="hero-image-container">
                                     <i class="fa-brands fa-react react-icon-3d"></i>
                                </div>
                            </div>

                            <div class="middle-row-grid">
                                <div class="card">
                                    <div class="card-header-row">
                                        <div>
                                            <h3>Daily Check-in</h3>
                                            <span class="sub-date" style="margin-bottom:0;">${currentMonthName}</span>
                                        </div>
                                        <button id="btn-open-modal" class="btn-add-checkin"><i class="fa-solid fa-plus"></i></button>
                                    </div>
                                    <div style="margin-top: 15px;">
                                        <div class="checkin-pills-container" id="checkinScrollContainer">
                                            ${checkinPillsHTML}
                                        </div>
                                    </div>
                                </div>
                                <div class="card">
                                    <div class="card-header-row">
                                        <h3>Today's Schedule</h3>
                                        <a href="#" class="link-view-all" id="viewAllSchedule">View all</a>
                                    </div>
                                    <p class="sub-date">${todayLocalized}</p>
                                    <div class="schedule-box-blue">
                                        ${scheduleCardHTML}
                                    </div>
                                </div>
                            </div>

                            <div class="card modules-section">
                                <div class="card-header-row mb-20">
                                    <h3>Current Modules</h3>
                                    <a href="#" class="link-view-all">Curriculum</a>
                                </div>
                                <div id="module-list-container">
                                    <div style="padding: 20px; text-align: center; color: #94a3b8;">Loading modules...</div>
                                </div>
                            </div>

                            <div class="card skill-section">
                                <div class="card-header-row mb-20">
                                    <h3>Skill Analysis</h3>
                                    <div class="chart-legend" style="font-size: 11px; display: flex; gap: 10px;">
                                        <span style="color: #2196f3;"><i class="fa-solid fa-circle" style="font-size: 8px;"></i> You</span>
                                        <span style="color: #ccc;"><i class="fa-solid fa-circle" style="font-size: 8px;"></i> Class Avg</span>
                                    </div>
                                </div>
                                <div class="radar-wrapper" style="height: 220px;">
                                    <canvas id="radarChart"></canvas>
                                </div>
                            </div>
                        </div>

                        <div class="right-column">
                            <div class="card stats-dark-card">
                                <div class="stats-top">
                                    <span>Total Study Time</span>
                                    <button class="btn-detail-stats" onclick="window.openStudyTimeDetail()">View Details</button>
                                </div>
                                <div class="stats-big-num" id="total-study-time">0 hrs</div>
                                <div class="wave-wrapper">
                                    <svg viewBox="0 0 1440 320" style="width:100%; height:100px; opacity:0.2; position:absolute; bottom:-20px; left:0;"><path fill="#ffffff" fill-opacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
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
                                    <span class="label-gray" style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Avg. Grade</span>
                                    <h4 id="grade-verdict" style="font-size: 18px; margin-top: 5px;">Computing...</h4>
                                </div>
                            </div>

                            <div class="card milestone-card">
                                <div class="card-header-row mb-20">
                                    <h3>Milestones</h3>
                                </div>
                                <div class="timeline-container" id="milestone-container">
                                    </div>
                            </div>
                        </div>
                    </div>

                    <footer>© 2025 Dicoding Indonesia • Learning Platform</footer>

                    <div class="modal-overlay" id="checkinModal">
                        <div class="modal-content" style="width: 400px;">
                            <div class="modal-header"><h3>Daily Check-in</h3><span class="close-modal" id="closeModal">&times;</span></div>
                            <div class="modal-body">
                                <input type="hidden" id="activeCheckinDate" value="">
                                <div class="emoji-container">
                                    <div class="emoji-btn" data-value="bad"><span class="emoji-icon">🤯</span><span class="emoji-label">Stuck</span></div>
                                    <div class="emoji-btn selected" data-value="neutral"><span class="emoji-icon">🙂</span><span class="emoji-label">Okay</span></div>
                                    <div class="emoji-btn" data-value="great"><span class="emoji-icon">🚀</span><span class="emoji-label">On Fire</span></div>
                                </div>
                                <div class="input-group" style="margin-top: 20px;">
                                    <label style="display:block; margin-bottom:8px; font-weight:600; font-size:12px; color:#64748b;">CATATAN BELAJAR HARI INI</label>
                                    <textarea class="checkin-textarea" id="checkinNotes" placeholder="Apa yang kamu pelajari hari ini?"></textarea>
                                </div>
                            </div>
                            <div class="modal-footer" style="text-align: right; margin-top: 20px;">
                                <button class="btn-submit-checkin" id="submitCheckin">Simpan Progress</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-overlay" id="moduleDetailModal">
                        <div class="modal-content">
                            <div class="modal-header" style="border-bottom: none; padding-bottom: 0;">
                                <span class="close-modal" id="closeModuleModal" style="position: absolute; right: 25px; top: 25px;">&times;</span>
                            </div>
                            <div class="modal-body module-detail-content" id="moduleDetailBody"></div>
                        </div>
                    </div>

                    <div class="modal-overlay" id="scheduleModal">
                        <div class="modal-content schedule-content" style="width: 550px;">
                            <div class="modal-header"><h3>Weekly Schedule</h3><span class="close-modal" id="closeScheduleModal">&times;</span></div>
                            <div class="modal-body schedule-list-container">${scheduleListHTML}</div>
                        </div>
                    </div>

                    <div class="modal-overlay" id="studyTimeModal">
                        <div class="modal-content" style="width: 500px;">
                            <div class="modal-header"><h3>Weekly Study Activity</h3><span class="close-modal" id="closeStudyModal">&times;</span></div>
                            <div class="modal-body">
                                <div style="height: 250px;">
                                    <canvas id="studyTimeChart"></canvas>
                                </div>
                                <p style="text-align:center; font-size:12px; color:#64748b; margin-top:15px;">Total hours spent learning this week.</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;
    },

    async afterRender() {
        // --- AUTO SCROLL VERTICAL TO TODAY ---
        setTimeout(() => {
            const todayPill = document.getElementById('scroll-to-today');
            const container = document.getElementById('checkinScrollContainer');
            if (todayPill && container) {
                const scrollTop = todayPill.offsetTop - container.offsetTop - (container.clientHeight / 2) + (todayPill.clientHeight / 2);
                container.scrollTo({ top: scrollTop, behavior: 'smooth' });
            }
        }, 300);

        // --- GLOBAL & EVENT LISTENERS ---
        
        const checkinModal = document.getElementById('checkinModal');
        const openCheckinBtn = document.getElementById('btn-open-modal');
        const closeCheckinBtn = document.getElementById('closeModal');
        const submitCheckinBtn = document.getElementById('submitCheckin');
        const emojiBtns = document.querySelectorAll('.emoji-btn');
        
        const scheduleModal = document.getElementById('scheduleModal');
        const openScheduleBtn = document.getElementById('viewAllSchedule');
        const closeScheduleBtn = document.getElementById('closeScheduleModal');

        const moduleModal = document.getElementById('moduleDetailModal');
        const closeModuleBtn = document.getElementById('closeModuleModal');

        const studyTimeModal = document.getElementById('studyTimeModal');
        const closeStudyModalBtn = document.getElementById('closeStudyModal');

        const logoutBtn = document.getElementById('logoutDashBtn');
        const searchInput = document.getElementById('searchInput');

        // Toggle Emoji
        emojiBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                emojiBtns.forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
            });
        });

        // Global functions
        window.handleCheckinClick = (dateStr) => {
            document.getElementById('activeCheckinDate').value = dateStr;
            document.getElementById('checkinNotes').value = "";
            emojiBtns.forEach(b => b.classList.remove('selected'));
            const neutralBtn = document.querySelector('.emoji-btn[data-value="neutral"]');
            if(neutralBtn) neutralBtn.classList.add('selected');
            checkinModal.classList.add('show');
        };

        window.openModuleDetail = (modTitle, modLevel, modHours, modRating, modStatus, modStartDate, modEndDate, modScore, modDesc, iconColor, iconHtml) => {
            const bodyEl = document.getElementById('moduleDetailBody');
            const levelBadgeColor = modLevel === 'Dasar' ? 'badge-dasar' : modLevel === 'Pemula' ? 'badge-pemula' : modLevel === 'Menengah' ? 'badge-menengah' : 'badge-mahir';
            
            // Format rating as stars (0-5)
            const ratingNum = parseInt(modRating) || 0;
            const stars = '⭐'.repeat(Math.min(ratingNum, 5));
            const ratingDisplay = ratingNum > 0 ? `${stars} ${ratingNum}` : 'Belum ada rating';
            
            // Format score
            const scoreDisplay = modScore > 0 ? Math.round(modScore) : '-';

            bodyEl.innerHTML = `
                <div class="module-detail-header">
                    <div class="module-detail-icon" style="background-color: ${iconColor}">
                        ${iconHtml}
                    </div>
                    <div class="module-detail-title">
                        <h2>${modTitle}</h2>
                        <span class="module-detail-badge ${levelBadgeColor}">${modLevel || 'Dasar'}</span>
                    </div>
                </div>
                <div class="module-meta-grid">
                    <div class="meta-item">
                        <span class="meta-label">Jam Belajar</span>
                        <span class="meta-value">${modHours ? modHours + ' Jam' : '-'}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Rating</span>
                        <span class="meta-value">${ratingDisplay}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Status</span>
                        <span class="meta-value" style="color:${modStatus === 'Completed' ? '#2e7d32' : '#0288d1'}">${modStatus}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Nilai Akhir</span>
                        <span class="meta-value">${scoreDisplay}</span>
                    </div>
                </div>
                <div class="module-description">
                    <p>${modDesc || 'Tidak ada deskripsi'}</p>
                </div>
                <button class="module-action-btn">${modStatus === 'Completed' ? 'Lihat Sertifikat' : 'Lanjutkan Belajar'}</button>
            `;
            moduleModal.classList.add('show');
        };

        // OPEN STUDY TIME DETAIL (New Chart)
        window.openStudyTimeDetail = () => {
            studyTimeModal.classList.add('show');
            
            // Mock Data for Last 7 Days
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const hours = [2.5, 4, 1.5, 5, 3, 6, 2]; // Mock hours

            const ctx = document.getElementById('studyTimeChart');
            // Destroy old chart if exists to avoid overlay
            if (window.myStudyChart) window.myStudyChart.destroy();

            window.myStudyChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: days,
                    datasets: [{
                        label: 'Study Hours',
                        data: hours,
                        backgroundColor: '#1976d2',
                        borderRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, title: { display: true, text: 'Hours' } },
                        x: { grid: { display: false } }
                    }
                }
            });
        };

        // Listeners for Buttons
        if(openCheckinBtn) openCheckinBtn.addEventListener('click', () => window.handleCheckinClick(new Date().toISOString().split('T')[0]));
        if(closeCheckinBtn) closeCheckinBtn.addEventListener('click', () => checkinModal.classList.remove('show'));
        if(closeModuleBtn) closeModuleBtn.addEventListener('click', () => moduleModal.classList.remove('show'));
        if(closeStudyModalBtn) closeStudyModalBtn.addEventListener('click', () => studyTimeModal.classList.remove('show'));
        if(openScheduleBtn) openScheduleBtn.addEventListener('click', (e) => { e.preventDefault(); scheduleModal.classList.add('show'); });
        if(closeScheduleBtn) closeScheduleBtn.addEventListener('click', () => scheduleModal.classList.remove('show'));

        if(submitCheckinBtn) {
            submitCheckinBtn.addEventListener('click', () => {
                const notes = document.getElementById('checkinNotes').value;
                if (!notes.trim()) {
                    createCustomModal("Eits!", "Tulis dulu dong apa yang kamu pelajari hari ini.", `<button class="btn-submit-checkin" onclick="this.closest('.modal-overlay').remove()">OK</button>`);
                    return;
                }
                const dateKey = document.getElementById('activeCheckinDate').value;
                const storedCheckins = localStorage.getItem('dailyCheckins');
                const checkinData = storedCheckins ? JSON.parse(storedCheckins) : {};
                checkinData[dateKey] = { note: notes, timestamp: new Date().toISOString() };
                localStorage.setItem('dailyCheckins', JSON.stringify(checkinData));
                
                checkinModal.classList.remove('show');
                const pill = document.querySelector(`.day-pill-vertical[data-date="${dateKey}"]`);
                if(pill) {
                    pill.classList.add('done');
                    pill.classList.remove('active-today');
                    if(!pill.querySelector('.dot-indicator')) {
                        pill.innerHTML += '<div class="dot-indicator"></div>';
                    }
                }

                const funnyMessages = ["Mantap! 🍕", "Keren! 👴", "Gas pol! 🚀", "Produktif! 😉"];
                const randomMsg = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
                createCustomModal("✅ Check-in Berhasil!", randomMsg, `<button class="btn-submit-checkin" onclick="this.closest('.modal-overlay').remove();">Siap!</button>`);
            });
        }

        if(logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                createCustomModal("Konfirmasi Logout", "Yakin ingin keluar?", `
                    <button class="btn-submit-checkin" style="background-color: #ef5350;" onclick="localStorage.removeItem('userInfo'); window.location.hash='/'; this.closest('.modal-overlay').remove();">Ya, Logout</button>
                    <button class="btn-submit-checkin" style="background-color: #94a3b8; margin-left: 10px;" onclick="this.closest('.modal-overlay').remove()">Batal</button>
                `);
            });
        }

        // --- FETCH DATA & RENDER MODULES + SEARCH LOGIC ---
        setTimeout(async () => {
                try {
                const userStr = localStorage.getItem('userInfo');
                const user = userStr ? JSON.parse(userStr) : { email: 'ari.gunawan93@example.com' }; 
                let allCourses = await fetchStudentData(user.email); // Store all courses (mapped)
                // also fetch raw student records for aggregations
                const studentRecords = await getStudentRecords(user.email);

                // --- Function to Render Modules (Reusable for Search) ---
                const renderModules = (courses) => {
                    const moduleContainer = document.getElementById('module-list-container');
                    let moduleHtml = '';
                    
                    if(courses.length === 0) {
                        moduleContainer.innerHTML = '<p style="text-align:center; padding:20px; color:#94a3b8;">No courses found.</p>';
                        return;
                    }

                    // Sort: In Progress first
                    const modulesToShow = courses.sort((a, b) => (a.isCompleted === b.isCompleted) ? 0 : (a.isCompleted ? 1 : -1));

                    const getModuleIcon = (title) => {
                        const t = title.toLowerCase();
                        if (t.includes('web') || t.includes('front-end') || t.includes('javascript')) return '<i class="fa-solid fa-code"></i>';
                        if (t.includes('android') || t.includes('kotlin')) return '<i class="fa-brands fa-android"></i>';
                        if (t.includes('back-end') || t.includes('cloud') || t.includes('aws') || t.includes('google')) return '<i class="fa-solid fa-server"></i>';
                        if (t.includes('ai') || t.includes('python')) return '<i class="fa-solid fa-brain"></i>';
                        if (t.includes('react')) return '<i class="fa-brands fa-react"></i>';
                        return '<i class="fa-solid fa-book"></i>';
                    };
                    
                    modulesToShow.forEach(mod => {
                        const pct = Math.round((mod.completed_tutorials / mod.active_tutorials) * 100) || 0;
                        const progressPct = Math.min(100, pct);
                        const safeTitle = mod.title.replace(/'/g, "\\'");
                        const statusStr = mod.isCompleted ? 'Completed' : 'In Progress';
                        const barColor = progressPct === 100 ? '#2e7d32' : '#2196f3';
                        const iconBgColor = progressPct === 100 ? '#2e7d32' : '#1976d2';
                        const moduleIcon = getModuleIcon(mod.title);
                        const safeDesc = (mod.description || "").replace(/'/g, "\\'");
                        const safeIconHtml = moduleIcon.replace(/"/g, "&quot;");

                        moduleHtml += `
                        <div class="module-row" onclick="window.openModuleDetail('${safeTitle}', '${mod.level}', ${mod.hours}, ${mod.rating}, '${statusStr}', '${mod.startDate}', '${mod.endDate}', ${mod.score}, '${safeDesc}', '${iconBgColor}', '${safeIconHtml}')">
                            <div class="mod-icon-wrapper" style="background-color: ${iconBgColor}">
                                ${moduleIcon}
                            </div>
                            <div class="mod-details" style="flex-grow:1;">
                                <div class="mod-top" style="display:flex; justify-content:space-between; margin-bottom:5px;">
                                    <h4>${mod.title}</h4>
                                    <span class="pct-text">${progressPct}%</span>
                                </div>
                                <span class="mod-sub">Dicoding Academy</span>
                                <div class="mod-progress-container">
                                    <div class="mod-progress-bar" style="width: ${progressPct}%; background-color: ${barColor}"></div>
                                </div>
                            </div>
                        </div>`;
                    });
                    moduleContainer.innerHTML = moduleHtml;
                };

                // Initial Render
                renderModules(allCourses);

                // --- SEARCH FILTER LOGIC ---
                if (searchInput) {
                    searchInput.addEventListener('input', (e) => {
                        const keyword = e.target.value.toLowerCase();
                        const filteredCourses = allCourses.filter(c => c.title.toLowerCase().includes(keyword));
                        renderModules(filteredCourses);
                    });
                }

                // --- STATS & CHARTS CALCULATIONS (UPDATED WITH CSV LOGIC) ---
                // Total study time: compute from earliest started_learning_at across student records to now (hours)
                let totalStudyHours = 0;
                if (studentRecords && studentRecords.length > 0) {
                    const validDates = studentRecords
                        .map(r => r.started_learning_at || r.started_learning_at)
                        .filter(Boolean)
                        .map(s => {
                            const d = new Date(s);
                            // try fallback parsing for common formats
                            if (isNaN(d.getTime())) {
                                // try replacing d/m/y to m/d/y if needed
                                try {
                                    const alt = new Date(s.replace(/(\d+)\/(\d+)\/(\d+)/, function(m, a,b,c){ return a+'/'+b+'/'+c;}));
                                    return alt;
                                } catch (_) { return null; }
                            }
                            return d;
                        })
                        .filter(d => d && !isNaN(d.getTime()));

                    if (validDates.length > 0) {
                        const earliest = validDates.reduce((min, cur) => cur < min ? cur : min, validDates[0]);
                        const now = new Date();
                        const diffMs = now - earliest;
                        totalStudyHours = Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));
                    }
                }
                document.getElementById('total-study-time').innerText = `${Math.round(totalStudyHours)} hrs`;

                // Avg grade: get exam_score directly from first valid student record
                let avgScore = 0;
                if (studentRecords && studentRecords.length > 0) {
                    // Find first record with valid exam_score
                    for (let rec of studentRecords) {
                        const score = parseFloat(rec.exam_score);
                        if (!isNaN(score) && score > 0) {
                            avgScore = Math.round(score);
                            console.log(`✓ Exam Score from record:`, rec.exam_score, 'Parsed:', avgScore);
                            break;
                        }
                    }
                    if (avgScore === 0) {
                        console.warn('⚠ No valid exam_score found in any student record');
                    }
                } else {
                    console.warn('⚠ No student records found');
                }
                
                // Update Grade UI with retry logic
                const updateGradeUI = () => {
                    const avgGradeText = document.getElementById('avg-grade-text');
                    const avgRing = document.getElementById('avg-grade-ring');
                    const verdictEl = document.getElementById('grade-verdict');
                    
                    let updated = false;
                    
                    if (avgGradeText) {
                        avgGradeText.textContent = avgScore || '-';
                        console.log('✓ Updated avg-grade-text to:', avgScore);
                        updated = true;
                    }
                    if (avgRing) {
                        const dashValue = Math.max(0, avgScore);
                        avgRing.setAttribute('stroke-dasharray', `${dashValue}, 100`);
                        console.log('✓ Updated avg-grade-ring stroke-dasharray to:', dashValue);
                        updated = true;
                    }
                    if (verdictEl) {
                        if (avgScore === 0) {
                            verdictEl.textContent = "No Grade Yet";
                            verdictEl.style.color = "#94a3b8";
                        } else if (avgScore >= 90) {
                            verdictEl.textContent = "Excellent!";
                            verdictEl.style.color = "#2196f3";
                        } else if (avgScore >= 80) {
                            verdictEl.textContent = "Very Good!";
                            verdictEl.style.color = "#2196f3";
                        } else {
                            verdictEl.textContent = "Good";
                            verdictEl.style.color = "#f57c00";
                        }
                        console.log('✓ Updated grade-verdict to:', verdictEl.textContent);
                        updated = true;
                    }
                    
                    return updated;
                };
                
                // Try update immediately, then retry after 100ms if not found
                if (!updateGradeUI()) {
                    setTimeout(updateGradeUI, 100);
                }

                // --- MILESTONE LOGIC (UPDATED TO ANDROID PATH) ---
                const milestoneContainer = document.getElementById('milestone-container');
                // Path Manual based on common Android Developer Roadmap in Dicoding
                const androidPath = [
                    { title: "Memulai Pemrograman dengan Kotlin", level: "Dasar" },
                    { title: "Belajar Membuat Aplikasi Android untuk Pemula", level: "Pemula" },
                    { title: "Belajar Fundamental Aplikasi Android", level: "Menengah" },
                    { title: "Belajar Pengembangan Aplikasi Android Intermediate", level: "Mahir" },
                    { title: "Menjadi Android Developer Expert", level: "Profesional" }
                ];
                
                let milestoneHtml = '';
                androidPath.forEach(path => {
                    const course = allCourses.find(c => c.title === path.title);
                    let status = 'future';
                    if (course) {
                        if (course.isCompleted) status = 'done';
                        else if (course.completed_tutorials > 0) status = 'current';
                    }
                    const dotClass = status === 'done' ? 'tl-dot' : (status === 'current' ? 'tl-dot-ring' : 'tl-dot-hollow');
                    
                    milestoneHtml += `
                        <div class="tl-item">
                            <div class="${dotClass}"></div>
                            <div class="tl-content">
                                <h4 class="${status === 'current' ? 'text-blue' : ''}" style="color: ${status === 'done' ? '#2e7d32' : ''}">${path.title}</h4>
                                <p>${path.level}</p>
                            </div>
                        </div>`;
                });
                milestoneContainer.innerHTML = milestoneHtml;

                // --- RADAR CHART (Skills based on Modules) ---
                const ctxRadar = document.getElementById('radarChart');
                if (ctxRadar && window.Chart) {
                    new Chart(ctxRadar, {
                        type: 'radar',
                        data: {
                            labels: ['Android', 'Web Basics', 'Back-End', 'DevOps', 'Soft Skills', 'Kotlin'],
                            datasets: [{
                                label: 'You',
                                // Scores estimated from completion: High Android, Good Web/BE, Moderate DevOps
                                data: [95, 90, 85, 70, 80, 85], 
                                backgroundColor: 'rgba(33, 150, 243, 0.2)',
                                borderColor: '#2196f3',
                                borderWidth: 2,
                                pointBackgroundColor: '#2196f3',
                                pointRadius: 3
                            }, {
                                label: 'Class Avg',
                                data: [75, 70, 65, 60, 55, 60],
                                backgroundColor: 'rgba(203, 213, 225, 0.3)', 
                                borderColor: '#cbd5e1', 
                                borderWidth: 1,
                                pointRadius: 0
                            }]
                        },
                        options: {
                            plugins: { legend: { display: false } },
                            scales: { 
                                r: { 
                                    ticks: { display: false, max: 100 }, 
                                    grid: { color: '#f1f5f9' }, 
                                    pointLabels: { font: { size: 10, family: 'Poppins' }, color: '#64748b' },
                                    angleLines: { color: '#f1f5f9' }
                                } 
                            },
                            maintainAspectRatio: false
                        }
                    });
                }
            } catch (e) {
                console.error("Error loading dashboard data", e);
            }
        }, 100);
    }
};

export default DashboardPage;