/* ============================================================
   Konfigurasi Form Kuesioner Kepuasan PintarUji (CBT)
   Politeknik IDN Bogor
   ============================================================ */
window.CONFIG = {
  // Salin Web App URL dari menu Deploy → Manage deployments di Google Apps Script.
  // URL WAJIB berakhiran /exec
  // Contoh: 'https://script.google.com/macros/s/AKfycb.../exec'
  WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbyy6SNgvA65Nrj41_GVWgnKBjxAq7cMr2u4fdOmghSMW8MvF6nex4beQocGUFr_zuwpGg/exec',

  // Samakan dengan cell B3 pada tab "Pengaturan" di Google Spreadsheet.
  // Boleh dikosongkan jika tidak menggunakan token form.
  TOKEN: 'pintaruji-survey-token',

  // Versi kuesioner. Naikkan ke 'v2' jika ada perubahan butir pertanyaan di kemudian hari.
  VERSION: 'v1',

  // Daftar Program Studi Resmi Politeknik IDN (digunakan oleh Mahasiswa & Dosen)
  PRODI: [
    { kode: '58302', nama: 'Teknik Rekayasa Perangkat Lunak (TRPL)' },
    { kode: '90346', nama: 'Teknik Rekayasa Komputer Jaringan (TRKJ)' },
    { kode: '90343', nama: 'Teknologi Rekayasa Multimedia Grafis (TRMG)' }
  ],

  // Masa penyimpanan draf pengisian lokal di peramban responden (hari)
  DRAFT_TTL_DAYS: 14
};

