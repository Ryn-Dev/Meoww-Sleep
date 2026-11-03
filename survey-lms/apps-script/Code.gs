/* ============================================================
   Kuesioner Kepuasan LMS — Google Apps Script
   ------------------------------------------------------------
   Cara pakai singkat:
   1. Buka Spreadsheet → Extensions → Apps Script.
   2. Ganti isi Code.gs dengan file ini, simpan (Ctrl+S).
   3. Sesuaikan SECRET (boleh dikosongkan) di bawah.
   4. Pilih fungsi setupSheet di toolbar lalu klik Run (izinkan akses).
   5. Deploy → New deployment → Web app
      - Execute as: Me
      - Who has access: Anyone
   6. Salin URL yang berakhiran /exec ke survey/assets/config.js.
   ============================================================ */

/* ---------- Pengaturan ---------- */

// Kosongkan untuk memakai spreadsheet tempat script ini terpasang (disarankan).
// Isi dengan ID spreadsheet bila script berdiri sendiri (standalone).
const SHEET_ID = '';

const SHEET_NAME = 'Respon';
const REKAP_NAME = 'Rekap';
const VISUAL_NAME = 'Visualisasi';
const PENGATURAN_NAME = 'Pengaturan';

// Harus sama dengan TOKEN di survey/assets/config.js.
// Bisa juga diatur langsung dari Google Spreadsheet di tab "Pengaturan" cell B3.
// Kosongkan ('') kalau tidak ingin memakai token.
const SECRET = 'ganti-token-acak';

// Opsional: PIN proteksi dashboard (mis. '123456').
// LEBIH MUDAH: Atur langsung di Google Spreadsheet pada tab "Pengaturan" cell B2!
// Kosongkan ('') agar ringkasan agregat bisa langsung dibuka tanpa PIN.
const DASHBOARD_PIN = '';

const PERAN_LIST = ['mahasiswa', 'dosen', 'admin'];

const PERAN_LABEL = {
  mahasiswa: 'Mahasiswa',
  dosen: 'Mentor',
  admin: 'Pimpinan'
};

const PRODI = [
  { kode: '58302', nama: 'Teknologi Rekayasa Perangkat Lunak' },
  { kode: '90343', nama: 'Teknologi Rekayasa Multimedia Grafis' },
  { kode: '90346', nama: 'Teknologi Rekayasa Komputer Jaringan' }
];

const EUCS_LABEL = {
  C: 'Content',
  A: 'Accuracy',
  F: 'Format',
  E: 'Ease of Use',
  T: 'Timeliness'
};

const EUCS_ORDER = ['C', 'A', 'F', 'E', 'T'];

/* ---------- Daftar butir (harus sinkron dengan assets/questions.js) ---------- */

const ITEMS = [
  // Mahasiswa
  { id: 'M1', peran: 'mahasiswa', fitur: 'Login', eucs: 'E', teks: 'Proses login ke LMS mudah dan lancar' },
  { id: 'M2', peran: 'mahasiswa', fitur: 'Umum', eucs: 'F', teks: 'Tampilan LMS menarik dan rapi' },
  { id: 'M3', peran: 'mahasiswa', fitur: 'Umum', eucs: 'E', teks: 'Menu dan fitur mudah ditemukan' },
  { id: 'M4', peran: 'mahasiswa', fitur: 'Umum', eucs: 'F', teks: 'LMS nyaman digunakan melalui HP' },
  { id: 'M5', peran: 'mahasiswa', fitur: 'Registrasi Kelas', eucs: 'E', teks: 'Proses registrasi/pemilihan kelas mudah dilakukan' },
  { id: 'M6', peran: 'mahasiswa', fitur: 'Kelas/Jadwal', eucs: 'C', teks: 'Informasi jadwal kelas jelas' },
  { id: 'M7', peran: 'mahasiswa', fitur: 'Materi', eucs: 'E', teks: 'Materi perkuliahan mudah diakses' },
  { id: 'M8', peran: 'mahasiswa', fitur: 'Materi', eucs: 'T', teks: 'Materi tersedia tepat waktu sesuai jadwal' },
  { id: 'M9', peran: 'mahasiswa', fitur: 'Tugas', eucs: 'C', teks: 'Instruksi dan batas waktu tugas jelas' },
  { id: 'M10', peran: 'mahasiswa', fitur: 'Tugas', eucs: 'E', teks: 'Proses pengumpulan tugas (reguler, harian, pekanan) mudah' },
  { id: 'M11', peran: 'mahasiswa', fitur: 'Tugas', eucs: 'C', teks: 'Nilai dan umpan balik tugas dari mentor dapat saya lihat dengan jelas' },
  { id: 'M12', peran: 'mahasiswa', fitur: 'Absensi', eucs: 'E', teks: 'Absensi mudah dilakukan' },
  { id: 'M13', peran: 'mahasiswa', fitur: 'Absensi', eucs: 'A', teks: 'Rekap kehadiran saya ditampilkan dengan akurat' },
  { id: 'M14', peran: 'mahasiswa', fitur: 'Laporan Ibadah', eucs: 'E', teks: 'Pengisian Laporan Ibadah mudah dilakukan' },
  { id: 'M15', peran: 'mahasiswa', fitur: 'Laporan Ibadah', eucs: 'C', teks: 'Laporan Ibadah membantu saya mengevaluasi konsistensi ibadah' },
  { id: 'M16', peran: 'mahasiswa', fitur: 'SKL', eucs: 'E', teks: 'Upload berkas SKL (buku, portofolio, project, sertifikat) mudah' },
  { id: 'M17', peran: 'mahasiswa', fitur: 'SKL', eucs: 'C', teks: 'Progres/status SKL saya mudah dipantau' },
  { id: 'M18', peran: 'mahasiswa', fitur: 'Performa', eucs: 'T', teks: 'Halaman LMS terbuka dengan cepat' },
  { id: 'M19', peran: 'mahasiswa', fitur: 'Performa', eucs: 'A', teks: 'LMS jarang mengalami error saat digunakan' },
  { id: 'M20', peran: 'mahasiswa', fitur: 'Manfaat', eucs: 'C', teks: 'LMS membantu proses belajar saya' },

  // Mentor
  { id: 'D1', peran: 'dosen', fitur: 'Umum', eucs: 'F', teks: 'Tampilan LMS mudah dipahami' },
  { id: 'D2', peran: 'dosen', fitur: 'Jadwal', eucs: 'C', teks: 'Informasi jadwal mengajar jelas' },
  { id: 'D3', peran: 'dosen', fitur: 'Kelas', eucs: 'E', teks: 'Mengelola kelas dan kelas harian mudah dilakukan' },
  { id: 'D4', peran: 'dosen', fitur: 'Materi', eucs: 'E', teks: 'Upload materi (file/video) mudah dilakukan' },
  { id: 'D5', peran: 'dosen', fitur: 'Tugas', eucs: 'E', teks: 'Membuat tugas (reguler, harian, pekanan) mudah dilakukan' },
  { id: 'D6', peran: 'dosen', fitur: 'Tugas', eucs: 'E', teks: 'Melihat pengumpulan tugas mahasiswa mudah' },
  { id: 'D7', peran: 'dosen', fitur: 'Penilaian', eucs: 'E', teks: 'Proses pemberian nilai efisien' },
  { id: 'D8', peran: 'dosen', fitur: 'Absensi', eucs: 'A', teks: 'Rekap absensi mahasiswa akurat' },
  { id: 'D9', peran: 'dosen', fitur: 'SKL', eucs: 'E', teks: 'Proses verifikasi SKL mahasiswa mudah' },
  { id: 'D10', peran: 'dosen', fitur: 'Monitoring', eucs: 'C', teks: 'LMS membantu saya memantau perkembangan mahasiswa (akademik, ibadah, SKL)' },
  { id: 'D11', peran: 'dosen', fitur: 'Data', eucs: 'T', teks: 'Data yang ditampilkan selalu terbaru (up to date)' },
  { id: 'D12', peran: 'dosen', fitur: 'Manfaat', eucs: 'T', teks: 'LMS menghemat waktu administrasi dibanding cara manual' },
  { id: 'D13', peran: 'dosen', fitur: 'Performa', eucs: 'T', teks: 'Halaman LMS terbuka dengan cepat' },
  { id: 'D14', peran: 'dosen', fitur: 'Performa', eucs: 'A', teks: 'LMS jarang mengalami error saat digunakan' },

  // Pimpinan
  { id: 'P1', peran: 'admin', fitur: 'Dashboard', eucs: 'C', teks: 'Dashboard memberikan gambaran ringkas kondisi pembelajaran' },
  { id: 'P2', peran: 'admin', fitur: 'Grafik', eucs: 'F', teks: 'Grafik absensi dan kelas harian mudah dipahami' },
  { id: 'P3', peran: 'admin', fitur: 'Grafik SKL', eucs: 'C', teks: 'Grafik SKL memberikan informasi yang saya butuhkan' },
  { id: 'P4', peran: 'admin', fitur: 'Grafik Ibadah', eucs: 'C', teks: 'Grafik Laporan Ibadah memberikan informasi yang saya butuhkan' },
  { id: 'P5', peran: 'admin', fitur: 'Monitoring', eucs: 'C', teks: 'Fitur Monitoring Mentor/Asdos membantu mengevaluasi kinerja pengajar' },
  { id: 'P6', peran: 'admin', fitur: 'Monitoring', eucs: 'C', teks: 'Fitur Monitoring Mahasiswa membantu mengidentifikasi mahasiswa yang perlu perhatian' },
  { id: 'P7', peran: 'admin', fitur: 'Data', eucs: 'A', teks: 'Data yang ditampilkan akurat' },
  { id: 'P8', peran: 'admin', fitur: 'Data', eucs: 'T', teks: 'Data yang ditampilkan selalu terbaru (real-time / up to date)' },
  { id: 'P9', peran: 'admin', fitur: 'Filter', eucs: 'E', teks: 'Filter data (periode, kelas, angkatan) sudah memadai' },
  { id: 'P10', peran: 'admin', fitur: 'Laporan', eucs: 'F', teks: 'Laporan dapat dicetak/diekspor sesuai kebutuhan' },
  { id: 'P11', peran: 'admin', fitur: 'Keamanan', eucs: 'A', teks: 'Pengaturan hak akses pengguna sudah aman dan sesuai' },
  { id: 'P12', peran: 'admin', fitur: 'Manfaat', eucs: 'C', teks: 'LMS membantu saya dalam pengambilan keputusan' },
  { id: 'P13', peran: 'admin', fitur: 'Manfaat', eucs: 'C', teks: 'LMS sesuai dengan tujuan dan kebutuhan lembaga' }
];

