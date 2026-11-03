/* ============================================================
   Kuesioner Kepuasan Layanan SIMTA — Google Apps Script Backend
   Sistem Informasi Manajemen Tugas Akhir · Politeknik IDN Bogor
   Target Evaluasi: https://simta.politeknikidn.id
   ------------------------------------------------------------
   Petunjuk Pemasangan:
   1. Buka Google Spreadsheet baru di Google Drive.
   2. Klik Extensions (Ekstensi) → Apps Script.
   3. Ganti seluruh isi Code.gs dengan file ini, lalu simpan (Ctrl+S).
   4. Jalankan fungsi setupSheet di toolbar lalu klik tombol Run (izinkan akses).
   5. Klik tombol Deploy → New deployment → pilih tipe Web app
      - Execute as: Me
      - Who has access: Anyone
   6. Salin Web app URL yang berakhiran /exec ke assets/config.js.
   ============================================================ */

/* ---------- Pengaturan Dasar ---------- */

// Kosongkan untuk memakai spreadsheet tempat script ini terpasang (disarankan).
const SHEET_ID = '';

const SHEET_NAME = 'Respon';
const REKAP_NAME = 'Rekap';
const VISUAL_NAME = 'Visualisasi';
const PENGATURAN_NAME = 'Pengaturan';

// Token rahasia default. Samakan dengan cell B3 pada tab "Pengaturan" di Spreadsheet.
const SECRET = 'simta-survey-token';

// Kode akses default dashboard. Atur di cell B2 pada tab "Pengaturan" di Spreadsheet.
const DASHBOARD_PIN = '';

const PERAN_LIST = ['mahasiswa', 'dosen', 'admin_prodi', 'admin'];

const PERAN_LABEL = {
  mahasiswa: 'Mahasiswa',
  dosen: 'Dosen',
  admin_prodi: 'Admin Prodi',
  admin: 'Administrator'
};

const PRODI = [
  { kode: '58302', nama: 'Teknologi Rekayasa Perangkat Lunak (TRPL)' },
  { kode: '90346', nama: 'Teknologi Rekayasa Komputer Jaringan (TRKJ)' },
  { kode: '90343', nama: 'Teknologi Rekayasa Multimedia Grafis (TRMG)' }
];

const EUCS_LABEL = {
  C: 'Content',
  A: 'Accuracy',
  F: 'Format',
  E: 'Ease of Use',
  T: 'Timeliness'
};

const EUCS_ORDER = ['C', 'A', 'F', 'E', 'T'];

/* ---------- Daftar 58 Butir Pernyataan SIMTA ---------- */

