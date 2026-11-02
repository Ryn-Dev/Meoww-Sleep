/* ============================================================
   Bank Soal Kuesioner Kepuasan Pengguna PintarUji (CBT)
   Politeknik IDN Bogor
   Single Source of Truth untuk HTML, Dashboard, dan Apps Script
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
  pengalaman_cbt: [
    '1 kali (Ujian pertama kali)',
    '2–3 kali mengikuti/mengelola',
    '4–6 kali mengikuti/mengelola',
    'Lebih dari 6 kali'
  ],
  frekuensi: [
    'Setiap hari saat masa ujian',
    'Beberapa kali seminggu',
    'Saat UTS & UAS saja',
    'Jarang'
  ],
  perangkat: ['Laptop / PC', 'HP (Smartphone)', 'Tablet'],

  /* Daftar Peran & Butir Pertanyaan */
  roles: [
    {
      id: 'mahasiswa',
      label: 'Mahasiswa',
      tagline: 'Menilai Pengalaman Ujian CBT',
      description: 'Login, token ujian, ruang pengerjaan, timer, autosave, anti-cheat, dan skor pilihan ganda.',
      count: 18,
      estimate: '± 6–7 menit',
      sections: [
        {
          title: 'Akses, Tampilan & Jadwal Ujian',
          desc: 'Kemudahan masuk ke sistem, kejelasan jadwal ujian, dan tata letak menu.',
          items: [
            { id: 'M1', text: 'Proses login ke PintarUji (menggunakan NIM atau Email) mudah dan lancar', fitur: 'Login', eucs: 'E' },
            { id: 'M2', text: 'Desain tampilan antarmuka PintarUji rapi, modern, dan nyaman dipandang', fitur: 'Desain Antarmuka', eucs: 'F' },
            { id: 'M3', text: 'Menu navigasi dan jadwal ujian mudah ditemukan pada dashboard', fitur: 'Navigasi', eucs: 'E' },
            { id: 'M4', text: 'Informasi jadwal ujian, mata kuliah, ruangan, dan nama pengawas tersaji lengkap dan jelas', fitur: 'Jadwal Ujian', eucs: 'C' }
          ]
        },
        {
          title: 'Persiapan & Konfirmasi Masuk Ujian',
          desc: 'Token ujian, tata tertib, dan tanda tangan digital.',
          items: [
            { id: 'M5', text: 'Proses input token ujian dan pembubuhan tanda tangan digital presensi mudah dilakukan', fitur: 'Konfirmasi Ujian', eucs: 'E' },
            { id: 'M6', text: 'Tata tertib dan petunjuk pelaksanaan ujian sebelum masuk ke ruang ujian dipahami dengan jelas', fitur: 'Tata Tertib', eucs: 'C' }
          ]
        },
        {
          title: 'Pengalaman di Ruang Ujian (CBT Room)',
          desc: 'Tampilan soal, pembesar font, palet nomor, penanda ragu-ragu, autosave, dan timer.',
          items: [
            { id: 'M7', text: 'Tampilan ruang ujian (soal, teks pilihan jawaban, dan gambar pendukung) jelas dan mudah dibaca', fitur: 'Ruang Ujian', eucs: 'F' },
            { id: 'M8', text: 'Fitur pembesar ukuran font (zoom), layar penuh (fullscreen), dan palet nomor soal membantu kenyamanan mengerjakan', fitur: 'Kontrol Layar', eucs: 'F' },
            { id: 'M9', text: 'Tombol penanda "Ragu-ragu" dan filter status soal mempermudah pengecekan kembali jawaban', fitur: 'Fitur Ragu-ragu', eucs: 'E' },
            { id: 'M10', text: 'Fitur penyimpanan otomatis (autosave) bekerja dengan baik dan memberi rasa aman bahwa jawaban tidak hilang', fitur: 'Autosave', eucs: 'A' },
            { id: 'M11', text: 'Timer hitung mundur sisa waktu ujian akurat dan tersinkronisasi dengan baik', fitur: 'Timer Realtime', eucs: 'T' },
            { id: 'M12', text: 'Fitur proteksi anti-cheat (peringatan perpindahan tab/jendela) efektif menjaga kejujuran ujian tanpa mengganggu konsentrasi', fitur: 'Anti-Cheat', eucs: 'A' }
          ]
        },
        {
          title: 'Pasca Ujian, Kartu & Performa Sistem',
          desc: 'Submit ujian, skor instan pilihan ganda, cetak kartu, dan stabilitas server.',
          items: [
            { id: 'M13', text: 'Proses submit atau penyelesaian ujian berjalan lancar tanpa hambatan teknis', fitur: 'Submit Ujian', eucs: 'E' },
            { id: 'M14', text: 'Perolehan skor pilihan ganda yang langsung ditampilkan setelah selesai ujian memberikan kejelasan hasil', fitur: 'Skor Instan', eucs: 'C' },
            { id: 'M15', text: 'Kartu ujian mahasiswa dapat dilihat dan dicetak dengan mudah saat dibutuhkan', fitur: 'Kartu Ujian', eucs: 'E' },
            { id: 'M16', text: 'Halaman PintarUji terbuka dengan cepat dan responsif saat diakses', fitur: 'Kecepatan', eucs: 'T' },
            { id: 'M17', text: 'Sistem PintarUji stabil dan jarang mengalami error saat pelaksanaan ujian berlangsung', fitur: 'Stabilitas', eucs: 'A' },
            { id: 'M18', text: 'Penggunaan PintarUji membuat pelaksanaan ujian terasa lebih praktis, tertib, dan tenang dibanding ujian kertas', fitur: 'Manfaat CBT', eucs: 'C' }
          ]
        }
      ],
      open: [
        { id: 'M_OPEN_1', text: 'Fitur apa pada ruang ujian PintarUji yang paling membantu kelancaran Anda saat mengerjakan soal?', hint: 'Contoh: autosave, palet nomor ragu-ragu, timer, dll.' },
        { id: 'M_OPEN_2', text: 'Kendala teknis apa yang pernah atau paling sering Anda alami saat pelaksanaan ujian?', hint: 'Contoh: koneksi lemot, sesi terkunci, tampilan gambar soal, dll.' }
      ]
    },

    {
      id: 'dosen',
      label: 'Dosen / Pengawas',
      tagline: 'Menilai Efisiensi & Pengawasan Ujian',
      description: 'Bank soal, import excel, jadwal mengawas, presensi peserta, monitoring realtime, dan daftar nilai.',
      count: 14,
      estimate: '± 5–6 menit',
      sections: [
        {
          title: 'Antarmuka & Jadwal Mengawas',
          desc: 'Kemudahan navigasi dan kejelasan penugasan jadwal ujian.',
          items: [
            { id: 'D1', text: 'Tampilan antarmuka dashboard dosen mudah dipahami dan intuitif', fitur: 'Dashboard Dosen', eucs: 'F' },
            { id: 'D2', text: 'Informasi jadwal mengajar dan penugasan sebagai pengawas ujian disajikan secara jelas dan terperinci', fitur: 'Jadwal Mengawas', eucs: 'C' }
          ]
        },
        {
          title: 'Pembuatan & Pengelolaan Bank Soal',
          desc: 'Pengaturan bank soal, import Excel, alokasi waktu, dan bobot.',
          items: [
            { id: 'D3', text: 'Proses pembuatan dan pengaturan bank soal (pilihan ganda & esai) mudah dilakukan', fitur: 'Bank Soal', eucs: 'E' },
            { id: 'D4', text: 'Fitur import butir soal melalui template Excel mempermudah dan mempercepat penyusunan soal ujian', fitur: 'Import Excel', eucs: 'E' },
            { id: 'D5', text: 'Pengaturan alokasi waktu ujian, bobot nilai, dan jenis ujian (UTS/UAS/Kuis/Remedial) fleksibel sesuai kebutuhan mata kuliah', fitur: 'Pengaturan Ujian', eucs: 'C' }
          ]
        },
        {
          title: 'Presensi, Monitoring & Pengawasan Ujian',
          desc: 'Presensi peserta, pantauan live monitoring, dan prosedur unlock sesi.',
          items: [
            { id: 'D6', text: 'Pengelolaan presensi kehadiran mahasiswa (hadir, tidak hadir, izin) di ruang ujian praktis dilakukan', fitur: 'Presensi Peserta', eucs: 'E' },
            { id: 'D7', text: 'Fitur Live Monitoring Ujian memudahkan pemantauan progres pengerjaan mahasiswa secara real-time', fitur: 'Monitoring Ujian', eucs: 'T' },
            { id: 'D8', text: 'Prosedur membuka kunci sesi (unlock/reset) bagi mahasiswa yang mengalami insiden perpindahan tab berjalan cepat', fitur: 'Unlock Sesi', eucs: 'E' },
            { id: 'D9', text: 'Rincian lembar jawaban mahasiswa dapat ditinjau dan diperiksa dengan jelas', fitur: 'Detail Jawaban', eucs: 'C' }
          ]
        },
        {
          title: 'Penilaian, Pelaporan & Performa',
          desc: 'Daftar nilai resmi, koreksi otomatis, efisiensi waktu, dan keandalan sistem.',
          items: [
            { id: 'D10', text: 'Dokumen Daftar Nilai Ujian dapat diunduh (Excel) dan dicetak dengan rapi sesuai standar resmi kampus', fitur: 'Dokumen Nilai', eucs: 'F' },
            { id: 'D11', text: 'Penilaian otomatis untuk soal pilihan ganda akurat dan menghemat waktu koreksi dosen', fitur: 'Koreksi Otomatis', eucs: 'A' },
            { id: 'D12', text: 'Sistem PintarUji memangkas waktu dan beban administrasi evaluasi dibanding pelaksanaan ujian konvensional', fitur: 'Efisiensi Administrasi', eucs: 'T' },
            { id: 'D13', text: 'Halaman PintarUji terbuka dengan cepat saat monitoring ujian berlangsung', fitur: 'Kecepatan Sistem', eucs: 'T' },
            { id: 'D14', text: 'Sistem PintarUji jarang mengalami gangguan teknis atau error selama masa ujian', fitur: 'Keandalan Sistem', eucs: 'A' }
          ]
        }
      ],
      open: [
        { id: 'D_OPEN_1', text: 'Proses apa yang masih terasa memakan waktu atau memerlukan penyederhanaan dalam pengelolaan ujian di PintarUji?', hint: 'Misalnya format import soal, pengelolaan presensi, rekap nilai, dll.' },
        { id: 'D_OPEN_2', text: 'Fitur tambahan apa yang paling Anda butuhkan untuk membantu proses evaluasi pembelajaran?', hint: 'Misalnya koreksi esai terintegrasi, analisis butir soal, bank soal bersama, dll.' }
      ]
    },

    {
      id: 'admin',
      label: 'Pimpinan / Admin',
      tagline: 'Menilai Tata Kelola & Integritas Ujian',
      description: 'Dashboard akademik, master data, auto-schedule, token, monitoring pusat, dan dokumen resmi.',
      count: 13,
      estimate: '± 5 menit',
      sections: [
        {
          title: 'Dashboard & Master Data Akademik',
          desc: 'Statistik kesiapan ujian, pengelolaan data prodi, angkatan, ruangan, dan matakuliah.',
          items: [
            { id: 'P1', text: 'Dashboard admin memberikan gambaran ringkas dan informatif mengenai kesiapan serta statistik ujian kampus', fitur: 'Dashboard Admin', eucs: 'C' },
            { id: 'P2', text: 'Pengelolaan data master (Program Studi, Tahun Angkatan, Ruangan, Mata Kuliah) terstruktur dan mudah dikelola', fitur: 'Master Data', eucs: 'E' },
            { id: 'P3', text: 'Fitur import data mahasiswa, dosen, dan mata kuliah dari Excel berjalan dengan akurat tanpa duplikasi', fitur: 'Integrasi Data', eucs: 'A' }
          ]
        },
        {
          title: 'Manajemen Jadwal, Token & Monitoring Kampus',
          desc: 'Deteksi bentrok jadwal, kontrol token ujian, dan live monitoring seluruh ruangan.',
          items: [
            { id: 'P4', text: 'Fitur pengaturan jadwal ujian (deteksi bentrok ruangan/pengawas & auto-generate) mempermudah perencanaan ujian', fitur: 'Penjadwalan Otomatis', eucs: 'E' },
            { id: 'P5', text: 'Pengelolaan token ujian (generate acak & pembaruan berkala) aman dan mencegah kebocoran akses', fitur: 'Keamanan Token', eucs: 'A' },
            { id: 'P6', text: 'Fitur Live Monitoring Ujian Realtime memberikan visibilitas menyeluruh atas seluruh ruangan dan sesi ujian yang sedang berjalan', fitur: 'Monitoring Pusat', eucs: 'T' },
            { id: 'P7', text: 'Pengelolaan peserta secara massal (tambah peserta, aktivasi akun, dan cetak kartu ujian massal) efisien dan menghemat waktu', fitur: 'Operasional Massal', eucs: 'E' }
          ]
        },
        {
          title: 'Dokumen Resmi, Keamanan & Tata Kelola',
          desc: 'Berita acara, daftar hadir, rekap Excel, otorisasi peran, dan keselarasan mutu.',
          items: [
            { id: 'P8', text: 'Dokumen resmi ujian (Berita Acara, Daftar Hadir, Daftar Nilai) terformat rapi sesuai kop dan standar Politeknik IDN', fitur: 'Dokumen Resmi', eucs: 'F' },
            { id: 'P9', text: 'Laporan Rekap Nilai Ujian dalam format multi-sheet Excel memudahkan kompilasi nilai akhir semester', fitur: 'Rekap Nilai Excel', eucs: 'F' },
            { id: 'P10', text: 'Fitur Cek Akun & Jadwal mandiri berbasis NIM pada halaman publik membantu mengurangi beban pertanyaan mahasiswa ke bagian akademik', fitur: 'Layanan Publik', eucs: 'C' },
            { id: 'P11', text: 'Pembagian hak akses pengguna (admin, dosen, mahasiswa) aman dan sesuai dengan wewenang operasional', fitur: 'Hak Akses', eucs: 'A' },
            { id: 'P12', text: 'Implementasi PintarUji berhasil mewujudkan ujian 100% paperless dan meningkatkan integritas akademik kampus', fitur: 'Paperless & Integritas', eucs: 'C' },
            { id: 'P13', text: 'Sistem PintarUji dapat diandalkan serta selaras dengan kebutuhan jangka panjang Politeknik IDN', fitur: 'Keandalan Lembaga', eucs: 'C' }
          ]
        }
      ],
      open: [
        { id: 'P_OPEN_1', text: 'Informasi atau indikator evaluasi apa yang belum tersedia pada sistem dan penting untuk pengambilan keputusan akademik?', hint: 'Misalnya statistik tingkat kesulitan soal, rekap pelanggaran per prodi, dll.' },
        { id: 'P_OPEN_2', text: 'Apa prioritas utama pengembangan dan integrasi PintarUji ke depan menurut pandangan Anda?', hint: 'Misalnya integrasi SIAKAD, mobile app, bank soal AI, dll.' }
      ]
    }
  ],

  /* Pertanyaan Penutup (Wajib Diisi Seluruh Peran) */
  closing: {
    Z1: {
      text: 'Secara keseluruhan, seberapa puas Anda dengan sistem ujian online PintarUji?',
      hint: 'Pilih satu angka dari 1 (Sangat tidak puas) sampai 5 (Sangat puas).'
    },
    Z2: {
      text: 'Seberapa besar kemungkinan Anda merekomendasikan penggunaan PintarUji sebagai platform ujian berbasis komputer?',
      hint: '0 = Sangat tidak mungkin merekomendasikan, 10 = Sangat mungkin merekomendasikan (NPS).'
    },
    Z3: {
      text: 'Kritik, saran, atau masukan untuk peningkatan kualitas sistem ujian PintarUji Politeknik IDN',
      hint: 'Opsional. Tuliskan masukan bebas untuk pengembangan sistem yang lebih baik.'
    }
  }
};