/* ---------- Susunan kolom sheet Respon ---------- */

const HEADERS = (function () {
  const out = [
    'timestamp', 'id_respon', 'versi_form', 'peran', 'nama', 'nim', 'prodi', 'kode_prodi',
    'lama_penggunaan', 'frekuensi_akses', 'perangkat', 'durasi_detik', 'user_agent'
  ];
  ITEMS.forEach(function (it) { out.push(it.id); });
  out.push('Z1', 'Z2');
  out.push('M_OPEN_1', 'M_OPEN_2', 'D_OPEN_1', 'D_OPEN_2', 'P_OPEN_1', 'P_OPEN_2', 'Z3');
  return out;
})();

const SCORE_IDS = ITEMS.map(function (it) { return it.id; });
const OPEN_IDS = ['M_OPEN_1', 'M_OPEN_2', 'D_OPEN_1', 'D_OPEN_2', 'P_OPEN_1', 'P_OPEN_2', 'Z3'];

const ITEM_ROLE_MAP = (function () {
  const map = {};
  ITEMS.forEach(function (it) { map[it.id] = it.peran; });
  return map;
})();

const OPEN_ROLE_MAP = {
  M_OPEN_1: 'mahasiswa',
  M_OPEN_2: 'mahasiswa',
  D_OPEN_1: 'dosen',
  D_OPEN_2: 'dosen',
  P_OPEN_1: 'admin',
  P_OPEN_2: 'admin',
  Z3: '*'
};

const OPEN_QUESTIONS_META = {
  M_OPEN_1: { peran: 'mahasiswa', label: 'Fitur apa yang paling bermanfaat bagi Anda?' },
  M_OPEN_2: { peran: 'mahasiswa', label: 'Kendala apa yang paling sering Anda alami?' },
  D_OPEN_1: { peran: 'dosen', label: 'Pekerjaan apa yang masih terasa repot di LMS?' },
  D_OPEN_2: { peran: 'dosen', label: 'Fitur apa yang perlu ditambahkan untuk membantu mengajar?' },
  P_OPEN_1: { peran: 'admin', label: 'Laporan/informasi apa yang belum tersedia namun Anda butuhkan?' },
  P_OPEN_2: { peran: 'admin', label: 'Apa prioritas pengembangan LMS ke depan menurut Anda?' },
  Z3: { peran: '*', label: 'Kritik dan saran untuk pengembangan LMS' }
};

const PROFILE_OPTIONS = {
  lama: ['Kurang dari 1 bulan', '1–3 bulan', '3–6 bulan', 'Lebih dari 6 bulan'],
  frekuensi: ['Setiap hari', 'Beberapa kali seminggu', 'Seminggu sekali', 'Jarang'],
  perangkat: ['HP', 'Laptop / PC', 'Tablet']
};

const TEXT_HEADERS = [
  'id_respon', 'versi_form', 'peran', 'nama', 'nim', 'prodi', 'kode_prodi',
  'lama_penggunaan', 'frekuensi_akses', 'perangkat', 'user_agent'
].concat(OPEN_IDS);

const ITEMS_BY_ROLE = {
  mahasiswa: ITEMS.filter(function (it) { return it.peran === 'mahasiswa'; }),
  dosen: ITEMS.filter(function (it) { return it.peran === 'dosen'; }),
  admin: ITEMS.filter(function (it) { return it.peran === 'admin'; })
};

/* ---------- Pembacaan Pengaturan dari Spreadsheet ---------- */

function getDashboardPin_() {
  try {
    const ss = getSS_();
    const sh = ss.getSheetByName(PENGATURAN_NAME);
    if (sh && sh.getLastRow() >= 2) {
      // Cell B2 pada sheet Pengaturan menyimpan Kode Akses Dashboard (PIN)
      const val = String(sh.getRange(2, 2).getValue() || '').trim();
      if (val !== '') return val;
    }
  } catch (err) {
    console.warn('Gagal membaca PIN dari sheet Pengaturan: ' + err);
  }
  return String(DASHBOARD_PIN || '').trim();
}

function getSecretToken_() {
  try {
    const ss = getSS_();
    const sh = ss.getSheetByName(PENGATURAN_NAME);
    if (sh && sh.getLastRow() >= 3) {
      // Cell B3 pada sheet Pengaturan menyimpan Token Formulir (Secret)
      const val = String(sh.getRange(3, 2).getValue() || '').trim();
      if (val !== '') return val;
    }
  } catch (err) {
    console.warn('Gagal membaca Token dari sheet Pengaturan: ' + err);
  }
  return String(SECRET || '').trim();
}

/* ---------- Entry point ---------- */

