import { getStudentData, getTutorialsByCourseName } from '../../user-data.js';

const TutorialsPage = {
  async render() {
    const query = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const courseTitle = query.get('title') || 'Course';

    return `
      <div class="dashboard-body">
        <aside class="sidebar">
          <div class="brand-logo">
            <i class="fa-solid fa-code"></i> dicoding
          </div>
          <div class="menu-group">
            <div class="menu-category">LEARNING</div>
            <a href="#/home" class="menu-item">Home</a>
            <a href="#/dashboard" class="menu-item">Dashboard</a>
            <a href="#/my-progress" class="menu-item">My Progres</a>
          </div>
        </aside>
        <main class="main-content">
          <div class="card">
            <div class="card-header-row">
              <div>
                <a href="#/my-progress" style="color:#0288d1; text-decoration:none; font-size:14px; margin-bottom:8px; display:inline-block;">
                  <i class="fa-solid fa-arrow-left"></i> Back to Progress
                </a>
                <h3 style="margin-bottom:6px; margin-top:8px;">${courseTitle}</h3>
                <p style="color:#666; font-size:13px;">Tutorial Progress</p>
              </div>
            </div>

            <div style="margin-top:20px;">
              <div class="card" style="padding:18px;">
                <div style="display:flex; gap:12px; margin-bottom:16px;">
                  <button id="tab-active" class="btn-tab active" style="padding:8px 16px;">
                    Active Tutorials (<span id="active-count">0</span>)
                  </button>
                  <button id="tab-completed" class="btn-tab inactive" style="padding:8px 16px;">
                    Completed Tutorials (<span id="completed-count">0</span>)
                  </button>
                </div>
                <hr style="margin:12px 0; border:none; height:1px; background:#eee;">
                
                <div id="tutorials-container" style="display:flex; flex-direction:column; gap:10px; margin-top:16px;">
                  <p style="padding:20px; text-align:center; color:#888;">Loading tutorials...</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    `;
  },

  async afterRender() {
    const userStr = localStorage.getItem('userInfo');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user || !user.email) {
      const container = document.getElementById('tutorials-container');
      if (container) container.innerHTML = '<p style="padding:20px; text-align:center;">Silakan login terlebih dahulu.</p>';
      return;
    }

    try {
      const query = new URLSearchParams(window.location.hash.split('?')[1] || '');
      const courseTitle = query.get('title') || 'Course';
      const courses = await getStudentData(user.email);
      const currentCourse = courses.find(c => c.title === courseTitle);

      if (!currentCourse) {
        const container = document.getElementById('tutorials-container');
        if (container) container.innerHTML = '<p style="padding:20px; text-align:center; color:#f44336;">Kursus tidak ditemukan.</p>';
        return;
      }

      // Get all tutorials for this course from CSV
      const allTutorials = await getTutorialsByCourseName(courseTitle);
      const activeTutCount = currentCourse.active_tutorials || 0;
      const completedTutCount = currentCourse.completed_tutorials || 0;
      
      // Create tutorial list - split based on active_tutorials and completed_tutorials count
      const activeTutorials = [];
      const completedTutorials = [];

      // Active tutorials (to do) - from index activeTutCount onwards
      for (let i = 0; i < Math.min(activeTutCount, allTutorials.length); i++) {
        activeTutorials.push({
          id: `${courseTitle}-active-${i}`,
          title: allTutorials[i],
          status: 'active',
          isCompleted: false,
          index: i + 1
        });
      }

      // Completed tutorials (done) - from start to completedTutCount
      for (let i = 0; i < Math.min(completedTutCount, allTutorials.length); i++) {
        completedTutorials.push({
          id: `${courseTitle}-completed-${i}`,
          title: allTutorials[i],
          status: 'completed',
          isCompleted: true,
          index: i + 1
        });
      }

      // Update counts
      document.getElementById('active-count').textContent = activeTutorials.length;
      document.getElementById('completed-count').textContent = completedTutorials.length;

      // Render active tutorials by default
      this.renderTutorials(activeTutorials, 'active');

      // Tab event listeners
      const tabActive = document.getElementById('tab-active');
      const tabCompleted = document.getElementById('tab-completed');

      if (tabActive) {
        tabActive.addEventListener('click', () => {
          tabActive.classList.add('active');
          tabActive.classList.remove('inactive');
          tabCompleted.classList.remove('active');
          tabCompleted.classList.add('inactive');
          this.renderTutorials(activeTutorials, 'active');
        });
      }

      if (tabCompleted) {
        tabCompleted.addEventListener('click', () => {
          tabCompleted.classList.add('active');
          tabCompleted.classList.remove('inactive');
          tabActive.classList.remove('active');
          tabActive.classList.add('inactive');
          this.renderTutorials(completedTutorials, 'completed');
        });
      }
    } catch (err) {
      console.error('Error in TutorialsPage:', err);
      const container = document.getElementById('tutorials-container');
      if (container) container.innerHTML = '<p style="padding:20px; text-align:center; color:#f44336;">Gagal memuat data tutorial.</p>';
    }
  },

  renderTutorials(tutorials, type) {
    const container = document.getElementById('tutorials-container');
    if (!container) return;

    if (tutorials.length === 0) {
      container.innerHTML = '<p style="padding:20px; text-align:center; color:#888;">Tidak ada tutorial di kategori ini.</p>';
      return;
    }

    const isCompleted = type === 'completed';
    const html = tutorials.map((tut, idx) => `
      <div style="display:flex; align-items:center; justify-content:space-between; padding:14px 12px; border-radius:8px; border:1px solid #eee; background:${isCompleted ? '#f5f5f5' : '#fafafa'};">
        <div style="display:flex; gap:12px; align-items:center; flex:1;">
          <div style="width:40px; height:40px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:${isCompleted ? '#e8f5e9' : '#e9f7ff'}; color:${isCompleted ? '#2e7d32' : '#0288d1'}; font-weight:700; font-size:18px;">
            ${isCompleted ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-circle-play"></i>'}
          </div>
          <div>
            <div style="font-weight:600; color:#333;">${tut.title}</div>
            <div style="font-size:12px; color:#888; margin-top:3px;">
              ${isCompleted ? 'Completed' : 'In Progress'}
            </div>
          </div>
        </div>
        <div>
          <button class="btn-small" style="padding:6px 14px; font-size:12px; cursor:pointer; border:none; border-radius:4px; background:${isCompleted ? '#4caf50' : '#0288d1'}; color:white; transition: 0.2s; font-weight: 500;">
            ${isCompleted ? 'Review' : 'Continue'}
          </button>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  }
};

export default TutorialsPage;