const ITEMS = [
  // Mahasiswa (18 Butir: M1–M18)
  { id: 'M1', peran: 'mahasiswa', fitur: 'Login & Otentikasi', eucs: 'E', teks: 'Proses login ke SIMTA (menggunakan NIM atau Email) mudah dan lancar' },
  { id: 'M2', peran: 'mahasiswa', fitur: 'Desain Antarmuka', eucs: 'F', teks: 'Tampilan antarmuka dashboard mahasiswa modern, informatif, dan nyaman digunakan' },
  { id: 'M3', peran: 'mahasiswa', fitur: 'Navigasi & Profil', eucs: 'E', teks: 'Menu navigasi dan penanda kelengkapan profil mahasiswa mudah dipahami' },
  { id: 'M4', peran: 'mahasiswa', fitur: 'Pengumuman Mahasiswa', eucs: 'C', teks: 'Fitur pengumuman resmi dan penanda pesan telah dibaca (mark as read) membantu mendapatkan informasi terkini' },
  { id: 'M5', peran: 'mahasiswa', fitur: 'Pengaduan Mahasiswa', eucs: 'T', teks: 'Layanan Pengaduan & Aspirasi mempermudah pelaporan kendala bimbingan dan cepat mendapatkan tanggapan' },
  { id: 'M6', peran: 'mahasiswa', fitur: 'Pengajuan Judul', eucs: 'E', teks: 'Formulir pengajuan judul/topik tugas akhir dan pemilihan dosen pembimbing terstruktur rapi' },
  { id: 'M7', peran: 'mahasiswa', fitur: 'Transparansi Status Judul', eucs: 'C', teks: 'Informasi status usulan judul (menunggu, disetujui, revisi, atau ditolak) disajikan secara jelas dan transparan' },
  { id: 'M8', peran: 'mahasiswa', fitur: 'Pusat Unduhan', eucs: 'E', teks: 'Fitur Pusat Unduhan memudahkan akses berkas template dokumen dan pedoman penulisan tugas akhir resmi' },
  { id: 'M9', peran: 'mahasiswa', fitur: 'Direktori Dosen & Kuota', eucs: 'C', teks: 'Fitur direktori Data Dosen membantu mengetahui bidang keahlian dan ketersediaan kuota bimbingan dosen' },
  { id: 'M10', peran: 'mahasiswa', fitur: 'Referensi Judul', eucs: 'C', teks: 'Fitur Referensi Judul mempermudah penelusuran ide dan topik tugas akhir terdahulu di kampus' },
  { id: 'M11', peran: 'mahasiswa', fitur: 'Syarat Seminar Proposal', eucs: 'E', teks: 'Alur pengunggahan berkas syarat seminar proposal (syarat-proposal) dan pendaftaran ujian praktis dijalani' },
  { id: 'M12', peran: 'mahasiswa', fitur: 'Jadwal Seminar Proposal', eucs: 'T', teks: 'Informasi jadwal seminar proposal, ruangan, dan dosen penguji tersaji lengkap serta tepat waktu' },
  { id: 'M13', peran: 'mahasiswa', fitur: 'Format Dokumen SK', eucs: 'F', teks: 'Berkas dokumen SK Pembimbing, SK Proposal, dan SK Sidang TA terformat rapi sesuai kop resmi kampus' },
  { id: 'M14', peran: 'mahasiswa', fitur: 'Validasi SK QR Code', eucs: 'A', teks: 'Fitur verifikasi QR Code pada dokumen SK menjamin keaslian dan legalitas surat keputusan' },
  { id: 'M15', peran: 'mahasiswa', fitur: 'Syarat Sidang TA', eucs: 'E', teks: 'Alur pengunggahan berkas syarat sidang tugas akhir (syarat-sidang-ta) dan pendaftaran ujian sidang jelas dan mudah' },
  { id: 'M16', peran: 'mahasiswa', fitur: 'Riwayat & Nilai Ujian', eucs: 'A', teks: 'Riwayat Ujian menyajikan rekam jejak penilaian, catatan revisi penguji, dan status kelulusan secara akurat' },
  { id: 'M17', peran: 'mahasiswa', fitur: 'Stabilitas & Kecepatan', eucs: 'A', teks: 'Platform SIMTA stabil, responsif, dan tidak mengalami kendala teknis saat mengunggah berkas naskah' },
  { id: 'M18', peran: 'mahasiswa', fitur: 'Efektivitas Layanan TA', eucs: 'C', teks: 'Platform SIMTA sangat membantu memperlancar dan mempercepat proses penyelesaian tugas akhir hingga lulus' },

  // Dosen (14 Butir: D1–D14)
  { id: 'D1', peran: 'dosen', fitur: 'Login & Profil Dosen', eucs: 'E', teks: 'Proses login dan pengelolaan profil serta bidang keahlian dosen di SIMTA praktis dan lancar' },
  { id: 'D2', peran: 'dosen', fitur: 'Antarmuka Dosen', eucs: 'F', teks: 'Tampilan antarmuka dashboard dosen menyajikan informasi bimbingan dan jadwal ujian secara terstruktur' },
  { id: 'D3', peran: 'dosen', fitur: 'Persetujuan Judul', eucs: 'E', teks: 'Alur peninjauan dan persetujuan usulan judul mahasiswa bimbingan mudah dioperasikan' },
  { id: 'D4', peran: 'dosen', fitur: 'Tautan Grup Bimbingan', eucs: 'E', teks: 'Fitur pencantuman link grup WhatsApp / komunikasi bimbingan mempermudah koordinasi dengan mahasiswa' },
  { id: 'D5', peran: 'dosen', fitur: 'Pemantauan Mahasiswa', eucs: 'C', teks: 'Dashboard pembimbing menyajikan rekam jejak dan progres tahapan tugas akhir mahasiswa binaan secara jelas' },
  { id: 'D6', peran: 'dosen', fitur: 'Pusat Unduhan Dosen', eucs: 'E', teks: 'Fitur unduhan berkas mempermudah dosen mengakses lembar pengesahan, panduan, dan format berita acara' },
  { id: 'D7', peran: 'dosen', fitur: 'Jadwal Menguji', eucs: 'T', teks: 'Pemberitahuan jadwal menguji seminar proposal dan sidang tugas akhir tersaji tepat waktu dan akurat' },
  { id: 'D8', peran: 'dosen', fitur: 'Akses Berkas Ujian', eucs: 'E', teks: 'Berkas naskah proposal atau skripsi mahasiswa yang akan diuji mudah diunduh dan dipelajari sebelum jadwal sidang' },
  { id: 'D9', peran: 'dosen', fitur: 'Rubrik Penilaian Online', eucs: 'A', teks: 'Formulir penilaian ujian sidang berbasis rubrik komponen nilai memudahkan penginputan nilai secara objektif' },
  { id: 'D10', peran: 'dosen', fitur: 'Catatan Revisi', eucs: 'C', teks: 'Fitur input catatan perbaikan/revisi mempermudah penguji memberikan instruksi tertulis yang jelas kepada mahasiswa' },
  { id: 'D11', peran: 'dosen', fitur: 'Akurasi Rekap Nilai', eucs: 'A', teks: 'Sistem kalkulasi nilai akhir ujian sidang (gabungan nilai pembimbing & penguji) akurat dan transparan' },
  { id: 'D12', peran: 'dosen', fitur: 'Kecepatan Akses', eucs: 'T', teks: 'Platform SIMTA memiliki kecepatan respon yang baik saat digunakan untuk menilai ujian sidang' },
  { id: 'D13', peran: 'dosen', fitur: 'Keandalan Dokumen SK', eucs: 'A', teks: 'Penerbitan SK pembimbing dan penguji terintegrasi dengan baik sehingga mempermudah administrasi beban kerja dosen' },
  { id: 'D14', peran: 'dosen', fitur: 'Dukungan Standar Mutu', eucs: 'C', teks: 'SIMTA efektif mendukung standarisasi mutu dan ketertiban administrasi tugas akhir di Politeknik IDN' },

  // Admin Prodi (12 Butir: AP1–AP12)
  { id: 'AP1', peran: 'admin_prodi', fitur: 'Navigasi Multi-Prodi', eucs: 'E', teks: 'Akses dashboard spesifik program studi (TRPL, TRKJ, TRMG) terisolasi dengan rapi dan mudah dinavigasi' },
  { id: 'AP2', peran: 'admin_prodi', fitur: 'Antarmuka Admin Prodi', eucs: 'F', teks: 'Tampilan ringkasan statistik tugas akhir tingkat program studi informatif dan mudah dipahami' },
  { id: 'AP3', peran: 'admin_prodi', fitur: 'Moderasi Usulan Judul', eucs: 'E', teks: 'Alur verifikasi dan moderasi kelayakan usulan topik tugas akhir mahasiswa prodi efisien dan terstruktur' },
  { id: 'AP4', peran: 'admin_prodi', fitur: 'Pengaturan Kuota Cepat', eucs: 'E', teks: 'Fitur Quick Kuota mempermudah admin prodi menyesuaikan alokasi kapasitas bimbingan per dosen' },
  { id: 'AP5', peran: 'admin_prodi', fitur: 'Verifikasi Syarat Proposal', eucs: 'A', teks: 'Fitur verifikasi berkas persyaratan seminar proposal akurat dalam menyaring kelayakan mahasiswa' },
  { id: 'AP6', peran: 'admin_prodi', fitur: 'Verifikasi Syarat Sidang', eucs: 'A', teks: 'Pemeriksaan dokumen persyaratan sidang tugas akhir teliti dan meminimalkan kesalahan administrasi' },
  { id: 'AP7', peran: 'admin_prodi', fitur: 'Ploting Jadwal Ujian', eucs: 'T', teks: 'Penjadwalan seminar proposal dan sidang TA tingkat prodi dapat diproses tepat waktu' },
  { id: 'AP8', peran: 'admin_prodi', fitur: 'Kelola Berkas Unduhan', eucs: 'E', teks: 'Fitur pengelolaan file unduhan mempermudah pembaruan template dokumen resmi jurusan' },
  { id: 'AP9', peran: 'admin_prodi', fitur: 'Penyelesaian Pengaduan', eucs: 'T', teks: 'Menu tindak lanjut pengaduan mahasiswa di tingkat prodi memudahkan penanganan kendala bimbingan' },
  { id: 'AP10', peran: 'admin_prodi', fitur: 'Kerapian Format Dokumen', eucs: 'F', teks: 'Format cetak berita acara dan rekapitulasi ujian prodi terformat rapi sesuai tata naskah dinas' },
  { id: 'AP11', peran: 'admin_prodi', fitur: 'Stabilitas & Keamanan Data', eucs: 'A', teks: 'SIMTA memiliki keamanan data yang andal dan tidak pernah mengalami data bentrok antar program studi' },
  { id: 'AP12', peran: 'admin_prodi', fitur: 'Efisiensi Operasional Prodi', eucs: 'C', teks: 'SIMTA secara signifikan memangkas waktu kerja administrasi tugas akhir di program studi' },

  // Administrator (14 Butir: P1–P14)
  { id: 'P1', peran: 'admin', fitur: 'Dashboard Eksekutif', eucs: 'C', teks: 'Dashboard administrator menyajikan visualisasi data komprehensif seluruh program studi di Politeknik IDN' },
  { id: 'P2', peran: 'admin', fitur: 'Antarmuka Admin Pusat', eucs: 'F', teks: 'Antarmuka pengelolaan tugas akhir institusi modern, responsif, dan mudah dipahami' },
  { id: 'P3', peran: 'admin', fitur: 'Master Data Institusi', eucs: 'E', teks: 'Pengelolaan master data (Prodi, Pengguna, Dosen, Mahasiswa, Komponen Nilai) fleksibel dan terstruktur' },
  { id: 'P4', peran: 'admin', fitur: 'Otomasi Ploting Penguji', eucs: 'T', teks: 'Fitur otomasi ploting susunan dosen penguji dan alokasi ruangan ujian mempercepat koordinasi kampus' },
  { id: 'P5', peran: 'admin', fitur: 'Penerbitan SK Rektorat', eucs: 'A', teks: 'Fitur penerbitan SK Pembimbing dan SK Penguji resmi kampus berjalan akurat dan sah secara legal' },
  { id: 'P6', peran: 'admin', fitur: 'Sistem QR Code SK', eucs: 'A', teks: 'Generator QR Code pada surat keputusan tugas akhir efektif mencegah pemalsuan dokumen akademik' },
  { id: 'P7', peran: 'admin', fitur: 'Broadcast Pengumuman', eucs: 'T', teks: 'Fitur siaran pengumuman multi-peran (mark as read) menjamin informasi krusial tersampaikan tepat waktu' },
  { id: 'P8', peran: 'admin', fitur: 'Manajemen Pengaduan Pusat', eucs: 'T', teks: 'Pusat eskalasi pengaduan dan aspirasi membantu pimpinan memantau iklim akademik secara cepat' },
  { id: 'P9', peran: 'admin', fitur: 'Format Laporan Akademik', eucs: 'F', teks: 'Format rekapitulasi nilai dan berita acara yudisium tugas akhir rapi dan terstandarisasi' },
  { id: 'P10', peran: 'admin', fitur: 'Keandalan Akses Bersamaan', eucs: 'A', teks: 'Platform SIMTA memiliki keandalan sistem yang sangat baik saat diakses bersamaan oleh ratusan pengguna' },
  { id: 'P11', peran: 'admin', fitur: 'Keamanan Data Akademik', eucs: 'A', teks: 'Pemisahan otorisasi peran (RBAC) dan perlindungan data tugas akhir mahasiswa terjamin keamanannya' },
  { id: 'P12', peran: 'admin', fitur: 'Monitoring Masa Studi', eucs: 'C', teks: 'Fitur pemantauan status tugas akhir membantu pimpinan mencegah keterlambatan kelulusan mahasiswa' },
  { id: 'P13', peran: 'admin', fitur: 'Dukungan Akreditasi Kampus', eucs: 'C', teks: 'Arsip digital dokumen tugas akhir pada SIMTA sangat memudahkan penyusunan borang akreditasi' },
  { id: 'P14', peran: 'admin', fitur: 'Dampak Transformasi Digital', eucs: 'C', teks: 'SIMTA berhasil mewujudkan tata kelola tugas akhir yang transparan, profesional, dan akuntabel' }
];

