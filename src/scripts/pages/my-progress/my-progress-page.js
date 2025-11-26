import { getStudentData } from '../../user-data.js';

const MyProgressPage = {
  async render() {
    return `
      <div class="dashboard-body">
        
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="brand-logo">
                    <span style="font-size: 24px; font-weight: 700;">9</span>
                </div>
            </div>

            <div class="menu-group">
                <div class="menu-category" style="color:white; font-size: 14px; margin-bottom:10px;">Academy</div>
            </div>

            <div class="menu-group">
                <div class="menu-category">LEARNING</div>
                <a href="#/dashboard" class="menu-item">Dashboard</a>
                <a href="#/my-progress" class="menu-item active">My Progress</a>
                <a href="#" class="menu-item">Dicoding Mentoring</a>
            </div>

            <div class="menu-group">
                <div class="menu-category">DOCUMENT</div>
                <a href="#" class="menu-item">Student Portal</a>
                <a href="#" class="menu-item">Announcement</a>
                <a href="#" class="menu-item">Capstone Project</a>
                <a href="#" class="menu-item">Newsletter</a>
            </div>
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
                <button id="tab-in-progress" class="btn-tab inactive">In Progress (0)</button>
                <button id="tab-completed" class="btn-tab active">Completed (0)</button>
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
    // 1. AMBIL USER YANG SEDANG LOGIN
    const userStr = localStorage.getItem('userInfo');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user || !user.email) {
        document.getElementById('course-list-container').innerHTML = '<p style="padding:20px;">Silakan login terlebih dahulu untuk melihat progress Anda.</p>';
        return;
    }

    try {
        // 2. FETCH DATA CSV BERDASARKAN EMAIL
        const courses = await getStudentData(user.email);
        
        // 3. FILTER DATA
        const coursesCompleted = courses.filter(c => c.isCompleted);
        const coursesInProgress = courses.filter(c => !c.isCompleted);

        // 4. HITUNG STATISTIK
        const total = courses.length;
        const completedCount = coursesCompleted.length;
        const inProgressCount = coursesInProgress.length;
        const percentage = total === 0 ? 0 : Math.round((completedCount / total) * 100);

        // 5. UPDATE UI PROGRESS BAR & TEXT
        document.getElementById('progress-text').innerText = `You have completed ${completedCount} of ${total} courses.`;
        document.getElementById('progress-percentage').innerText = `${percentage}%`;
        
        // Efek animasi bar
        setTimeout(() => {
            const bar = document.getElementById('progress-bar');
            if(bar) bar.style.width = `${percentage}%`;
        }, 100);

        // 6. UPDATE JUMLAH DI TAB
        const tabInProgress = document.getElementById('tab-in-progress');
        const tabCompleted = document.getElementById('tab-completed');
        
        tabInProgress.innerText = `In Progress (${inProgressCount})`;
        tabCompleted.innerText = `Completed (${completedCount})`;

        const listContainer = document.getElementById('course-list-container');

        // --- Helper Format Tanggal ---
        const formatDate = (dateStr) => {
            if(!dateStr) return "";
            const dateObj = new Date(dateStr);
            if(isNaN(dateObj)) return dateStr; 
            return dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        };

        // --- Fungsi Render List ---
        const renderInProgress = () => {
            if(coursesInProgress.length === 0) {
                listContainer.innerHTML = '<p style="padding:20px; text-align:center; color:#888;">Tidak ada kursus yang sedang berjalan.</p>';
            } else {
                let html = '';
                coursesInProgress.forEach(course => {
                    html += `
                    <div class="course-item-row">
                        <div class="course-icon"><i class="fas fa-info-circle"></i></div>
                        <div class="course-info-text">
                            <div class="course-name">${course.title}</div>
                        </div>
                        <button class="btn-continue">Continue</button>
                    </div>`;
                });
                listContainer.innerHTML = html;
            }
            
            // Update Style Tab
            tabInProgress.classList.add('active'); tabInProgress.classList.remove('inactive');
            tabCompleted.classList.remove('active'); tabCompleted.classList.add('inactive');
        };

        const renderCompleted = () => {
            if(coursesCompleted.length === 0) {
                listContainer.innerHTML = '<p style="padding:20px; text-align:center; color:#888;">Belum ada kursus yang selesai.</p>';
            } else {
                let html = '';
                coursesCompleted.forEach(course => {
                    const dateDisplay = course.date ? `Completed on: ${formatDate(course.date)}` : "Completed";
                    html += `
                    <div class="course-item-row">
                        <div class="icon-check-green"><i class="fas fa-check"></i></div>
                        <div class="course-info-text">
                            <div class="course-name">${course.title}</div>
                            <div class="course-date">${dateDisplay}</div>
                        </div>
                        <button class="btn-view-certificate">
                            <i class="fas fa-circle" style="font-size:8px;"></i> View Certificate
                        </button>
                    </div>`;
                });
                listContainer.innerHTML = html;
            }

            // Update Style Tab
            tabCompleted.classList.add('active'); tabCompleted.classList.remove('inactive');
            tabInProgress.classList.remove('active'); tabInProgress.classList.add('inactive');
        };

        // Event Listeners untuk Klik Tab
        tabInProgress.addEventListener('click', renderInProgress);
        tabCompleted.addEventListener('click', renderCompleted);

        // Default View (Tampilkan Completed saat awal buka)
        renderCompleted();

    } catch (err) {
        console.error(err);
        document.getElementById('course-list-container').innerHTML = '<p style="color:red; padding:20px;">Gagal memuat data.</p>';
    }
  }
};

export default MyProgressPage;