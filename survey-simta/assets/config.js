/* ============================================================
   Konfigurasi Form Kuesioner Kepuasan SIMTA (Tugas Akhir)
   Politeknik IDN Bogor
   ============================================================ */
window.CONFIG = {
  // Salin Web App URL dari menu Deploy → Manage deployments di Google Apps Script.
  // URL WAJIB berakhiran /exec
  // Contoh: 'https://script.google.com/macros/s/AKfycb.../exec'
  WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbx7iJD6p1n89sNsxvZZrKGh-_5rqCgL8Llm4qrfUAQM9hojc6WbB3sg88kZJ54naq5WHA/exec',

  // Samakan dengan cell B3 pada tab "Pengaturan" di Google Spreadsheet.
  // Boleh dikosongkan jika tidak menggunakan token form.
  TOKEN: 'simta-survey-token',

  // Versi kuesioner. Naikkan ke 'v2' jika ada perubahan butir pertanyaan di kemudian hari.
  VERSION: 'v1',

  // Tautan resmi platform SIMTA yang dievaluasi
  APP_URL: 'https://simta.politeknikidn.id',

  // Daftar Program Studi Resmi Politeknik IDN (digunakan oleh Mahasiswa, Dosen, dan Admin Prodi)
  // Sesuai kode program studi aktual pada sistem SIMTA
  PRODI: [
    { kode: '58302', nama: 'Teknologi Rekayasa Perangkat Lunak' },
    { kode: '90346', nama: 'Teknologi Rekayasa Komputer Jaringan' },
    { kode: '90343', nama: 'Teknologi Rekayasa Multimedia Grafis' }
  ],

  // Masa penyimpanan draf pengisian lokal di peramban responden (hari)
  DRAFT_TTL_DAYS: 14
};

