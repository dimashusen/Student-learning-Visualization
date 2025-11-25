// --- 1. DAILY CHECK-IN LOGIC ---
document.addEventListener("DOMContentLoaded", function() {
    renderCheckinPills();
    renderCharts();
});

function renderCheckinPills() {
    const container = document.getElementById('checkinContainer');
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    // Status hardcoded sesuai gambar referensi:
    // 1, 2, 3 = Hijau (Selesai)
    // 4 = Merah (Missed/Today but late?)
    // 5 = Abu (Future)
    
    let html = '';
    for(let i=1; i<=5; i++) {
        let statusClass = '';
        if(i <= 3) statusClass = 'done'; // Hijau
        else if (i === 4) statusClass = 'missed'; // Merah
        else statusClass = 'future'; // Abu

        html += `
        <div class="day-pill-vertical ${statusClass}">
            <span class="pill-day">${days[i-1]}</span>
            <span class="pill-num">${i}</span>
        </div>
        `;
    }
    container.innerHTML = html;
}

// --- 2. CHARTS (RADAR & WAVE) ---
function renderCharts() {
    // Radar Chart
    const ctxRadar = document.getElementById('radarChart').getContext('2d');
    new Chart(ctxRadar, {
        type: 'radar',
        data: {
            labels: ['HTML/CSS', 'JavaScript', 'React', 'Testing', 'DevOps', 'Soft Skills'],
            datasets: [{
                label: 'You', data: [90, 85, 88, 60, 40, 75],
                backgroundColor: 'rgba(33, 150, 243, 0.2)', borderColor: '#2196f3', borderWidth: 2,
                pointBackgroundColor: '#2196f3'
            }, {
                label: 'Class Avg', data: [70, 75, 60, 50, 45, 65],
                backgroundColor: 'rgba(200, 200, 200, 0.2)', borderColor: '#ccc', borderWidth: 1,
                pointBackgroundColor: '#ccc'
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: { r: { ticks: { display: false }, grid: { color: '#f0f0f0' }, pointLabels: { font: { size: 9 } } } },
            maintainAspectRatio: false
        }
    });

    // Wave Chart (Line Chart Simpel)
    const ctxWave = document.getElementById('waveChart').getContext('2d');
    new Chart(ctxWave, {
        type: 'line',
        data: {
            labels: ['M','T','W','T','F','S','S'],
            datasets: [{
                data: [30, 50, 40, 60, 50, 70, 60],
                borderColor: '#4dd0e1', borderWidth: 2,
                backgroundColor: 'rgba(77, 208, 225, 0.3)', fill: true, pointRadius: 0, tension: 0.4
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false } },
            maintainAspectRatio: false
        }
    });
}

// --- 3. SIDEBAR TOGGLE (MOBILE) ---
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}