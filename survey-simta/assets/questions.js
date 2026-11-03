/* ============================================================
   Bank Soal Kuesioner Kepuasan Pengguna SIMTA (Tugas Akhir)
   Politeknik IDN Bogor
   Single Source of Truth untuk Form, Dashboard, dan Apps Script
   Aplikasi yang dievaluasi: https://simta.politeknikidn.id
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
  perangkat: ['Laptop / PC', 'HP (Smartphone)', 'Tablet'],

  /* Daftar 4 Peran Resmi SIMTA & Butir Pertanyaan */
  roles: [
    {
      id: 'mahasiswa',
      label: 'Mahasiswa',
      tagline: 'Mengevaluasi Bimbingan & Ujian Tugas Akhir',
      description: 'Pengajuan judul, bimbingan dosen, template unduhan, syarat seminar proposal & sidang TA, riwayat ujian, dan cetak SK ber-QR code.',
      count: 18,
      estimate: '± 6–7 menit',
      sections: [
        {
          title: 'Akses, Antarmuka & Layanan Pengaduan',
          desc: 'Kemudahan login akun, kenyamanan tampilan dashboard, navigasi profil, pengumuman, dan saluran aspirasi.',
          items: [
            { id: 'M1', text: 'Proses login ke SIMTA (menggunakan NIM atau Email) mudah dan lancar', fitur: 'Login & Otentikasi', eucs: 'E' },
            { id: 'M2', text: 'Tampilan antarmuka dashboard mahasiswa modern, informatif, dan nyaman digunakan', fitur: 'Desain Antarmuka', eucs: 'F' },
            { id: 'M3', text: 'Menu navigasi dan penanda kelengkapan profil mahasiswa mudah dipahami', fitur: 'Navigasi & Profil', eucs: 'E' },
            { id: 'M4', text: 'Fitur pengumuman resmi dan penanda pesan telah dibaca (mark as read) membantu mendapatkan informasi terkini', fitur: 'Pengumuman Mahasiswa', eucs: 'C' },
            { id: 'M5', text: 'Layanan Pengaduan & Aspirasi mempermudah pelaporan kendala bimbingan dan cepat mendapatkan tanggapan', fitur: 'Pengaduan Mahasiswa', eucs: 'T' }
          ]
        },
        {
          title: 'Pengajuan Judul, Bimbingan & Referensi',
          desc: 'Proses pengajuan judul baru, pemilihan dosen pembimbing, pusat unduhan pedoman, direktori dosen, dan referensi karya.',
          items: [
            { id: 'M6', text: 'Formulir pengajuan judul/topik tugas akhir dan pemilihan dosen pembimbing terstruktur rapi', fitur: 'Pengajuan Judul', eucs: 'E' },
            { id: 'M7', text: 'Informasi status usulan judul (menunggu, disetujui, revisi, atau ditolak) disajikan secara jelas dan transparan', fitur: 'Transparansi Status Judul', eucs: 'C' },
            { id: 'M8', text: 'Fitur Pusat Unduhan memudahkan akses berkas template dokumen dan pedoman penulisan tugas akhir resmi', fitur: 'Pusat Unduhan', eucs: 'E' },
            { id: 'M9', text: 'Fitur direktori Data Dosen membantu mengetahui bidang keahlian dan ketersediaan kuota bimbingan dosen', fitur: 'Direktori Dosen & Kuota', eucs: 'C' },
            { id: 'M10', text: 'Fitur Referensi Judul mempermudah penelusuran ide dan topik tugas akhir terdahulu di kampus', fitur: 'Referensi Judul', eucs: 'C' }
          ]
        },
        {
          title: 'Ujian Proposal, SK Resmi & Sidang TA',
          desc: 'Pendaftaran seminar proposal, jadwal ujian, keabsahan dokumen SK ber-QR code, dan pendaftaran sidang akhir.',
          items: [
            { id: 'M11', text: 'Alur pengunggahan berkas syarat seminar proposal (syarat-proposal) dan pendaftaran ujian praktis dijalani', fitur: 'Syarat Seminar Proposal', eucs: 'E' },
            { id: 'M12', text: 'Informasi jadwal seminar proposal, ruangan, dan dosen penguji tersaji lengkap serta tepat waktu', fitur: 'Jadwal Seminar Proposal', eucs: 'T' },
            { id: 'M13', text: 'Berkas dokumen SK Pembimbing, SK Proposal, dan SK Sidang TA terformat rapi sesuai kop resmi kampus', fitur: 'Format Dokumen SK', eucs: 'F' },
            { id: 'M14', text: 'Fitur verifikasi QR Code pada dokumen SK menjamin keaslian dan legalitas surat keputusan', fitur: 'Validasi SK QR Code', eucs: 'A' },
            { id: 'M15', text: 'Alur pengunggahan berkas syarat sidang tugas akhir (syarat-sidang-ta) dan pendaftaran ujian sidang jelas dan mudah', fitur: 'Syarat Sidang TA', eucs: 'E' }
          ]
        },
        {
          title: 'Riwayat Ujian, Stabilitas & Manfaat',
          desc: 'Rekam jejak nilai ujian, stabilitas pengunggahan berkas laporan, dan efektivitas SIMTA dalam mempercepat kelulusan.',
          items: [
            { id: 'M16', text: 'Riwayat Ujian menyajikan rekam jejak penilaian, catatan revisi penguji, dan status kelulusan secara akurat', fitur: 'Riwayat & Nilai Ujian', eucs: 'A' },
            { id: 'M17', text: 'Platform SIMTA stabil, responsif, dan tidak mengalami kendala teknis saat mengunggah berkas naskah', fitur: 'Stabilitas & Kecepatan', eucs: 'A' },
            { id: 'M18', text: 'Platform SIMTA sangat membantu memperlancar dan mempercepat proses penyelesaian tugas akhir hingga lulus', fitur: 'Efektivitas Layanan TA', eucs: 'C' }
          ]
        }
      ],
      open: [
        { id: 'M_OPEN_1', text: 'Fitur apa pada SIMTA yang paling mempermudah proses penyelesaian tugas akhir Anda?', hint: 'Contoh: pengajuan judul online, template unduhan, pantau jadwal sidang, validasi SK QR code, dll.' },
        { id: 'M_OPEN_2', text: 'Kendala teknis atau administrasi apa yang pernah Anda alami selama menggunakan SIMTA?', hint: 'Contoh: format unggah berkas, kejelasan revisi, waktu respon pengaduan, tampilan mobile, dll.' }
      ]
    },

    {
      id: 'dosen',
      label: 'Dosen',
      tagline: 'Mengevaluasi Pembimbingan & Penilaian Ujian',
      description: 'Permintaan bimbingan judul, link grup bimbingan, SK pembimbing, referensi judul, input penilaian proposal & sidang TA berbasis rubrik.',
      count: 14,
      estimate: '± 5–6 menit',
      sections: [
        {
          title: 'Dashboard, Usulan Judul & Pembimbingan',
          desc: 'Kemudahan memahami dashboard dosen, pengelolaan usulan judul bimbingan, link koordinasi grup, dan berkas SK.',
          items: [
            { id: 'D1', text: 'Antarmuka dashboard dosen mudah dipahami dan memberikan gambaran jelas terkait aktivitas bimbingan & ujian', fitur: 'Dashboard Dosen', eucs: 'F' },
            { id: 'D2', text: 'Informasi daftar usulan judul dan mahasiswa bimbingan yang masuk disajikan lengkap dan terstruktur', fitur: 'Permintaan Bimbingan', eucs: 'C' },
            { id: 'D3', text: 'Proses persetujuan (acc), pemberian catatan revisi, atau penolakan usulan judul mahasiswa mudah dilakukan', fitur: 'Moderasi Usulan Judul', eucs: 'E' },
            { id: 'D4', text: 'Fitur pembaruan tautan grup koordinasi (link group WhatsApp/Telegram) mempermudah komunikasi bimbingan', fitur: 'Link Grup Bimbingan', eucs: 'E' },
            { id: 'D5', text: 'Dokumen SK Pembimbing Dosen dapat diakses dan dicetak dengan mudah kapan pun dibutuhkan', fitur: 'Akses SK Pembimbing', eucs: 'E' }
          ]
        },
        {
          title: 'Referensi Judul & Penilaian Ujian',
          desc: 'Penelusuran referensi judul kampus, pengisian nilai ujian proposal & sidang TA, dan kalkulasi otomatis.',
          items: [
            { id: 'D6', text: 'Fitur penelusuran Judul Mahasiswa mempermudah pengecekan topik yang sedang dibimbing agar tidak terjadi duplikasi', fitur: 'Referensi Judul Kampus', eucs: 'C' },
            { id: 'D7', text: 'Formulir penilaian Ujian Seminar Proposal terstruktur jelas sesuai rincian komponen bobot nilai', fitur: 'Form Nilai Proposal', eucs: 'E' },
            { id: 'D8', text: 'Penilaian Ujian Sidang Tugas Akhir berbasis rubrik/komponen baku memudahkan penilaian yang objektif dan adil', fitur: 'Form Nilai Sidang TA', eucs: 'A' },
            { id: 'D9', text: 'Informasi naskah laporan, berkas lampiran, dan syarat mahasiswa dapat ditinjau dosen dengan jelas sebelum ujian', fitur: 'Peninjauan Berkas Ujian', eucs: 'C' },
            { id: 'D10', text: 'Sistem kalkulasi otomatis nilai akhir ujian seminar proposal dan sidang TA berjalan akurat tanpa kesalahan hitung', fitur: 'Akurasi Nilai Otomatis', eucs: 'A' }
          ]
        },
        {
          title: 'Efisiensi, Notifikasi & Keandalan',
          desc: 'Penghematan waktu bimbingan, ketepatan notifikasi jadwal sidang, keabsahan data, dan standar mutu kelulusan.',
          items: [
            { id: 'D11', text: 'SIMTA menghemat waktu dan memangkas beban administrasi dosen dibanding proses bimbingan/ujian konvensional', fitur: 'Efisiensi Waktu Bimbingan', eucs: 'T' },
            { id: 'D12', text: 'Notifikasi dan jadwal penugasan sebagai dosen pembimbing atau dosen penguji tersampaikan tepat waktu', fitur: 'Ketepatan Jadwal Tugas', eucs: 'T' },
            { id: 'D13', text: 'Keabsahan data mahasiswa, judul tugas akhir, dan riwayat bimbingan yang tercatat di SIMTA akurat dan valid', fitur: 'Keandalan Data Akademik', eucs: 'A' },
            { id: 'D14', text: 'Implementasi SIMTA meningkatkan standar mutu pembimbingan dan objektivitas evaluasi kelulusan tugas akhir', fitur: 'Mutu Evaluasi TA', eucs: 'C' }
          ]
        }
      ],
      open: [
        { id: 'D_OPEN_1', text: 'Aspek apa dalam alur bimbingan atau penilaian ujian di SIMTA yang menurut Anda masih memerlukan penyempurnaan?', hint: 'Misalnya fleksibilitas form nilai, reminder tenggat bimbingan, catatan revisi, dll.' },
        { id: 'D_OPEN_2', text: 'Fitur tambahan apa yang paling Anda harapkan untuk mendukung proses pembimbingan dan pengujian tugas akhir ke depan?', hint: 'Misalnya log bimbingan mandiri mahasiswa, integrasi cek plagiarisme, tanda tangan digital berita acara, dll.' }
      ]
    },

    {
      id: 'admin_prodi',
      label: 'Admin Prodi',
      tagline: 'Mengevaluasi Tata Kelola TA Program Studi',
      description: 'Dashboard prodi, verifikasi usulan judul, validasi berkas syarat proposal & sidang prodi, kontrol kuota dosen, dan ekspor data.',
      count: 12,
      estimate: '± 5 menit',
      sections: [
        {
          title: 'Dashboard Prodi & Moderasi Judul',
          desc: 'Ringkasan statistik prodi, monitoring judul mahasiswa prodi, verifikasi acc/tolak pembimbing, dan pergantian pembimbing.',
          items: [
            { id: 'AP1', text: 'Dashboard Admin Prodi menyajikan ringkasan statistik tugas akhir program studi yang informatif dan tepat sasaran', fitur: 'Dashboard Prodi', eucs: 'C' },
            { id: 'AP2', text: 'Pemantauan usulan judul tugas akhir mahasiswa di lingkup program studi mudah dipantau dan difilter', fitur: 'Monitoring Judul Prodi', eucs: 'E' },
            { id: 'AP3', text: 'Fitur persetujuan, penolakan, atau pembatalan acc pembimbing pada usulan judul mahasiswa prodi berjalan efektif', fitur: 'Verifikasi Judul Prodi', eucs: 'E' },
            { id: 'AP4', text: 'Fitur pergantian dosen pembimbing mempermudah penyesuaian bila terjadi kendala bimbingan di tingkat program studi', fitur: 'Penggantian Pembimbing', eucs: 'E' }
          ]
        },
        {
          title: 'Validasi Berkas Proposal & Sidang TA',
          desc: 'Verifikasi kelengkapan berkas syarat ujian proposal & sidang prodi, kontrol kuota dosen, dan ekspor data rekapitulasi.',
          items: [
            { id: 'AP5', text: 'Proses validasi berkas persyaratan seminar proposal mahasiswa prodi praktis dan mudah diverifikasi kelengkapannya', fitur: 'Validasi Berkas Proposal', eucs: 'E' },
            { id: 'AP6', text: 'Proses validasi berkas persyaratan sidang tugas akhir mahasiswa prodi berjalan cepat dan transparan', fitur: 'Validasi Berkas Sidang', eucs: 'E' },
            { id: 'AP7', text: 'Fitur quick-kuota dosen program studi memudahkan pengaturan alokasi beban bimbingan agar merata', fitur: 'Kontrol Kuota Dosen', eucs: 'A' },
            { id: 'AP8', text: 'Fitur ekspor data rekapitulasi usulan judul dan progres tugas akhir mahasiswa prodi ke Excel akurat dan rapi', fitur: 'Ekspor Data Prodi', eucs: 'F' }
          ]
        },
        {
          title: 'Transparansi, Antarmuka & Kecepatan Layanan',
          desc: 'Kejelasan catatan verifikasi, kenyamanan antarmuka prodi, keamanan isolasi data, dan percepatan layanan mahasiswa.',
          items: [
            { id: 'AP9', text: 'Informasi catatan revisi dan riwayat verifikasi berkas disajikan secara transparan bagi mahasiswa dan prodi', fitur: 'Transparansi Verifikasi', eucs: 'C' },
            { id: 'AP10', text: 'Tampilan antarmuka khusus Admin Prodi rapi, responsif, dan memudahkan alur kerja tata kelola jurusan', fitur: 'Antarmuka Admin Prodi', eucs: 'F' },
            { id: 'AP11', text: 'Akses data program studi terisolasi secara aman dan tidak tercampur dengan data program studi lain', fitur: 'Keamanan Akses Data', eucs: 'A' },
            { id: 'AP12', text: 'Platform SIMTA mempercepat waktu pelayanan administrasi tugas akhir mahasiswa di tingkat program studi', fitur: 'Kecepatan Layanan Prodi', eucs: 'T' }
          ]
        }
      ],
      open: [
        { id: 'AP_OPEN_1', text: 'Kendala apa yang paling sering dihadapi Admin Prodi saat memvalidasi berkas atau memoderasi usulan judul mahasiswa?', hint: 'Misalnya format berkas yang salah, batas kuota pembimbing, waktu verifikasi, dll.' },
        { id: 'AP_OPEN_2', text: 'Fitur pelaporan atau analitik apa yang paling dibutuhkan program studi untuk monitoring masa studi mahasiswa?', hint: 'Misalnya grafik kelulusan per angkatan, tren topik penelitian prodi, rekap mahasiswa macet TA, dll.' }
      ]
    },

    {
      id: 'admin',
      label: 'Administrator',
      tagline: 'Mengevaluasi Tata Kelola TA & Penjadwalan Pusat',
      description: 'Dashboard eksekutif, master data, auto-ploting penguji/ruangan, cetak presensi, penerbitan SK resmi, berita acara yudisium, dan validasi QR code.',
      count: 14,
      estimate: '± 5–6 menit',
      sections: [
        {
          title: 'Dashboard Eksekutif & Manajemen Data',
          desc: 'Statistik eksekutif kampus, master data institusi, import massal user, pengumuman broadcast, dan penanganan pengaduan.',
          items: [
            { id: 'P1', text: 'Dashboard analitik eksekutif menyajikan statistik komprehensif terkait perkembangan tugas akhir se-Politeknik IDN', fitur: 'Dashboard Eksekutif', eucs: 'C' },
            { id: 'P2', text: 'Manajemen master data (Tahun Angkatan, Program Studi, Topik Penelitian, Ruangan Sidang, Pejabat) mudah dikelola', fitur: 'Master Data Sistem', eucs: 'E' },
            { id: 'P3', text: 'Fitur import massal dan kelola data mahasiswa serta dosen melalui template Excel berjalan akurat dan andal', fitur: 'Integrasi Data User', eucs: 'A' },
            { id: 'P4', text: 'Fitur broadcast Pengumuman massal efektif menyampaikan informasi tenggat waktu dan kebijakan tugas akhir kampus', fitur: 'Pengumuman Terpusat', eucs: 'T' },
            { id: 'P5', text: 'Fitur tindak lanjut Pengaduan & Aspirasi mempermudah penanganan keluhan teknis maupun administratif civitas akademika', fitur: 'Manajemen Pengaduan', eucs: 'E' }
          ]
        },
        {
          title: 'Penjadwalan Cerdas & Manajemen Ujian',
          desc: 'Pengaturan periode TA, kecerdasan auto-ploting penguji proposal & sidang, pencegahan bentrok ruangan, dan cetak presensi.',
          items: [
            { id: 'P6', text: 'Pengaturan periode pengajuan judul, periode seminar proposal, dan periode sidang TA fleksibel sesuai kalender akademik', fitur: 'Kalender & Periode TA', eucs: 'E' },
            { id: 'P7', text: 'Fitur cerdas Auto-Ploting Dosen Penguji & Jadwal Seminar Proposal sangat menghemat waktu penjadwalan', fitur: 'Auto-Ploting Proposal', eucs: 'E' },
            { id: 'P8', text: 'Fitur cerdas Auto-Ploting Dosen Penguji & Ruangan Sidang Tugas Akhir efektif mencegah bentrok jadwal dosen dan ruangan', fitur: 'Auto-Ploting Sidang TA', eucs: 'A' },
            { id: 'P9', text: 'Fitur cetak jadwal ujian dan presensi sidang otomatis terformat rapi sesuai tata naskah dinas resmi kampus', fitur: 'Dokumen Jadwal & Presensi', eucs: 'F' }
          ]
        },
        {
          title: 'Penerbitan SK, Legalitas & Dampak Lembaga',
          desc: 'Penerbitan SK resmi terpadu, verifikasi publik QR code, berita acara yudisium, keandalan server, dan tata kelola paperless.',
          items: [
            { id: 'P10', text: 'Penerbitan berkas resmi SK Pembimbing, SK Ujian Proposal, dan SK Sidang TA terintegrasi dengan penomoran surat resmi', fitur: 'Penerbitan SK Terpadu', eucs: 'F' },
            { id: 'P11', text: 'Sistem verifikasi publik keaslian SK berbasis QR Code (/validasi-sk/{uuid}) memperkuat akuntabilitas dan integritas dokumen', fitur: 'Integritas Validasi SK', eucs: 'A' },
            { id: 'P12', text: 'Rekapitulasi nilai akhir dan pencetakan Berita Acara Ujian resmi siap digunakan untuk yudisium dan kelulusan mahasiswa', fitur: 'Berita Acara Yudisium', eucs: 'C' },
            { id: 'P13', text: 'Kecepatan akses, keandalan server, dan keamanan hak akses multi-role pada SIMTA terjamin dengan baik', fitur: 'Keandalan Sistem Pusat', eucs: 'T' },
            { id: 'P14', text: 'Implementasi SIMTA berhasil mewujudkan tata kelola tugas akhir 100% paperless, transparan, dan mendukung akreditasi institusi', fitur: 'Dampak Mutu Lembaga', eucs: 'C' }
          ]
        }
      ],
      open: [
        { id: 'P_OPEN_1', text: 'Informasi atau indikator apa yang belum terangkum pada dashboard administrator dan penting untuk evaluasi pimpinan?', hint: 'Misalnya durasi rata-rata penyelesaian TA per prodi, produktivitas dosen membimbing, dll.' },
        { id: 'P_OPEN_2', text: 'Apa prioritas utama integrasi dan pengembangan SIMTA Politeknik IDN ke depan?', hint: 'Misalnya integrasi otomatis ke SIAKAD, sinkronisasi PDDIKTI, repositori perpustakaan digital, dll.' }
      ]
    }
  ],

  /* Pertanyaan Penutup (Wajib Diisi Seluruh Peran) */
  closing: {
    Z1: {
      text: 'Secara keseluruhan, seberapa puas Anda dengan kualitas layanan platform SIMTA Politeknik IDN?',
      hint: 'Pilih satu angka dari 1 (Sangat tidak puas) sampai 5 (Sangat puas).'
    },
    Z2: {
      text: 'Seberapa besar kemungkinan Anda merekomendasikan penggunaan platform SIMTA kepada rekan mahasiswa, dosen, atau institusi lain?',
      hint: '0 = Sangat tidak mungkin merekomendasikan, 10 = Sangat mungkin merekomendasikan (NPS).'
    },
    Z3: {
      text: 'Kritik, saran, atau masukan bebas untuk peningkatan kualitas layanan sistem informasi SIMTA Politeknik IDN',
      hint: 'Opsional. Tuliskan masukan bebas untuk pengembangan fitur, tampilan antarmuka, alur bimbingan, atau keandalan sistem ke depan.'
    }
  }
};

