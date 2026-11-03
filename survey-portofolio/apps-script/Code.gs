/* ============================================================
   Kuesioner Kepuasan Platform Portofolio IDN — Google Apps Script
   Politeknik IDN Bogor
   ------------------------------------------------------------
   Petunjuk Pemasangan:
   1. Buka Google Spreadsheet baru di Google Drive.
   2. Klik Extensions (Ekstensi) → Apps Script.
   3. Ganti seluruh isi Code.gs dengan file ini, lalu simpan (Ctrl+S).
   4. Pilih fungsi setupSheet di toolbar lalu klik tombol Run (izinkan akses).
   5. Klik tombol Deploy → New deployment → pilih tipe Web app
      - Execute as: Me
      - Who has access: Anyone
   6. Salin URL yang berakhiran /exec ke assets/config.js.
   ============================================================ */

/* ---------- Pengaturan Dasar ---------- */

// Kosongkan untuk memakai spreadsheet tempat script ini terpasang (disarankan).
const SHEET_ID = '';

const SHEET_NAME = 'Respon';
const REKAP_NAME = 'Rekap';
const VISUAL_NAME = 'Visualisasi';
const PENGATURAN_NAME = 'Pengaturan';

// Token rahasia default. Samakan dengan cell B3 pada tab "Pengaturan" di Spreadsheet.
const SECRET = 'portofolio-survey-token';

// Kode akses default dashboard. Atur di cell B2 pada tab "Pengaturan" di Spreadsheet.
const DASHBOARD_PIN = '';

const PERAN_LIST = ['mahasiswa', 'dosen', 'admin'];

const PERAN_LABEL = {
  mahasiswa: 'Mahasiswa',
  dosen: 'Dosen / Kurator',
  admin: 'Pimpinan / Admin'
};

const PRODI = [
  { kode: '58302', nama: 'Teknologi Rekayasa Perangkat Lunak (Programmer)' },
  { kode: '90346', nama: 'Teknologi Rekayasa Komputer Jaringan (Engineer)' },
  { kode: '90343', nama: 'Teknologi Rekayasa Multimedia Grafis (Designer)' }
];

const EUCS_LABEL = {
  C: 'Content',
  A: 'Accuracy',
  F: 'Format',
  E: 'Ease of Use',
  T: 'Timeliness'
};

const EUCS_ORDER = ['C', 'A', 'F', 'E', 'T'];

/* ---------- Daftar Butir Pernyataan Portofolio IDN (45 Butir) ---------- */

