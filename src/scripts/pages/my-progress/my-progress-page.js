import { getStudentData } from '../../user-data.js';

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
                <a href="#/dashboard" class="menu-item">Dashboard</a>
                <a href="#/my-progress" class="menu-item">My Progres</a>
            </div>
            <!-- Document links removed as requested -->
        </aside>
        <main class="main-content">
            <div class="progress-header">
                <div class="search-bar-wide">
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
        const courses = await getStudentData(user.email);
        const coursesCompleted = courses.filter(c => c.isCompleted);
        // Courses we already have in-progress from CSV
        const coursesInProgress = courses.filter(c => !c.isCompleted);

        // --- Add Provided Default In-Progress Courses If Not Present ---
        const DEFAULT_IN_PROGRESS_COURSES = [
            "Belajar Dasar AI",
            "Belajar Fundamental Deep Learning",
            "Belajar Machine Learning untuk Pemula",
            "Machine Learning Terapan",
            "Membangun Proyek Deep Learning Tingkat Mahir",
            "Memulai Pemrograman dengan Python",
            "Belajar Fundamental Aplikasi Android",
            "Belajar Membuat Aplikasi Android untuk Pemula",
            "Belajar Pengembangan Aplikasi Android Intermediate",
            "Belajar Prinsip Pemrograman SOLID",
            "Memulai Pemrograman dengan Kotlin",
            "Menjadi Android Developer Expert",
            "Architecting on AWS (Membangun Arsitektur Cloud di AWS)",
            "Belajar Back-End Pemula dengan JavaScript",
            "Belajar Dasar Cloud dan Gen AI di AWS",
            "Belajar Dasar Pemrograman JavaScript",
            "Belajar Fundamental Back-End dengan JavaScript",
            "Menjadi Back-End Developer Expert dengan JavaScript",
            "Menjadi Node.js Application Developer",
            "Belajar Back-End Pemula dengan Python",
            "Belajar Dasar Google Cloud",
            "Belajar Fundamental Back-End dengan Python",
            "Menjadi Google Cloud Architect",
            "Menjadi Google Cloud Engineer",
            "Belajar Analisis Data dengan Python",
            "Belajar Dasar Data Science",
            "Belajar Dasar Structured Query Language (SQL)",
            "Belajar Matematika untuk Data Science",
            "Belajar Penerapan Data Science",
            "Belajar Dasar-Dasar DevOps",
            "Belajar Implementasi CI/CD",
            "Belajar Jaringan Komputer untuk Pemula",
            "Belajar Membangun Arsitektur Microservices",
            "Menjadi Linux System Administrator",
            "Belajar Dasar Pemrograman Web",
            "Belajar Fundamental Front-End Web Development",
            "Belajar Membuat Front-End Web untuk Pemula",
            "Belajar Pengembangan Web Intermediate",
            "Prompt Engineering untuk Software Developer",
            "Belajar Membuat Aplikasi Back-End untuk Pemula dengan Google Cloud",
            "Belajar Fundamental Aplikasi iOS",
            "Belajar Membuat Aplikasi iOS untuk Pemula",
            "Memulai Pemrograman Dengan Swift",
            "Menjadi iOS Developer Expert",
            "Machine Learning Operations (MLOps)",
            "Membangun Sistem Machine Learning",
            "Belajar Fundamental Aplikasi Flutter",
            "Belajar Membuat Aplikasi Flutter untuk Pemula",
            "Belajar Pengembangan Aplikasi Flutter Intermediate",
            "Memulai Pemrograman dengan Dart",
            "Menjadi Flutter Developer Expert",
            "Belajar Fundamental Aplikasi Web dengan React"
        ];

        // Normalize and dedupe provided titles
        const providedSet = new Set(DEFAULT_IN_PROGRESS_COURSES.map(t => t.trim()));
        const additionalTitles = Array.from(providedSet).filter(title =>
            !coursesCompleted.some(c => (c.title || '').toLowerCase() === title.toLowerCase()) &&
            !coursesInProgress.some(c => (c.title || '').toLowerCase() === title.toLowerCase())
        );

        // Convert to placeholder objects and append to coursesInProgress
        const placeholders = additionalTitles.map(title => ({
            title: title,
            isCompleted: false,
            date: '',
            score: 0,
            tutorials: 0,
            activeTutorials: 0,
            completedTutorials: 0,
            progress: 0,
            status: 'in_progress',
            level: 'Dasar',
            url: `https://www.dicoding.com/search?q=${encodeURIComponent(title)}`
        }));

        if (placeholders.length > 0) {
            coursesInProgress.push(...placeholders);
        }
        // Recompute totals after adding placeholders
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
                    const link = course.url ? course.url : '#';
                    html += `
                    <div class="course-item-row">
                        <div class="course-icon"><i class="fas fa-book-open"></i></div>
                        <div class="course-info-text">
                            <div class="course-name">${course.title} ${levelBadge}</div>
                            ${progressBarSmall}
                        </div>
                        <a href="#/course?title=${encodeURIComponent(course.title)}" class="btn-continue" aria-label="Continue ${course.title}">Continue</a>
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
