/* ===== Mind 'n Margin — halaman Home ===== */

const STORAGE_KEY = 'mindnmargin-home-v1';
const MAX_TRANSAKSI_TAMPIL = 5;

/* ---------- Kata-kata motivasi (1 hari 1 kata, gonta-ganti otomatis) ---------- */
const QUOTES = [
    'Everything in this world requires a process, including you',
    'Small steps every day still move you forward',
    'Done is better than perfect, start where you are',
    'Your future is built by what you do today',
    'Progress is quiet, but it adds up',
    'Be patient with yourself, growth takes time',
    'Discipline is choosing what you want most over what you want now',
    'One focused hour beats a distracted day',
    'Save a little, learn a little, grow a lot',
    'Rest is part of the process, not a break from it',
    'You do not have to be fast, you just have to keep going',
    'Every checked box is a promise you kept to yourself',
    'Make your money work as hard as you do',
    'Tomorrow-you will thank today-you for starting',
    'A messy start is still a start'
];

function quoteHariIni(tanggal) {
    // Hitung nomor hari (bukan jam) supaya ganti tepat saat tengah malam waktu lokal
    const nomorHari = Math.floor(
        Date.UTC(tanggal.getFullYear(), tanggal.getMonth(), tanggal.getDate()) / 86400000
    );
    return QUOTES[nomorHari % QUOTES.length];
}

/* ---------- Helper ---------- */
function kunciTanggal(tanggal) {
    const y = tanggal.getFullYear();
    const m = String(tanggal.getMonth() + 1).padStart(2, '0');
    const d = String(tanggal.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
}

function rupiah(angka) {
    return 'Rp' + Math.abs(angka).toLocaleString('id-ID');
}

/* ---------- Data (tersimpan di localStorage supaya tidak hilang saat refresh) ---------- */
function dataAwal() {
    const hariIni = kunciTanggal(new Date());
    return {
        saldo: 3250000,
        tasks: [
            { text: 'Belajar Bootstrap', done: true },
            { text: 'Review sistem digital', done: true },
            { text: 'Menyelesaikan laprak', done: true },
            { text: 'Rapikan catatan kuliah', done: false }
        ],
        // Urutan: yang paling baru di atas
        transactions: [
            { name: 'Air mineral', amount: 6000, tgl: hariIni },
            { name: 'Parkir', amount: 2000, tgl: hariIni },
            { name: 'Print tugas', amount: 3000, tgl: hariIni },
            { name: 'Makan siang', amount: 15000, tgl: hariIni },
            { name: 'Beli kopi', amount: 14000, tgl: hariIni }
        ]
    };
}

function muatData() {
    try {
        const mentah = localStorage.getItem(STORAGE_KEY);
        if (mentah) return JSON.parse(mentah);
    } catch (e) {
        console.error('Gagal memuat data dari localStorage:', e);
    }
    return dataAwal();
}

function simpanData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('Gagal menyimpan data ke localStorage:', e);
    }
}

const state = muatData();

/* ---------- Header: tanggal, quote, highlight chart ---------- */
const sekarang = new Date();

document.getElementById('tanggal').textContent =
    sekarang.toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

document.getElementById('quote').textContent = quoteHariIni(sekarang);

// Senin = index 0 ... Minggu = index 6
const indexHariIni = (sekarang.getDay() + 6) % 7;
document.querySelectorAll('#chart-bars .bar-item').forEach((item, i) => {
    if (i === indexHariIni) item.classList.add('today');
    if (i > indexHariIni) item.classList.add('future');
});

/* ---------- Render: To-Do ---------- */
const todoList = document.getElementById('todo-list');
const tugasCount = document.getElementById('tugas-count');

function renderTugas() {
    todoList.innerHTML = '';

    if (state.tasks.length === 0) {
        const kosong = document.createElement('li');
        kosong.className = 'empty';
        kosong.textContent = 'Belum ada tugas. Tambah dulu yuk!';
        todoList.appendChild(kosong);
    }

    state.tasks.forEach((tugas) => {
        const li = document.createElement('li');
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        const teks = document.createElement('span');

        checkbox.type = 'checkbox';
        checkbox.checked = tugas.done;
        teks.textContent = tugas.text;

        checkbox.addEventListener('change', () => {
            tugas.done = checkbox.checked;
            simpanData();
            renderRingkasanTugas();
        });

        label.appendChild(checkbox);
        label.appendChild(teks);
        li.appendChild(label);
        todoList.appendChild(li);
    });

    renderRingkasanTugas();
}