const ITEMS = [
  // Mahasiswa (18 Butir)
  { id: 'M1', peran: 'mahasiswa', fitur: 'Registrasi & Login', eucs: 'E', teks: 'Proses pendaftaran akun (dengan captcha) dan login ke platform Portofolio IDN mudah dan lancar' },
  { id: 'M2', peran: 'mahasiswa', fitur: 'Desain Antarmuka', eucs: 'F', teks: 'Desain tampilan antarmuka platform modern, rapi, dan nyaman dipandang' },
  { id: 'M3', peran: 'mahasiswa', fitur: 'Navigasi & Dashboard', eucs: 'E', teks: 'Menu navigasi dan dashboard mahasiswa mudah dipahami dan digunakan' },
  { id: 'M4', peran: 'mahasiswa', fitur: 'Kelola Profil', eucs: 'E', teks: 'Fitur pengelolaan profil (biodata, foto profil, keahlian, link GitHub/LinkedIn/kontak) mudah dilengkapi' },
  { id: 'M5', peran: 'mahasiswa', fitur: 'Form Portofolio', eucs: 'E', teks: 'Formulir pembuatan dan pengunggahan portofolio baru (judul, ringkasan, slug) terstruktur dan mudah diisi' },
  { id: 'M6', peran: 'mahasiswa', fitur: 'Optimasi WebP', eucs: 'A', teks: 'Fitur kompresi gambar cover otomatis ke WebP membuat proses upload cepat tanpa menurunkan kualitas visual' },
  { id: 'M7', peran: 'mahasiswa', fitur: 'Galeri Carousel', eucs: 'F', teks: 'Fitur galeri gambar carousel mempermudah penyajian dokumentasi atau tangkapan layar karya secara interaktif' },
  { id: 'M8', peran: 'mahasiswa', fitur: 'Deskripsi Proyek', eucs: 'C', teks: 'Fitur penulisan deskripsi proyek berbab (latar belakang, teknologi, alur, hasil) membantu mendokumentasikan karya secara terperinci' },
  { id: 'M9', peran: 'mahasiswa', fitur: 'Pratinjau Karya', eucs: 'E', teks: 'Fitur pratinjau (preview) karya sebelum diajukan publikasi membantu memastikan tampilan karya sudah rapi' },
  { id: 'M10', peran: 'mahasiswa', fitur: 'Status Kurasi', eucs: 'C', teks: 'Informasi status karya (draf, proses kurasi, dan terverifikasi terbit) disajikan secara jelas dan transparan' },
  { id: 'M11', peran: 'mahasiswa', fitur: 'Metrik Views/Likes', eucs: 'A', teks: 'Metrik jumlah pembaca (views) dan penyuka (likes) tampil akurat serta memotivasi untuk terus berkarya' },
  { id: 'M12', peran: 'mahasiswa', fitur: 'Keamanan Akun', eucs: 'A', teks: 'Fitur keamanan akun dan penggantian kata sandi berfungsi dengan baik dan memberi rasa aman' },
  { id: 'M13', peran: 'mahasiswa', fitur: 'Tampilan Publik', eucs: 'F', teks: 'Halaman publik detail portofolio menyajikan karya secara elegan dan siap dibagikan kepada calon perekrut industri' },
  { id: 'M14', peran: 'mahasiswa', fitur: 'Leaderboard & Direktori', eucs: 'C', teks: 'Fitur Leaderboard dan direktori karya mahasiswa memicu motivasi kompetisi positif untuk menghasilkan karya bermutu' },
  { id: 'M15', peran: 'mahasiswa', fitur: 'Kecepatan Akses', eucs: 'T', teks: 'Halaman platform terbuka dengan cepat dan responsif saat diakses dari komputer maupun smartphone' },
  { id: 'M16', peran: 'mahasiswa', fitur: 'Stabilitas Sistem', eucs: 'A', teks: 'Platform stabil dan tidak mengalami gangguan teknis saat proses pengunggahan berkas karya berlangsung' },
  { id: 'M17', peran: 'mahasiswa', fitur: 'Waktu Kurasi', eucs: 'T', teks: 'Waktu yang dibutuhkan admin/kurator dalam memverifikasi dan menerbitkan karya tergolong cepat' },
  { id: 'M18', peran: 'mahasiswa', fitur: 'Dampak Karir', eucs: 'C', teks: 'Platform Portofolio IDN sangat membantu dalam membangun personal branding dan meningkatkan kepercayaan diri memasuki dunia kerja' },

  // Dosen / Kurator (14 Butir)
  { id: 'D1', peran: 'dosen', fitur: 'Antarmuka Platform', eucs: 'F', teks: 'Tampilan antarmuka platform Portofolio IDN mudah dipahami, intuitif, dan nyaman digunakan' },
  { id: 'D2', peran: 'dosen', fitur: 'Struktur Informasi', eucs: 'C', teks: 'Informasi karya mahasiswa per jurusan (Programmer, Engineer, Designer) dan angkatan disajikan lengkap' },
  { id: 'D3', peran: 'dosen', fitur: 'Format Dokumentasi', eucs: 'F', teks: 'Format dokumentasi karya (ringkasan, tangkapan layar carousel, dan deskripsi teknis) memudahkan peninjauan karya' },
  { id: 'D4', peran: 'dosen', fitur: 'Monitoring Karya', eucs: 'E', teks: 'Platform mempermudah dosen dalam memantau portofolio karya mahasiswa bimbingan secara terpusat' },
  { id: 'D5', peran: 'dosen', fitur: 'Pencarian & Filter', eucs: 'E', teks: 'Fitur pencarian dan filter jurusan memudahkan penemuan karya spesifik yang sedang dievaluasi' },
  { id: 'D6', peran: 'dosen', fitur: 'Direktori Mahasiswa', eucs: 'C', teks: 'Halaman direktori profil mahasiswa menyajikan rekam jejak keterampilan dan karya mahasiswa secara terperinci' },
  { id: 'D7', peran: 'dosen', fitur: 'Grafik Analitik', eucs: 'C', teks: 'Halaman grafik statistik sebaran karya (/grafik) memberikan gambaran jelas mengenai produktivitas mahasiswa' },
  { id: 'D8', peran: 'dosen', fitur: 'Akurasi Leaderboard', eucs: 'A', teks: 'Fitur Leaderboard menyajikan data karya terpopuler dan mahasiswa paling aktif secara transparan dan akurat' },
  { id: 'D9', peran: 'dosen', fitur: 'Evaluasi Capaian', eucs: 'C', teks: 'Platform efektif digunakan sebagai etalase penilaian luaran praktikum, proyek semester, maupun tugas akhir' },
  { id: 'D10', peran: 'dosen', fitur: 'Efisiensi Kerja', eucs: 'T', teks: 'Platform menghemat waktu dan beban administratif dosen dibanding peninjauan karya melalui berkas manual' },
  { id: 'D11', peran: 'dosen', fitur: 'Kecepatan Media', eucs: 'T', teks: 'Gambar, media carousel, dan halaman karya mahasiswa termuat dengan cepat tanpa kendala teknis' },
  { id: 'D12', peran: 'dosen', fitur: 'Keabsahan Data', eucs: 'A', teks: 'Data identitas, jurusan, dan kepemilikan karya mahasiswa yang disajikan akurat dan valid' },
  { id: 'D13', peran: 'dosen', fitur: 'Keandalan Sistem', eucs: 'A', teks: 'Platform berjalan stabil dan jarang mengalami gangguan teknis saat digunakan untuk kurasi karya' },
  { id: 'D14', peran: 'dosen', fitur: 'Peningkatan Mutu', eucs: 'C', teks: 'Keberadaan platform Portofolio IDN mendorong peningkatan mutu dan kesiapan kerja karya mahasiswa sesuai standar industri' },

  // Pimpinan / Admin (13 Butir)
  { id: 'P1', peran: 'admin', fitur: 'Dashboard Admin', eucs: 'C', teks: 'Dashboard admin menyajikan gambaran ringkas dan informatif mengenai statistik portofolio dan mahasiswa kampus' },
  { id: 'P2', peran: 'admin', fitur: 'Master Data', eucs: 'E', teks: 'Pengelolaan master data Jurusan dan Angkatan terstruktur rapi dan mudah diperbarui' },
  { id: 'P3', peran: 'admin', fitur: 'Tata Kelola Akun', eucs: 'E', teks: 'Fitur verifikasi akun pendaftaran mahasiswa baru (verify/unverify) berjalan efektif dan mempermudah tata kelola' },
  { id: 'P4', peran: 'admin', fitur: 'Moderasi Kurasi', eucs: 'A', teks: 'Fitur moderasi dan verifikasi publikasi portofolio (verify-publish) efektif menjaga standar mutu karya yang tampil ke publik' },
  { id: 'P5', peran: 'admin', fitur: 'Pratinjau Admin', eucs: 'E', teks: 'Fitur pratinjau (preview) karya pada panel admin mempermudah peninjauan sebelum memberikan persetujuan tayang' },
  { id: 'P6', peran: 'admin', fitur: 'Pengumuman Terjadwal', eucs: 'T', teks: 'Fitur manajemen pengumuman kampus (draft, rilis terjadwal otomatis schedule) berjalan tepat waktu dan andal' },
  { id: 'P7', peran: 'admin', fitur: 'Keamanan Otorisasi', eucs: 'A', teks: 'Pengaturan status platform (settings) dan hak akses peran aman sesuai kewenangan operasional' },
  { id: 'P8', peran: 'admin', fitur: 'Citra Kelembagaan', eucs: 'F', teks: 'Tampilan etalase publik portofolio mencerminkan reputasi profesional Politeknik IDN di mata masyarakat dan industri' },
  { id: 'P9', peran: 'admin', fitur: 'Analitik Pimpinan', eucs: 'C', teks: 'Visualisasi grafik statistik membantu pimpinan dalam monitoring capaian indikator kinerja institusi' },
  { id: 'P10', peran: 'admin', fitur: 'Impresi Industri', eucs: 'T', teks: 'Kecepatan akses dan responsivitas platform memberikan pengalaman positif bagi mitra industri dan recruiter' },
  { id: 'P11', peran: 'admin', fitur: 'Dukungan Akreditasi', eucs: 'C', teks: 'Platform Portofolio IDN sangat mendukung pemenuhan dokumentasi luaran karya untuk akreditasi program studi' },
  { id: 'P12', peran: 'admin', fitur: 'Keberlanjutan Sistem', eucs: 'A', teks: 'Platform memiliki keandalan sistem dan keamanan data yang baik untuk keberlanjutan operasional jangka panjang' },
  { id: 'P13', peran: 'admin', fitur: 'Kesiapan Kerja Lulusan', eucs: 'C', teks: 'Implementasi Portofolio IDN berhasil memperkuat sinergi link and match antara lulusan kampus dengan kebutuhan industri' }
];

/* ---------- Susunan Kolom Sheet Respon (67 Kolom) ---------- */