/* ---------- Susunan 82 Kolom Sheet Respon ---------- */

const HEADERS = (function () {
  const out = [
    'timestamp', 'id_respon', 'versi_form', 'peran', 'nama', 'nim', 'prodi', 'kode_prodi',
    'tahap_tugas_akhir', 'frekuensi_akses', 'perangkat', 'durasi_detik', 'user_agent'
  ];
  ITEMS.forEach(function (it) { out.push(it.id); });
  out.push('Z1', 'Z2');
  out.push('M_OPEN_1', 'M_OPEN_2', 'D_OPEN_1', 'D_OPEN_2', 'AP_OPEN_1', 'AP_OPEN_2', 'P_OPEN_1', 'P_OPEN_2', 'Z3');
  return out;
})();

const SCORE_IDS = ITEMS.map(function (it) { return it.id; });
const OPEN_IDS = ['M_OPEN_1', 'M_OPEN_2', 'D_OPEN_1', 'D_OPEN_2', 'AP_OPEN_1', 'AP_OPEN_2', 'P_OPEN_1', 'P_OPEN_2', 'Z3'];

const ITEMS_BY_ROLE = {
  mahasiswa: ITEMS.filter(function (it) { return it.peran === 'mahasiswa'; }),
  dosen: ITEMS.filter(function (it) { return it.peran === 'dosen'; }),
  admin_prodi: ITEMS.filter(function (it) { return it.peran === 'admin_prodi'; }),
  admin: ITEMS.filter(function (it) { return it.peran === 'admin'; })
};

const PROFILE_OPTIONS = {
  pengalaman_ta: [
    'Persiapan / Pengajuan Judul',
    'Bimbingan Seminar Proposal',
    'Pasca Seminar Proposal',
    'Bimbingan Sidang TA',
    'Lulus Sidang Akhir',
    'Mengelola / Membimbing Seluruh Tahapan'
  ],
  frekuensi: [
    'Setiap hari',
    'Beberapa kali seminggu',
    'Sebulan sekali',
    'Saat masa pengajuan & ujian saja'
  ],
  perangkat: ['Laptop / PC', 'HP (Smartphone)', 'Tablet']
};

/* ---------- Helper Spreadsheet ---------- */

function getSpreadsheet_() {
  return SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
}

function getOrMakeSheet_(name) {
  const ss = getSpreadsheet_();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  return sh;
}