function renderRingkasanTugas() {
    const selesai = state.tasks.filter((t) => t.done).length;
    tugasCount.textContent = selesai + '/' + state.tasks.length + ' Selesai';
}

/* ---------- Render: Transaksi + ringkasan keuangan ---------- */
const transactionList = document.getElementById('transaction-list');

function renderTransaksi() {
    transactionList.innerHTML = '';

    if (state.transactions.length === 0) {
        const kosong = document.createElement('li');
        kosong.className = 'empty';
        kosong.textContent = 'Belum ada transaksi.';
        transactionList.appendChild(kosong);
    }

    state.transactions.slice(0, MAX_TRANSAKSI_TAMPIL).forEach((trx) => {
        const li = document.createElement('li');
        const nama = document.createElement('span');
        const jumlah = document.createElement('span');

        nama.className = 'item-name';
        nama.textContent = trx.name;
        jumlah.className = 'item-amount';
        jumlah.textContent = '-' + rupiah(trx.amount);

        li.appendChild(nama);
        li.appendChild(jumlah);
        transactionList.appendChild(li);
    });

    renderRingkasanKeuangan();
}

function renderRingkasanKeuangan() {
    const hariIni = kunciTanggal(new Date());
    const transaksiHariIni = state.transactions.filter((t) => t.tgl === hariIni);
    const totalHariIni = transaksiHariIni.reduce((jumlah, t) => jumlah + t.amount, 0);

    document.getElementById('pengeluaran-value').textContent = '-' + rupiah(totalHariIni);
    document.getElementById('pengeluaran-note').textContent =
        transaksiHariIni.length + ' transaksi hari ini';

    const saldoEl = document.getElementById('saldo-value');
    const statusEl = document.getElementById('saldo-status');
    saldoEl.textContent = (state.saldo < 0 ? '-' : '') + rupiah(state.saldo);

    statusEl.classList.remove('ok', 'warn');
    if (state.saldo >= 500000) {
        statusEl.textContent = 'Status: Aman';
        statusEl.classList.add('ok');
    } else if (state.saldo >= 0) {
        statusEl.textContent = 'Status: Menipis';
        statusEl.classList.add('warn');
    } else {
        statusEl.textContent = 'Status: Minus';
        statusEl.classList.add('warn');
    }
}

/* ---------- Pop up (dialog) ---------- */
function pasangDialog(idDialog, idTombolBuka, idForm, saatSubmit) {
    const dialog = document.getElementById(idDialog);
    const form = document.getElementById(idForm);

    document.getElementById(idTombolBuka).addEventListener('click', () => {
        form.reset();
        dialog.showModal();
        form.querySelector('input').focus();
    });

    dialog.querySelectorAll('[data-close]').forEach((tombol) => {
        tombol.addEventListener('click', () => dialog.close());
    });

    // Klik area gelap di luar kotak = tutup
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.close();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saatSubmit(form.elements);
        dialog.close();
    });
}

pasangDialog('dialog-tugas', 'btn-tambah-tugas', 'form-tugas', (field) => {
    const teks = field.nama.value.trim();
    if (!teks) return;

    state.tasks.push({ text: teks, done: false });
    simpanData();
    renderTugas();
    todoList.scrollTop = todoList.scrollHeight;
});

pasangDialog('dialog-transaksi', 'btn-catat-transaksi', 'form-transaksi', (field) => {
    const nama = field.nama.value.trim();
    const jumlah = Math.round(Number(field.jumlah.value));
    if (!nama || !(jumlah > 0)) return;

    state.transactions.unshift({ name: nama, amount: jumlah, tgl: kunciTanggal(new Date()) });
    state.saldo -= jumlah;
    simpanData();
    renderTransaksi();
});

/* ---------- Jalankan ---------- */
renderTugas();
renderTransaksi();