const HEADERS = (function () {
  const out = [
    'timestamp', 'id_respon', 'versi_form', 'peran', 'nama', 'nim', 'prodi', 'kode_prodi',
    'pengalaman_portofolio', 'frekuensi_akses', 'perangkat', 'durasi_detik', 'user_agent'
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
  M_OPEN_1: { peran: 'mahasiswa', label: 'Fitur apa pada platform Portofolio IDN yang paling Anda sukai atau paling membantu memamerkan karya Anda?' },
  M_OPEN_2: { peran: 'mahasiswa', label: 'Kendala teknis apa yang pernah Anda alami saat mengunggah atau mengelola portofolio di platform ini?' },
  D_OPEN_1: { peran: 'dosen', label: 'Aspek apa yang menurut Anda masih memerlukan penyempurnaan dalam proses peninjauan atau kurasi karya mahasiswa?' },
  D_OPEN_2: { peran: 'dosen', label: 'Fitur tambahan apa yang paling Anda harapkan untuk mendukung pembimbingan portofolio mahasiswa ke depan?' },
  P_OPEN_1: { peran: 'admin', label: 'Informasi atau metrik analitik tambahan apa yang paling Anda butuhkan pada dashboard eksekutif?' },
  P_OPEN_2: { peran: 'admin', label: 'Apa saran prioritas Anda untuk pengembangan jangka panjang dan integrasi platform Portofolio IDN ke depan?' },
  Z3: { peran: '*', label: 'Kritik, saran, atau masukan bebas untuk peningkatan kualitas layanan platform Portofolio IDN' }
};

const PROFILE_OPTIONS = {
  pengalaman_portofolio: [
    'Belum pernah',
    '1–2 karya diunggah/ditinjau',
    '3–5 karya diunggah/ditinjau',
    'Lebih dari 5 karya diunggah/ditinjau'
  ],
  frekuensi: [
    'Setiap hari',
    'Beberapa kali seminggu',
    'Sebulan sekali',
    'Saat ada tugas/event pameran saja'
  ],
  perangkat: ['Laptop / PC', 'HP (Smartphone)', 'Tablet']
};

const TEXT_HEADERS = [
  'id_respon', 'versi_form', 'peran', 'nama', 'nim', 'prodi', 'kode_prodi',
  'pengalaman_portofolio', 'frekuensi_akses', 'perangkat', 'user_agent'
].concat(OPEN_IDS);

const ITEMS_BY_ROLE = {
  mahasiswa: ITEMS.filter(function (it) { return it.peran === 'mahasiswa'; }),
  dosen: ITEMS.filter(function (it) { return it.peran === 'dosen'; }),
  admin: ITEMS.filter(function (it) { return it.peran === 'admin'; })
};

/* ---------- Pembacaan Pengaturan Spreadsheet ---------- */

function getDashboardPin_() {
  try {
    const ss = getSS_();
    const sh = ss.getSheetByName(PENGATURAN_NAME);
    if (sh && sh.getLastRow() >= 2) {
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
      const val = String(sh.getRange(3, 2).getValue() || '').trim();
      if (val !== '') return val;
    }
  } catch (err) {
    console.warn('Gagal membaca Token dari sheet Pengaturan: ' + err);
  }
  return String(SECRET || '').trim();
}

/* ---------- Entry Points (doGet & doPost) ---------- */

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
    service: 'Kuesioner Kepuasan Platform Portofolio IDN',
    institution: 'Politeknik IDN Bogor',
    version: 'v1',
    appUrl: 'https://portofolio.politeknikidn.id',
    endpoints: { submit: 'POST /exec', dashboard: 'GET /exec?mode=rekap' },
    message: 'Endpoint Web App aktif. Pengiriman jawaban kuesioner menggunakan metode POST.'
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

    const nim = peran === 'mahasiswa' ? clean_(data.nim, 40) : '';
    if (peran === 'mahasiswa' && !nim) {
      return json_({ ok: false, error: 'nim_kosong' });
    }

    const scoreError = validateScores_(peran, data);
    if (scoreError) {
      return json_({ ok: false, error: scoreError });
    }

    const sheet = getSheet_();
    const idRespon = clean_(data.id_respon, 64);

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

/* ---------- Setup Sheet Otomatis ---------- */

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
  ensureRows_(sh, 7);

  // Header
  sh.getRange(1, 1, 1, 3).merge()
    .setValue('Pengaturan Kuesioner Platform Portofolio IDN & Dashboard')
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
  sh.getRange(2, 3).setValue('Ketik PIN di kolom B untuk mengunci dashboard hasil survei. Kosongkan cell ini jika dashboard dibuka bebas tanpa kode.')
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
  sh.getRange(4, 3).setValue('Status proteksi otomatis terbaca oleh script saat dashboard web dibuka.')
    .setFontColor('#64748b').setFontSize(9);

  // Row 5: Target Evaluasi / URL
  sh.getRange(5, 1).setValue('Target Evaluasi / URL').setFontWeight('bold');
  sh.getRange(5, 2).setValue('https://portofolio.politeknikidn.id').setNumberFormat('@');
  sh.getRange(5, 3).setValue('Tautan resmi platform Portofolio IDN yang dievaluasi.')
    .setFontColor('#64748b').setFontSize(9);

  // Row 6: Versi Kuesioner
  sh.getRange(6, 1).setValue('Versi Kuesioner').setFontWeight('bold');
  sh.getRange(6, 2).setValue('v1').setNumberFormat('@');
  sh.getRange(6, 3).setValue('Versi instrumen survei saat ini.')
    .setFontColor('#64748b').setFontSize(9);

  // Styling
  sh.setColumnWidth(1, 230);
  sh.setColumnWidth(2, 220);
  sh.setColumnWidth(3, 440);
  sh.setRowHeight(2, 30);
  sh.setRowHeight(3, 30);
  sh.setRowHeight(4, 30);
  sh.setRowHeight(5, 30);
  sh.setRowHeight(6, 30);
  sh.setTabColor('#f59e0b');
  sh.getRange(2, 1, 5, 3).setFontFamily('Inter').setFontSize(10).setVerticalAlignment('middle');
  sh.getRange(2, 2, 5, 1).setBackground('#fffbeb').setFontColor('#0f172a');

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
    pengalaman: colOf_('pengalaman_portofolio'),
    frekuensi: colOf_('frekuensi_akses'),
    perangkat: colOf_('perangkat')
  };

  function ref_(col) {
    return 'Respon!$' + col + '$2:$' + col;
  }

  /* Judul */
  sh.getRange(1, 1, 1, LAST_COL).merge()
    .setValue('Rekapitulasi Kuesioner Kepuasan Platform Portofolio IDN')
    .setFontSize(16).setFontWeight('bold')
    .setFontColor('#ffffff').setBackground('#1e1b4b')
    .setVerticalAlignment('middle');
  sh.setRowHeight(1, 42);

  sh.getRange(2, 1, 1, LAST_COL).merge()
    .setValue('Dihitung otomatis dari sheet "Respon". Untuk memperbarui formula setelah ada penyesuaian, jalankan menu Portofolio Survey → Bangun ulang sheet Rekap.')
    .setFontSize(9).setFontColor('#475569')
    .setVerticalAlignment('middle');
  sh.setRowHeight(2, 28);

  /* Ringkasan Eksekutif */
  let r = 4;
  section_(sh, r++, 'Ringkasan Eksekutif', LAST_COL);

  summary_(sh, r++, 'Total Respons Masuk', '=COUNTA(' + ref_(C.timestamp) + ')', '#,##0');
  summary_(sh, r++, 'Mahasiswa', '=COUNTIF(' + ref_(C.peran) + ',"mahasiswa")', '#,##0');
  summary_(sh, r++, 'Dosen / Kurator', '=COUNTIF(' + ref_(C.peran) + ',"dosen")', '#,##0');
  summary_(sh, r++, 'Pimpinan / Admin', '=COUNTIF(' + ref_(C.peran) + ',"admin")', '#,##0');
  const rowZ1 = r;
  summary_(sh, r++, 'Rata-rata Kepuasan Umum (Z1, 1–5)',
    '=IFERROR(AVERAGE(' + ref_(C.z1) + '),"")', '0.00');
  summary_(sh, r++, 'Indeks Kepuasan Keseluruhan (Z1 ÷ 5)',
    '=IFERROR(B' + rowZ1 + '/5,"")', '0.0%');
  const rowNps = r;
  summary_(sh, r++, 'Net Promoter Score (NPS / Z2)',
    '=IFERROR((COUNTIF(' + ref_(C.z2) + ',">=9")-COUNTIF(' + ref_(C.z2) + ',"<=6"))/' +
    'COUNT(' + ref_(C.z2) + '),"")', '0.0%');
  summary_(sh, r++, 'Kategori Mutu NPS',
    '=IF(B' + rowNps + '="","",IF(B' + rowNps + '>=0.5,"Sangat baik",' +
    'IF(B' + rowNps + '>=0,"Baik","Perlu perbaikan")))', '');
  summary_(sh, r++, 'Rata-rata Durasi Pengisian (detik)',
    '=IFERROR(AVERAGE(' + ref_(C.durasi) + '),"")', '#,##0');
  summary_(sh, r++, 'Total Butir Evaluasi',
    ITEMS.length, '#,##0');

  r++;
  sh.getRange(r, 1, 1, LAST_COL).merge()
    .setValue('Catatan: Jumlah respons mencerminkan partisipasi pengisian. Seluruh baris dihitung secara agregat.')
    .setFontSize(9).setFontColor('#b45309')
    .setBackground('#fffbeb').setWrap(true).setVerticalAlignment('middle');
  sh.setRowHeight(r, 30);
  r += 2;

  /* Rata-rata per Butir Soal */
  section_(sh, r++, 'Rata-rata Skor per Butir Evaluasi (Likert 1–5)', LAST_COL);
  const itemHead = r;
  tableHeader_(sh, r++, ['Peran', 'Kode', 'Pernyataan Evaluasi', 'Fitur Aplikasi', 'EUCS', 'Rata-rata', 'Jumlah N', 'Indeks (%)', 'Kategori Mutu']);
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
    tableHeader_(sh, itemHead, ['Peran', 'Kode', 'Pernyataan Evaluasi', 'Fitur Aplikasi', 'EUCS', 'Rata-rata', 'Jumlah N', 'Indeks (%)', 'Kategori Mutu']);
  }

  /* Rata-rata per Dimensi EUCS */
  r++;
  section_(sh, r++, 'Rata-rata per Dimensi EUCS', LAST_COL);
  tableHeader_(sh, r++, ['Dimensi EUCS', 'Kode', 'Keterangan Dimensi', 'Mahasiswa', 'Dosen', 'Pimpinan', 'Rata-rata Total', 'Indeks Total', 'Kategori Mutu']);
  const eucsStart = r;

  const EUCS_DESC_MAP = {
    C: 'Dokumentasi proyek berbab, kelengkapan profil, kejelasan kurasi karya, dan visibilitas metrik',
    A: 'Keandalan kompresi WebP, counter likes/views, keamanan akun, dan keabsahan data karya',
    F: 'Kerapian antarmuka showcase, tata letak kartu karya, kenyamanan carousel, dan keterbacaan',
    E: 'Kemudahan registrasi captcha, navigasi menu, form upload, pratinjau, dan verifikasi admin',
    T: 'Kecepatan buka halaman, responsivitas upload WebP, pengumuman, dan ketepatan kurasi karya'
  };

  EUCS_ORDER.forEach(function (code) {
    sh.getRange(r, 1).setValue(EUCS_LABEL[code]);
    sh.getRange(r, 2).setValue(code).setHorizontalAlignment('center');
    sh.getRange(r, 3).setValue(EUCS_DESC_MAP[code]);

    // Rata-rata per peran
    PERAN_LIST.forEach(function (peran, idx) {
      const colLetter = String.fromCharCode(68 + idx); // D, E, F
      const refs = ITEMS.filter(function (it) {
        return it.peran === peran && it.eucs === code;
      }).map(function (it) {
        return ref_(colOf_(it.id));
      });
      const formula = refs.length ? '=IFERROR(AVERAGE(' + refs.join(',') + '),"")' : '""';
      sh.getRange(r, 4 + idx).setFormula(formula).setNumberFormat('0.00').setHorizontalAlignment('center');
    });

    // Rata-rata total
    const allRefs = ITEMS.filter(function (it) {
      return it.eucs === code;
    }).map(function (it) {
      return ref_(colOf_(it.id));
    });
    sh.getRange(r, 7)
      .setFormula('=IFERROR(AVERAGE(' + allRefs.join(',') + '),"")')
      .setNumberFormat('0.00').setHorizontalAlignment('center');
    sh.getRange(r, 8)
      .setFormula('=IFERROR(G' + r + '/5,"")')
      .setNumberFormat('0.0%').setHorizontalAlignment('center');
    sh.getRange(r, 9)
      .setFormula('=IF(G' + r + '="","",IF(G' + r + '>=4.2,"Sangat puas",' +
        'IF(G' + r + '>=3.4,"Puas",IF(G' + r + '>=2.6,"Cukup",' +
        'IF(G' + r + '>=1.8,"Tidak puas","Sangat tidak puas")))))')
      .setHorizontalAlignment('center');
    r++;
  });

  /* Rata-rata per Program Studi */
  r++;
  section_(sh, r++, 'Rata-rata Kepuasan per Program Studi (Mahasiswa & Dosen)', LAST_COL);
  tableHeader_(sh, r++, ['Kode Prodi', 'Nama Program Studi', 'Jumlah Respons', 'Mahasiswa', 'Dosen', 'Rata-rata Z1', 'Indeks (%)', 'Skor NPS', 'Kategori Mutu']);
  const prodiStart = r;

  PRODI.forEach(function (p) {
    sh.getRange(r, 1).setValue(p.kode).setNumberFormat('@').setHorizontalAlignment('center');
    sh.getRange(r, 2).setValue(p.nama);
    sh.getRange(r, 3)
      .setFormula('=COUNTIF(' + ref_(C.kode) + ',"' + p.kode + '")')
      .setNumberFormat('#,##0').setHorizontalAlignment('center');
    sh.getRange(r, 4)
      .setFormula('=COUNTIFS(' + ref_(C.kode) + ',"' + p.kode + '",' + ref_(C.peran) + ',"mahasiswa")')
      .setNumberFormat('#,##0').setHorizontalAlignment('center');
    sh.getRange(r, 5)
      .setFormula('=COUNTIFS(' + ref_(C.kode) + ',"' + p.kode + '",' + ref_(C.peran) + ',"dosen")')
      .setNumberFormat('#,##0').setHorizontalAlignment('center');
    sh.getRange(r, 6)
      .setFormula('=IFERROR(AVERAGEIFS(' + ref_(C.z1) + ',' + ref_(C.kode) + ',"' + p.kode + '"),"")')
      .setNumberFormat('0.00').setHorizontalAlignment('center');
    sh.getRange(r, 7)
      .setFormula('=IFERROR(F' + r + '/5,"")')
      .setNumberFormat('0.0%').setHorizontalAlignment('center');
    sh.getRange(r, 8)
      .setFormula('=IFERROR((COUNTIFS(' + ref_(C.kode) + ',"' + p.kode + '",' + ref_(C.z2) + ',">=9")-' +
        'COUNTIFS(' + ref_(C.kode) + ',"' + p.kode + '",' + ref_(C.z2) + ',"<=6"))/' +
        'COUNTIFS(' + ref_(C.kode) + ',"' + p.kode + '",' + ref_(C.z2) + ',">=0"),"")')
      .setNumberFormat('0.0%').setHorizontalAlignment('center');
    sh.getRange(r, 9)
      .setFormula('=IF(F' + r + '="","",IF(F' + r + '>=4.2,"Sangat puas",' +
        'IF(F' + r + '>=3.4,"Puas",IF(F' + r + '>=2.6,"Cukup",' +
        'IF(F' + r + '>=1.8,"Tidak puas","Sangat tidak puas")))))')
      .setHorizontalAlignment('center');
    r++;
  });

  /* Styling Sheet Rekap */
  sh.setColumnWidth(1, 110);
  sh.setColumnWidth(2, 70);
  sh.setColumnWidth(3, 400);
  sh.setColumnWidth(4, 160);
  sh.setColumnWidth(5, 75);
  sh.setColumnWidth(6, 100);
  sh.setColumnWidth(7, 110);
  sh.setColumnWidth(8, 95);
  sh.setColumnWidth(9, 130);
  sh.setFrozenRows(3);
  sh.setTabColor('#4f46e5');
  sh.getRange(1, 1, sh.getMaxRows(), LAST_COL).setFontFamily('Inter').setFontSize(10);
  sh.getRange(1, 1, 1, LAST_COL).setFontSize(16);

  return 'Sheet "' + REKAP_NAME + '" berhasil dibangun ulang (' + ITEMS.length + ' butir evaluasi).';
}

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
    .setValue('Visualisasi Grafik Kepuasan Platform Portofolio IDN')
    .setFontSize(16).setFontWeight('bold')
    .setFontColor('#ffffff').setBackground('#1e1b4b')
    .setVerticalAlignment('middle');
  sh.setRowHeight(1, 42);

  sh.getRange(2, 1, 1, GRID_COLS).merge()
    .setValue('Grafik terhubung otomatis dengan sheet "Respon". Klik ikon titik tiga (⋮) pada tiap grafik untuk menyalin atau mengunduh sebagai PNG/PDF.')
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

  /* Tabel Sumber Data Grafik (Baris 58 ke bawah) */
  const SRC_ROW = 59;
  section_(sh, SRC_ROW - 1, 'Tabel Sumber Grafik Otomatis', GRID_COLS);

  // 1) Sebaran Peran
  tableHeader_(sh, SRC_ROW, ['Peran', 'Jumlah']);
  const rolesRows = [
    ['Mahasiswa', '=COUNTIF(' + ref_(C.peran) + ',"mahasiswa")'],
    ['Dosen / Kurator', '=COUNTIF(' + ref_(C.peran) + ',"dosen")'],
    ['Pimpinan / Admin', '=COUNTIF(' + ref_(C.peran) + ',"admin")']
  ];
  rolesRows.forEach(function (pair, idx) {
    sh.getRange(SRC_ROW + 1 + idx, 1).setValue(pair[0]);
    sh.getRange(SRC_ROW + 1 + idx, 2).setFormula(pair[1]).setNumberFormat('#,##0');
  });
  const rangePeran = sh.getRange(SRC_ROW, 1, 4, 2);

  // 2) Komposisi NPS
  sh.getRange(SRC_ROW, 4, 1, 2).setValues([['Kategori NPS', 'Jumlah']])
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

  // 3) Kepuasan per Prodi
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

  // 4) Perangkat Responden
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

  // 5) Rata-rata Dimensi EUCS per Peran
  const EUCS_ROW = SRC_ROW + 6;
  tableHeader_(sh, EUCS_ROW, ['Dimensi EUCS', 'Mahasiswa', 'Dosen', 'Pimpinan']);
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

  /* Bangun 5 Grafik Google Sheets */
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
    .setOption('title', 'Komposisi Rekomendasi Net Promoter Score (NPS)')
    .setOption('pieHole', 0.45)
    .setOption('colors', ['#10b981', '#f59e0b', '#ef4444'])
    .setOption('legend', { position: 'bottom' })
    .setOption('width', 530)
    .setOption('height', 295)
    .setPosition(7, 7, 0, 0)
    .build();

  const chartProdi = sh.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(rangeProdi)
    .setNumHeaders(1)
    .setOption('title', 'Rata-rata Kepuasan Umum (Z1) per Program Studi')
    .setOption('colors', ['#2563eb'])
    .setOption('legend', { position: 'none' })
    .setOption('vAxis', { minValue: 1, maxValue: 5, gridlines: { count: 5 } })
    .setOption('width', 530)
    .setOption('height', 295)
    .setPosition(24, 1, 0, 0)
    .build();

  const chartPerangkat = sh.newChart()
    .setChartType(Charts.ChartType.BAR)
    .addRange(rangePerangkat)
    .setNumHeaders(1)
    .setOption('title', 'Perangkat Utama Responden')
    .setOption('colors', ['#0f766e'])
    .setOption('legend', { position: 'none' })
    .setOption('width', 530)
    .setOption('height', 295)
    .setPosition(24, 7, 0, 0)
    .build();

  const chartEucs = sh.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(rangeEucs)
    .setNumHeaders(1)
    .setOption('title', 'Rata-rata 5 Dimensi EUCS per Peran Pengguna')
    .setOption('colors', ['#4f46e5', '#0ea5e9', '#0f766e'])
    .setOption('legend', { position: 'bottom' })
    .setOption('vAxis', { minValue: 1, maxValue: 5, gridlines: { count: 5 } })
    .setOption('width', 1080)
    .setOption('height', 340)
    .setPosition(41, 1, 0, 0)
    .build();

  sh.insertChart(chartPeran);
  sh.insertChart(chartNps);
  sh.insertChart(chartProdi);
  sh.insertChart(chartPerangkat);
  sh.insertChart(chartEucs);

  /* Styling Sheet Visualisasi */
  for (let c = 1; c <= GRID_COLS; c++) {
    sh.setColumnWidth(c, 90);
  }
  sh.setTabColor('#0ea5e9');
  sh.getRange(1, 1, sh.getMaxRows(), GRID_COLS).setFontFamily('Inter').setFontSize(10);
  sh.getRange(1, 1, 1, GRID_COLS).setFontSize(16);

  return 'Sheet "' + VISUAL_NAME + '" berhasil dibangun ulang (5 grafik Google Sheets terpasang).';
}

