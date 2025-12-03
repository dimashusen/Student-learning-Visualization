import { getStudentData, getLpCourse } from '../../user-data.js';

// Helper: fallback CSV parser (semicolons)
function parseCsvText(csvText) {
    const lines = csvText.split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) return [];
    const header = lines[0].split(';').map(h => h.trim());
    const rows = lines.slice(1);
    return rows.map(line => {
        const cols = line.split(';');
        const obj = {};
        header.forEach((h,i) => obj[h] = cols[i] ? cols[i].trim() : '');
        return obj;
    });
}

// Get course levels from course level.csv
async function getCourseLevels() {
    const pathsToTry = ['./public/data/course level.csv', './data/course level.csv', '/public/data/course level.csv'];
    for (const p of pathsToTry) {
        try {
            const resp = await fetch(p);
            if (!resp.ok) continue;
            const text = await resp.text();
            const parsed = parseCsvText(text);
            const levelMap = {};
            parsed.forEach(row => {
                const id = row.id ? String(row.id).trim() : '';
                const level = row.course_level ? row.course_level.trim() : '';
                if (id && level) levelMap[id] = level;
            });
            return levelMap;
        } catch (err) { /* try next */ }
    }
    console.warn('getCourseLevels: CSV not found');
    return {};
}

// Get course data from course.csv to map course_name to course_level_id
async function getCourseData() {
    const pathsToTry = ['./public/data/course.csv', './data/course.csv', '/public/data/course.csv'];
    for (const p of pathsToTry) {
        try {
            const resp = await fetch(p);
            if (!resp.ok) continue;
            const text = await resp.text();
            const parsed = parseCsvText(text);
            const courseMap = {};
            parsed.forEach(row => {
                const courseName = row.course_name ? row.course_name.trim() : '';
                // course.csv uses course_level_str which is the level ID (1,2,3,4,5)
                const levelId = row.course_level_str ? String(row.course_level_str).trim() : '';
                if (courseName && levelId) courseMap[courseName] = levelId;
            });
            return courseMap;
        } catch (err) { /* try next */ }
    }
    console.warn('getCourseData: CSV not found');
    return {};
}

