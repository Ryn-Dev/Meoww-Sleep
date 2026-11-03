/* ============================================================
   Konfigurasi form kuesioner LMS
   Ubah nilai di bawah ini setelah Apps Script di-deploy.
   ============================================================ */
window.CONFIG = {
  // URL Web App Apps Script, HARUS berakhiran /exec
  // Contoh: 'https://script.google.com/macros/s/AKfycb.../exec'
  WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbwJlRpPcMYSpAzyRLeaLoiFrnfCznXZWxzl_a5u6KgBobxegIJvNvMAAS_mLYFZ2PjBZg/exec',

  // Samakan dengan SECRET di apps-script/Code.gs (boleh dikosongkan)
  TOKEN: 'ganti-token-acak',

  // Naikkan versi ini kalau ada soal yang diubah setelah data masuk
  VERSION: 'v1',

  // Tautan resmi aplikasi LMS yang dievaluasi
  APP_URL: 'https://lms.politeknikidn.id',

  // Daftar prodi (dipakai Mahasiswa dan Mentor; Pimpinan tidak memilih prodi)
  PRODI: [
    { kode: '58302', nama: 'Teknologi Rekayasa Perangkat Lunak' },
    { kode: '90343', nama: 'Teknologi Rekayasa Multimedia Grafis' },
    { kode: '90346', nama: 'Teknologi Rekayasa Komputer Jaringan' }
  ],

  // Lama data draf disimpan di browser (hari)
  DRAFT_TTL_DAYS: 14
};
