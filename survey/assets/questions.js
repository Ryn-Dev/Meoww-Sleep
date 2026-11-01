/* ============================================================
   Bank soal kuesioner kepuasan LMS
   Sumber: survey/kuesioner_kepuasan_lms.md
   Ubah soal di sini — HTML dan sheet mengikuti otomatis.
   ============================================================ */
window.SURVEY = {
  version: 'v1',

  /* Skala Likert 1-5 */
  scale: [
    { value: 1, short: 'STS', label: 'Sangat tidak setuju' },
    { value: 2, short: 'TS', label: 'Tidak setuju' },
    { value: 3, short: 'N', label: 'Netral' },
    { value: 4, short: 'S', label: 'Setuju' },
    { value: 5, short: 'SS', label: 'Sangat setuju' }
  ],

  /* Skala kepuasan keseluruhan (Z1) */
  satisfaction: [
    { value: 1, short: 'STP', label: 'Sangat tidak puas' },
    { value: 2, short: 'TP', label: 'Tidak puas' },
    { value: 3, short: 'C', label: 'Cukup' },
    { value: 4, short: 'P', label: 'Puas' },
    { value: 5, short: 'SP', label: 'Sangat puas' }
  ],

  /* Data responden */
  lama: [
    'Kurang dari 1 bulan',
    '1–3 bulan',
    '3–6 bulan',
    'Lebih dari 6 bulan'
  ],
  frekuensi: [
    'Setiap hari',
    'Beberapa kali seminggu',
    'Seminggu sekali',
    'Jarang'
  ],
  perangkat: ['HP', 'Laptop / PC', 'Tablet'],

  /* Peran + soal */
  roles: [
    {
      id: 'mahasiswa',
      label: 'Mahasiswa',
      tagline: 'Menilai kemudahan belajar',
      description: 'Kelas, materi, tugas, absensi, laporan ibadah, dan SKL.',
      count: 20,
      estimate: '± 7 menit',
      sections: [
        {
          title: 'Akses & Tampilan',
          desc: 'Tentang login, tampilan, dan kenyamanan memakai LMS.',
          items: [
            { id: 'M1', text: 'Proses login ke LMS mudah dan lancar', fitur: 'Login', eucs: 'E' },
            { id: 'M2', text: 'Tampilan LMS menarik dan rapi', fitur: 'Umum', eucs: 'F' },
            { id: 'M3', text: 'Menu dan fitur mudah ditemukan', fitur: 'Umum', eucs: 'E' },
            { id: 'M4', text: 'LMS nyaman digunakan melalui HP', fitur: 'Umum', eucs: 'F' }
          ]
        },
        {
          title: 'Kelas & Materi',
          desc: 'Registrasi kelas, jadwal, dan ketersediaan materi.',
          items: [
            { id: 'M5', text: 'Proses registrasi/pemilihan kelas mudah dilakukan', fitur: 'Registrasi Kelas', eucs: 'E' },
            { id: 'M6', text: 'Informasi jadwal kelas jelas', fitur: 'Kelas/Jadwal', eucs: 'C' },
            { id: 'M7', text: 'Materi perkuliahan mudah diakses', fitur: 'Materi', eucs: 'E' },
            { id: 'M8', text: 'Materi tersedia tepat waktu sesuai jadwal', fitur: 'Materi', eucs: 'T' }
          ]
        },
        {
          title: 'Tugas & Nilai',
          desc: 'Instruksi, pengumpulan, dan umpan balik tugas.',
          items: [
            { id: 'M9', text: 'Instruksi dan batas waktu tugas jelas', fitur: 'Tugas', eucs: 'C' },
            { id: 'M10', text: 'Proses pengumpulan tugas (reguler, harian, pekanan) mudah', fitur: 'Tugas', eucs: 'E' },
            { id: 'M11', text: 'Nilai dan umpan balik tugas dari mentor dapat saya lihat dengan jelas', fitur: 'Tugas', eucs: 'C' }
          ]
        },
        {
          title: 'Absensi, Ibadah, SKL & Performa',
          desc: 'Kehadiran, laporan ibadah, SKL, dan kecepatan LMS.',
          items: [
            { id: 'M12', text: 'Absensi mudah dilakukan', fitur: 'Absensi', eucs: 'E' },
            { id: 'M13', text: 'Rekap kehadiran saya ditampilkan dengan akurat', fitur: 'Absensi', eucs: 'A' },
            { id: 'M14', text: 'Pengisian Laporan Ibadah mudah dilakukan', fitur: 'Laporan Ibadah', eucs: 'E' },
            { id: 'M15', text: 'Laporan Ibadah membantu saya mengevaluasi konsistensi ibadah', fitur: 'Laporan Ibadah', eucs: 'C' },
            { id: 'M16', text: 'Upload berkas SKL (buku, portofolio, project, sertifikat) mudah', fitur: 'SKL', eucs: 'E' },
            { id: 'M17', text: 'Progres/status SKL saya mudah dipantau', fitur: 'SKL', eucs: 'C' },
            { id: 'M18', text: 'Halaman LMS terbuka dengan cepat', fitur: 'Performa', eucs: 'T' },
            { id: 'M19', text: 'LMS jarang mengalami error saat digunakan', fitur: 'Performa', eucs: 'A' },
            { id: 'M20', text: 'LMS membantu proses belajar saya', fitur: 'Manfaat', eucs: 'C' }
          ]
        }
      ],
      open: [
        { id: 'M_OPEN_1', text: 'Fitur apa yang paling bermanfaat bagi Anda?', hint: 'Sebutkan fitur yang paling sering membantu.' },
        { id: 'M_OPEN_2', text: 'Kendala apa yang paling sering Anda alami?', hint: 'Boleh menyebut halaman atau langkah yang menyulitkan.' }
      ]
    },

    {
      id: 'dosen',
      label: 'Mentor',
      tagline: 'Menilai efisiensi mengajar',
      description: 'Jadwal, materi, tugas, penilaian, absensi, dan SKL.',
      count: 14,
      estimate: '± 6 menit',
      sections: [
        {
          title: 'Jadwal & Kelas',
          desc: 'Jadwal mengajar dan pengelolaan kelas.',
          items: [
            { id: 'D1', text: 'Tampilan LMS mudah dipahami', fitur: 'Umum', eucs: 'F' },
            { id: 'D2', text: 'Informasi jadwal mengajar jelas', fitur: 'Jadwal', eucs: 'C' },
            { id: 'D3', text: 'Mengelola kelas dan kelas harian mudah dilakukan', fitur: 'Kelas', eucs: 'E' }
          ]
        },
        {
          title: 'Materi & Tugas',
          desc: 'Upload materi, pembuatan tugas, dan penilaian.',
          items: [
            { id: 'D4', text: 'Upload materi (file/video) mudah dilakukan', fitur: 'Materi', eucs: 'E' },
            { id: 'D5', text: 'Membuat tugas (reguler, harian, pekanan) mudah dilakukan', fitur: 'Tugas', eucs: 'E' },
            { id: 'D6', text: 'Melihat pengumpulan tugas mahasiswa mudah', fitur: 'Tugas', eucs: 'E' },
            { id: 'D7', text: 'Proses pemberian nilai efisien', fitur: 'Penilaian', eucs: 'E' }
          ]
        },
        {
          title: 'Absensi & SKL',
          desc: 'Rekap kehadiran dan verifikasi SKL.',
          items: [
            { id: 'D8', text: 'Rekap absensi mahasiswa akurat', fitur: 'Absensi', eucs: 'A' },
            { id: 'D9', text: 'Proses verifikasi SKL mahasiswa mudah', fitur: 'SKL', eucs: 'E' }
          ]
        },
        {
          title: 'Monitoring & Performa',
          desc: 'Pemantauan mahasiswa, kesegaran data, dan performa.',
          items: [
            { id: 'D10', text: 'LMS membantu saya memantau perkembangan mahasiswa (akademik, ibadah, SKL)', fitur: 'Monitoring', eucs: 'C' },
            { id: 'D11', text: 'Data yang ditampilkan selalu terbaru (up to date)', fitur: 'Data', eucs: 'T' },
            { id: 'D12', text: 'LMS menghemat waktu administrasi dibanding cara manual', fitur: 'Manfaat', eucs: 'T' },
            { id: 'D13', text: 'Halaman LMS terbuka dengan cepat', fitur: 'Performa', eucs: 'T' },
            { id: 'D14', text: 'LMS jarang mengalami error saat digunakan', fitur: 'Performa', eucs: 'A' }
          ]
        }
      ],
      open: [
        { id: 'D_OPEN_1', text: 'Pekerjaan apa yang masih terasa repot di LMS?', hint: 'Misalnya langkah yang berulang atau data yang harus diisi manual.' },
        { id: 'D_OPEN_2', text: 'Fitur apa yang perlu ditambahkan untuk membantu mengajar?', hint: 'Tuliskan kebutuhan yang belum terpenuhi.' }
      ]
    },

    {
      id: 'admin',
      label: 'Pimpinan',
      tagline: 'Menilai kualitas informasi',
      description: 'Dashboard, grafik, monitoring, laporan, dan keamanan akses.',
      count: 13,
      estimate: '± 6 menit',
      sections: [
        {
          title: 'Dashboard & Grafik',
          desc: 'Ringkasan kondisi pembelajaran dan grafik yang tersedia.',
          items: [
            { id: 'P1', text: 'Dashboard memberikan gambaran ringkas kondisi pembelajaran', fitur: 'Dashboard', eucs: 'C' },
            { id: 'P2', text: 'Grafik absensi dan kelas harian mudah dipahami', fitur: 'Grafik', eucs: 'F' },
            { id: 'P3', text: 'Grafik SKL memberikan informasi yang saya butuhkan', fitur: 'Grafik SKL', eucs: 'C' },
            { id: 'P4', text: 'Grafik Laporan Ibadah memberikan informasi yang saya butuhkan', fitur: 'Grafik Ibadah', eucs: 'C' }
          ]
        },
        {
          title: 'Monitoring & Data',
          desc: 'Pemantauan pengajar, mahasiswa, dan filter data.',
          items: [
            { id: 'P5', text: 'Fitur Monitoring Mentor/Asdos membantu mengevaluasi kinerja pengajar', fitur: 'Monitoring', eucs: 'C' },
            { id: 'P6', text: 'Fitur Monitoring Mahasiswa membantu mengidentifikasi mahasiswa yang perlu perhatian', fitur: 'Monitoring', eucs: 'C' },
            { id: 'P7', text: 'Data yang ditampilkan akurat', fitur: 'Data', eucs: 'A' },
            { id: 'P8', text: 'Data yang ditampilkan selalu terbaru (real-time / up to date)', fitur: 'Data', eucs: 'T' },
            { id: 'P9', text: 'Filter data (periode, kelas, angkatan) sudah memadai', fitur: 'Filter', eucs: 'E' }
          ]
        },
        {
          title: 'Laporan & Keamanan',
          desc: 'Cetak/ekspor, hak akses, dan manfaat untuk keputusan.',
          items: [
            { id: 'P10', text: 'Laporan dapat dicetak/diekspor sesuai kebutuhan', fitur: 'Laporan', eucs: 'F' },
            { id: 'P11', text: 'Pengaturan hak akses pengguna sudah aman dan sesuai', fitur: 'Keamanan', eucs: 'A' },
            { id: 'P12', text: 'LMS membantu saya dalam pengambilan keputusan', fitur: 'Manfaat', eucs: 'C' },
            { id: 'P13', text: 'LMS sesuai dengan tujuan dan kebutuhan lembaga', fitur: 'Manfaat', eucs: 'C' }
          ]
        }
      ],
      open: [
        { id: 'P_OPEN_1', text: 'Laporan/informasi apa yang belum tersedia namun Anda butuhkan?', hint: 'Sebutkan data yang ingin Anda lihat di dashboard.' },
        { id: 'P_OPEN_2', text: 'Apa prioritas pengembangan LMS ke depan menurut Anda?', hint: 'Tuliskan hal yang paling mendesak untuk diperbaiki.' }
      ]
    }
  ],

  /* Penutup (semua peran) */
  closing: {
    Z1: {
      text: 'Secara keseluruhan, seberapa puas Anda dengan LMS ini?',
      hint: 'Pilih satu angka yang paling menggambarkan kepuasan Anda.'
    },
    Z2: {
      text: 'Seberapa besar kemungkinan Anda merekomendasikan LMS ini kepada orang lain?',
      hint: '0 = tidak mungkin sama sekali, 10 = sangat mungkin.'
    },
    Z3: {
      text: 'Kritik dan saran untuk pengembangan LMS',
      hint: 'Opsional. Boleh dikosongkan.'
    }
  }
};