function doGet(e) {
  const params = (e && e.parameter) ? e.parameter : {};
  if (params.mode === 'rekap') {
    const requiredPin = getDashboardPin_();
    if (requiredPin && String(params.pin || '').trim() !== requiredPin) {
      return json_({ ok: false, error: 'pin_diperlukan' });
    }
    try {
      const data = buildDashboardData_(params);
      data.pin_required = Boolean(requiredPin);
      return json_(data);
    } catch (err) {
      console.error(err);
      return json_({ ok: false, error: 'gagal_memuat_rekap' });
    }
  }

  return json_({
    ok: true,
    service: 'Kuesioner Kepuasan LMS',
    version: 'v1',
    endpoints: { submit: 'POST /exec', dashboard: 'GET /exec?mode=rekap' },
    message: 'Endpoint Web App aktif. Pengiriman jawaban menggunakan metode POST dari formulir.'
  });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (err) {
    return json_({ ok: false, error: 'sibuk' });
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json_({ ok: false, error: 'kosong' });
    }

    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      return json_({ ok: false, error: 'json_tidak_valid' });
    }

    if (!data || typeof data !== 'object') {
      return json_({ ok: false, error: 'json_tidak_valid' });
    }

    const requiredToken = getSecretToken_();
    if (requiredToken && String(data.token || '') !== requiredToken) {
      return json_({ ok: false, error: 'token' });
    }

    const peran = String(data.peran || '');
    if (PERAN_LIST.indexOf(peran) === -1) {
      return json_({ ok: false, error: 'peran_tidak_valid' });
    }

    const nama = clean_(data.nama, 120);
    if (!nama) {
      return json_({ ok: false, error: 'nama_kosong' });
    }

    // NIM hanya untuk mahasiswa. Tidak ada pencocokan ke daftar mana pun.
    const nim = peran === 'mahasiswa' ? clean_(data.nim, 40) : '';
    if (peran === 'mahasiswa' && !nim) {
      return json_({ ok: false, error: 'nim_kosong' });
    }

    // Penjagaan bentuk data saja (bukan verifikasi responden).
    const scoreError = validateScores_(peran, data);
    if (scoreError) {
      return json_({ ok: false, error: scoreError });
    }

    const sheet = getSheet_();
    const idRespon = clean_(data.id_respon, 64);

    // Cegah baris ganda akibat retry teknis (fallback no-cors / antrean offline)
    // untuk klik kirim yang persis sama. Pengisian ulang tetap bebas karena id_respon baru.
    const existingRow = findRowByResponseId_(sheet, idRespon);
    if (existingRow > 0) {
      return json_({ ok: true, baris: existingRow, duplikat_id: true });
    }

    const row = buildRow_(data, { nama: nama, nim: nim, id_respon: idRespon });
    const target = sheet.getLastRow() + 1;
    ensureRows_(sheet, target);

    const targetRange = sheet.getRange(target, 1, 1, HEADERS.length);
    targetRange.setBackground(null).setFontColor('#0f172a').setFontWeight('normal').setVerticalAlignment('top');
    sheet.getRange(target, colIndex_('nim')).setNumberFormat('@');
    sheet.getRange(target, colIndex_('kode_prodi')).setNumberFormat('@');
    targetRange.setValues([row]);

    return json_({ ok: true, baris: target });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server_error' });
  } finally {
    lock.releaseLock();
  }
}

/* ---------- Setup (jalankan sekali dari editor) ---------- */

function setupSheet() {
  const sheet = getSheet_();
  formatSheet_(sheet);
  const rekap = buildRekap();
  const visual = buildVisualisasi();
  const pengaturan = setupPengaturan();
  const message =
    'Sheet "' + SHEET_NAME + '" siap (' + HEADERS.length + ' kolom, ' +
    Math.max(0, sheet.getLastRow() - 1) + ' baris data). ' + rekap + ' ' + visual + ' ' + pengaturan;
  console.log(message);
  return message;
}

function setupPengaturan() {
  const ss = getSS_();
  let sh = ss.getSheetByName(PENGATURAN_NAME);
  if (!sh) {
    sh = ss.insertSheet(PENGATURAN_NAME);
  }
  ensureColumns_(sh, 3);
  ensureRows_(sh, 6);

  // Header
  sh.getRange(1, 1, 1, 3).merge()
    .setValue('Pengaturan Kuesioner & Dashboard LMS')
    .setFontFamily('Inter').setFontSize(14).setFontWeight('bold')
    .setFontColor('#ffffff').setBackground('#1e1b4b')
    .setVerticalAlignment('middle');
  sh.setRowHeight(1, 38);

  // Row 2: PIN Dashboard
  sh.getRange(2, 1).setValue('Kode Akses Dashboard (PIN)').setFontWeight('bold');
  const cellPin = sh.getRange(2, 2);
  const currentPin = cellPin.getValue();
  cellPin.setNumberFormat('@');
  if (currentPin === '' && DASHBOARD_PIN) {
    cellPin.setValue(DASHBOARD_PIN);
  }
  sh.getRange(2, 3).setValue('Ketik kode/PIN di kolom B untuk mengunci dashboard. Kosongkan cell ini jika dashboard ingin dibuka tanpa kode.')
    .setFontColor('#64748b').setFontSize(9);

  // Row 3: Token Form (Secret)
  sh.getRange(3, 1).setValue('Token Form (Secret)').setFontWeight('bold');
  const cellToken = sh.getRange(3, 2);
  const currentToken = cellToken.getValue();
  cellToken.setNumberFormat('@');
  if (currentToken === '' && SECRET) {
    cellToken.setValue(SECRET);
  }
  sh.getRange(3, 3).setValue('Harus sama dengan TOKEN di assets/config.js. Kosongkan jika tanpa token.')
    .setFontColor('#64748b').setFontSize(9);

  // Row 4: Status Proteksi
  sh.getRange(4, 1).setValue('Status Proteksi Dashboard').setFontWeight('bold');
  sh.getRange(4, 2).setFormula('=IF(ISBLANK(B2),"TERBUKA (Tanpa PIN)","TERKUNCI (Memerlukan PIN)")')
    .setFontWeight('bold');
  sh.getRange(4, 3).setValue('Status proteksi otomatis terbaca oleh script saat dashboard dibuka.')
    .setFontColor('#64748b').setFontSize(9);

  // Styling
  sh.setColumnWidth(1, 230);
  sh.setColumnWidth(2, 180);
  sh.setColumnWidth(3, 440);
  sh.setRowHeight(2, 30);
  sh.setRowHeight(3, 30);
  sh.setRowHeight(4, 30);
  sh.setTabColor('#f59e0b');
  sh.getRange(2, 1, 3, 3).setFontFamily('Inter').setFontSize(10).setVerticalAlignment('middle');
  sh.getRange(2, 2, 2, 1).setBackground('#fffbeb').setFontColor('#0f172a');

  return 'Sheet "' + PENGATURAN_NAME + '" siap.';
}