/* ---------- Aggregator Dashboard untuk Web App (doGet) ---------- */

function buildDashboardData_(params) {
  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();
  const meta = {
    version: 'v1',
    roles: PERAN_LABEL,
    eucs: EUCS_LABEL,
    prodi: PRODI
  };

  if (lastRow < 2) {
    return {
      ok: true,
      generatedAt: new Date().toISOString(),
      filter: { from: params.from || '', to: params.to || '' },
      range: { firstDate: '', lastDate: '' },
      meta: meta,
      slices: {
        all: emptySlice_(),
        mahasiswa: emptySlice_(),
        dosen: emptySlice_(),
        admin: emptySlice_()
      },
      items: [],
      byProdi: [],
      feedback: []
    };
  }

  const values = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();

  // Parsing & Filter Tanggal
  const fromTime = params.from ? parseDateFilter_(params.from, false) : 0;
  const toTime = params.to ? parseDateFilter_(params.to, true) : Infinity;

  const validRows = [];
  let minDate = '';
  let maxDate = '';

  for (let i = 0; i < values.length; i++) {
    const rawRow = values[i];
    const ts = rawRow[colIndex_('timestamp') - 1];
    const d = ts instanceof Date ? ts : new Date(ts);
    const time = d.getTime();

    if (isNaN(time)) continue;
    if (time < fromTime || time > toTime) continue;

    const iso = d.toISOString().slice(0, 10);
    if (!minDate || iso < minDate) minDate = iso;
    if (!maxDate || iso > maxDate) maxDate = iso;

    validRows.push({
      date: iso,
      peran: String(rawRow[colIndex_('peran') - 1] || ''),
      prodi: String(rawRow[colIndex_('prodi') - 1] || ''),
      kode_prodi: String(rawRow[colIndex_('kode_prodi') - 1] || ''),
      pengalaman_portofolio: String(rawRow[colIndex_('pengalaman_portofolio') - 1] || ''),
      frekuensi_akses: String(rawRow[colIndex_('frekuensi_akses') - 1] || ''),
      perangkat: String(rawRow[colIndex_('perangkat') - 1] || ''),
      durasi_detik: Number(rawRow[colIndex_('durasi_detik') - 1]) || 0,
      scores: extractScoresFromRow_(rawRow),
      opens: extractOpensFromRow_(rawRow),
      z1: toIntOrNull_(rawRow[colIndex_('Z1') - 1], 1, 5),
      z2: toIntOrNull_(rawRow[colIndex_('Z2') - 1], 0, 10)
    });
  }

  const slices = {
    all: aggregateSlice_(validRows, null),
    mahasiswa: aggregateSlice_(validRows, 'mahasiswa'),
    dosen: aggregateSlice_(validRows, 'dosen'),
    admin: aggregateSlice_(validRows, 'admin')
  };

  const items = aggregateItems_(validRows);
  const byProdi = aggregateByProdi_(validRows);
  const feedback = aggregateFeedback_(validRows);

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    filter: { from: params.from || '', to: params.to || '' },
    range: { firstDate: minDate, lastDate: maxDate },
    meta: meta,
    slices: slices,
    items: items,
    byProdi: byProdi,
    feedback: feedback
  };
}

