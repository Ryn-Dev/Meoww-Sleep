/* ============================================================
   Konfigurasi Executive Comparison Dashboard
   Survei Kepuasan Layanan Digital Politeknik IDN Bogor
   ============================================================ */
window.CONFIG = {
  // Versi konfigurasi dashboard komparasi
  VERSION: 'v1',

  // Master PIN opsional untuk memproteksi halaman dashboard komparasi.
  // Biarkan kosong ('') jika dashboard komparasi dapat diakses langsung oleh civitas kampus.
  MASTER_PIN: '',

  // Daftar 4 platform digital resmi yang dievaluasi
  APPS: [
    {
      id: 'pintaruji',
      name: 'PintarUji (CBT)',
      shortName: 'PintarUji',
      category: 'Platform Ujian & Asesmen',
      appUrl: 'https://pintaruji.politeknikidn.id',
      dashboardUrl: '../survey-pintaruji/dashboard.html',
      surveyUrl: '../survey-pintaruji/index.html',
      apiUrl: 'https://script.google.com/macros/s/AKfycbyy6SNgvA65Nrj41_GVWgnKBjxAq7cMr2u4fdOmghSMW8MvF6nex4beQocGUFr_zuwpGg/exec',
      pin: '', // Isi bila PIN spreadsheet PintarUji berbeda (misal: '0987')
      color: '#10b981',       // Emerald
      colorBg: 'rgba(16, 185, 129, 0.12)',
      colorBorder: 'rgba(16, 185, 129, 0.35)',
      token: 'pintaruji-survey-token'
    },
    {
      id: 'portofolio',
      name: 'Portofolio IDN',
      shortName: 'Portofolio',
      category: 'Platform Karya Mahasiswa',
      appUrl: 'https://portofolio.politeknikidn.id',
      dashboardUrl: '../survey-portofolio/dashboard.html',
      surveyUrl: '../survey-portofolio/index.html',
      apiUrl: 'https://script.google.com/macros/s/AKfycbwq8FiAM_F87t2rUtgizwW7JRszh-rYHWraO0wEzpX9VGgBPLz6CquHg_PAZjlkQ-xHvQ/exec',
      pin: '', // Isi bila PIN spreadsheet Portofolio berbeda (misal: '4321')
      color: '#6366f1',       // Indigo
      colorBg: 'rgba(99, 102, 241, 0.12)',
      colorBorder: 'rgba(99, 102, 241, 0.35)',
      token: 'portofolio-survey-token'
    },
    {
      id: 'lms',
      name: 'LMS IDN',
      shortName: 'LMS',
      category: 'Learning Management System',
      appUrl: 'https://lms.politeknikidn.id',
      dashboardUrl: '../survey-lms/dashboard.html',
      surveyUrl: '../survey-lms/index.html',
      apiUrl: 'https://script.google.com/macros/s/AKfycbwJlRpPcMYSpAzyRLeaLoiFrnfCznXZWxzl_a5u6KgBobxegIJvNvMAAS_mLYFZ2PjBZg/exec',
      pin: '', // Isi bila PIN spreadsheet LMS berbeda (misal: '1234')
      color: '#0284c7',       // Sky Blue
      colorBg: 'rgba(2, 132, 199, 0.12)',
      colorBorder: 'rgba(2, 132, 199, 0.35)',
      token: 'ganti-token-acak'
    },
    {
      id: 'simta',
      name: 'SIMTA IDN',
      shortName: 'SIMTA',
      category: 'Sistem Tugas Akhir & Bimbingan',
      appUrl: 'https://simta.politeknikidn.id',
      dashboardUrl: '../survey-simta/dashboard.html',
      surveyUrl: '../survey-simta/index.html',
      apiUrl: 'https://script.google.com/macros/s/AKfycbx7iJD6p1n89sNsxvZZrKGh-_5rqCgL8Llm4qrfUAQM9hojc6WbB3sg88kZJ54naq5WHA/exec',
      pin: '', // Isi bila PIN spreadsheet SIMTA berbeda (misal: '4567')
      color: '#8b5cf6',       // Purple / Violet
      colorBg: 'rgba(139, 92, 246, 0.12)',
      colorBorder: 'rgba(139, 92, 246, 0.35)',
      token: 'simta-survey-token'
    }
  ],

  // Definisi Dimensi Baku EUCS
  EUCS: {
    keys: ['C', 'A', 'F', 'E', 'T'],
    names: {
      C: 'Content',
      A: 'Accuracy',
      F: 'Format',
      E: 'Ease of Use',
      T: 'Timeliness'
    },
    namesID: {
      C: 'Isi Informasi',
      A: 'Akurasi Data',
      F: 'Tampilan & Format',
      E: 'Kemudahan Penggunaan',
      T: 'Kecepatan & Ketepatan Waktu'
    },
    descriptions: {
      C: 'Kelengkapan, kejelasan, dan relevansi informasi yang disajikan sistem.',
      A: 'Ketepatan hasil pengolahan data, keandalan sistem, dan bebas dari galat/error.',
      F: 'Kerapian tata letak, kejelasan tipografi, dan estetika antarmuka grafis sistem.',
      E: 'Kemudahan alur interaksi, navigasi yang intuitif, serta kemudahan bagi pengguna baru.',
      T: 'Kecepatan respon sistem, loading halaman yang efisien, dan ketersediaan data real-time.'
    }
  },

  // Program Studi Resmi Politeknik IDN
  PRODI: [
    { kode: '58302', nama: 'Teknologi Rekayasa Perangkat Lunak', short: 'TRPL' },
    { kode: '90346', nama: 'Teknologi Rekayasa Komputer Jaringan', short: 'TRKJ' },
    { kode: '90343', nama: 'Teknologi Rekayasa Multimedia Grafis', short: 'TRMG' }
  ]
};

