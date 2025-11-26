const MyProgressPage = {
  async render() {
    // Data User (Simulasi)
    const userStr = localStorage.getItem('userInfo');
    const user = userStr ? JSON.parse(userStr) : { name: "Student" };

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
                <p>You have completed 4 of 9 courses.</p>
                <div class="progress-container-wide">
                    <div class="progress-bar-orange" style="width: 44%;"></div>
                </div>
                <div class="progress-text-right">44%</div>
            </div>

            <div class="tab-section">
                <button class="btn-tab active">In Progress (3)</button>
                <button class="btn-tab inactive">Completed (4)</button>
            </div>

            <hr class="divider-line">

            <div class="course-list-section">
                <div class="list-header">
                    <i class="fas fa-graduation-cap"></i> <h3>Asah 2025</h3>
                </div>

                <div class="alert-box-yellow">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>The learning deadline for all classes can be seen on the Timeline Program.</span>
                </div>

                <div class="course-item-row">
                    <div class="course-icon"><i class="fas fa-info-circle"></i></div>
                    <div class="course-name">Introduction to Programming Logic (Programming Logic 101)</div>
                    <button class="btn-continue">Continue</button>
                </div>

                <div class="course-item-row">
                    <div class="course-icon"><i class="fas fa-info-circle"></i></div>
                    <div class="course-name">Learn Basic Web Programming</div>
                </div>

                <div class="course-item-row">
                    <div class="course-icon"><i class="fas fa-info-circle"></i></div>
                    <div class="course-name">Learn to Create Back-End Applications for Beginners</div>
                </div>
            </div>

            <div class="recommendation-section">
                <h3 class="rec-title"><i class="fas fa-lightbulb" style="color:#fbc02d; margin-right:8px;"></i> Recommended For You</h3>
                
                <div class="rec-grid">
                    <div class="rec-card">
                        <h4>Solid Programming Principles</h4>
                        <p>Write maintainable, scalable, and robust code by following SOLID principles.</p>
                        <a href="#" class="link-start">Start Learning ></a>
                    </div>

                    <div class="rec-card">
                        <h4>Cloud Practitioner Essentials (AWS Cloud)</h4>
                        <p>Get started with cloud computing concepts and the AWS ecosystem.</p>
                        <a href="#" class="link-start">Start Learning ></a>
                    </div>
                </div>
            </div>

            <footer class="dash-footer">© 2025 Dicoding Indonesia</footer>
        </main>
      </div>
    `;
  },

  async afterRender() {
    // Logika tambahan jika diperlukan (misal: fetch data real)
  }
};

export default MyProgressPage;