function emptySlice_() {
  const eucsObj = {};
  EUCS_ORDER.forEach(function (k) {
    eucsObj[k] = { kode: k, label: EUCS_LABEL[k], avg: null, indexPct: null, category: '', count: 0 };
  });
  return {
    count: 0,
    avgDurationSec: 0,
    z1Avg: null,
    z1IndexPct: null,
    z1Category: '',
    z1Dist: [0, 0, 0, 0, 0],
    nps: null,
    npsCategory: '',
    npsBreakdown: { promoter: 0, passive: 0, detractor: 0, total: 0 },
    npsDist: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    eucs: eucsObj,
    profiles: {
      pengalaman_portofolio: PROFILE_OPTIONS.pengalaman_portofolio.map(function (label) { return { label: label, count: 0 }; }),
      frekuensi: PROFILE_OPTIONS.frekuensi.map(function (label) { return { label: label, count: 0 }; }),
      perangkat: PROFILE_OPTIONS.perangkat.map(function (label) { return { label: label, count: 0 }; })
    },
    timeline: []
  };
}

function aggregateSlice_(rows, roleFilter) {
  const filtered = roleFilter ? rows.filter(function (r) { return r.peran === roleFilter; }) : rows;
  const count = filtered.length;
  if (!count) return emptySlice_();

  let totalDuration = 0;
  let z1Sum = 0;
  let z1Count = 0;
  const z1Dist = [0, 0, 0, 0, 0];

  let prom = 0;
  let pass = 0;
  let detr = 0;
  let npsCount = 0;
  const npsDist = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  const profileCounters = {
    pengalaman_portofolio: {},
    frekuensi: {},
    perangkat: {}
  };
  PROFILE_OPTIONS.pengalaman_portofolio.forEach(function (opt) { profileCounters.pengalaman_portofolio[opt] = 0; });
  PROFILE_OPTIONS.frekuensi.forEach(function (opt) { profileCounters.frekuensi[opt] = 0; });
  PROFILE_OPTIONS.perangkat.forEach(function (opt) { profileCounters.perangkat[opt] = 0; });

  const timelineMap = {};

  filtered.forEach(function (r) {
    totalDuration += r.durasi_detik || 0;

    if (r.z1 !== null) {
      z1Sum += r.z1;
      z1Count++;
      z1Dist[r.z1 - 1]++;
    }

    if (r.z2 !== null) {
      npsCount++;
      npsDist[r.z2]++;
      if (r.z2 >= 9) prom++;
      else if (r.z2 >= 7) pass++;
      else detr++;
    }

    if (r.pengalaman_portofolio && profileCounters.pengalaman_portofolio[r.pengalaman_portofolio] !== undefined) {
      profileCounters.pengalaman_portofolio[r.pengalaman_portofolio]++;
    }
    if (r.frekuensi_akses && profileCounters.frekuensi[r.frekuensi_akses] !== undefined) {
      profileCounters.frekuensi[r.frekuensi_akses]++;
    }
    if (r.perangkat && profileCounters.perangkat[r.perangkat] !== undefined) {
      profileCounters.perangkat[r.perangkat]++;
    }

    timelineMap[r.date] = (timelineMap[r.date] || 0) + 1;
  });

  const z1Avg = z1Count ? Math.round((z1Sum / z1Count) * 100) / 100 : null;
  const z1IndexPct = z1Avg !== null ? Math.round((z1Avg / 5) * 1000) / 10 : null;
  const z1Category = categorizeScore_(z1Avg);

  const npsVal = npsCount ? Math.round(((prom - detr) / npsCount) * 1000) / 10 : null;
  const npsCategory = npsVal === null ? '' : (npsVal >= 50 ? 'Sangat baik' : (npsVal >= 0 ? 'Baik' : 'Perlu perbaikan'));

  // EUCS 5 Pilar
  const eucsObj = {};
  EUCS_ORDER.forEach(function (code) {
    const applicableItems = (roleFilter ? ITEMS_BY_ROLE[roleFilter] : ITEMS).filter(function (it) {
      return it.eucs === code;
    });

    let eucsSum = 0;
    let eucsN = 0;
    applicableItems.forEach(function (it) {
      filtered.forEach(function (r) {
        const val = r.scores[it.id];
        if (val !== undefined && val !== null) {
          eucsSum += val;
          eucsN++;
        }
      });
    });

    const mean = eucsN ? Math.round((eucsSum / eucsN) * 100) / 100 : null;
    eucsObj[code] = {
      kode: code,
      label: EUCS_LABEL[code],
      avg: mean,
      indexPct: mean !== null ? Math.round((mean / 5) * 1000) / 10 : null,
      category: categorizeScore_(mean),
      count: eucsN
    };
  });

  // Timeline
  const timeline = Object.keys(timelineMap).sort().map(function (d) {
    return { date: d, count: timelineMap[d] };
  });

  return {
    count: count,
    avgDurationSec: Math.round(totalDuration / count),
    z1Avg: z1Avg,
    z1IndexPct: z1IndexPct,
    z1Category: z1Category,
    z1Dist: z1Dist,
    nps: npsVal,
    npsCategory: npsCategory,
    npsBreakdown: { promoter: prom, passive: pass, detractor: detr, total: npsCount },
    npsDist: npsDist,
    eucs: eucsObj,
    profiles: {
      pengalaman_portofolio: PROFILE_OPTIONS.pengalaman_portofolio.map(function (opt) {
        return { label: opt, count: profileCounters.pengalaman_portofolio[opt] || 0 };
      }),
      frekuensi: PROFILE_OPTIONS.frekuensi.map(function (opt) {
        return { label: opt, count: profileCounters.frekuensi[opt] || 0 };
      }),
      perangkat: PROFILE_OPTIONS.perangkat.map(function (opt) {
        return { label: opt, count: profileCounters.perangkat[opt] || 0 };
      })
    },
    timeline: timeline
  };
}