function colOf_(headerName) {
  const idx = HEADERS.indexOf(headerName);
  if (idx === -1) throw new Error('Kolom ' + headerName + ' tidak ditemukan di HEADERS.');
  let num = idx + 1;
  let letter = '';
  while (num > 0) {
    const rem = (num - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    num = Math.floor((num - 1) / 26);
  }
  return letter;
}

function colIndex_(headerName) {
  const idx = HEADERS.indexOf(headerName);
  if (idx === -1) throw new Error('Kolom ' + headerName + ' tidak ditemukan.');
  return idx + 1;
}

function ensureColumns_(sh, needed) {
  const cur = sh.getMaxColumns();
  if (cur < needed) sh.insertColumnsAfter(cur, needed - cur);
}

function ensureRows_(sh, needed) {
  const cur = sh.getMaxRows();
  if (cur < needed) sh.insertRowsAfter(cur, needed - cur);
}

function section_(sh, r, title, cols) {
  sh.getRange(r, 1, 1, cols).merge()
    .setValue(title)
    .setFontSize(11).setFontWeight('bold')
    .setFontColor('#1e293b').setBackground('#f1f5f9')
    .setVerticalAlignment('middle');
  sh.setRowHeight(r, 26);
}

function tableHeader_(sh, r, labels) {
  labels.forEach(function (lbl, i) {
    sh.getRange(r, i + 1).setValue(lbl);
  });
  sh.getRange(r, 1, 1, labels.length)
    .setFontWeight('bold').setFontSize(9)
    .setFontColor('#0f172a').setBackground('#e2e8f0')
    .setVerticalAlignment('middle');
  sh.setRowHeight(r, 24);
}

function summary_(sh, r, label, formulaOrVal, format) {
  sh.getRange(r, 1).setValue(label).setFontWeight('bold').setFontSize(10);
  const cell = sh.getRange(r, 2);
  if (typeof formulaOrVal === 'string' && formulaOrVal.charAt(0) === '=') {
    cell.setFormula(formulaOrVal);
  } else {
    cell.setValue(formulaOrVal);
  }
  if (format) cell.setNumberFormat(format);
  cell.setFontWeight('bold').setFontSize(10).setHorizontalAlignment('right');
  sh.setRowHeight(r, 22);
}

function categorizeScore_(score) {
  if (score === null || score === undefined || !isFinite(score)) return '';
  if (score >= 4.2) return 'Sangat puas';
  if (score >= 3.4) return 'Puas';
  if (score >= 2.6) return 'Cukup';
  if (score >= 1.8) return 'Tidak puas';
  return 'Sangat tidak puas';
}

function toIntOrNull_(val, min, max) {
  if (val === '' || val === null || val === undefined) return null;
  const n = Number(val);
  if (!Number.isInteger(n)) return null;
  if (min !== undefined && n < min) return null;
  if (max !== undefined && n > max) return null;
  return n;
}

/* ---------- Setup Sheet Respon ---------- */

function setupSheet() {
  const sh = getOrMakeSheet_(SHEET_NAME);
  ensureColumns_(sh, HEADERS.length);
  ensureRows_(sh, 100);

  sh.getRange(1, 1, 1, HEADERS.length)
    .setValues([HEADERS])
    .setFontWeight('bold')
    .setFontSize(10)
    .setFontColor('#0f172a')
    .setBackground('#f8fafc')
    .setVerticalAlignment('middle');

  sh.setRowHeight(1, 32);
  sh.setFrozenRows(1);

  // Bersihkan format sheet
  const maxRows = Math.max(10, sh.getMaxRows());
  sh.getRange(2, 1, maxRows - 1, HEADERS.length).clearFormat();

  // Kolom timestamp
  sh.getRange(2, colIndex_('timestamp'), maxRows - 1, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  // Kolom ID respon
  sh.getRange(2, colIndex_('id_respon'), maxRows - 1, 1).setNumberFormat('@');
  // Kolom NIM
  sh.getRange(2, colIndex_('nim'), maxRows - 1, 1).setNumberFormat('@');

  // Format angka untuk butir skor dan penutup
  SCORE_IDS.forEach(function (id) {
    sh.getRange(2, colIndex_(id), maxRows - 1, 1).setNumberFormat('0').setHorizontalAlignment('center');
  });
  sh.getRange(2, colIndex_('Z1'), maxRows - 1, 1).setNumberFormat('0').setHorizontalAlignment('center');
  sh.getRange(2, colIndex_('Z2'), maxRows - 1, 1).setNumberFormat('0').setHorizontalAlignment('center');
  sh.getRange(2, colIndex_('durasi_detik'), maxRows - 1, 1).setNumberFormat('#,##0').setHorizontalAlignment('right');

  setupPengaturan();
  buildRekap();
  buildVisualisasi();

  SpreadsheetApp.flush();
  return { ok: true, message: 'Setup sheet SIMTA berhasil (82 kolom).' };
}

/* ---------- Setup Tab Pengaturan ---------- */

function setupPengaturan() {
  const ss = getSpreadsheet_();
  let sh = ss.getSheetByName(PENGATURAN_NAME);
  if (!sh) {
    sh = ss.insertSheet(PENGATURAN_NAME);
  }
  ensureColumns_(sh, 3);
  ensureRows_(sh, 7);

  // Header
  sh.getRange(1, 1, 1, 3).merge()
    .setValue('Pengaturan Kuesioner SIMTA & Dashboard')
    .setFontFamily('Inter').setFontSize(14).setFontWeight('bold')
    .setFontColor('#ffffff').setBackground('#0f172a')
    .setVerticalAlignment('middle');
  sh.setRowHeight(1, 38);

  // Row 2: PIN Dashboard (Cell B2)
  sh.getRange(2, 1).setValue('Kode Akses Dashboard (PIN)').setFontWeight('bold');
  const cellPin = sh.getRange(2, 2);
  const currentPin = cellPin.getValue();
  cellPin.setNumberFormat('@');
  if (currentPin === '' && DASHBOARD_PIN) {
    cellPin.setValue(DASHBOARD_PIN);
  }
  sh.getRange(2, 3).setValue('Ketik PIN di kolom B untuk mengunci dashboard hasil survei. Kosongkan cell ini jika dashboard dibuka bebas tanpa kode.')
    .setFontColor('#64748b').setFontSize(9);
  sh.setRowHeight(2, 24);

  // Row 3: Token Form (Secret) (Cell B3)
  sh.getRange(3, 1).setValue('Token Form (Secret)').setFontWeight('bold');
  const cellToken = sh.getRange(3, 2);
  const currentToken = cellToken.getValue();
  cellToken.setNumberFormat('@');
  if (currentToken === '' && SECRET) {
    cellToken.setValue(SECRET);
  }
  sh.getRange(3, 3).setValue('Harus sama dengan TOKEN di assets/config.js. Kosongkan jika tanpa token.')
    .setFontColor('#64748b').setFontSize(9);
  sh.setRowHeight(3, 24);

  // Row 4: Status Proteksi Dashboard
  sh.getRange(4, 1).setValue('Status Proteksi Dashboard').setFontWeight('bold');
  sh.getRange(4, 2).setFormula('=IF(ISBLANK(B2),"TERBUKA (Tanpa PIN)","TERKUNCI (Memerlukan PIN)")')
    .setFontWeight('bold');
  sh.getRange(4, 3).setValue('Status proteksi otomatis terbaca oleh script saat dashboard web dibuka.')
    .setFontColor('#64748b').setFontSize(9);
  sh.setRowHeight(4, 24);

  // Row 5: Target Aplikasi / URL
  sh.getRange(5, 1).setValue('Target Evaluasi / URL').setFontWeight('bold');
  sh.getRange(5, 2).setValue('https://simta.politeknikidn.id').setNumberFormat('@');
  sh.getRange(5, 3).setValue('Tautan resmi aplikasi SIMTA yang dievaluasi.')
    .setFontColor('#64748b').setFontSize(9);
  sh.setRowHeight(5, 24);

  // Row 6: Versi Kuesioner
  sh.getRange(6, 1).setValue('Versi Kuesioner').setFontWeight('bold');
  sh.getRange(6, 2).setValue('v1').setNumberFormat('@');
  sh.getRange(6, 3).setValue('Versi instrumen survei saat ini.')
    .setFontColor('#64748b').setFontSize(9);
  sh.setRowHeight(6, 24);

  sh.autoResizeColumns(1, 3);
  return 'Sheet "' + PENGATURAN_NAME + '" berhasil disiapkan.';
}

function getDashboardPin_() {
  try {
    const ss = getSpreadsheet_();
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
    const ss = getSpreadsheet_();
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

/* ---------- Bangun Ulang Tab Rekapitulasi ---------- */

function buildRekap() {
  const sh = getOrMakeSheet_(REKAP_NAME);
  const LAST_COL = 10;
  ensureColumns_(sh, LAST_COL);
  ensureRows_(sh, ITEMS.length + PRODI.length + 80);
  sh.getBandings().forEach(function (b) { b.remove(); });
  sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).breakApart();

  const C = {
    timestamp: colOf_('timestamp'),
    peran: colOf_('peran'),
    prodi: colOf_('prodi'),
    kode: colOf_('kode_prodi'),
    z1: colOf_('Z1'),
    z2: colOf_('Z2'),
    durasi: colOf_('durasi_detik'),
    tahap: colOf_('tahap_tugas_akhir'),
    frekuensi: colOf_('frekuensi_akses'),
    perangkat: colOf_('perangkat')
  };

  function ref_(col) {
    return 'Respon!$' + col + '$2:$' + col;
  }

  /* Judul */
  sh.getRange(1, 1, 1, LAST_COL).merge()
    .setValue('Rekapitulasi Kuesioner Kepuasan Layanan SIMTA IDN')
    .setFontSize(16).setFontWeight('bold')
    .setFontColor('#ffffff').setBackground('#0f172a')
    .setVerticalAlignment('middle');
  sh.setRowHeight(1, 42);

  sh.getRange(2, 1, 1, LAST_COL).merge()
    .setValue('Dihitung otomatis dari sheet "Respon" (https://simta.politeknikidn.id). Seluruh data disajikan secara agregat anonim.')
    .setFontSize(9).setFontColor('#475569')
    .setVerticalAlignment('middle');
  sh.setRowHeight(2, 28);

  /* Ringkasan Eksekutif */
  let r = 4;
  section_(sh, r++, 'Ringkasan Eksekutif SIMTA', LAST_COL);

  summary_(sh, r++, 'Total Respons Masuk', '=COUNTA(' + ref_(C.timestamp) + ')', '#,##0');
  summary_(sh, r++, 'Mahasiswa', '=COUNTIF(' + ref_(C.peran) + ',"mahasiswa")', '#,##0');
  summary_(sh, r++, 'Dosen', '=COUNTIF(' + ref_(C.peran) + ',"dosen")', '#,##0');
  summary_(sh, r++, 'Admin Prodi', '=COUNTIF(' + ref_(C.peran) + ',"admin_prodi")', '#,##0');
  summary_(sh, r++, 'Administrator', '=COUNTIF(' + ref_(C.peran) + ',"admin")', '#,##0');

  const rowZ1 = r;
  summary_(sh, r++, 'Rata-rata Kepuasan Umum (Z1, 1–5)', '=IFERROR(AVERAGE(' + ref_(C.z1) + '),"")', '0.00');
  summary_(sh, r++, 'Indeks Kepuasan Keseluruhan (Z1 ÷ 5)', '=IFERROR(B' + rowZ1 + '/5,"")', '0.0%');

  const rowNps = r;
  summary_(sh, r++, 'Net Promoter Score (NPS / Z2)',
    '=IFERROR((COUNTIF(' + ref_(C.z2) + ',">=9")-COUNTIF(' + ref_(C.z2) + ',"<=6"))/COUNT(' + ref_(C.z2) + '),"")', '0.0%');
  summary_(sh, r++, 'Kategori Mutu NPS',
    '=IF(B' + rowNps + '="","",IF(B' + rowNps + '>=0.5,"Sangat baik",IF(B' + rowNps + '>=0,"Baik","Perlu perbaikan")))', '');
  summary_(sh, r++, 'Rata-rata Durasi Pengisian (detik)', '=IFERROR(AVERAGE(' + ref_(C.durasi) + '),"")', '#,##0');
  summary_(sh, r++, 'Total Butir Evaluasi', ITEMS.length, '#,##0');

  r += 2;

  /* Rata-rata per Butir Soal (58 Butir) */
  section_(sh, r++, 'Rata-rata Skor per Butir Evaluasi (Likert 1–5)', LAST_COL);
  const itemHead = r;
  tableHeader_(sh, r++, ['Peran', 'Kode', 'Pernyataan Evaluasi', 'Fitur SIMTA', 'EUCS', 'Rata-rata', 'Jumlah N', 'Indeks (%)', 'Kategori Mutu']);
  const itemStart = r;

  ITEMS.forEach(function (item) {
    const col = colOf_(item.id);
    const ref = 'Respon!$' + col + '$2:$' + col;
    sh.getRange(r, 1).setValue(PERAN_LABEL[item.peran]);
    sh.getRange(r, 2).setValue(item.id);
    sh.getRange(r, 3).setValue(item.teks);
    sh.getRange(r, 4).setValue(item.fitur);
    sh.getRange(r, 5).setValue(item.eucs).setHorizontalAlignment('center');
    sh.getRange(r, 6).setFormula('=IFERROR(AVERAGE(' + ref + '),"")').setNumberFormat('0.00').setHorizontalAlignment('center');
    sh.getRange(r, 7).setFormula('=COUNT(' + ref + ')').setNumberFormat('#,##0').setHorizontalAlignment('center');
    sh.getRange(r, 8).setFormula('=IFERROR(F' + r + '/5,"")').setNumberFormat('0.0%').setHorizontalAlignment('center');
    sh.getRange(r, 9).setFormula('=IF(F' + r + '="","",IF(F' + r + '>=4.2,"Sangat puas",IF(F' + r + '>=3.4,"Puas",IF(F' + r + '>=2.6,"Cukup",IF(F' + r + '>=1.8,"Tidak puas","Sangat tidak puas")))))').setHorizontalAlignment('center');
    r++;
  });

  const itemEnd = r - 1;
  sh.getRange(itemStart, 3, itemEnd - itemStart + 1, 1).setWrap(true).setVerticalAlignment('top');
  if (itemHead < itemEnd) {
    sh.getRange(itemHead, 1, itemEnd - itemHead + 1, 9).applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false);
    tableHeader_(sh, itemHead, ['Peran', 'Kode', 'Pernyataan Evaluasi', 'Fitur SIMTA', 'EUCS', 'Rata-rata', 'Jumlah N', 'Indeks (%)', 'Kategori Mutu']);
  }

  r += 2;

  /* Rata-rata per Dimensi EUCS (5 Dimensi x 4 Peran) */
  section_(sh, r++, 'Rata-rata per Dimensi EUCS SIMTA', LAST_COL);
  tableHeader_(sh, r++, ['Dimensi EUCS', 'Kode', 'Keterangan Dimensi', 'Mahasiswa', 'Dosen', 'Admin Prodi', 'Admin', 'Rata-rata Total', 'Indeks Total', 'Kategori Mutu']);

  const EUCS_DESC_MAP = {
    C: 'Kejelasan status judul, kelengkapan berkas unduhan template, direktori kuota dosen, dan rekam jejak yudisium',
    A: 'Keabsahan dokumen SK ber-QR code, ketelitian rubrik nilai, akurasi riwayat nilai, dan keandalan sistem',
    F: 'Kerapian format dokumen cetak resmi, tampilan antarmuka tiap peran, dan kenyamanan keterbacaan komponen nilai',
    E: 'Kemudahan alur pengajuan judul, upload syarat proposal & sidang, serta kemudahan dosen memberi nilai',
    T: 'Ketepatan pembaruan jadwal ujian, kecepatan respon pengaduan, notifikasi pesan, dan kelancaran kelulusan'
  };

  EUCS_ORDER.forEach(function (code) {
    sh.getRange(r, 1).setValue(EUCS_LABEL[code]);
    sh.getRange(r, 2).setValue(code).setHorizontalAlignment('center');
    sh.getRange(r, 3).setValue(EUCS_DESC_MAP[code]);

    // 4 Peran: Mahasiswa (col 4), Dosen (col 5), Admin Prodi (col 6), Admin (col 7)
    PERAN_LIST.forEach(function (peran, idx) {
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
    sh.getRange(r, 8).setFormula('=IFERROR(AVERAGE(' + allRefs.join(',') + '),"")').setNumberFormat('0.00').setHorizontalAlignment('center');
    sh.getRange(r, 9).setFormula('=IFERROR(H' + r + '/5,"")').setNumberFormat('0.0%').setHorizontalAlignment('center');
    sh.getRange(r, 10).setFormula('=IF(H' + r + '="","",IF(H' + r + '>=4.2,"Sangat puas",IF(H' + r + '>=3.4,"Puas",IF(H' + r + '>=2.6,"Cukup",IF(H' + r + '>=1.8,"Tidak puas","Sangat tidak puas")))))').setHorizontalAlignment('center');
    r++;
  });

  r += 2;

  /* Rata-rata per Program Studi */
  section_(sh, r++, 'Rekapitulasi per Program Studi', LAST_COL);
  tableHeader_(sh, r++, ['Kode Prodi', 'Program Studi', 'Total Respon', 'Mahasiswa', 'Dosen', 'Admin Prodi', 'Rata-rata Z1', 'Indeks Z1', 'NPS', 'Kategori NPS']);

  PRODI.forEach(function (p) {
    sh.getRange(r, 1).setValue(p.kode).setHorizontalAlignment('center');
    sh.getRange(r, 2).setValue(p.nama);
    sh.getRange(r, 3).setFormula('=COUNTIF(' + ref_(C.kode) + ',"' + p.kode + '")').setNumberFormat('#,##0').setHorizontalAlignment('center');
    sh.getRange(r, 4).setFormula('=COUNTIFS(' + ref_(C.kode) + ',"' + p.kode + '",' + ref_(C.peran) + ',"mahasiswa")').setNumberFormat('#,##0').setHorizontalAlignment('center');
    sh.getRange(r, 5).setFormula('=COUNTIFS(' + ref_(C.kode) + ',"' + p.kode + '",' + ref_(C.peran) + ',"dosen")').setNumberFormat('#,##0').setHorizontalAlignment('center');
    sh.getRange(r, 6).setFormula('=COUNTIFS(' + ref_(C.kode) + ',"' + p.kode + '",' + ref_(C.peran) + ',"admin_prodi")').setNumberFormat('#,##0').setHorizontalAlignment('center');
    sh.getRange(r, 7).setFormula('=IFERROR(AVERAGEIFS(' + ref_(C.z1) + ',' + ref_(C.kode) + ',"' + p.kode + '"),"")').setNumberFormat('0.00').setHorizontalAlignment('center');
    sh.getRange(r, 8).setFormula('=IFERROR(G' + r + '/5,"")').setNumberFormat('0.0%').setHorizontalAlignment('center');
    sh.getRange(r, 9).setFormula('=IFERROR((COUNTIFS(' + ref_(C.kode) + ',"' + p.kode + '",' + ref_(C.z2) + ',">=9")-COUNTIFS(' + ref_(C.kode) + ',"' + p.kode + '",' + ref_(C.z2) + ',"<=6"))/COUNTIFS(' + ref_(C.kode) + ',"' + p.kode + '",' + ref_(C.z2) + ',"<>"),"")').setNumberFormat('0.0%').setHorizontalAlignment('center');
    sh.getRange(r, 10).setFormula('=IF(I' + r + '="","",IF(I' + r + '>=0.5,"Sangat baik",IF(I' + r + '>=0,"Baik","Perlu perbaikan")))').setHorizontalAlignment('center');
    r++;
  });

  SpreadsheetApp.flush();
  return { ok: true, message: 'Sheet Rekap SIMTA berhasil dibangun ulang.' };
}

/* ---------- Bangun Ulang Tab Visualisasi ---------- */

function buildVisualisasi() {
  const sh = getOrMakeSheet_(VISUAL_NAME);
  ensureColumns_(sh, 14);
  ensureRows_(sh, 80);

  // Bersihkan chart lama
  sh.getCharts().forEach(function (c) { sh.removeChart(c); });

  sh.getRange(1, 1, 1, 14).merge()
    .setValue('Visualisasi Grafik Hasil Survei SIMTA')
    .setFontSize(16).setFontWeight('bold')
    .setFontColor('#ffffff').setBackground('#0f172a')
    .setVerticalAlignment('middle');
  sh.setRowHeight(1, 40);

  const rekapSh = getOrMakeSheet_(REKAP_NAME);

  // Chart 1: Donut Komposisi Peran
  const roleChart = sh.newChart()
    .asPieChart()
    .setTitle('Komposisi Responden SIMTA per Peran')
    .addRange(rekapSh.getRange('A6:B9'))
    .setOption('pieHole', 0.45)
    .setOption('colors', ['#4f46e5', '#0ea5e9', '#d97706', '#0f766e'])
    .setPosition(3, 1, 0, 0)
    .build();
  sh.insertChart(roleChart);

  // Chart 2: Bar Dimensi EUCS
  const eucsChart = sh.newChart()
    .asBarChart()
    .setTitle('Skor Rata-rata 5 Dimensi EUCS SIMTA')
    .addRange(rekapSh.getRange('A71:A75'))
    .addRange(rekapSh.getRange('H71:H75'))
    .setOption('legend', { position: 'none' })
    .setOption('colors', ['#2563eb'])
    .setOption('hAxis', { minValue: 1, maxValue: 5 })
    .setPosition(3, 8, 0, 0)
    .build();
  sh.insertChart(eucsChart);

  SpreadsheetApp.flush();
  return { ok: true, message: 'Grafik Visualisasi SIMTA berhasil diperbarui.' };
}

/* ---------- Web App Handler: doGet ---------- */

function doGet(e) {
  const params = (e && e.parameter) ? e.parameter : {};
  const mode = params.mode || 'info';

  if (mode === 'rekap') {
    const requiredPin = getDashboardPin_();
    if (requiredPin && String(params.pin || '').trim() !== requiredPin) {
      return ContentService.createTextOutput(JSON.stringify({
        ok: false,
        error: 'pin_diperlukan'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    try {
      const data = buildDashboardData_(params);
      data.pin_required = Boolean(requiredPin);
      return ContentService.createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      console.error(err);
      return ContentService.createTextOutput(JSON.stringify({
        ok: false,
        error: 'gagal_memuat_rekap'
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Info status default
  return ContentService.createTextOutput(JSON.stringify({
    ok: true,
    service: 'Kuesioner Kepuasan Layanan SIMTA',
    institution: 'Politeknik IDN Bogor',
    version: 'v1',
    appUrl: 'https://simta.politeknikidn.id',
    endpoints: { submit: 'POST /exec', dashboard: 'GET /exec?mode=rekap' },
    message: 'Endpoint Web App aktif. Pengiriman jawaban kuesioner menggunakan metode POST.'
  })).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- Agregasi Dashboard (Zero-PII Leak) ---------- */

function buildDashboardData_(params) {
  const sh = getOrMakeSheet_(SHEET_NAME);
  const lastRow = sh.getLastRow();
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
        admin_prodi: emptySlice_(),
        admin: emptySlice_()
      },
      items: emptyItems_(),
      byProdi: emptyByProdi_(),
      feedback: []
    };
  }

  const values = sh.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  const filterFrom = params.from ? new Date(params.from + 'T00:00:00') : null;
  const filterTo = params.to ? new Date(params.to + 'T23:59:59') : null;

  const validRows = [];
  let minDate = '';
  let maxDate = '';

  for (let i = 0; i < values.length; i++) {
    const rawRow = values[i];
    const tsRaw = rawRow[colIndex_('timestamp') - 1];
    if (!tsRaw) continue;

    const rowDate = new Date(tsRaw);
    if (isNaN(rowDate.getTime())) continue;

    if (filterFrom && rowDate < filterFrom) continue;
    if (filterTo && rowDate > filterTo) continue;

    const dateStr = Utilities.formatDate(rowDate, 'Asia/Jakarta', 'yyyy-MM-dd');
    if (!minDate || dateStr < minDate) minDate = dateStr;
    if (!maxDate || dateStr > maxDate) maxDate = dateStr;

    const peran = String(rawRow[colIndex_('peran') - 1] || '').trim().toLowerCase();
    if (PERAN_LIST.indexOf(peran) === -1) continue;

    // Catat data agregat (NAMA dan NIM TIDAK PERNAH DIMASUKKAN ke validRows!)
    validRows.push({
      date: dateStr,
      peran: peran,
      kode_prodi: String(rawRow[colIndex_('kode_prodi') - 1] || '').trim(),
      prodi: String(rawRow[colIndex_('prodi') - 1] || '').trim(),
      pengalaman_ta: String(rawRow[colIndex_('tahap_tugas_akhir') - 1] || '').trim(),
      frekuensi_akses: String(rawRow[colIndex_('frekuensi_akses') - 1] || '').trim(),
      perangkat: String(rawRow[colIndex_('perangkat') - 1] || '').trim(),
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
    admin_prodi: aggregateSlice_(validRows, 'admin_prodi'),
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

function extractScoresFromRow_(row) {
  const obj = {};
  SCORE_IDS.forEach(function (id) {
    const val = toIntOrNull_(row[colIndex_(id) - 1], 1, 5);
    if (val !== null) obj[id] = val;
  });
  return obj;
}

function extractOpensFromRow_(row) {
  const obj = {};
  OPEN_IDS.forEach(function (id) {
    const val = String(row[colIndex_(id) - 1] || '').trim();
    if (val) obj[id] = val;
  });
  return obj;
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
      pengalaman_ta: PROFILE_OPTIONS.pengalaman_ta.map(function (label) { return { label: label, count: 0 }; }),
      frekuensi: PROFILE_OPTIONS.frekuensi.map(function (label) { return { label: label, count: 0 }; }),
      perangkat: PROFILE_OPTIONS.perangkat.map(function (label) { return { label: label, count: 0 }; })
    },
    timeline: []
  };
}

function emptyItems_() {
  return ITEMS.map(function (it) {
    return {
      id: it.id,
      peran: it.peran,
      peranLabel: PERAN_LABEL[it.peran],
      fitur: it.fitur,
      eucs: it.eucs,
      eucsLabel: EUCS_LABEL[it.eucs],
      teks: it.teks,
      count: 0,
      avg: null,
      indexPct: null,
      category: '',
      dist: [0, 0, 0, 0, 0]
    };
  });
}

function emptyByProdi_() {
  return PRODI.map(function (p) {
    return {
      kode: p.kode,
      nama: p.nama,
      count: 0,
      byRole: { mahasiswa: 0, dosen: 0, admin_prodi: 0 },
      z1Avg: null,
      z1IndexPct: null,
      z1Category: '',
      nps: null,
      npsCategory: ''
    };
  });
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
    pengalaman_ta: {},
    frekuensi: {},
    perangkat: {}
  };
  PROFILE_OPTIONS.pengalaman_ta.forEach(function (opt) { profileCounters.pengalaman_ta[opt] = 0; });
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

    if (r.pengalaman_ta && profileCounters.pengalaman_ta[r.pengalaman_ta] !== undefined) {
      profileCounters.pengalaman_ta[r.pengalaman_ta]++;
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

  const timelineArr = Object.keys(timelineMap).sort().map(function (d) {
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
      pengalaman_ta: PROFILE_OPTIONS.pengalaman_ta.map(function (label) {
        return { label: label, count: profileCounters.pengalaman_ta[label] || 0 };
      }),
      frekuensi: PROFILE_OPTIONS.frekuensi.map(function (label) {
        return { label: label, count: profileCounters.frekuensi[label] || 0 };
      }),
      perangkat: PROFILE_OPTIONS.perangkat.map(function (label) {
        return { label: label, count: profileCounters.perangkat[label] || 0 };
      })
    },
    timeline: timelineArr
  };
}

function aggregateItems_(rows) {
  return ITEMS.map(function (it) {
    let sum = 0;
    let n = 0;
    const dist = [0, 0, 0, 0, 0];

    rows.forEach(function (r) {
      const val = r.scores[it.id];
      if (val !== undefined && val !== null) {
        sum += val;
        n++;
        dist[val - 1]++;
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
    const list = rows.filter(function (r) {
      return r.kode_prodi === p.kode || r.prodi === p.nama;
    });
    const count = list.length;
    const byRole = { mahasiswa: 0, dosen: 0, admin_prodi: 0 };

    let z1Sum = 0;
    let z1Count = 0;
    let prom = 0;
    let detr = 0;
    let npsCount = 0;

    list.forEach(function (r) {
      if (byRole[r.peran] !== undefined) byRole[r.peran]++;
      if (r.z1 !== null) {
        z1Sum += r.z1;
        z1Count++;
      }
      if (r.z2 !== null) {
        npsCount++;
        if (r.z2 >= 9) prom++;
        else if (r.z2 <= 6) detr++;
      }
    });

    const z1Avg = z1Count ? Math.round((z1Sum / z1Count) * 100) / 100 : null;
    const npsVal = npsCount ? Math.round(((prom - detr) / npsCount) * 1000) / 10 : null;

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
      const txt = r.opens[qid];
      if (txt && txt.length >= 3) {
        out.push({
          peran: r.peran,
          peranLabel: PERAN_LABEL[r.peran],
          prodi: r.prodi || r.kode_prodi,
          date: r.date,
          source: qid,
          sourceLabel: qid === 'Z3' ? 'Pesan & Harapan' : 'Umpan Balik Kualitatif',
          text: txt
        });
      }
    });
  });

  return out.slice(-30).reverse();
}

/* ---------- Web App Handler: doPost ---------- */

function doPost(e) {
  try {
    let payload = null;
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }
    if (!payload) throw new Error('Data POST tidak terbaca.');

    // Validasi token
    const expectedToken = getSecretToken_();
    if (expectedToken && String(payload.token || '').trim() !== expectedToken) {
      throw new Error('Token otentikasi tidak valid.');
    }

    // Validasi peran
    const peran = String(payload.peran || '').trim().toLowerCase();
    if (PERAN_LIST.indexOf(peran) === -1) {
      throw new Error('Peran tidak dikenali: ' + peran);
    }

    // Validasi kelengkapan identitas
    const nama = String(payload.nama || '').trim();
    if (!nama) throw new Error('Nama lengkap wajib diisi.');

    const nim = String(payload.nim || '').trim();
    if (peran === 'mahasiswa' && !nim) throw new Error('NIM wajib diisi untuk peran Mahasiswa.');

    let kodeProdi = String(payload.kode_prodi || '').trim();
    let namaProdi = String(payload.prodi || '').trim();

    if (peran === 'admin') {
      kodeProdi = '-';
      namaProdi = 'Seluruh Program Studi (Pusat)';
    } else {
      if (!kodeProdi) throw new Error('Program studi wajib dipilih.');
      if (!namaProdi) {
        for (let k = 0; k < PRODI.length; k++) {
          if (PRODI[k].kode === kodeProdi) {
            namaProdi = PRODI[k].nama;
            break;
          }
        }
      }
    }

    const sh = getOrMakeSheet_(SHEET_NAME);
    const subId = String(payload.submission_id || '').trim();

    // Pencegahan duplikasi submission_id
    if (subId && sh.getLastRow() > 1) {
      const idCol = colIndex_('id_respon');
      const existingIds = sh.getRange(2, idCol, sh.getLastRow() - 1, 1).getValues();
      for (let j = 0; j < existingIds.length; j++) {
        if (String(existingIds[j][0]) === subId) {
          return ContentService.createTextOutput(JSON.stringify({
            status: 'success',
            message: 'Tanggapan sudah tersimpan sebelumnya (deduplicated).',
            submission_id: subId
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    // Susun baris 82 kolom
    const row = new Array(HEADERS.length).fill('');

    row[colIndex_('timestamp') - 1] = payload.timestamp ? new Date(payload.timestamp) : new Date();
    row[colIndex_('id_respon') - 1] = subId;
    row[colIndex_('versi_form') - 1] = 'v1';
    row[colIndex_('peran') - 1] = peran;
    row[colIndex_('nama') - 1] = nama;
    row[colIndex_('nim') - 1] = nim;
    row[colIndex_('prodi') - 1] = namaProdi;
    row[colIndex_('kode_prodi') - 1] = kodeProdi;
    row[colIndex_('tahap_tugas_akhir') - 1] = String(payload.pengalaman_ta || '').trim();
    row[colIndex_('frekuensi_akses') - 1] = String(payload.frekuensi_akses || '').trim();
    row[colIndex_('perangkat') - 1] = String(payload.perangkat || '').trim();
    row[colIndex_('durasi_detik') - 1] = Number(payload.duration_seconds) || 0;
    row[colIndex_('user_agent') - 1] = String(payload.user_agent || '').slice(0, 300);

    const ans = payload.answers || {};

    // Skor 58 butir
    SCORE_IDS.forEach(function (id) {
      const val = ans[id];
      if (val !== undefined && val !== null && val !== '') {
        const num = Number(val);
        if (Number.isInteger(num) && num >= 1 && num <= 5) {
          row[colIndex_(id) - 1] = num;
        }
      }
    });

    // Z1 & Z2
    const z1Val = toIntOrNull_(payload.Z1, 1, 5);
    if (z1Val !== null) row[colIndex_('Z1') - 1] = z1Val;

    const z2Val = toIntOrNull_(payload.Z2, 0, 10);
    if (z2Val !== null) row[colIndex_('Z2') - 1] = z2Val;

    // Jawaban terbuka (8 role questions + Z3)
    OPEN_IDS.forEach(function (qid) {
      const txt = (ans[qid] !== undefined) ? ans[qid] : payload[qid];
      if (txt) row[colIndex_(qid) - 1] = String(txt).trim();
    });

    sh.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Tanggapan berhasil disimpan di sheet Respon.',
      submission_id: subId
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