function buildRekap() {
  getSheet_();
  const ss = getSS_();
  let sh = ss.getSheetByName(REKAP_NAME);
  if (!sh) {
    sh = ss.insertSheet(REKAP_NAME);
  } else {
    sh.clear();
    sh.clearNotes();
  }
  const LAST_COL = 9;
  ensureColumns_(sh, LAST_COL);
  ensureRows_(sh, ITEMS.length + PRODI.length + 75);
  sh.getBandings().forEach(function (banding) { banding.remove(); });
  sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).breakApart();
  const C = {
    timestamp: colOf_('timestamp'),
    peran: colOf_('peran'),
    prodi: colOf_('prodi'),
    kode: colOf_('kode_prodi'),
    z1: colOf_('Z1'),
    z2: colOf_('Z2'),
    durasi: colOf_('durasi_detik'),
    lama: colOf_('lama_penggunaan'),
    frekuensi: colOf_('frekuensi_akses'),
    perangkat: colOf_('perangkat')
  };

  function ref_(col) {
    return 'Respon!$' + col + '$2:$' + col;
  }

  /* Judul */
  sh.getRange(1, 1, 1, LAST_COL).merge()
    .setValue('Rekap Kuesioner Kepuasan LMS')
    .setFontSize(16).setFontWeight('bold')
    .setFontColor('#ffffff').setBackground('#1e1b4b')
    .setVerticalAlignment('middle');
  sh.setRowHeight(1, 42);

  sh.getRange(2, 1, 1, LAST_COL).merge()
    .setValue('Dihitung otomatis dari sheet "Respon". Jangan ubah urutan kolom Respon; ' +
      'setelah mengubah struktur, jalankan menu Kuesioner LMS → Bangun ulang sheet Rekap.')
    .setFontSize(9).setFontColor('#475569')
    .setVerticalAlignment('middle');
  sh.setRowHeight(2, 28);

  /* Ringkasan */
  let r = 4;
  section_(sh, r++, 'Ringkasan', LAST_COL);

  summary_(sh, r++, 'Jumlah respons', '=COUNTA(' + ref_(C.timestamp) + ')', '#,##0');
  summary_(sh, r++, 'Mahasiswa', '=COUNTIF(' + ref_(C.peran) + ',"mahasiswa")', '#,##0');
  summary_(sh, r++, 'Mentor', '=COUNTIF(' + ref_(C.peran) + ',"dosen")', '#,##0');
  summary_(sh, r++, 'Pimpinan', '=COUNTIF(' + ref_(C.peran) + ',"admin")', '#,##0');
  const rowZ1 = r;
  summary_(sh, r++, 'Rata-rata kepuasan keseluruhan (Z1, 1–5)',
    '=IFERROR(AVERAGE(' + ref_(C.z1) + '),"")', '0.00');
  summary_(sh, r++, 'Indeks kepuasan (Z1 ÷ 5)',
    '=IFERROR(B' + rowZ1 + '/5,"")', '0.0%');
  const rowNps = r;
  summary_(sh, r++, 'NPS (Z2)',
    '=IFERROR((COUNTIF(' + ref_(C.z2) + ',">=9")-COUNTIF(' + ref_(C.z2) + ',"<=6"))/' +
    'COUNT(' + ref_(C.z2) + '),"")', '0.0%');
  summary_(sh, r++, 'Kategori NPS',
    '=IF(B' + rowNps + '="","",IF(B' + rowNps + '>=0.5,"Sangat baik",' +
    'IF(B' + rowNps + '>=0,"Baik","Perlu perbaikan")))', '');
  summary_(sh, r++, 'Rata-rata durasi pengisian (detik)',
    '=IFERROR(AVERAGE(' + ref_(C.durasi) + '),"")', '#,##0');
  summary_(sh, r++, 'Jumlah butir dinilai',
    ITEMS.length, '#,##0');

  r++;
  sh.getRange(r, 1, 1, LAST_COL).merge()
    .setValue('Catatan: jumlah respons tidak sama dengan jumlah orang. Tidak ada verifikasi atau dedupe; ' +
      'periksa id_respon/nim yang sama secara manual sebelum analisis.')
    .setFontSize(9).setFontColor('#b45309')
    .setBackground('#fffbeb').setWrap(true).setVerticalAlignment('middle');
  sh.setRowHeight(r, 30);
  r += 2;

  /* Rata-rata per butir */
  section_(sh, r++, 'Rata-rata per butir', LAST_COL);
  const itemHead = r;
  tableHeader_(sh, r++, ['Peran', 'Kode', 'Pernyataan', 'Fitur', 'EUCS', 'Rata-rata', 'Jumlah jawaban', 'Indeks (%)', 'Kategori']);
  const itemStart = r;

  ITEMS.forEach(function (item) {
    const col = colOf_(item.id);
    const ref = 'Respon!$' + col + '$2:$' + col;
    sh.getRange(r, 1).setValue(PERAN_LABEL[item.peran]);
    sh.getRange(r, 2).setValue(item.id);
    sh.getRange(r, 3).setValue(item.teks);
    sh.getRange(r, 4).setValue(item.fitur);
    sh.getRange(r, 5).setValue(item.eucs).setHorizontalAlignment('center');
    sh.getRange(r, 6)
      .setFormula('=IFERROR(AVERAGE(' + ref + '),"")')
      .setNumberFormat('0.00').setHorizontalAlignment('center');
    sh.getRange(r, 7)
      .setFormula('=COUNT(' + ref + ')')
      .setNumberFormat('#,##0').setHorizontalAlignment('center');
    sh.getRange(r, 8)
      .setFormula('=IFERROR(F' + r + '/5,"")')
      .setNumberFormat('0.0%').setHorizontalAlignment('center');
    sh.getRange(r, 9)
      .setFormula('=IF(F' + r + '="","",IF(F' + r + '>=4.2,"Sangat puas",' +
        'IF(F' + r + '>=3.4,"Puas",IF(F' + r + '>=2.6,"Cukup",' +
        'IF(F' + r + '>=1.8,"Tidak puas","Sangat tidak puas")))))')
      .setHorizontalAlignment('center');
    r++;
  });
  const itemEnd = r - 1;
  sh.getRange(itemStart, 3, itemEnd - itemStart + 1, 1).setWrap(true).setVerticalAlignment('top');
  if (itemHead < itemEnd) {
    sh.getRange(itemHead, 1, itemEnd - itemHead + 1, LAST_COL)
      .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false);
    tableHeader_(sh, itemHead, ['Peran', 'Kode', 'Pernyataan', 'Fitur', 'EUCS', 'Rata-rata', 'Jumlah jawaban', 'Indeks (%)', 'Kategori']);
  }

  /* Rata-rata per dimensi EUCS */
  r++;
  section_(sh, r++, 'Rata-rata per dimensi EUCS', LAST_COL);
  tableHeader_(sh, r++, ['Peran', 'Dimensi', 'Kode', 'Jumlah butir', 'Rata-rata', 'Indeks (%)']);
  const dimStart = r;

  PERAN_LIST.forEach(function (peran) {
    EUCS_ORDER.forEach(function (code) {
      const n = ITEMS.filter(function (it) {
        return it.peran === peran && it.eucs === code;
      }).length;
      if (!n) return;

      sh.getRange(r, 1).setValue(PERAN_LABEL[peran]);
      sh.getRange(r, 2).setValue(EUCS_LABEL[code]);
      sh.getRange(r, 3).setValue(code).setHorizontalAlignment('center');
      sh.getRange(r, 4).setValue(n).setHorizontalAlignment('center');
      sh.getRange(r, 5)
        .setFormula('=IFERROR(AVERAGEIFS($F$' + itemStart + ':$F$' + itemEnd +
          ',$A$' + itemStart + ':$A$' + itemEnd + ',$A' + r +
          ',$E$' + itemStart + ':$E$' + itemEnd + ',$C' + r + '),"")')
        .setNumberFormat('0.00').setHorizontalAlignment('center');
      sh.getRange(r, 6)
        .setFormula('=IFERROR(E' + r + '/5,"")')
        .setNumberFormat('0.0%').setHorizontalAlignment('center');
      r++;
    });
  });
  const dimEnd = r - 1;

  /* Rata-rata per prodi */
  r++;
  section_(sh, r++, 'Rata-rata per program studi', LAST_COL);
  tableHeader_(sh, r++, ['Program studi', 'Kode', 'Jumlah respons', 'Rata-rata Z1', 'Indeks (%)', 'NPS']);
  PRODI.forEach(function (p) {
    const kodeRef = ref_(C.kode);
    sh.getRange(r, 1).setValue(p.nama);
    sh.getRange(r, 2).setNumberFormat('@').setValue(p.kode).setHorizontalAlignment('center');
    sh.getRange(r, 3)
      .setFormula('=COUNTIF(' + kodeRef + ',"' + p.kode + '")')
      .setNumberFormat('#,##0').setHorizontalAlignment('center');
    sh.getRange(r, 4)
      .setFormula('=IFERROR(AVERAGEIFS(' + ref_(C.z1) + ',' + kodeRef + ',"' + p.kode + '"),"")')
      .setNumberFormat('0.00').setHorizontalAlignment('center');
    sh.getRange(r, 5)
      .setFormula('=IFERROR(D' + r + '/5,"")')
      .setNumberFormat('0.0%').setHorizontalAlignment('center');
    sh.getRange(r, 6)
      .setFormula('=IFERROR((COUNTIFS(' + kodeRef + ',"' + p.kode + '",' + ref_(C.z2) + ',">=9")' +
        '-COUNTIFS(' + kodeRef + ',"' + p.kode + '",' + ref_(C.z2) + ',"<=6"))/' +
        'COUNTIFS(' + kodeRef + ',"' + p.kode + '",' + ref_(C.z2) + ',">=0"),"")')
      .setNumberFormat('0.0%').setHorizontalAlignment('center');
    r++;
  });

  /* Profil responden */
  r++;
  section_(sh, r++, 'Profil responden', LAST_COL);
  tableHeader_(sh, r++, ['Pertanyaan', 'Pilihan', 'Jumlah']);

  const profiles = [
    ['Lama penggunaan', C.lama, ['Kurang dari 1 bulan', '1–3 bulan', '3–6 bulan', 'Lebih dari 6 bulan']],
    ['Frekuensi akses', C.frekuensi, ['Setiap hari', 'Beberapa kali seminggu', 'Seminggu sekali', 'Jarang']],
    ['Perangkat', C.perangkat, ['HP', 'Laptop / PC', 'Tablet']]
  ];

  profiles.forEach(function (group) {
    group[2].forEach(function (option, idx) {
      sh.getRange(r, 1).setValue(idx === 0 ? group[0] : '');
      sh.getRange(r, 2).setValue(option);
      sh.getRange(r, 3)
        .setFormula('=COUNTIF(' + ref_(group[1]) + ',"' + option.replace(/"/g, '""') + '")')
        .setNumberFormat('#,##0').setHorizontalAlignment('center');
      r++;
    });
  });

  /* Catatan penutup */
  r++;
  sh.getRange(r, 1, 1, LAST_COL).merge()
    .setValue('Skala Likert 1–5. Kategori rata-rata: ≥4,20 Sangat puas · 3,40–4,19 Puas · ' +
      '2,60–3,39 Cukup · 1,80–2,59 Tidak puas · <1,80 Sangat tidak puas. ' +
      'NPS: ≥50% Sangat baik · 0–49% Baik · <0% Perlu perbaikan.')
    .setFontSize(9).setFontColor('#475569').setWrap(true).setVerticalAlignment('middle');
  sh.setRowHeight(r, 40);

  /* Format umum */
  sh.setColumnWidth(1, 210);
  sh.setColumnWidth(2, 130);
  sh.setColumnWidth(3, 360);
  sh.setColumnWidth(4, 130);
  sh.setColumnWidth(5, 70);
  sh.setColumnWidth(6, 100);
  sh.setColumnWidth(7, 110);
  sh.setColumnWidth(8, 95);
  sh.setColumnWidth(9, 130);
  sh.setFrozenRows(3);
  sh.setTabColor('#4f46e5');
  sh.getRange(1, 1, sh.getMaxRows(), LAST_COL).setFontFamily('Inter').setFontSize(10);
  sh.getRange(1, 1, 2, LAST_COL).setFontSize(10);
  sh.getRange(1, 1, 1, LAST_COL).setFontSize(16);

  return 'Sheet "' + REKAP_NAME + '" dibangun ulang (' + ITEMS.length + ' butir, ' + PRODI.length + ' prodi).';
}