function aggregateItems_(rows) {
  return ITEMS.map(function (it) {
    let sum = 0;
    let n = 0;
    const dist = [0, 0, 0, 0, 0];

    rows.forEach(function (r) {
      if (r.peran !== it.peran) return;
      const v = r.scores[it.id];
      if (v >= 1 && v <= 5) {
        sum += v;
        n++;
        dist[v - 1]++;
      }
    });

    const avg = n ? Math.round((sum / n) * 100) / 100 : null;
    return {
      id: it.id,
      peran: it.peran,
      peranLabel: PERAN_LABEL[it.peran],
      fitur: it.fitur,
      eucs: it.eucs,
      eucsLabel: EUCS_LABEL[it.eucs],
      teks: it.teks,
      count: n,
      avg: avg,
      indexPct: avg !== null ? Math.round((avg / 5) * 1000) / 10 : null,
      category: categorizeScore_(avg),
      dist: dist
    };
  });
}

function aggregateByProdi_(rows) {
  return PRODI.map(function (p) {
    const prodiRows = rows.filter(function (r) { return r.kode_prodi === p.kode; });
    const count = prodiRows.length;
    let z1Sum = 0;
    let z1N = 0;
    let prom = 0;
    let detr = 0;
    let npsN = 0;
    const byRole = { mahasiswa: 0, dosen: 0 };

    prodiRows.forEach(function (r) {
      if (byRole[r.peran] !== undefined) byRole[r.peran]++;
      if (r.z1 !== null) { z1Sum += r.z1; z1N++; }
      if (r.z2 !== null) {
        npsN++;
        if (r.z2 >= 9) prom++;
        else if (r.z2 <= 6) detr++;
      }
    });

    const z1Avg = z1N ? Math.round((z1Sum / z1N) * 100) / 100 : null;
    const npsVal = npsN ? Math.round(((prom - detr) / npsN) * 1000) / 10 : null;

    return {
      kode: p.kode,
      nama: p.nama,
      count: count,
      byRole: byRole,
      z1Avg: z1Avg,
      z1IndexPct: z1Avg !== null ? Math.round((z1Avg / 5) * 1000) / 10 : null,
      z1Category: categorizeScore_(z1Avg),
      nps: npsVal,
      npsCategory: npsVal === null ? '' : (npsVal >= 50 ? 'Sangat baik' : (npsVal >= 0 ? 'Baik' : 'Perlu perbaikan'))
    };
  });
}

