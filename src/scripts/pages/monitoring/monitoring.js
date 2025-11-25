// --- MENTORING.JS ---

// Fungsi untuk mengganti Tab (Schedule <-> Reschedule)
function switchTab(tabName) {
    // Ambil semua tombol toggle
    const buttons = document.querySelectorAll('.toggle-btn');
    
    // Ambil container view
    const scheduleView = document.getElementById('view-my-schedule');
    const rescheduleView = document.getElementById('view-reschedule');

    // Reset kelas active pada semua tombol
    buttons.forEach(btn => btn.classList.remove('active'));

    // Logika Switch
    if (tabName === 'schedule') {
        // Tampilkan Schedule
        scheduleView.style.display = 'grid';
        rescheduleView.style.display = 'none';
        buttons[0].classList.add('active'); // Tombol pertama (My Schedule)
    } else if (tabName === 'reschedule') {
        // Tampilkan Reschedule
        scheduleView.style.display = 'none';
        rescheduleView.style.display = 'grid';
        buttons[1].classList.add('active'); // Tombol kedua (Reschedule)
    }
}

// Event Listener untuk tombol Join & Feedback (Simulasi)
const joinBtns = document.querySelectorAll('.btn-join');
joinBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        if(this.innerText === "Request Reschedule") {
            alert('Permintaan Reschedule berhasil dikirim!');
        } else {
            alert('Mengarahkan ke Zoom Meeting...');
        }
    });
});

const feedbackBtns = document.querySelectorAll('.btn-feedback');
feedbackBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        alert('Membuka form feedback...');
    });
});