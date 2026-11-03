/* ============================================================
   Bank Soal Kuesioner Kepuasan Pengguna Platform Portofolio IDN
   Politeknik IDN Bogor
   Single Source of Truth untuk Form, Dashboard, dan Apps Script
   ============================================================ */
window.SURVEY = {
  version: 'v1',

  /* Skala Likert 1–5 Berlabel Lengkap */
  scale: [
    { value: 1, short: 'STS', label: 'Sangat tidak setuju' },
    { value: 2, short: 'TS', label: 'Tidak setuju' },
    { value: 3, short: 'N', label: 'Netral' },
    { value: 4, short: 'S', label: 'Setuju' },
    { value: 5, short: 'SS', label: 'Sangat setuju' }
  ],

  /* Skala Kepuasan Umum (Z1) */
  satisfaction: [
    { value: 1, short: 'STP', label: 'Sangat tidak puas' },
    { value: 2, short: 'TP', label: 'Tidak puas' },
    { value: 3, short: 'C', label: 'Cukup' },
    { value: 4, short: 'P', label: 'Puas' },
    { value: 5, short: 'SP', label: 'Sangat puas' }
  ],

  /* Pilihan Profil Responden */
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
  perangkat: ['Laptop / PC', 'HP (Smartphone)', 'Tablet'],

  /* Daftar Peran & Butir Pertanyaan */
  roles: [
    {
      id: 'mahasiswa',
      label: 'Mahasiswa',
      tagline: 'Mengevaluasi Pengalaman Showcase Portofolio',
      description: 'Registrasi captcha, profil sosmed, form portofolio, kompresi WebP otomatis, galeri carousel, deskripsi berbab, preview karya, dan views/likes.',
      count: 18,
      estimate: '± 6–7 menit',
      sections: [
        {
          title: 'Akses, Tampilan & Profil Pribadi',
          desc: 'Kemudahan pendaftaran akun mandiri, kenyamanan tata letak, navigasi, dan kelengkapan profil mahasiswa.',
          items: [
            { id: 'M1', text: 'Proses pendaftaran akun (dengan captcha) dan login ke platform Portofolio IDN mudah dan lancar', fitur: 'Registrasi & Login', eucs: 'E' },
            { id: 'M2', text: 'Desain tampilan antarmuka platform modern, rapi, dan nyaman dipandang', fitur: 'Desain Antarmuka', eucs: 'F' },
            { id: 'M3', text: 'Menu navigasi dan dashboard mahasiswa mudah dipahami dan digunakan', fitur: 'Navigasi & Dashboard', eucs: 'E' },
            { id: 'M4', text: 'Fitur pengelolaan profil (biodata, foto profil, keahlian, link GitHub/LinkedIn/kontak) mudah dilengkapi', fitur: 'Kelola Profil', eucs: 'E' }
          ]
        },
        {
          title: 'Pengunggahan & Manajemen Portofolio',
          desc: 'Pembuatan portofolio baru, optimasi cover WebP, galeri carousel gambar, deskripsi berbab, dan pratinjau.',
          items: [
            { id: 'M5', text: 'Formulir pembuatan dan pengunggahan portofolio baru (judul, ringkasan, slug) terstruktur dan mudah diisi', fitur: 'Form Portofolio', eucs: 'E' },
            { id: 'M6', text: 'Fitur kompresi gambar cover otomatis ke WebP membuat proses upload cepat tanpa menurunkan kualitas visual', fitur: 'Optimasi WebP', eucs: 'A' },
            { id: 'M7', text: 'Fitur galeri gambar carousel mempermudah penyajian dokumentasi atau tangkapan layar karya secara interaktif', fitur: 'Galeri Carousel', eucs: 'F' },
            { id: 'M8', text: 'Fitur penulisan deskripsi proyek berbab (latar belakang, teknologi, alur, hasil) membantu mendokumentasikan karya secara terperinci', fitur: 'Deskripsi Proyek', eucs: 'C' },
            { id: 'M9', text: 'Fitur pratinjau (preview) karya sebelum diajukan publikasi membantu memastikan tampilan karya sudah rapi', fitur: 'Pratinjau Karya', eucs: 'E' }
          ]
        },
        {
          title: 'Transparansi Kurasi, Interaksi & Keamanan',
          desc: 'Kejelasan status kurasi terbit, metrik pembaca & likes, keamanan akun, dan tampilan halaman publik karya.',
          items: [
            { id: 'M10', text: 'Informasi status karya (draf, proses kurasi, dan terverifikasi terbit) disajikan secara jelas dan transparan', fitur: 'Status Kurasi', eucs: 'C' },
            { id: 'M11', text: 'Metrik jumlah pembaca (views) dan penyuka (likes) tampil akurat serta memotivasi untuk terus berkarya', fitur: 'Metrik Views/Likes', eucs: 'A' },
            { id: 'M12', text: 'Fitur keamanan akun dan penggantian kata sandi berfungsi dengan baik dan memberi rasa aman', fitur: 'Keamanan Akun', eucs: 'A' },
            { id: 'M13', text: 'Halaman publik detail portofolio menyajikan karya secara elegan dan siap dibagikan kepada calon perekrut industri', fitur: 'Tampilan Publik', eucs: 'F' }
          ]
        },
        {
          title: 'Performa, Manfaat & Kesiapan Karir',
          desc: 'Leaderboard, kecepatan akses, stabilitas unggah berkas, kecepatan verifikasi, dan personal branding karir.',
          items: [
            { id: 'M14', text: 'Fitur Leaderboard dan direktori karya mahasiswa memicu motivasi kompetisi positif untuk menghasilkan karya bermutu', fitur: 'Leaderboard & Direktori', eucs: 'C' },
            { id: 'M15', text: 'Halaman platform terbuka dengan cepat dan responsif saat diakses dari komputer maupun smartphone', fitur: 'Kecepatan Akses', eucs: 'T' },
            { id: 'M16', text: 'Platform stabil dan tidak mengalami gangguan teknis saat proses pengunggahan berkas karya berlangsung', fitur: 'Stabilitas Sistem', eucs: 'A' },
            { id: 'M17', text: 'Waktu yang dibutuhkan admin/kurator dalam memverifikasi dan menerbitkan karya tergolong cepat', fitur: 'Waktu Kurasi', eucs: 'T' },
            { id: 'M18', text: 'Platform Portofolio IDN sangat membantu dalam membangun personal branding dan meningkatkan kepercayaan diri memasuki dunia kerja', fitur: 'Dampak Karir', eucs: 'C' }
          ]
        }
      ],
      open: [
        { id: 'M_OPEN_1', text: 'Fitur apa pada platform Portofolio IDN yang paling Anda sukai atau paling membantu dalam memamerkan karya Anda?', hint: 'Contoh: galeri carousel, optimasi webp, deskripsi terstruktur, link sosmed, dll.' },
        { id: 'M_OPEN_2', text: 'Kendala teknis apa yang pernah Anda alami saat mengunggah atau mengelola portofolio di platform ini?', hint: 'Contoh: proses upload foto, preview kurang pas, waktu verifikasi, tampilan mobile, dll.' }
      ]
    },

    {
      id: 'dosen',
      label: 'Dosen / Kurator',
      tagline: 'Mengevaluasi Peninjauan & Kurasi Karya Mahasiswa',
      description: 'Peninjauan karya per jurusan/angkatan, kelengkapan bab proyek, monitoring capaian praktikum/tugas akhir, grafik sebaran karya, dan leaderboard.',
      count: 14,
      estimate: '± 5–6 menit',
      sections: [
        {
          title: 'Antarmuka & Peninjauan Karya',
          desc: 'Kemudahan memahami tampilan, struktur informasi per jurusan, kelengkapan format, dan monitoring terpusat.',
          items: [
            { id: 'D1', text: 'Tampilan antarmuka platform Portofolio IDN mudah dipahami, intuitif, dan nyaman digunakan', fitur: 'Antarmuka Platform', eucs: 'F' },
            { id: 'D2', text: 'Informasi karya mahasiswa per jurusan (Programmer, Engineer, Designer) dan angkatan disajikan lengkap', fitur: 'Struktur Informasi', eucs: 'C' },
            { id: 'D3', text: 'Format dokumentasi karya (ringkasan, tangkapan layar carousel, dan deskripsi teknis) memudahkan peninjauan karya', fitur: 'Format Dokumentasi', eucs: 'F' },
            { id: 'D4', text: 'Platform mempermudah dosen dalam memantau portofolio karya mahasiswa bimbingan secara terpusat', fitur: 'Monitoring Karya', eucs: 'E' }
          ]
        },
        {
          title: 'Kurasi, Direktori & Statistik',
          desc: 'Fitur pencarian/filter jurusan, direktori profil mahasiswa, grafik sebaran karya, leaderboard, dan penilaian capaian luaran.',
          items: [
            { id: 'D5', text: 'Fitur pencarian dan filter jurusan memudahkan penemuan karya spesifik yang sedang dievaluasi', fitur: 'Pencarian & Filter', eucs: 'E' },
            { id: 'D6', text: 'Halaman direktori profil mahasiswa menyajikan rekam jejak keterampilan dan karya mahasiswa secara terperinci', fitur: 'Direktori Mahasiswa', eucs: 'C' },
            { id: 'D7', text: 'Halaman grafik statistik sebaran karya (/grafik) memberikan gambaran jelas mengenai produktivitas mahasiswa', fitur: 'Grafik Analitik', eucs: 'C' },
            { id: 'D8', text: 'Fitur Leaderboard menyajikan data karya terpopuler dan mahasiswa paling aktif secara transparan dan akurat', fitur: 'Akurasi Leaderboard', eucs: 'A' },
            { id: 'D9', text: 'Platform efektif digunakan sebagai etalase penilaian luaran praktikum, proyek semester, maupun tugas akhir', fitur: 'Evaluasi Capaian', eucs: 'C' }
          ]
        },
        {
          title: 'Efisiensi, Keandalan & Standar Mutu',
          desc: 'Efisiensi waktu kerja, kecepatan muat media visual, keabsahan data mahasiswa, stabilitas sistem, dan mutu karya industri.',
          items: [
            { id: 'D10', text: 'Platform menghemat waktu dan beban administratif dosen dibanding peninjauan karya melalui berkas manual', fitur: 'Efisiensi Kerja', eucs: 'T' },
            { id: 'D11', text: 'Gambar, media carousel, dan halaman karya mahasiswa termuat dengan cepat tanpa kendala teknis', fitur: 'Kecepatan Media', eucs: 'T' },
            { id: 'D12', text: 'Data identitas, jurusan, dan kepemilikan karya mahasiswa yang disajikan akurat dan valid', fitur: 'Keabsahan Data', eucs: 'A' },
            { id: 'D13', text: 'Platform berjalan stabil dan jarang mengalami gangguan teknis saat digunakan untuk kurasi karya', fitur: 'Keandalan Sistem', eucs: 'A' },
            { id: 'D14', text: 'Keberadaan platform Portofolio IDN mendorong peningkatan mutu dan kesiapan kerja karya mahasiswa sesuai standar industri', fitur: 'Peningkatan Mutu', eucs: 'C' }
          ]
        }
      ],
      open: [
        { id: 'D_OPEN_1', text: 'Aspek apa yang menurut Anda masih memerlukan penyempurnaan dalam proses peninjauan atau kurasi karya mahasiswa?', hint: 'Misalnya format laporan proyek, fitur komentar/feedback dosen, penilaian langsung, dll.' },
        { id: 'D_OPEN_2', text: 'Fitur tambahan apa yang paling Anda harapkan untuk mendukung pembimbingan portofolio mahasiswa ke depan?', hint: 'Misalnya badge sertifikasi, filter berbasis teknologi/tools, ekspor ringkasan portofolio mahasiswa, dll.' }
      ]
    },

    {
      id: 'admin',
      label: 'Pimpinan / Admin',
      tagline: 'Mengevaluasi Tata Kelola & Etalase Institusi',
      description: 'Dashboard analitik eksekutif, verifikasi akun mahasiswa, moderasi publikasi portofolio, master jurusan/angkatan, pengumuman terjadwal, dan reputasi kampus.',
      count: 13,
      estimate: '± 5 menit',
      sections: [
        {
          title: 'Dashboard Eksekutif & Manajemen Data',
          desc: 'Statistik karya kampus, pengelolaan master data jurusan & angkatan, verifikasi akun pengguna, dan moderasi publikasi.',
          items: [
            { id: 'P1', text: 'Dashboard admin menyajikan gambaran ringkas dan informatif mengenai statistik portofolio dan mahasiswa kampus', fitur: 'Dashboard Admin', eucs: 'C' },
            { id: 'P2', text: 'Pengelolaan master data Jurusan dan Angkatan terstruktur rapi dan mudah diperbarui', fitur: 'Master Data', eucs: 'E' },
            { id: 'P3', text: 'Fitur verifikasi akun pendaftaran mahasiswa baru (verify/unverify) berjalan efektif dan mempermudah tata kelola', fitur: 'Tata Kelola Akun', eucs: 'E' },
            { id: 'P4', text: 'Fitur moderasi dan verifikasi publikasi portofolio (verify-publish) efektif menjaga standar mutu karya yang tampil ke publik', fitur: 'Moderasi Kurasi', eucs: 'A' }
          ]
        },
        {
          title: 'Komunikasi, Pengaturan & Reputasi Publik',
          desc: 'Pratinjau kurasi admin, pengumuman terjadwal otomatis, pengaturan platform, dan citra institusi profesional.',
          items: [
            { id: 'P5', text: 'Fitur pratinjau (preview) karya pada panel admin mempermudah peninjauan sebelum memberikan persetujuan tayang', fitur: 'Pratinjau Admin', eucs: 'E' },
            { id: 'P6', text: 'Fitur manajemen pengumuman kampus (draft, rilis terjadwal otomatis schedule) berjalan tepat waktu dan andal', fitur: 'Pengumuman Terjadwal', eucs: 'T' },
            { id: 'P7', text: 'Pengaturan status platform (settings) dan hak akses peran aman sesuai kewenangan operasional', fitur: 'Keamanan Otorisasi', eucs: 'A' },
            { id: 'P8', text: 'Tampilan etalase publik portofolio mencerminkan reputasi profesional Politeknik IDN di mata masyarakat dan industri', fitur: 'Citra Kelembagaan', eucs: 'F' }
          ]
        },
        {
          title: 'Kecepatan, Akreditasi & Dampak Industri',
          desc: 'Grafik analitik pimpinan, impresi mitra industri, dukungan dokumentasi akreditasi prodi, stabilitas, dan sinergi link & match.',
          items: [
            { id: 'P9', text: 'Visualisasi grafik statistik membantu pimpinan dalam monitoring capaian indikator kinerja institusi', fitur: 'Analitik Pimpinan', eucs: 'C' },
            { id: 'P10', text: 'Kecepatan akses dan responsivitas platform memberikan pengalaman positif bagi mitra industri dan recruiter', fitur: 'Impresi Industri', eucs: 'T' },
            { id: 'P11', text: 'Platform Portofolio IDN sangat mendukung pemenuhan dokumentasi luaran karya untuk akreditasi program studi', fitur: 'Dukungan Akreditasi', eucs: 'C' },
            { id: 'P12', text: 'Platform memiliki keandalan sistem dan keamanan data yang baik untuk keberlanjutan operasional jangka panjang', fitur: 'Keberlanjutan Sistem', eucs: 'A' },
            { id: 'P13', text: 'Implementasi Portofolio IDN berhasil memperkuat sinergi link and match antara lulusan kampus dengan kebutuhan industri', fitur: 'Kesiapan Kerja Lulusan', eucs: 'C' }
          ]
        }
      ],
      open: [
        { id: 'P_OPEN_1', text: 'Informasi atau metrik analitik tambahan apa yang paling Anda butuhkan pada dashboard eksekutif untuk pengambilan keputusan kampus?', hint: 'Misalnya statistik minat industri per karya, tren teknologi terpopuler, rekap serapan magang, dll.' },
        { id: 'P_OPEN_2', text: 'Apa saran prioritas Anda untuk pengembangan jangka panjang dan integrasi platform Portofolio IDN ke depan?', hint: 'Misalnya integrasi akun industri terverifikasi, pameran virtual 3D, integrasi tracer study, dll.' }
      ]
    }
  ],

  /* Pertanyaan Penutup (Wajib Diisi Seluruh Peran) */
  closing: {
    Z1: {
      text: 'Secara keseluruhan, seberapa puas Anda dengan kualitas layanan platform Portofolio IDN?',
      hint: 'Pilih satu angka dari 1 (Sangat tidak puas) sampai 5 (Sangat puas).'
    },
    Z2: {
      text: 'Seberapa besar kemungkinan Anda merekomendasikan penggunaan platform Portofolio IDN kepada rekan mahasiswa, dosen, atau mitra industri lainnya?',
      hint: '0 = Sangat tidak mungkin merekomendasikan, 10 = Sangat mungkin merekomendasikan (NPS).'
    },
    Z3: {
      text: 'Kritik, saran, atau masukan bebas untuk peningkatan kualitas layanan platform Portofolio IDN',
      hint: 'Opsional. Tuliskan masukan bebas untuk pengembangan fitur, tampilan, atau layanan ke depan.'
    }
  }
};

