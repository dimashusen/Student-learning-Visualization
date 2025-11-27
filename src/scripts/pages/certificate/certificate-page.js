// Printable Certificate Page
function parseHashQuery() {
  const hash = window.location.hash || '#/';
  const parts = hash.slice(1).split('?');
  const query = {};
  if (parts.length > 1) {
    const params = parts[1].split('&');
    params.forEach(p => {
      const [k, v] = p.split('=');
      if (k) query[k] = decodeURIComponent(v || '');
    });
  }
  return query;
}

const CertificatePage = {
  async render() {
    const query = parseHashQuery();
    const title = query.title || 'Course Title';
    const date = query.date || query.completedAt || new Date().toLocaleDateString('id-ID');
    const score = query.score || '';
    const userInfo = localStorage.getItem('userInfo');
    const user = userInfo ? JSON.parse(userInfo) : { name: 'Student' };
    const name = user.name || 'Student';

    return `
      <div class="dashboard-body certificate-page">
        <aside class="sidebar">
            <div class="sidebar-header"><div class="brand-logo">dicoding</div></div>
            <div class="menu-group">
                <div class="menu-category">LEARNING</div>
                <a href="#/home" class="menu-item">Home</a>
                <a href="#/dashboard" class="menu-item">Dashboard</a>
                <a href="#/my-progress" class="menu-item">My Progres</a>
            </div>
        </aside>
        <main class="main-content">
          <div class="card certificate-card" id="certificate-card" style="padding:40px; text-align:center;">
            <h1 class="cert-title">Sertifikat Penyelesaian</h1>
            <p class="cert-sub" style="font-size:16px;">Diberikan kepada</p>
            <h2 class="cert-name" style="font-size:28px; margin:8px 0 20px 0;">${name}</h2>
            <p class="cert-course" style="font-size:18px;">Telah menyelesaikan kursus <strong>${title}</strong></p>
            ${score ? `<p style="margin-top:6px; color:#333;">Nilai Akhir: <strong>${score}</strong></p>` : ''}
            <p style="margin-top:18px; color:#666;">Tanggal Penyelesaian: <strong>${date}</strong></p>
            <div style="margin-top:36px; display:flex; justify-content:space-between; align-items:center;">
              <div style="text-align:left;">
                <div style="font-weight:700;">Dicoding Indonesia</div>
                <div style="font-size:12px; color:#666;">www.dicoding.com</div>
              </div>
              <div style="text-align:right;">
                <div style="font-weight:700; margin-bottom:6px;">TTD Program Manager</div>
                <div style="font-size:12px; color:#666;">Dicoding Indonesia</div>
              </div>
            </div>
            <div style="margin-top:30px; text-align:center;">
              <button id="printBtn" class="btn-primary">Cetak Sertifikat</button>
              <a href="#/home" style="margin-left:12px; display:inline-block;" class="btn-outline-white">Home</a>
              <a href="#/my-progress" style="margin-left:12px; display:inline-block;" class="btn-outline-white">Kembali</a>
            </div>
          </div>
        </main>
      </div>
    `;
  },
  async afterRender() {
    const btn = document.getElementById('printBtn');
    if (btn) {
      btn.addEventListener('click', () => {
        // Open print dialog and attempt to print only certificate card
        window.print();
      });
    }
  }
};

export default CertificatePage;