/* ---------- Sheet Respon ---------- */

function ensureColumns_(sh, minCols) {
  const need = minCols || HEADERS.length;
  const have = sh.getMaxColumns();
  if (have < need) sh.insertColumnsAfter(have, need - have);
}

function ensureRows_(sh, minRows) {
  const have = sh.getMaxRows();
  if (have < minRows) sh.insertRowsAfter(have, minRows - have);
}

function getSS_() {
  if (SHEET_ID) return SpreadsheetApp.openById(SHEET_ID);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('Spreadsheet tidak ditemukan. Pasang script ini dari Spreadsheet (Extensions → Apps Script) atau isi SHEET_ID.');
  }
  return ss;
}

function getSheet_() {
  const ss = getSS_();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
  }
  ensureHeader_(sh);
  return sh;
}

function ensureHeader_(sh) {
  ensureColumns_(sh);
  ensureRows_(sh, 2);

  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    formatSheet_(sh);
    return;
  }

  const width = Math.max(sh.getLastColumn(), HEADERS.length);
  const current = sh.getRange(1, 1, 1, width).getValues()[0].map(function (v) {
    return String(v == null ? '' : v).trim();
  });
  const same = HEADERS.every(function (h, i) { return current[i] === h; });
  const extra = current.slice(HEADERS.length).some(function (v) { return v !== ''; });
  if (!same || extra) {
    throw new Error(
      'Header sheet "' + SHEET_NAME + '" tidak cocok dengan HEADERS. ' +
      'Perbaiki manual atau buat spreadsheet baru, lalu jalankan setupSheet() lagi.'
    );
  }
}

function formatSheet_(sh) {
  ensureColumns_(sh);
  ensureRows_(sh, 2);
  sh.setFrozenRows(1);
  const head = sh.getRange(1, 1, 1, HEADERS.length);
  head.setFontWeight('bold').setFontColor('#ffffff').setBackground('#1e1b4b')
    .setVerticalAlignment('middle').setWrap(true);
  sh.setRowHeight(1, 34);

  const dataRows = Math.max(1, sh.getMaxRows() - 1);
  sh.getRange(2, 1, dataRows, HEADERS.length)
    .setBackground(null)
    .setFontColor('#0f172a')
    .setFontWeight('normal')
    .setVerticalAlignment('top');

  TEXT_HEADERS.forEach(function (name) {
    const col = colIndex_(name);
    sh.getRange(2, col, dataRows, 1).setNumberFormat('@');
  });

  const tsCol = colIndex_('timestamp');
  sh.getRange(2, tsCol, dataRows, 1)
    .setNumberFormat('yyyy-mm-dd hh:mm:ss');

  const widths = {
    timestamp: 150, id_respon: 150, versi_form: 70, peran: 90, nama: 180, nim: 120,
    prodi: 230, kode_prodi: 100, lama_penggunaan: 160, frekuensi_akses: 170,
    perangkat: 120, durasi_detik: 100, user_agent: 220
  };
  Object.keys(widths).forEach(function (name) {
    sh.setColumnWidth(colIndex_(name), widths[name]);
  });
  SCORE_IDS.forEach(function (id) { sh.setColumnWidth(colIndex_(id), 52); });
  sh.setColumnWidth(colIndex_('Z1'), 60);
  sh.setColumnWidth(colIndex_('Z2'), 60);
  OPEN_IDS.forEach(function (id) { sh.setColumnWidth(colIndex_(id), 260); });

  sh.setTabColor('#0f766e');
}

/* ---------- Bantu ---------- */

function findRowByResponseId_(sh, idRespon) {
  if (!idRespon) return 0;
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return 0;
  const col = colIndex_('id_respon');
  const values = sh.getRange(2, col, lastRow - 1, 1).getValues();
  for (let i = values.length - 1; i >= 0; i--) {
    if (String(values[i][0] == null ? '' : values[i][0]).trim() === idRespon) {
      return i + 2;
    }
  }
  return 0;
}

function buildRow_(data, identity) {
  const now = new Date();
  const peran = String(data.peran || '');
  return HEADERS.map(function (header) {
    if (header === 'timestamp') return now;
    if (header === 'nama') return identity.nama;
    if (header === 'nim') return identity.nim;
    if ((header === 'prodi' || header === 'kode_prodi') && peran === 'admin') return '';
    if (header === 'id_respon') return identity.id_respon != null ? identity.id_respon : clean_(data.id_respon, 64);
    if (header === 'versi_form') return clean_(data.versi_form, 20);
    if (header === 'peran') return peran;
    if (header === 'durasi_detik') {
      const n = Number(data.durasi_detik);
      return isFinite(n) && n > 0 ? Math.round(n) : '';
    }
    if (header === 'Z1' || header === 'Z2') {
      return Number(data[header]);
    }
    if (SCORE_IDS.indexOf(header) !== -1) {
      // Kosongkan kolom milik peran lain agar tidak menulis NaN atau 0 ke sheet.
      if (ITEM_ROLE_MAP[header] !== peran) return '';
      if (data[header] === '' || data[header] == null || typeof data[header] === 'boolean') return '';
      const score = Number(data[header]);
      return isFinite(score) ? score : '';
    }
    if (OPEN_IDS.indexOf(header) !== -1) {
      const allowedRole = OPEN_ROLE_MAP[header];
      if (allowedRole !== '*' && allowedRole !== peran) return '';
      return clean_(data[header], 2000);
    }
    return clean_(data[header], 240);
  });
}

function validateScores_(peran, data) {
  const items = ITEMS_BY_ROLE[peran] || [];
  for (let i = 0; i < items.length; i++) {
    if (!isIntegerIn_(data[items[i].id], 1, 5)) return 'skor_' + items[i].id;
  }

  if (!isIntegerIn_(data.Z1, 1, 5)) return 'skor_Z1';
  if (!isIntegerIn_(data.Z2, 0, 10)) return 'skor_Z2';
  return '';
}

function isIntegerIn_(raw, min, max) {
  if (raw === '' || raw === null || typeof raw === 'undefined' || typeof raw === 'boolean') {
    return false;
  }
  const value = Number(raw);
  return Number.isInteger(value) && value >= min && value <= max;
}