function aggregateFeedback_(rows) {
  const out = [];
  rows.forEach(function (r) {
    OPEN_IDS.forEach(function (qid) {
      const txt = (r.opens[qid] || '').trim();
      if (!txt) return;
      const meta = OPEN_QUESTIONS_META[qid] || {};
      out.push({
        peran: r.peran,
        peranLabel: PERAN_LABEL[r.peran] || r.peran,
        kode: qid,
        pertanyaan: meta.label || qid,
        teks: txt,
        tanggal: r.date
      });
    });
  });
  return out.slice(-80).reverse();
}

/* ---------- Helpers Teknis Spreadsheet ---------- */

function getSS_() {
  if (SHEET_ID) return SpreadsheetApp.openById(SHEET_ID);
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet_() {
  const ss = getSS_();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

function colIndex_(name) {
  const idx = HEADERS.indexOf(name);
  if (idx === -1) throw new Error('Kolom tidak ditemukan: ' + name);
  return idx + 1;
}

function colLetter_(colNum) {
  let letter = '';
  let temp = colNum;
  while (temp > 0) {
    const mod = (temp - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    temp = Math.floor((temp - mod) / 26);
  }
  return letter;
}

function colOf_(name) {
  return colLetter_(colIndex_(name));
}

function ensureColumns_(sh, needed) {
  const cur = sh.getMaxColumns();
  if (cur < needed) sh.insertColumnsAfter(cur, needed - cur);
}

function ensureRows_(sh, needed) {
  const cur = sh.getMaxRows();
  if (cur < needed) sh.insertRowsAfter(cur, needed - cur);
}

function clean_(val, maxLen) {
  if (val === null || val === undefined) return '';
  let s = String(val).replace(/[\r\n\t]+/g, ' ').trim();
  if (s && /^[\x3D\x2B\x2D\x40\x27]/.test(s)) {
    s = "'" + s;
  }
  return s.slice(0, maxLen || 500);
}

function toIntOrNull_(val, min, max) {
  if (val === '' || val === null || typeof val === 'undefined') return null;
  const n = Number(val);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

function validateScores_(peran, data) {
  const items = ITEMS_BY_ROLE[peran] || [];
  for (let i = 0; i < items.length; i++) {
    const id = items[i].id;
    const v = data[id];
    const n = Number(v);
    if (!Number.isInteger(n) || n < 1 || n > 5) {
      return 'skor_' + id;
    }
  }
  const z1 = Number(data.Z1);
  if (!Number.isInteger(z1) || z1 < 1 || z1 > 5) return 'skor_Z1';

  const z2 = Number(data.Z2);
  if (!Number.isInteger(z2) || z2 < 0 || z2 > 10) return 'skor_Z2';

  return null;
}

function buildRow_(data, sanitized) {
  const now = new Date();
  const row = new Array(HEADERS.length);

  row[colIndex_('timestamp') - 1] = now;
  row[colIndex_('id_respon') - 1] = sanitized.id_respon;
  row[colIndex_('versi_form') - 1] = clean_(data.versi_form, 16);
  row[colIndex_('peran') - 1] = clean_(data.peran, 20);
  row[colIndex_('nama') - 1] = sanitized.nama;
  row[colIndex_('nim') - 1] = sanitized.nim;

  if (data.peran === 'admin') {
    row[colIndex_('prodi') - 1] = '';
    row[colIndex_('kode_prodi') - 1] = '';
  } else {
    row[colIndex_('prodi') - 1] = clean_(data.prodi, 100);
    row[colIndex_('kode_prodi') - 1] = clean_(data.kode_prodi, 16);
  }

  row[colIndex_('pengalaman_portofolio') - 1] = clean_(data.pengalaman_portofolio, 60);
  row[colIndex_('frekuensi_akses') - 1] = clean_(data.frekuensi_akses, 60);
  row[colIndex_('perangkat') - 1] = clean_(data.perangkat, 40);
  row[colIndex_('durasi_detik') - 1] = Number(data.durasi_detik) || 0;
  row[colIndex_('user_agent') - 1] = clean_(data.user_agent, 255);

  ITEMS.forEach(function (it) {
    const idx = colIndex_(it.id) - 1;
    if (it.peran === data.peran && data[it.id] !== undefined) {
      row[idx] = Number(data[it.id]);
    } else {
      row[idx] = '';
    }
  });

  row[colIndex_('Z1') - 1] = Number(data.Z1);
  row[colIndex_('Z2') - 1] = Number(data.Z2);

  OPEN_IDS.forEach(function (oid) {
    const idx = colIndex_(oid) - 1;
    const roleForOpen = OPEN_ROLE_MAP[oid];
    if ((roleForOpen === '*' || roleForOpen === data.peran) && data[oid]) {
      row[idx] = clean_(data[oid], 2000);
    } else {
      row[idx] = '';
    }
  });

  return row;
}

function findRowByResponseId_(sheet, idRespon) {
  if (!idRespon) return 0;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  const col = colIndex_('id_respon');
  const ids = sheet.getRange(2, col, lastRow - 1, 1).getValues();
  for (let i = ids.length - 1; i >= 0; i--) {
    if (String(ids[i][0]).trim() === idRespon) {
      return i + 2;
    }
  }
  return 0;
}

function extractScoresFromRow_(rawRow) {
  const scores = {};
  ITEMS.forEach(function (it) {
    const v = rawRow[colIndex_(it.id) - 1];
    const n = toIntOrNull_(v, 1, 5);
    if (n !== null) scores[it.id] = n;
  });
  return scores;
}

function extractOpensFromRow_(rawRow) {
  const opens = {};
  OPEN_IDS.forEach(function (qid) {
    opens[qid] = String(rawRow[colIndex_(qid) - 1] || '');
  });
  return opens;
}

function parseDateFilter_(str, endOfDay) {
  const parts = String(str).split('-');
  if (parts.length !== 3) return 0;
  const y = Number(parts[0]);
  const m = Number(parts[1]) - 1;
  const d = Number(parts[2]);
  const dt = new Date(y, m, d, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0);
  return dt.getTime();
}

function categorizeScore_(avg) {
  if (avg === null || !isFinite(avg)) return '';
  if (avg >= 4.2) return 'Sangat puas';
  if (avg >= 3.4) return 'Puas';
  if (avg >= 2.6) return 'Cukup';
  if (avg >= 1.8) return 'Tidak puas';
  return 'Sangat tidak puas';
}

function section_(sh, row, title, cols) {
  sh.getRange(row, 1, 1, cols).merge()
    .setValue(title)
    .setFontSize(11).setFontWeight('bold')
    .setFontColor('#0f172a').setBackground('#f1f5f9')
    .setVerticalAlignment('middle');
  sh.setRowHeight(row, 28);
}

function summary_(sh, row, label, formulaOrVal, format) {
  sh.getRange(row, 1).setValue(label).setFontWeight('bold');
  const c = sh.getRange(row, 2);
  if (typeof formulaOrVal === 'string' && formulaOrVal.charAt(0) === '=') {
    c.setFormula(formulaOrVal);
  } else {
    c.setValue(formulaOrVal);
  }
  if (format) c.setNumberFormat(format);
  c.setFontWeight('bold').setHorizontalAlignment('center');
  sh.setRowHeight(row, 24);
}

function tableHeader_(sh, row, cols) {
  const range = sh.getRange(row, 1, 1, cols.length);
  range.setValues([cols])
    .setFontWeight('bold').setFontColor('#ffffff').setBackground('#4f46e5')
    .setVerticalAlignment('middle');
  sh.setRowHeight(row, 28);
}

function formatSheet_(sheet) {
  ensureColumns_(sheet, HEADERS.length);
  ensureRows_(sheet, 100);

  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setValues([HEADERS]);
  headerRange
    .setFontFamily('Inter').setFontSize(10).setFontWeight('bold')
    .setFontColor('#ffffff').setBackground('#1e1b4b')
    .setHorizontalAlignment('center').setVerticalAlignment('middle')
    .setWrap(false);
  sheet.setRowHeight(1, 36);
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(4);
  sheet.setTabColor('#1e1b4b');

  sheet.setColumnWidth(colIndex_('timestamp'), 160);
  sheet.setColumnWidth(colIndex_('id_respon'), 190);
  sheet.setColumnWidth(colIndex_('versi_form'), 95);
  sheet.setColumnWidth(colIndex_('peran'), 110);
  sheet.setColumnWidth(colIndex_('nama'), 200);
  sheet.setColumnWidth(colIndex_('nim'), 130);
  sheet.setColumnWidth(colIndex_('prodi'), 240);
  sheet.setColumnWidth(colIndex_('kode_prodi'), 100);
  sheet.setColumnWidth(colIndex_('pengalaman_portofolio'), 180);
  sheet.setColumnWidth(colIndex_('frekuensi_akses'), 180);
  sheet.setColumnWidth(colIndex_('perangkat'), 140);
  sheet.setColumnWidth(colIndex_('durasi_detik'), 110);
  sheet.setColumnWidth(colIndex_('user_agent'), 220);

  ITEMS.forEach(function (it) {
    sheet.setColumnWidth(colIndex_(it.id), 55);
  });
  sheet.setColumnWidth(colIndex_('Z1'), 60);
  sheet.setColumnWidth(colIndex_('Z2'), 60);

  OPEN_IDS.forEach(function (qid) {
    sheet.setColumnWidth(colIndex_(qid), 240);
  });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ---------- Custom UI Menu Spreadsheet ---------- */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Portofolio Survey')
    .addItem('Buka Dashboard Visualisasi Web', 'menuOpenDashboard_')
    .addSeparator()
    .addItem('Bangun ulang sheet Rekap & Visualisasi', 'setupSheet')
    .addItem('Periksa Sheet Respon', 'menuCheckRespon_')
    .addItem('Atur / Perbarui PIN Dashboard', 'menuPromptPin_')
    .addToUi();
}

function menuOpenDashboard_() {
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    'Dashboard Hasil Survei Portofolio',
    'Untuk membuka dashboard visualisasi, buka file dashboard.html pada folder survey-portofolio melalui browser Anda, atau hosting ke GitHub Pages / web server kampus.',
    ui.ButtonSet.OK
  );
}

function menuCheckRespon_() {
  const sheet = getSheet_();
  const count = Math.max(0, sheet.getLastRow() - 1);
  const pin = getDashboardPin_();
  SpreadsheetApp.getUi().alert(
    'Status Sheet Respon',
    'Total data masuk: ' + count + ' baris.\n' +
    'Jumlah kolom: ' + HEADERS.length + ' kolom.\n' +
    'Status Dashboard PIN: ' + (pin ? 'TERKUNCI (PIN aktif)' : 'TERBUKA (Tanpa PIN)'),
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function menuPromptPin_() {
  const ui = SpreadsheetApp.getUi();
  const currentPin = getDashboardPin_();
  const res = ui.prompt(
    'Pengaturan Kode Akses PIN Dashboard',
    'Masukkan PIN baru untuk mengunci dashboard hasil survei (kosongkan jika ingin membuka bebas tanpa PIN):\nPIN saat ini: ' + (currentPin || '(kosong / tanpa PIN)'),
    ui.ButtonSet.OK_CANCEL
  );

  if (res.getSelectedButton() === ui.Button.OK) {
    const newPin = String(res.getResponseText() || '').trim();
    const ss = getSS_();
    let sh = ss.getSheetByName(PENGATURAN_NAME);
    if (!sh) setupPengaturan();
    sh = ss.getSheetByName(PENGATURAN_NAME);
    sh.getRange(2, 2).setNumberFormat('@').setValue(newPin);
    ui.alert(
      'PIN Berhasil Diperbarui',
      newPin ? 'Dashboard kini terproteksi dengan PIN: ' + newPin : 'Proteksi PIN dinonaktifkan. Dashboard kini terbuka tanpa PIN.',
      ui.ButtonSet.OK
    );
  }
}
