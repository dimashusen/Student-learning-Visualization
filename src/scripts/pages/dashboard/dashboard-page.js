// --- MOCK DATA & HELPERS (Simulasi Backend/API) ---

const getStudentData = async (email) => {
    // Mock Data: Progress Ari Gunawan
    return [
        { title: "Belajar Dasar Pemrograman Web", isCompleted: "1", active_tutorials: "131", completed_tutorials: "131", score: "100", level: "Dasar", hours: 46, rating: 4.8, startDate: "2025-01-10", endDate: "2025-02-15", description: "Pelajari dasar pembuatan website dengan HTML, CSS, dan teknik layouting modern." },
        { title: "Belajar Fundamental Aplikasi Android", isCompleted: "1", active_tutorials: "107", completed_tutorials: "214", score: "100", level: "Menengah", hours: 140, rating: 4.9, startDate: "2025-03-01", endDate: "2025-04-20", description: "Kuasai fundamental pembuatan aplikasi Android dengan Android Studio dan Kotlin." }, 
        { title: "Belajar Membuat Aplikasi Back-End untuk Pemula dengan Google Cloud", isCompleted: "1", active_tutorials: "108", completed_tutorials: "110", score: "90", level: "Pemula", hours: 45, rating: 4.7, startDate: "2025-05-05", endDate: "2025-05-30", description: "Belajar membuat RESTful API sederhana dan deploy ke Google Cloud Platform." },
        
        // Courses with completion but no score (score 0 in CSV) or in progress
        { title: "Belajar Pengembangan Aplikasi Android Intermediate", isCompleted: "1", active_tutorials: "115", completed_tutorials: "115", score: "0", level: "Mahir", hours: 150, rating: 4.8, startDate: "2025-06-01", endDate: "2025-08-10", description: "Tingkatkan skill Android Developer kamu dengan materi advanced seperti Testing dan Performance." }, 
        { title: "Belajar Fundamental Deep Learning", isCompleted: "0", active_tutorials: "131", completed_tutorials: "67", score: "0", level: "Menengah", hours: 110, rating: 4.9, startDate: "2025-09-01", endDate: "-", description: "Pelajari konsep Deep Learning dan Neural Network menggunakan TensorFlow." }, 
        
        // Placeholder courses for React Milestone (keeping the structure for the radar chart logic)
        { title: "Belajar Dasar Pemrograman JavaScript", isCompleted: "1", active_tutorials: "12", completed_tutorials: "12", score: "88", level: "Dasar", hours: 46, rating: 4.8, startDate: "2024-12-01", endDate: "2024-12-25", description: "Fondasi utama untuk menjadi Web Developer handal dengan menguasai JavaScript." }, 
        { title: "Belajar Membuat Aplikasi Front-End Pemula", isCompleted: "0", active_tutorials: "10", completed_tutorials: "7", score: "78", level: "Pemula", hours: 45, rating: 4.7, startDate: "2025-10-01", endDate: "-", description: "Langkah awal membuat aplikasi web interaktif dengan manipulasi DOM dan Web Storage." },
        { title: "Belajar Fundamental Aplikasi React", isCompleted: "0", active_tutorials: "10", completed_tutorials: "1", score: "0", level: "Menengah", hours: 100, rating: 4.9, startDate: "-", endDate: "-", description: "Bangun aplikasi web modern yang cepat dan modular menggunakan library React." },
        { title: "Menjadi React Web Developer Expert", isCompleted: "0", active_tutorials: "15", completed_tutorials: "0", score: "0", level: "Mahir", hours: 110, rating: 4.9, startDate: "-", endDate: "-", description: "Kuasai teknik advanced React seperti Automation Testing, CI/CD, dan State Management." }, 
    ].map(course => ({
        ...course,
        // Ensure isCompleted is a boolean for consistent logic
        isCompleted: course.isCompleted === "1",
        // Parse numbers needed for calculation
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

// Helper untuk membuat Modal Kustom (pengganti alert/confirm)
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

        // 2. Date Logic
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dayOfWeek = today.getDay(); 
        const dayAdjusted = dayOfWeek === 0 ? 7 : dayOfWeek;
        const monday = new Date(today);
        monday.setDate(today.getDate() - (dayAdjusted - 1));
        
        // Format Date for Display
        const todayLocalized = new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'});
        const endOfWeek = new Date(monday.getTime() + 4 * 24 * 60 * 60 * 1000);
        const weekRange = `${monday.getDate()} - ${endOfWeek.getDate()} ${new Date().toLocaleString('default', { month: 'long' })}`;

        // 3. Check-in Logic (Pills Generation)
        const storedCheckins = localStorage.getItem('dailyCheckins');
        const checkinData = storedCheckins ? JSON.parse(storedCheckins) : {};
        
        // Mock checkin data example
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
            } else if (currentLoopDate.getTime() < today.getTime()) {
                statusClass = 'missed'; 
            } else if (currentLoopDate.getTime() === today.getTime()) {
                statusClass = 'active-today'; 
                isClickable = true;
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

        // 4. Mock Schedule Data for Modal & Card
        const mockSchedule = [
            { time: "08.00 - 10.00", title: "ILT-FB1- Front-End Web Dasar", type: "Live Session" },
            { time: "10.30 - 12.00", title: "Mentoring Session Group A", type: "Mentoring" },
            { time: "13.00 - 15.00", title: "Module: React Hooks Deep Dive", type: "Self Study" },
            { time: "16.00 - 17.00", title: "Quiz: Fundamental JavaScript", type: "Assessment" },
            { time: "19.00 - 21.00", title: "Project: Building Interactive Apps", type: "Project Work" },
        ];
        
        // HTML untuk Modal (Full List)
        const scheduleListHTML = mockSchedule.map(item => `
            <div class="schedule-list-item">
                <span class="schedule-time">${item.time}</span>
                <div class="schedule-details">
                    <h4>${item.title}</h4>
                    <p>${item.type}</p>
                </div>
            </div>
        `).join('');

        // HTML untuk Card (Menampilkan sebagian)
        const scheduleCardHTML = mockSchedule.map(item => `
            <div class="sched-row-item">
                <div>
                    <h4 style="font-size:12px; margin:0 0 4px 0;">${item.title}</h4>
                    <span class="sched-time" style="font-size:11px; color:#666;">${item.time}</span>
                </div>
                <div class="sched-actions">
                    <button class="btn-outline-white" style="font-size:10px; padding:2px 8px;">View</button>
                </div>
            </div>
        `).join('');

        return `
            <style>
                /* Global Styles & Layout */
                body { margin: 0; padding: 0; font-family: 'Poppins', sans-serif; background: #f4f6f9; color: #333; }
                a { text-decoration: none; color: inherit; }
                h1, h2, h3, h4 { margin: 0; font-weight: 700; }
                .dashboard-body { display: flex; min-height: 100vh; }
                
                /* Sidebar */
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

                /* Main Content */
                .main-content { flex-grow: 1; padding: 30px; }
                .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
                .header-left h1 { font-size: 24px; color: #1976d2; font-weight: 800; }
                .header-left p { font-size: 14px; color: #666; margin-top: 5px; }
                .header-right { display: flex; align-items: center; gap: 20px; }
                .search-wrapper { position: relative; }
                .search-wrapper input { padding: 8px 12px 8px 35px; border: 1px solid #ddd; border-radius: 20px; width: 200px; font-size: 14px; }
                .search-wrapper i { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #999; font-size: 14px; }
                .notif-btn { width: 40px; height: 40px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); cursor: pointer; color: #666; }
                
                /* Grid System */
                .dashboard-grid { display: grid; grid-template-columns: 3fr 1fr; gap: 20px; }
                @media (max-width: 1024px) {
                    .dashboard-grid { grid-template-columns: 1fr; }
                    .right-column { min-width: auto; }
                    .middle-row-grid { grid-template-columns: 1fr; }
                }
                .middle-row-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

                /* Cards */
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

                /* Schedule Card - SCROLLABLE */
                .schedule-box-blue { 
                    background-color: #f0f4f8; 
                    border-radius: 10px; 
                    padding: 15px; 
                    color: #2d3e50;
                    max-height: 180px; 
                    overflow-y: auto;
                }
                .schedule-box-blue::-webkit-scrollbar { width: 5px; }
                .schedule-box-blue::-webkit-scrollbar-track { background: transparent; }
                .schedule-box-blue::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
                
                .sched-row-item {
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center; 
                    margin-bottom: 12px; 
                    padding-bottom: 8px; 
                    border-bottom: 1px solid #e0e7ed;
                }
                .sched-row-item:last-child { border-bottom: none; margin-bottom: 0; }
                
                .sched-deadline-row { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 10px; border-top: 2px dashed #e0e7ed; }
                .deadline-text { font-size: 12px; color: #555; }
                .btn-pilled-white { background: #ff7043; color: white; border: none; padding: 5px 12px; border-radius: 15px; font-size: 11px; cursor: pointer; }

                /* Checkin Pills */
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

                /* Stats & Grade Card */
                .stats-dark-card { background-color: #005060; color: white; position: relative; overflow: hidden; height: 160px; }
                .stats-top { display: flex; justify-content: space-between; align-items: center; font-size: 12px; opacity: 0.8; }
                .stats-big-num { font-size: 48px; font-weight: 700; margin-top: 10px; z-index: 10; position: relative; }
                .wave-wrapper { position: absolute; bottom: 0; left: 0; width: 100%; height: 100px; opacity: 0.1; }
                .grade-card { display: flex; align-items: center; justify-content: center; text-align: center; flex-direction: column; height: 200px; }
                .grade-circle-wrapper { width: 100px; height: 100px; margin-bottom: 10px; }
                .circular-chart { display: block; max-width: 100%; }
                .circle-bg { fill: none; stroke: #eee; stroke-width: 3; }
                .circle { fill: none; stroke: #2196f3; stroke-width: 3; stroke-linecap: round; transform: rotate(-90deg); transform-origin: center; }
                .percentage { fill: #333; font-family: 'Poppins', sans-serif; font-size: 0.6em; text-anchor: middle; dominant-baseline: central; font-weight: 800; }
                .label-gray { font-size: 12px; color: #999; }

                /* Milestone Timeline */
                .timeline-container { border-left: 2px solid #e0e0e0; padding-left: 15px; margin-left: 20px; }
                .tl-item { position: relative; padding-bottom: 20px; }
                .tl-dot, .tl-dot-ring, .tl-dot-hollow { position: absolute; left: -18px; top: 0px; width: 12px; height: 12px; border-radius: 50%; }
                .tl-dot { background-color: #2e7d32; }
                .tl-dot-ring { border: 2px solid #2196f3; background: white; }
                .tl-dot-hollow { border: 2px solid #bdbdbd; background: white; }
                .tl-item.current .tl-content h4 { color: #1976d2; font-weight: 700; }
                .tl-content h4 { font-size: 14px; margin: 0; }
                .tl-content p { font-size: 11px; color: #888; margin-top: 2px; }

                /* Module List Styles */
                #module-list-container { max-height: 280px; overflow-y: auto; padding-right: 5px; }
                #module-list-container::-webkit-scrollbar { width: 6px; }
                #module-list-container::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
                #module-list-container::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
                .module-row { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee; cursor: pointer; transition: background-color 0.2s; }
                .module-row:hover { background-color: #f9f9f9; }
                
                /* MODULE ICON STYLE */
                .mod-icon-wrapper { 
                    width: 46px; 
                    height: 46px; 
                    border-radius: 12px; 
                    margin-right: 16px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    font-size: 22px; 
                    color: white; 
                    flex-shrink: 0;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1); 
                }
                
                /* Module Details */
                .mod-details { flex-grow: 1; margin-right: 15px; }
                .mod-top { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 6px; }
                .mod-details h4 { font-size: 13px; font-weight: 600; color: #333; margin: 0; }
                .mod-sub { font-size: 11px; color: #888; margin-bottom: 8px; display: block; }
                
                /* Horizontal Progress Bar Styles */
                .mod-progress-container { width: 100%; background-color: #f0f0f0; height: 6px; border-radius: 3px; overflow: hidden; }
                .mod-progress-bar { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
                .mod-progress-bar.blue { background-color: #2196f3; }
                .mod-progress-bar.green { background-color: #2e7d32; }
                
                /* Module Right Side */
                .mod-right { text-align: right; min-width: 40px; }
                .pct-text { font-size: 12px; font-weight: 700; color: #333; display: block; }
                .status-text { font-size: 10px; color: #888; }
                
                /* Shared Modals */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 9999; display: flex; justify-content: center; align-items: center; opacity: 0; visibility: hidden; transition: all 0.3s ease; }
                .modal-overlay.show { opacity: 1; visibility: visible; }
                .modal-content { background: white; width: 450px; max-width: 90%; border-radius: 12px; padding: 24px; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.2); font-family: 'Poppins', sans-serif; }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .modal-header h3 { margin: 0; font-size: 18px; color: #333; font-weight: 700; }
                .close-modal { cursor: pointer; font-size: 24px; color: #999; }
                .schedule-list-item { display: flex; align-items: center; margin-bottom: 15px; padding: 10px; border-radius: 8px; background: #f8f9fa; border-left: 4px solid #1976d2; }
                .schedule-time { font-size: 12px; font-weight: 600; color: #1976d2; flex-shrink: 0; width: 80px; }
                .schedule-details { flex-grow: 1; padding-left: 10px; border-left: 1px solid #e0e0e0; margin-left: 10px; }
                .schedule-details h4 { font-size: 14px; margin-bottom: 2px; color: #2d3e50; }
                .schedule-details p { font-size: 11px; color: #888; margin: 0; }
                .schedule-list-container { max-height: 400px; overflow-y: auto; padding-right: 10px; }
                
                /* Check-in Form Styles */
                .emoji-container { display: flex; gap: 15px; margin-bottom: 20px; justify-content: space-between; }
                .emoji-btn { flex: 1; border: 1px solid #e0e0e0; border-radius: 10px; padding: 10px; cursor: pointer; text-align: center; transition: all 0.2s; background: white; }
                .emoji-btn.selected { border-color: #2d3e50; background-color: #f0f4f8; border-width: 2px; }
                .emoji-icon { font-size: 28px; display: block; margin-bottom: 5px; }
                .emoji-label { font-size: 12px; color: #666; font-weight: 500; }
                .input-group label { display: block; font-size: 12px; color: #333; margin-bottom: 8px; font-weight: 600; }
                .checkin-textarea { width: 100%; height: 120px; padding: 12px; border: 1px solid #ccc; border-radius: 8px; resize: none; font-family: inherit; font-size: 14px; }
                .btn-submit-checkin { background-color: #0e677d; color: white; border: none; padding: 10px 24px; border-radius: 20px; font-weight: 600; cursor: pointer; font-size: 14px; }
                
                /* -- NEW: MODULE DETAIL MODAL STYLES (Image like) -- */
                .module-detail-content { text-align: left; }
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
            </style>

            <div class="dashboard-body">
                <aside class="sidebar">
                    <div class="sidebar-header">
                        <div class="brand-logo"><i class="fa-solid fa-code"></i> dicoding</div>
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
                            <div class="notif-btn"><i class="fa-regular fa-bell"></i></div>
                        </div>
                    </header>

                    <div class="dashboard-grid">
                        <div class="left-column">
                            <div class="card hero-card">
                                <div class="hero-text-content">
                                    <span class="tag-blue">Recommended Next Step</span>
                                    <h2>Mastering React Hooks & Custom Logic</h2>
                                    <p>Berdasarkan hasil kuis Modul 3, Anda siap untuk materi lanjutan.</p>
                                    <button class="btn-primary"><i class="fa-solid fa-play"></i> Lanjut Belajar</button>
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
                                        <button id="btn-open-modal" class="btn-add-checkin"><i class="fa-solid fa-plus" style="font-size: 12px;"></i></button>
                                    </div>
                                    <p class="sub-date">Minggu Ini (${weekRange})</p>
                                    <div class="checkin-pills-container">${checkinPillsHTML}</div>
                                </div>
                                <div class="card">
                                    <div class="card-header-row">
                                        <h3>My Schedule</h3>
                                        <a href="#" class="link-view-all" id="viewAllSchedule">View all</a>
                                    </div>
                                    <p class="sub-date">Today, ${todayLocalized}</p>
                                    <!-- Added SCROLLABLE container logic via CSS -->
                                    <div class="schedule-box-blue">
                                        ${scheduleCardHTML} <!-- Using dynamic list inside card now -->
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
                                <div class="stats-big-num" id="total-study-time">...</div>
                                <div class="wave-wrapper">
                                    <svg viewBox="0 0 1440 320" style="width:100%; height:100px; opacity:0.3; position:absolute; bottom:-20px; left:0;"><path fill="#ffffff" fill-opacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
                                </div>
                            </div>

                            <div class="card grade-card">
                                <div class="grade-circle-wrapper">
                                    <svg viewBox="0 0 36 36" class="circular-chart">
                                        <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        <path class="circle" id="avg-grade-ring" stroke-dasharray="0, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        <text x="18" y="20.35" class="percentage" id="avg-grade-text">...</text>
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

                    <!-- Modals -->
                    <div class="modal-overlay" id="checkinModal">
                        <div class="modal-content">
                            <div class="modal-header"><h3>Daily Check-in</h3><span class="close-modal" id="closeModal">&times;</span></div>
                            <div class="modal-body">
                                <input type="hidden" id="activeCheckinDate" value="">
                                <div class="emoji-container">
                                    <div class="emoji-btn" data-value="bad"><span class="emoji-icon">🤯</span><span class="emoji-label">Bad</span></div>
                                    <div class="emoji-btn selected" data-value="neutral"><span class="emoji-icon">🙂</span><span class="emoji-label">Netral</span></div>
                                    <div class="emoji-btn" data-value="great"><span class="emoji-icon">🤩</span><span class="emoji-label">Great</span></div>
                                </div>
                                <div class="input-group"><label>Apa yang kamu pelajari?</label><textarea class="checkin-textarea" id="checkinNotes"></textarea></div>
                            </div>
                            <div class="modal-footer"><button class="btn-submit-checkin" id="submitCheckin">Submit</button></div>
                        </div>
                    </div>
                    
                    <!-- MODULE DETAIL MODAL (Updated Layout) -->
                    <div class="modal-overlay" id="moduleDetailModal">
                        <div class="modal-content">
                            <div class="modal-header" style="border-bottom: none; padding-bottom: 0;">
                                <span class="close-modal" id="closeModuleModal" style="position: absolute; right: 20px; top: 20px;">&times;</span>
                            </div>
                            <div class="modal-body module-detail-content" id="moduleDetailBody">
                                <!-- Content injected by JS -->
                            </div>
                        </div>
                    </div>

                    <div class="modal-overlay" id="scheduleModal">
                        <div class="modal-content schedule-content" style="width: 550px;">
                            <div class="modal-header"><h3>Full Weekly Schedule</h3><span class="close-modal" id="closeScheduleModal">&times;</span></div>
                            <div class="modal-body schedule-list-container">${scheduleListHTML}</div>
                            <div class="modal-footer"><button class="btn-submit-checkin" onclick="document.getElementById('scheduleModal').classList.remove('show')">Close</button></div>
                        </div>
                    </div>
                </main>
            </div>
        `;
    },

    async afterRender() {
        // 1. Setup Event Listeners for Static Elements (Check-in, Schedule, Logout)
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

        const logoutBtn = document.getElementById('logoutDashBtn');

        // Attach Global function for Check-in pill click (generated in render)
        window.handleCheckinClick = (dateStr) => {
            document.getElementById('activeCheckinDate').value = dateStr;
            document.getElementById('checkinNotes').value = "";
            emojiBtns.forEach(b => b.classList.remove('selected'));
            const neutralBtn = document.querySelector('.emoji-btn[data-value="neutral"]');
            if(neutralBtn) neutralBtn.classList.add('selected');
            checkinModal.classList.add('show');
        };

        // Attach Global function for Module click (Dynamic content injection)
        window.openModuleDetail = (modTitle, modLevel, modHours, modRating, modStatus, modStartDate, modEndDate, modScore, modDesc, iconColor, iconHtml) => {
            const bodyEl = document.getElementById('moduleDetailBody');
            
            const levelBadgeColor = modLevel === 'Dasar' ? 'badge-dasar' : 
                                    modLevel === 'Pemula' ? 'badge-pemula' : 
                                    modLevel === 'Menengah' ? 'badge-menengah' : 'badge-mahir';

            bodyEl.innerHTML = `
                <div class="module-detail-header">
                    <div class="module-detail-icon" style="background-color: ${iconColor}">
                        ${iconHtml}
                    </div>
                    <div class="module-detail-title">
                        <h2>${modTitle}</h2>
                        <span class="module-detail-badge ${levelBadgeColor}">${modLevel}</span>
                    </div>
                </div>
                
                <div class="module-meta-grid">
                    <div class="meta-item">
                        <span class="meta-label">Jam Belajar</span>
                        <span class="meta-value">${modHours} Jam</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Rating</span>
                        <span class="meta-value">⭐ ${modRating} / 5.0</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Status</span>
                        <span class="meta-value" style="color:${modStatus === 'Completed' ? '#2e7d32' : '#1976d2'}">${modStatus}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Nilai Akhir</span>
                        <span class="meta-value">${modScore > 0 ? modScore : '-'}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Mulai Belajar</span>
                        <span class="meta-value">${modStartDate}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Selesai Belajar</span>
                        <span class="meta-value">${modEndDate}</span>
                    </div>
                </div>
                
                <div class="module-description">
                    <p>${modDesc}</p>
                </div>
                
                <button class="module-action-btn">${modStatus === 'Completed' ? 'Lihat Sertifikat' : 'Lanjutkan Belajar'}</button>
            `;
            
            moduleModal.classList.add('show');
        };

        // Basic Listeners
        if(openCheckinBtn) openCheckinBtn.addEventListener('click', () => window.handleCheckinClick(new Date().toISOString().split('T')[0]));
        if(closeCheckinBtn) closeCheckinBtn.addEventListener('click', () => checkinModal.classList.remove('show'));
        if(closeModuleBtn) closeModuleBtn.addEventListener('click', () => moduleModal.classList.remove('show'));
        if(openScheduleBtn) openScheduleBtn.addEventListener('click', (e) => { e.preventDefault(); scheduleModal.classList.add('show'); });
        if(closeScheduleBtn) closeScheduleBtn.addEventListener('click', () => scheduleModal.classList.remove('show'));

        // Submit Check-in with Random Funny Notification
        if(submitCheckinBtn) {
            submitCheckinBtn.addEventListener('click', () => {
                const notes = document.getElementById('checkinNotes').value;
                if (!notes.trim()) {
                    const footer = `<button class="btn-submit-checkin" onclick="this.closest('.modal-overlay').remove()">OK</button>`;
                    createCustomModal("Perhatian", "Tulis dulu apa yang kamu pelajari hari ini!", footer);
                    return;
                }
                // Save logic (mock)
                const dateKey = document.getElementById('activeCheckinDate').value;
                const storedCheckins = localStorage.getItem('dailyCheckins');
                const checkinData = storedCheckins ? JSON.parse(storedCheckins) : {};
                checkinData[dateKey] = { note: notes, timestamp: new Date().toISOString() };
                localStorage.setItem('dailyCheckins', JSON.stringify(checkinData));
                
                checkinModal.classList.remove('show');

                // Array of funny/motivational messages
                const funnyMessages = [
                    "Mantap! Jangan lupa istirahat, jangan coding terus sampai lupa makan! 🍕",
                    "Keren! Satu langkah lebih dekat jadi sepuh. 👴",
                    "Gas pol rem blong! 🚀 Tapi kalau error, istirahat dulu ya.",
                    "Wah, produktif sekali hari ini! Besok lagi ya? 😉",
                    "Otak makin encer nih, nice progress! Awas tumpah 🤯",
                    "Sipp! Jangan lupa push ke GitHub biar ga ilang codingannya! 🐙"
                ];
                const randomMsg = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
                
                const footer = `<button class="btn-submit-checkin" onclick="this.closest('.modal-overlay').remove(); location.reload();">OK</button>`;
                createCustomModal("✅ Check-in Berhasil!", `${randomMsg}`, footer);
            });
        }

        // Logout
        if(logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                const footer = `
                    <button class="btn-submit-checkin" style="background-color: #ef5350;" onclick="localStorage.removeItem('userInfo'); window.location.hash='/'; this.closest('.modal-overlay').remove();">Ya</button>
                    <button class="btn-submit-checkin" style="background-color: #ccc; margin-left: 10px;" onclick="this.closest('.modal-overlay').remove()">Tidak</button>
                `;
                createCustomModal("Konfirmasi", "Yakin ingin logout?", footer);
            });
        }

        // 2. FETCH DATA AND RENDER DYNAMIC CONTENT (Modules, Stats, Charts)
        setTimeout(async () => {
            try {
                const userStr = localStorage.getItem('userInfo');
                const user = userStr ? JSON.parse(userStr) : { email: 'ari.gunawan93@example.com' }; 
                const studentCourses = await getStudentData(user.email);

                // A. Calculate Stats (Total Hours)
                let totalStudyHours = 0;
                studentCourses.forEach(c => {
                     const ratio = c.completed_tutorials / c.active_tutorials;
                     totalStudyHours += (ratio > 1 ? 1 : ratio) * 40;
                });
                document.getElementById('total-study-time').innerText = `${Math.round(totalStudyHours)} hrs`;

                // B. Calculate Avg Grade
                const gradedCourses = studentCourses.filter(c => c.score > 0);
                let avgScore = 0;
                if (gradedCourses.length > 0) {
                    const totalScore = gradedCourses.reduce((acc, c) => acc + c.score, 0);
                    avgScore = Math.round(totalScore / gradedCourses.length);
                }
                
                const avgGradeText = document.getElementById('avg-grade-text');
                const avgRing = document.getElementById('avg-grade-ring');
                if (avgGradeText) avgGradeText.innerText = avgScore;
                if (avgRing) avgRing.setAttribute('stroke-dasharray', `${avgScore}, 100`);

                const verdictEl = document.getElementById('grade-verdict');
                if(verdictEl) {
                    verdictEl.innerText = avgScore >= 90 ? "Excellent!" : (avgScore >= 80 ? "Very Good!" : "Good");
                    verdictEl.style.color = avgScore >= 80 ? "#2563eb" : "#ca8a04";
                }

                // C. Render Modules List (With Icons & Progress Bar)
                const moduleContainer = document.getElementById('module-list-container');
                let moduleHtml = '';
                // Sort: In Progress first
                const modulesToShow = studentCourses.sort((a, b) => (a.isCompleted === b.isCompleted) ? 0 : (a.isCompleted ? 1 : -1));

                // Helper for icons
                const getModuleIcon = (title) => {
                    const t = title.toLowerCase();
                    if (t.includes('web') || t.includes('front-end') || t.includes('react') || t.includes('javascript')) return '<i class="fa-solid fa-code"></i>';
                    if (t.includes('android') || t.includes('kotlin')) return '<i class="fa-brands fa-android"></i>';
                    if (t.includes('back-end') || t.includes('cloud') || t.includes('aws') || t.includes('google')) return '<i class="fa-solid fa-server"></i>';
                    if (t.includes('ai') || t.includes('python') || t.includes('deep learning')) return '<i class="fa-solid fa-brain"></i>';
                    if (t.includes('ios') || t.includes('swift')) return '<i class="fa-brands fa-apple"></i>';
                    return '<i class="fa-solid fa-book"></i>';
                };
                
                modulesToShow.forEach(mod => {
                    const pct = Math.round((mod.completed_tutorials / mod.active_tutorials) * 100) || 0;
                    const progressPct = Math.min(100, pct);
                    const safeTitle = mod.title.replace(/'/g, "\\'");
                    // const statusStr = mod.isCompleted ? 'Graduated' : 'In Progress'; -- OLD STATUS
                    const statusStr = mod.isCompleted ? 'Completed' : 'In Progress'; // New Status for Modal
                    
                    // Color logic
                    const barColor = progressPct === 100 ? 'green' : 'blue';
                    const iconBgColor = progressPct === 100 ? '#2e7d32' : '#005060';
                    const moduleIcon = getModuleIcon(mod.title);
                    
                    // Pass data to window.openModuleDetail
                    // args: title, level, hours, rating, status, start, end, score, desc, color, icon
                    // We need to escape single quotes in description for the onclick handler
                    const safeDesc = (mod.description || "").replace(/'/g, "\\'");
                    const safeIconHtml = moduleIcon.replace(/"/g, "&quot;"); // Encode double quotes for HTML attribute

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

                // D. Render Milestone (Simple)
                const milestoneContainer = document.getElementById('milestone-container');
                const reactPath = [
                    { title: "Belajar Dasar Pemrograman Web", level: "Dasar" },
                    { title: "Belajar Dasar Pemrograman JavaScript", level: "Dasar" },
                    { title: "Belajar Membuat Aplikasi Front-End Pemula", level: "Pemula" },
                    { title: "Belajar Fundamental Aplikasi React", level: "Menengah" },
                    { title: "Menjadi React Web Developer Expert", level: "Mahir" }
                ];
                let milestoneHtml = '';
                reactPath.forEach(path => {
                    const course = studentCourses.find(c => c.title === path.title);
                    let status = 'future';
                    if (course) {
                        if (course.isCompleted) status = 'done';
                        else if (course.completed_tutorials > 0) status = 'current';
                    }
                    
                    const dotClass = status === 'done' ? 'tl-dot' : (status === 'current' ? 'tl-dot-ring' : 'tl-dot-hollow');
                    const titleClass = status === 'current' ? 'text-blue' : '';
                    
                    milestoneHtml += `
                        <div class="tl-item ${status}">
                            <div class="${dotClass}"></div>
                            <div class="tl-content">
                                <h4 class="${titleClass}">${path.title}</h4>
                                <p>Level: ${path.level}</p>
                            </div>
                        </div>`;
                });
                milestoneContainer.innerHTML = milestoneHtml;

                // E. Render Radar Chart (Skill Analysis)
                const ctxRadar = document.getElementById('radarChart');
                if (ctxRadar && window.Chart) {
                    const skillScores = [85, 80, 75, 60, 70, 80]; 
                    new Chart(ctxRadar, {
                        type: 'radar',
                        data: {
                            labels: ['HTML/CSS', 'JavaScript', 'React', 'Testing', 'DevOps', 'Soft Skills'],
                            datasets: [{
                                label: 'You',
                                data: skillScores,
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
                            scales: { r: { ticks: { display: false, max: 100 }, grid: { color: '#f0f0f0' }, pointLabels: { font: { size: 10, family: 'Poppins' } } } },
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