const MyProgressPage = {
  async render() {
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
                <a href="#/home" class="menu-item">Home</a>
                <a href="#/dashboard" class="menu-item">Dashboard</a>
                <a href="#/my-progress" class="menu-item">My Progres</a>
            </div>
            <!-- Document links removed as requested -->
        </aside>
        <main class="main-content">
            <div class="progress-header" style="display:flex; align-items:center; gap:12px;">
                <a href="#/home" class="home-icon-btn" title="Home"><i class="fa-solid fa-house"></i></a>
                <div class="search-bar-wide" style="flex:1">
                    <input type="text" placeholder="Apa yang ingin anda pelajari">
                </div>
            </div>
            <div class="card progress-overview-card">
                <h3>Learning Progress</h3>
                <p id="progress-text">Loading progress...</p>
                <div class="progress-container-wide">
                    <div class="progress-bar-orange" id="progress-bar" style="width: 0%; transition: width 1s;"></div>
                </div>
                <div class="progress-text-right" id="progress-percentage">0%</div>
            </div>
            <div class="tab-section">
                <button id="tab-in-progress" class="btn-tab active">In Progress (0)</button>
                <button id="tab-completed" class="btn-tab inactive">Completed (0)</button>
            </div>
            <hr class="divider-line">
            <div class="course-list-section">
                <div class="list-header">
                    <h3>Asah 2025</h3>
                </div>
                <div class="alert-box-yellow">
                    <i class="fas fa-lightbulb" style="color: #9ca3af;"></i>
                    <span>The learning deadline for all classes can be seen on the <strong style="color: #d97706;">Timeline Program.</strong></span>
                </div>
                <div id="course-list-container">
                    <p style="padding: 20px; color: #666;">Memuat data kursus...</p>
                </div>
            </div>
            <footer class="dash-footer">© 2025 Dicoding Indonesia</footer>
                </main>
            </div>
        `;
    },
    async afterRender() {
    const userStr = localStorage.getItem('userInfo');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user || !user.email) {
        const listContainer = document.getElementById('course-list-container');
        if(listContainer) listContainer.innerHTML = '<p style="padding:20px;">Silakan login terlebih dahulu untuk melihat progress Anda.</p>';
        return;
    }
    try {
        // Get course level mappings
        const courseLevels = await getCourseLevels();
        const courseNameToLevelId = await getCourseData();
        
        // Get student data
        const courses = await getStudentData(user.email);
        
        // Enhance courses with level information
        const enhancedCourses = courses.map(course => {
            const levelId = courseNameToLevelId[course.title];
            const levelName = levelId ? courseLevels[levelId] : 'Dasar';
            
            // Calculate progress percentage based on active and completed tutorials
            let progress = 0;
            if (course.active_tutorials && course.active_tutorials > 0) {
                progress = Math.round((course.completed_tutorials / course.active_tutorials) * 100);
            }
            
            return {
                ...course,
                level: levelName,
                progress: progress,
                url: `https://www.dicoding.com/search?q=${encodeURIComponent(course.title)}`
            };
        });
        
        const coursesCompleted = enhancedCourses.filter(c => c.isCompleted);
        // Courses we already have in-progress from CSV
        const coursesInProgress = enhancedCourses.filter(c => !c.isCompleted);

        // Recompute totals
        const total = coursesCompleted.length + coursesInProgress.length;
        const completedCount = coursesCompleted.length;
        const inProgressCount = coursesInProgress.length;
        const percentage = total === 0 ? 0 : Math.round((completedCount / total) * 100);
        const progressTextEl = document.getElementById('progress-text');
        const progressPercentageEl = document.getElementById('progress-percentage');
        if(progressTextEl) progressTextEl.innerText = `You have completed ${completedCount} of ${total} courses.`;
        if(progressPercentageEl) progressPercentageEl.innerText = `${percentage}%`;
        setTimeout(() => {
            const bar = document.getElementById('progress-bar');
            if(bar) bar.style.width = `${percentage}%`;
        }, 100);
        const tabInProgress = document.getElementById('tab-in-progress');
        const tabCompleted = document.getElementById('tab-completed');
        if(tabInProgress) tabInProgress.innerText = `In Progress (${inProgressCount})`;
        if(tabCompleted) tabCompleted.innerText = `Completed (${completedCount})`;
        const listContainer = document.getElementById('course-list-container');
        const formatDate = (dateStr) => {
            if(!dateStr) return "";
            const dateObj = new Date(dateStr);
            if(isNaN(dateObj)) return dateStr; 
            return dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        };
        const renderInProgress = () => {
            if(!listContainer) return;
            if(coursesInProgress.length === 0) {
                listContainer.innerHTML = '<p style="padding:20px; text-align:center; color:#888;">Tidak ada kursus yang sedang berjalan.</p>';
            } else {
                let html = '';
                coursesInProgress.forEach(course => {
                    const levelBadge = course.level ? `<span class="badge-level small">${course.level}</span>` : '';
                    const progressBarSmall = `
                        <div class="course-mini-progress">
                            <div class="mini-track">
                                <div class="mini-fill" style="width:${course.progress}%"></div>
                            </div>
                            <div class="mini-percent">${course.progress}%</div>
                        </div>`;
                    const tutorialInfo = `<div class="tutorial-info" style="font-size: 12px; color: #666; margin-top: 4px;">
                        Tutorial: ${course.completed_tutorials}/${course.active_tutorials}
                    </div>`;
                    html += `
                    <div class="course-item-row">
                        <div class="course-icon"><i class="fas fa-book-open"></i></div>
                        <div class="course-info-text">
                            <div class="course-name">${course.title} ${levelBadge}</div>
                            ${progressBarSmall}
                            ${tutorialInfo}
                        </div>
                        <a href="#/tutorials?title=${encodeURIComponent(course.title)}" class="btn-continue" aria-label="Continue ${course.title}">Continue</a>
                    </div>`;
                });
                listContainer.innerHTML = html;
            }
            if(tabInProgress && tabCompleted) {
                tabInProgress.classList.add('active'); tabInProgress.classList.remove('inactive');
                tabCompleted.classList.remove('active'); tabCompleted.classList.add('inactive');
            }
        };
        const renderCompleted = () => {
            if(!listContainer) return;
            if(coursesCompleted.length === 0) {
                listContainer.innerHTML = '<p style="padding:20px; text-align:center; color:#888;">Belum ada kursus yang selesai.</p>';
            } else {
                let html = '';
                coursesCompleted.forEach(course => {
                    const dateDisplay = course.date ? `Completed on: ${formatDate(course.date)}` : "Completed";
                    const levelBadge = course.level ? `<span class="badge-level small">${course.level}</span>` : '';
                    const certDate = course.date ? encodeURIComponent(course.date) : encodeURIComponent(new Date().toLocaleDateString('id-ID'));
                    const certScore = course.score ? encodeURIComponent(course.score) : '';
                    html += `
                    <div class="course-item-row completed">
                        <div class="icon-check-green"><i class="fas fa-check"></i></div>
                        <div class="course-info-text">
                            <div class="course-name">${course.title} ${levelBadge}</div>
                            <div class="course-date">${dateDisplay}</div>
                        </div>
                        <a href="#/certificate?title=${encodeURIComponent(course.title)}&date=${certDate}&score=${certScore}" class="btn-view-certificate" aria-label="View certificate for ${course.title}">
                            <i class="fas fa-certificate"></i> View Certificate
                        </a>
                    </div>`;
                });
                listContainer.innerHTML = html;
            }
            if(tabCompleted && tabInProgress) {
                tabCompleted.classList.add('active'); tabCompleted.classList.remove('inactive');
                tabInProgress.classList.remove('active'); tabInProgress.classList.add('inactive');
            }
        };
        if(tabInProgress) tabInProgress.addEventListener('click', renderInProgress);
        if(tabCompleted) tabCompleted.addEventListener('click', renderCompleted);
        renderInProgress();
    } catch (err) {
        console.error(err);
        const listContainer = document.getElementById('course-list-container');
        if(listContainer) listContainer.innerHTML = '<p style="color:red; padding:20px;">Gagal memuat data.</p>';
    }
  }
};

export default MyProgressPage;