function clean_(value, max) {
  let s = String(value == null ? '' : value).trim();
  if (s.length > max) s = s.slice(0, max);
  // Cegah teks yang dibaca Sheets sebagai formula.
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function colOf_(header) {
  return colLetter_(colIndex_(header));
}

function colIndex_(header) {
  const idx = HEADERS.indexOf(header);
  if (idx === -1) throw new Error('Kolom tidak dikenal: ' + header);
  return idx + 1;
}

function colLetter_(n) {
  let out = '';
  while (n > 0) {
    const mod = (n - 1) % 26;
    out = String.fromCharCode(65 + mod) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

function summary_(sh, row, label, valueOrFormula, format) {
  sh.getRange(row, 1).setValue(label).setFontWeight('bold');
  const cell = sh.getRange(row, 2);
  if (typeof valueOrFormula === 'string' && valueOrFormula.charAt(0) === '=') {
    cell.setFormula(valueOrFormula);
  } else {
    cell.setValue(valueOrFormula);
  }
  if (format) cell.setNumberFormat(format);
  cell.setHorizontalAlignment('left');
}

function section_(sh, row, text, lastCol) {
  sh.getRange(row, 1, 1, lastCol).merge()
    .setValue(text)
    .setFontWeight('bold').setFontSize(11)
    .setFontColor('#312e81').setBackground('#eef2ff')
    .setVerticalAlignment('middle');
  sh.setRowHeight(row, 28);
}

function tableHeader_(sh, row, labels) {
  const range = sh.getRange(row, 1, 1, labels.length);
  range.setValues([labels])
    .setFontWeight('bold').setFontColor('#ffffff')
    .setBackground('#4f46e5').setWrap(true)
    .setVerticalAlignment('middle').setHorizontalAlignment('center');
  sh.setRowHeight(row, 34);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ---------- Visualisasi Grafik di Google Sheets & API Dashboard ---------- */

function buildVisualisasi() {
  getSheet_();
  const ss = getSS_();
  let sh = ss.getSheetByName(VISUAL_NAME);
  if (!sh) {
    sh = ss.insertSheet(VISUAL_NAME);
  } else {
    sh.getCharts().forEach(function (chart) { sh.removeChart(chart); });
    sh.clear();
    sh.clearNotes();
  }

  const GRID_COLS = 12;
  ensureColumns_(sh, GRID_COLS);
  ensureRows_(sh, 80);
  sh.getBandings().forEach(function (banding) { banding.remove(); });
  sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).breakApart();

  const C = {
    timestamp: colOf_('timestamp'),
    peran: colOf_('peran'),
    kode: colOf_('kode_prodi'),
    z1: colOf_('Z1'),
    z2: colOf_('Z2'),
    perangkat: colOf_('perangkat')
  };
  function ref_(col) {
    return 'Respon!$' + col + '$2:$' + col;
  }

  /* Header */
  sh.getRange(1, 1, 1, GRID_COLS).merge()
    .setValue('Visualisasi Kuesioner Kepuasan LMS')
    .setFontSize(16).setFontWeight('bold')
    .setFontColor('#ffffff').setBackground('#1e1b4b')
    .setVerticalAlignment('middle');
  sh.setRowHeight(1, 42);

  sh.getRange(2, 1, 1, GRID_COLS).merge()
    .setValue('Grafik diperbarui otomatis dari sheet "Respon". Klik ikon titik tiga (⋮) di pojok kanan atas grafik untuk menyalin atau mengunduh PNG/PDF.')
    .setFontSize(9).setFontColor('#475569')
    .setVerticalAlignment('middle');
  sh.setRowHeight(2, 26);

  /* Kartu Ringkasan KPI (Baris 4-5) */
  const kpis = [
    { col: 1, label: 'TOTAL RESPONS', formula: '=COUNTA(' + ref_(C.timestamp) + ')', fmt: '#,##0', bg: '#eef2ff', fg: '#312e81' },
    { col: 4, label: 'RATA-RATA KEPUASAN (Z1)', formula: '=IFERROR(AVERAGE(' + ref_(C.z1) + '),0)', fmt: '0.00', bg: '#f0f9ff', fg: '#0c4a6e' },
    { col: 7, label: 'INDEKS KEPUASAN', formula: '=IFERROR(AVERAGE(' + ref_(C.z1) + ')/5,0)', fmt: '0.0%', bg: '#ecfdf5', fg: '#065f46' },
    { col: 10, label: 'SKOR NPS (Z2)', formula: '=IFERROR((COUNTIF(' + ref_(C.z2) + ',">=9")-COUNTIF(' + ref_(C.z2) + ',"<=6"))/COUNT(' + ref_(C.z2) + '),0)', fmt: '0.0%', bg: '#fffbeb', fg: '#78350f' }
  ];
  sh.setRowHeight(4, 22);
  sh.setRowHeight(5, 36);
  kpis.forEach(function (k) {
    sh.getRange(4, k.col, 1, 3).merge()
      .setValue(k.label)
      .setFontSize(8).setFontWeight('bold')
      .setFontColor(k.fg).setBackground(k.bg)
      .setHorizontalAlignment('center').setVerticalAlignment('middle');
    sh.getRange(5, k.col, 1, 3).merge()
      .setFormula(k.formula)
      .setNumberFormat(k.fmt)
      .setFontSize(15).setFontWeight('bold')
      .setFontColor(k.fg).setBackground(k.bg)
      .setHorizontalAlignment('center').setVerticalAlignment('middle');
  });

  /* Tabel Sumber Grafik (Baris 58 ke bawah, otomatis & tidak menutupi grafik) */
  const SRC_ROW = 59;
  section_(sh, SRC_ROW - 1, 'Tabel Sumber Grafik (Otomatis — Jangan Dihapus)', GRID_COLS);

  // 1) Sebaran Peran (A59:B62)
  tableHeader_(sh, SRC_ROW, ['Peran', 'Jumlah']);
  const rolesRows = [
    ['Mahasiswa', '=COUNTIF(' + ref_(C.peran) + ',"mahasiswa")'],
    ['Mentor', '=COUNTIF(' + ref_(C.peran) + ',"dosen")'],
    ['Pimpinan', '=COUNTIF(' + ref_(C.peran) + ',"admin")']
  ];
  rolesRows.forEach(function (pair, idx) {
    sh.getRange(SRC_ROW + 1 + idx, 1).setValue(pair[0]);
    sh.getRange(SRC_ROW + 1 + idx, 2).setFormula(pair[1]).setNumberFormat('#,##0');
  });
  const rangePeran = sh.getRange(SRC_ROW, 1, 4, 2);

  // 2) Komposisi NPS (D59:E62)
  const npsHeadRange = sh.getRange(SRC_ROW, 4, 1, 2);
  npsHeadRange.setValues([['Kategori NPS', 'Jumlah']])
    .setFontWeight('bold').setFontColor('#ffffff').setBackground('#4f46e5')
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  const npsRows = [
    ['Promoter (9–10)', '=COUNTIF(' + ref_(C.z2) + ',">=9")'],
    ['Passive (7–8)', '=COUNTIFS(' + ref_(C.z2) + ',">=7",' + ref_(C.z2) + ',"<=8")'],
    ['Detractor (0–6)', '=COUNTIF(' + ref_(C.z2) + ',"<=6")']
  ];
  npsRows.forEach(function (pair, idx) {
    sh.getRange(SRC_ROW + 1 + idx, 4).setValue(pair[0]);
    sh.getRange(SRC_ROW + 1 + idx, 5).setFormula(pair[1]).setNumberFormat('#,##0');
  });
  const rangeNps = sh.getRange(SRC_ROW, 4, 4, 2);

  // 3) Kepuasan per Prodi (G59:H62)
  sh.getRange(SRC_ROW, 7, 1, 2).setValues([['Program Studi', 'Rata-rata Z1']])
    .setFontWeight('bold').setFontColor('#ffffff').setBackground('#4f46e5')
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  PRODI.forEach(function (p, idx) {
    sh.getRange(SRC_ROW + 1 + idx, 7).setValue(p.nama);
    sh.getRange(SRC_ROW + 1 + idx, 8)
      .setFormula('=IFERROR(AVERAGEIFS(' + ref_(C.z1) + ',' + ref_(C.kode) + ',"' + p.kode + '"),0)')
      .setNumberFormat('0.00');
  });
  const rangeProdi = sh.getRange(SRC_ROW, 7, 1 + PRODI.length, 2);

  // 4) Perangkat Responden (J59:K62)
  sh.getRange(SRC_ROW, 10, 1, 2).setValues([['Perangkat', 'Jumlah']])
    .setFontWeight('bold').setFontColor('#ffffff').setBackground('#4f46e5')
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  PROFILE_OPTIONS.perangkat.forEach(function (opt, idx) {
    sh.getRange(SRC_ROW + 1 + idx, 10).setValue(opt);
    sh.getRange(SRC_ROW + 1 + idx, 11)
      .setFormula('=COUNTIF(' + ref_(C.perangkat) + ',"' + opt.replace(/"/g, '""') + '")')
      .setNumberFormat('#,##0');
  });
  const rangePerangkat = sh.getRange(SRC_ROW, 10, 1 + PROFILE_OPTIONS.perangkat.length, 2);

  // 5) Rata-rata Dimensi EUCS per Peran (A65:D70)
  const EUCS_ROW = SRC_ROW + 6;
  tableHeader_(sh, EUCS_ROW, ['Dimensi EUCS', 'Mahasiswa', 'Mentor', 'Pimpinan']);
  EUCS_ORDER.forEach(function (code, idx) {
    const rowNum = EUCS_ROW + 1 + idx;
    sh.getRange(rowNum, 1).setValue(EUCS_LABEL[code] + ' (' + code + ')');
    PERAN_LIST.forEach(function (peran, pIdx) {
      const refs = ITEMS.filter(function (it) {
        return it.peran === peran && it.eucs === code;
      }).map(function (it) {
        return ref_(colOf_(it.id));
      });
      const formula = refs.length ? '=IFERROR(AVERAGE(' + refs.join(',') + '),0)' : '=0';
      sh.getRange(rowNum, 2 + pIdx).setFormula(formula).setNumberFormat('0.00');
    });
  });
  const rangeEucs = sh.getRange(EUCS_ROW, 1, 1 + EUCS_ORDER.length, 4);

  /* Bangun 5 Grafik Bawaan Google Sheets */
  const chartPeran = sh.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(rangePeran)
    .setNumHeaders(1)
    .setOption('title', 'Sebaran Responden per Peran')
    .setOption('pieHole', 0.45)
    .setOption('colors', ['#4f46e5', '#0ea5e9', '#0f766e'])
    .setOption('legend', { position: 'bottom' })
    .setOption('width', 530)
    .setOption('height', 295)
    .setPosition(7, 1, 0, 0)
    .build();

  const chartNps = sh.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(rangeNps)
    .setNumHeaders(1)
    .setOption('title', 'Komposisi Net Promoter Score (NPS)')
    .setOption('pieHole', 0.45)
    .setOption('colors', ['#10b981', '#f59e0b', '#ef4444'])
    .setOption('legend', { position: 'bottom' })
    .setOption('width', 530)
    .setOption('height', 295)
    .setPosition(7, 7, 0, 0)
    .build();

  const chartEucs = sh.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(rangeEucs)
    .setNumHeaders(1)
    .setOption('title', 'Rata-rata Dimensi EUCS per Peran (Skala 1–5)')
    .setOption('colors', ['#4f46e5', '#0ea5e9', '#0f766e'])
    .setOption('legend', { position: 'top' })
    .setOption('vAxis', { minValue: 0, maxValue: 5 })
    .setOption('width', 1084)
    .setOption('height', 320)
    .setPosition(23, 1, 0, 0)
    .build();

  const chartProdi = sh.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(rangeProdi)
    .setNumHeaders(1)
    .setOption('title', 'Rata-rata Kepuasan (Z1) per Program Studi')
    .setOption('colors', ['#6366f1'])
    .setOption('legend', { position: 'none' })
    .setOption('vAxis', { minValue: 0, maxValue: 5 })
    .setOption('width', 530)
    .setOption('height', 295)
    .setPosition(40, 1, 0, 0)
    .build();

  const chartPerangkat = sh.newChart()
    .setChartType(Charts.ChartType.BAR)
    .addRange(rangePerangkat)
    .setNumHeaders(1)
    .setOption('title', 'Perangkat Utama Responden')
    .setOption('colors', ['#0ea5e9'])
    .setOption('legend', { position: 'none' })
    .setOption('width', 530)
    .setOption('height', 295)
    .setPosition(40, 7, 0, 0)
    .build();

  [chartPeran, chartNps, chartEucs, chartProdi, chartPerangkat].forEach(function (c) {
    sh.insertChart(c);
  });

  for (let col = 1; col <= GRID_COLS; col++) {
    sh.setColumnWidth(col, 92);
  }
  sh.setFrozenRows(2);
  sh.setTabColor('#0284c7');
  sh.getRange(1, 1, sh.getMaxRows(), GRID_COLS).setFontFamily('Inter');
  sh.getRange(1, 1, 1, GRID_COLS).setFontSize(16);
  sh.getRange(2, 1, 1, GRID_COLS).setFontSize(9);

  return 'Sheet "' + VISUAL_NAME + '" dibangun ulang (5 grafik).';
}

function buildDashboardData_(params) {
  params = params || {};
  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();

  const fromStr = /^\d{4}-\d{2}-\d{2}$/.test(String(params.from || '')) ? String(params.from) : '';
  const toStr = /^\d{4}-\d{2}-\d{2}$/.test(String(params.to || '')) ? String(params.to) : '';
  const fromTs = fromStr ? parseDateBound_(fromStr, false) : null;
  const toTs = toStr ? parseDateBound_(toStr, true) : null;

  function makeSlice_() {
    const eucs = {};
    EUCS_ORDER.forEach(function (k) { eucs[k] = { sum: 0, count: 0 }; });
    const prof = { lama: {}, frekuensi: {}, perangkat: {} };
    PROFILE_OPTIONS.lama.forEach(function (k) { prof.lama[k] = 0; });
    PROFILE_OPTIONS.frekuensi.forEach(function (k) { prof.frekuensi[k] = 0; });
    PROFILE_OPTIONS.perangkat.forEach(function (k) { prof.perangkat[k] = 0; });
    return {
      count: 0,
      durSum: 0,
      durCount: 0,
      z1Sum: 0,
      z1Count: 0,
      z1Dist: [0, 0, 0, 0, 0],
      z2Count: 0,
      z2Dist: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      promoter: 0,
      passive: 0,
      detractor: 0,
      eucs: eucs,
      profiles: prof,
      timeline: {}
    };
  }

  const slices = {
    all: makeSlice_(),
    mahasiswa: makeSlice_(),
    dosen: makeSlice_(),
    admin: makeSlice_()
  };

  const itemStats = {};
  ITEMS.forEach(function (it) {
    itemStats[it.id] = { sum: 0, count: 0, dist: [0, 0, 0, 0, 0] };
  });

  const prodiStats = {};
  PRODI.forEach(function (p) {
    prodiStats[p.kode] = {
      kode: p.kode,
      nama: p.nama,
      count: 0,
      byRole: { mahasiswa: 0, dosen: 0 },
      z1Sum: 0,
      z1Count: 0,
      z2Count: 0,
      promoter: 0,
      passive: 0,
      detractor: 0
    };
  });

  const hIdx = {};
  HEADERS.forEach(function (h, idx) { hIdx[h] = idx; });

  const feedbackAll = [];
  const seenIds = {};
  let firstDate = '';
  let lastDate = '';

  if (lastRow >= 2) {
    const rows = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      const peran = String(row[hIdx.peran] || '').trim();
      if (PERAN_LIST.indexOf(peran) === -1) continue;

      const idRespon = String(row[hIdx.id_respon] || '').trim();
      if (idRespon) {
        if (seenIds[idRespon]) continue;
        seenIds[idRespon] = true;
      }

      const rawTs = row[hIdx.timestamp];
      const dt = rawTs instanceof Date ? rawTs : (rawTs ? new Date(rawTs) : null);
      const validDt = dt && !isNaN(dt.getTime()) ? dt : null;
      if (fromTs !== null && (!validDt || validDt.getTime() < fromTs)) continue;
      if (toTs !== null && (!validDt || validDt.getTime() > toTs)) continue;

      const dateKey = validDt ? formatDateKey_(validDt) : '';
      if (dateKey) {
        if (!firstDate || dateKey < firstDate) firstDate = dateKey;
        if (!lastDate || dateKey > lastDate) lastDate = dateKey;
      }

      const targets = [slices.all, slices[peran]];
      targets.forEach(function (sl) {
        sl.count++;
        if (dateKey) sl.timeline[dateKey] = (sl.timeline[dateKey] || 0) + 1;
      });

      const dur = Number(row[hIdx.durasi_detik]);
      if (isFinite(dur) && dur > 0) {
        targets.forEach(function (sl) { sl.durSum += dur; sl.durCount++; });
      }

      const lama = String(row[hIdx.lama_penggunaan] || '').trim();
      const frek = String(row[hIdx.frekuensi_akses] || '').trim();
      const dev = String(row[hIdx.perangkat] || '').trim();
      targets.forEach(function (sl) {
        if (lama) sl.profiles.lama[lama] = (sl.profiles.lama[lama] || 0) + 1;
        if (frek) sl.profiles.frekuensi[frek] = (sl.profiles.frekuensi[frek] || 0) + 1;
        if (dev) sl.profiles.perangkat[dev] = (sl.profiles.perangkat[dev] || 0) + 1;
      });

      const z1Raw = row[hIdx.Z1];
      const hasZ1 = isIntegerIn_(z1Raw, 1, 5);
      const z1Val = hasZ1 ? Number(z1Raw) : null;
      if (hasZ1) {
        targets.forEach(function (sl) {
          sl.z1Sum += z1Val;
          sl.z1Count++;
          sl.z1Dist[z1Val - 1]++;
        });
      }

      const z2Raw = row[hIdx.Z2];
      const hasZ2 = isIntegerIn_(z2Raw, 0, 10);
      const z2Val = hasZ2 ? Number(z2Raw) : null;
      if (hasZ2) {
        targets.forEach(function (sl) {
          sl.z2Count++;
          sl.z2Dist[z2Val]++;
          if (z2Val >= 9) sl.promoter++;
          else if (z2Val >= 7) sl.passive++;
          else sl.detractor++;
        });
      }

      const kodeProdi = peran === 'admin' ? '' : String(row[hIdx.kode_prodi] || '').trim();
      if (kodeProdi && prodiStats[kodeProdi]) {
        const ps = prodiStats[kodeProdi];
        ps.count++;
        if (ps.byRole[peran] !== undefined) ps.byRole[peran]++;
        if (hasZ1) { ps.z1Sum += z1Val; ps.z1Count++; }
        if (hasZ2) {
          ps.z2Count++;
          if (z2Val >= 9) ps.promoter++;
          else if (z2Val >= 7) ps.passive++;
          else ps.detractor++;
        }
      }

      const roleItems = ITEMS_BY_ROLE[peran] || [];
      for (let i = 0; i < roleItems.length; i++) {
        const it = roleItems[i];
        const rawScore = row[hIdx[it.id]];
        if (!isIntegerIn_(rawScore, 1, 5)) continue;
        const sc = Number(rawScore);
        const st = itemStats[it.id];
        st.sum += sc;
        st.count++;
        st.dist[sc - 1]++;
        targets.forEach(function (sl) {
          sl.eucs[it.eucs].sum += sc;
          sl.eucs[it.eucs].count++;
        });
      }

      OPEN_IDS.forEach(function (oid) {
        const meta = OPEN_QUESTIONS_META[oid];
        if (!meta || (meta.peran !== '*' && meta.peran !== peran)) return;
        let text = String(row[hIdx[oid]] == null ? '' : row[hIdx[oid]]).trim();
        if (!text) return;
        text = text.replace(/^'([=+\-@])/, '$1');
        feedbackAll.push({
          peran: peran,
          peranLabel: PERAN_LABEL[peran],
          kode: oid,
          pertanyaan: meta.label,
          teks: text,
          tanggal: dateKey
        });
      });
    }
  }

  function finalizeSlice_(sl) {
    const z1Avg = sl.z1Count ? round2_(sl.z1Sum / sl.z1Count) : null;
    const z1IndexPct = z1Avg !== null ? round1_((z1Avg / 5) * 100) : null;
    const nps = sl.z2Count ? round1_(((sl.promoter - sl.detractor) / sl.z2Count) * 100) : null;
    const eucsOut = {};
    EUCS_ORDER.forEach(function (k) {
      const e = sl.eucs[k];
      const avg = e.count ? round2_(e.sum / e.count) : null;
      eucsOut[k] = {
        kode: k,
        label: EUCS_LABEL[k],
        avg: avg,
        indexPct: avg !== null ? round1_((avg / 5) * 100) : null,
        category: categoryLikert_(avg),
        count: e.count
      };
    });

    function mapProf_(groupKey) {
      const known = PROFILE_OPTIONS[groupKey] || [];
      const seen = {};
      const out = known.map(function (opt) {
        seen[opt] = true;
        return { label: opt, count: sl.profiles[groupKey][opt] || 0 };
      });
      Object.keys(sl.profiles[groupKey]).forEach(function (k) {
        if (!seen[k] && sl.profiles[groupKey][k] > 0) {
          out.push({ label: k, count: sl.profiles[groupKey][k] });
        }
      });
      return out;
    }

    const timeline = Object.keys(sl.timeline).sort().map(function (d) {
      return { date: d, count: sl.timeline[d] };
    });

    return {
      count: sl.count,
      avgDurationSec: sl.durCount ? Math.round(sl.durSum / sl.durCount) : null,
      z1Avg: z1Avg,
      z1IndexPct: z1IndexPct,
      z1Category: categoryLikert_(z1Avg),
      z1Dist: sl.z1Dist,
      nps: nps,
      npsCategory: categoryNps_(nps),
      npsBreakdown: {
        promoter: sl.promoter,
        passive: sl.passive,
        detractor: sl.detractor,
        total: sl.z2Count
      },
      npsDist: sl.z2Dist,
      eucs: eucsOut,
      profiles: {
        lama: mapProf_('lama'),
        frekuensi: mapProf_('frekuensi'),
        perangkat: mapProf_('perangkat')
      },
      timeline: timeline
    };
  }

  const itemsOut = ITEMS.map(function (it) {
    const st = itemStats[it.id];
    const avg = st.count ? round2_(st.sum / st.count) : null;
    return {
      id: it.id,
      peran: it.peran,
      peranLabel: PERAN_LABEL[it.peran],
      fitur: it.fitur,
      eucs: it.eucs,
      eucsLabel: EUCS_LABEL[it.eucs],
      teks: it.teks,
      count: st.count,
      avg: avg,
      indexPct: avg !== null ? round1_((avg / 5) * 100) : null,
      category: categoryLikert_(avg),
      dist: st.dist
    };
  });

  const prodiOut = PRODI.map(function (p) {
    const ps = prodiStats[p.kode];
    const z1Avg = ps.z1Count ? round2_(ps.z1Sum / ps.z1Count) : null;
    const nps = ps.z2Count ? round1_(((ps.promoter - ps.detractor) / ps.z2Count) * 100) : null;
    return {
      kode: ps.kode,
      nama: ps.nama,
      count: ps.count,
      byRole: ps.byRole,
      z1Avg: z1Avg,
      z1IndexPct: z1Avg !== null ? round1_((z1Avg / 5) * 100) : null,
      z1Category: categoryLikert_(z1Avg),
      nps: nps,
      npsCategory: categoryNps_(nps)
    };
  });

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    filter: { from: fromStr, to: toStr },
    range: { firstDate: firstDate, lastDate: lastDate },
    meta: {
      version: 'v1',
      roles: PERAN_LABEL,
      eucs: EUCS_LABEL,
      prodi: PRODI
    },
    slices: {
      all: finalizeSlice_(slices.all),
      mahasiswa: finalizeSlice_(slices.mahasiswa),
      dosen: finalizeSlice_(slices.dosen),
      admin: finalizeSlice_(slices.admin)
    },
    items: itemsOut,
    byProdi: prodiOut,
    feedback: feedbackAll.reverse().slice(0, 80)
  };
}

function parseDateBound_(ymd, endOfDay) {
  const parts = ymd.split('-').map(Number);
  return endOfDay
    ? new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59, 999).getTime()
    : new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0).getTime();
}

function formatDateKey_(dt) {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

function round2_(n) {
  return Math.round(n * 100) / 100;
}

function round1_(n) {
  return Math.round(n * 10) / 10;
}

function categoryLikert_(avg) {
  if (avg === null || !isFinite(avg)) return '';
  if (avg >= 4.2) return 'Sangat puas';
  if (avg >= 3.4) return 'Puas';
  if (avg >= 2.6) return 'Cukup';
  if (avg >= 1.8) return 'Tidak puas';
  return 'Sangat tidak puas';
}

function categoryNps_(nps) {
  if (nps === null || !isFinite(nps)) return '';
  if (nps >= 50) return 'Sangat baik';
  if (nps >= 0) return 'Baik';
  return 'Perlu perbaikan';
}

/* ---------- Menu di Spreadsheet & alias kompatibilitas ---------- */

function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('Kuesioner LMS')
      .addItem('Siapkan / perbaiki semua sheet', 'setupSheet')
      .addItem('Atur / siapkan sheet Pengaturan (PIN & Token)', 'setupPengaturan')
      .addItem('Bangun ulang sheet Rekap', 'buildRekap')
      .addItem('Bangun ulang sheet Visualisasi (Grafik)', 'buildVisualisasi')
      .addToUi();
  } catch (err) {
    // Diabaikan saat script tidak terpasang di Spreadsheet.
  }
}

function setupSheet_() {
  return setupSheet();
}

function setupPengaturan_() {
  return setupPengaturan();
}

function buildRekap_() {
  return buildRekap();
}

function buildVisualisasi_() {
  return buildVisualisasi();
}
