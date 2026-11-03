# Kuesioner Kepuasan Layanan SIMTA IDN

Sistem survei dan evaluasi kepuasan layanan **Sistem Informasi Manajemen Tugas Akhir (SIMTA)** di lingkungan **Politeknik IDN Bogor**.

Aplikasi yang dievaluasi: **[https://simta.politeknikidn.id](https://simta.politeknikidn.id)**

---

## 1. Ikhtisar & Arsitektur Sistem

Platform survei ini dirancang untuk mengumpulkan, memvalidasi, dan memvisualisasikan umpan balik dari seluruh pemangku kepentingan tugas akhir di Politeknik IDN secara transparan, aman, dan tanpa biaya operasional (*zero server cost*).

- **Frontend**: Vanilla Modern HTML5, CSS3, dan ES6 (tanpa framework, tanpa bundler/build step, langsung jalan di peramban).
- **Backend**: Google Apps Script Web App (`Code.gs`) yang mengelola validasi, deduplikasi, dan agregasi data.
- **Database**: Google Spreadsheet dengan tab `Respon` (82 kolom), `Rekap` (formula analitik otomatis), `Visualisasi` (grafik bawaan spreadsheet), dan `Pengaturan` (konfigurasi token & PIN).
- **Design System**:
  - Pasangan font: **Space Grotesk** (display & angka) + **Inter** (body & label).
  - Micro-Box 4px (`--radius: 4px`) pada seluruh card, input, dan tombol.
  - Skema warna halus & tenang (Slate/Zinc) dengan dukungan penuh **Dark Mode** (`#09090b` / `#121215`) dan **Light Mode**.
  - Jarak antar elemen proporsional (margin pertanyaan 24px, jarak pertanyaan ke pilihan 20px).
  - Tautan interaktif langsung ke platform live `https://simta.politeknikidn.id` pada bilah navigasi dan kartu pengantar.

---

## 2. Struktur Peran & Distribusi Instrumen

Kuesioner secara otomatis menyesuaikan butir pertanyaan berdasarkan peran yang dipilih responden:

| Peran | Kode Butir | Jumlah Butir | Pertanyaan Terbuka | Kebutuhan Program Studi |
| :--- | :---: | :---: | :---: | :---: |
| **Mahasiswa** | `M1` – `M18` | 18 butir | `M_OPEN_1`, `M_OPEN_2` | Wajib memilih (TRPL / TRKJ / TRMG) + NIM |
| **Dosen** | `D1` – `D14` | 14 butir | `D_OPEN_1`, `D_OPEN_2` | Wajib memilih prodi homebase |
| **Admin Prodi** | `AP1` – `AP12` | 12 butir | `AP_OPEN_1`, `AP_OPEN_2` | Wajib memilih prodi binaan |
| **Administrator** | `P1` – `P14` | 14 butir | `P_OPEN_1`, `P_OPEN_2` | Tidak memilih prodi (Pusat Kampus) |
| **Penutup (Semua)** | `Z1`, `Z2`, `Z3` | 3 butir | `Z3` | Evaluasi umum 1–5, NPS 0–10, pesan/saran |

### 5 Dimensi EUCS (*End-User Computing Satisfaction*):
1. **Content (C - 14 butir / 24,1%)**: Kejelasan informasi status usulan judul, kelengkapan berkas unduhan template dokumen, direktori kuota dosen, referensi topik terdahulu, dan rekam jejak kelulusan.
2. **Accuracy (A - 11 butir / 19,0%)**: Keabsahan dokumen SK dengan verifikasi QR code resmi kampus, ketelitian rubrik penilaian sidang, akurasi riwayat nilai, dan keandalan sistem tanpa duplikasi data.
3. **Format (F - 7 butir / 12,1%)**: Kerapian format dokumen cetak resmi SK rektorat, kejelasan antarmuka dashboard tiap peran, struktur jadwal ujian, dan kenyamanan keterbacaan komponen penilaian.
4. **Ease of Use (E - 19 butir / 32,8%)**: Kemudahan alur pengajuan judul baru, pengunggahan berkas syarat seminar proposal & sidang TA, kemudahan dosen memberikan bimbingan & nilai, dan validasi berkas oleh admin prodi.
5. **Timeliness (T - 7 butir / 12,1%)**: Ketepatan waktu pembaruan jadwal ujian proposal & sidang, kecepatan respon pengaduan mahasiswa, notifikasi pesan, dan kelancaran proses kelulusan tepat waktu.

Total: **58 Butir Likert 1–5** + **9 Kolom Kualitatif** + **2 Kolom Penutup Numerik** + **13 Kolom Metadata** = **82 Kolom Database**.

---

## 3. Struktur Berkas

```
survey-simta/
├── assets/
│   ├── app.js               # Logika formulir, validasi multi-step, autosave & offline queue
│   ├── config.js            # Konfigurasi endpoint Apps Script, token, dan prodi
│   ├── dashboard.css        # Tata letak dashboard, grafik radar SVG, donut, dan tabel
│   ├── dashboard.js         # Logika dashboard agregat, PIN gate, radar SVG & generator demo
│   ├── questions.js         # Single source of truth butir instrumen, peran, dan dimensi
│   └── style.css            # Desain sistem: Space Grotesk + Inter, Micro-Box 4px & Dark Mode
├── apps-script/
│   └── Code.gs              # Backend Google Apps Script (doGet, doPost, setup, rekap, visualisasi)
├── dashboard.html           # Halaman laporan analitik visual interaktif
├── hasil.html               # Halaman konfirmasi pengiriman respon & status offline
├── index.html               # Halaman formulir pengisian kuesioner utama
├── kuesioner_kepuasan_simta.md # Dokumen naskah lengkap instrumen kuesioner psikometrik
├── rencana_survey_simta.md  # Dokumen arsitektur teknis dan mapping kolom database
└── README.md                # Dokumentasi panduan operasional proyek
```

---

## 4. Panduan Pemasangan & Penerapan (Deployment)

### Langkah 1: Siapkan Google Spreadsheet
1. Buka [Google Drive](https://drive.google.com) dan buat **Google Spreadsheet Baru**.
2. Beri nama spreadsheet, misalnya: `SIMTA - Kuesioner Kepuasan Layanan`.
3. Buka menu **Extensions (Ekstensi)** → **Apps Script**.

### Langkah 2: Salin Kode Backend
1. Hapus seluruh isi pada editor file `Code.gs`.
2. Salin seluruh isi dari berkas [`apps-script/Code.gs`](file:///d:/Meoww-Sleep/survey-simta/apps-script/Code.gs) ke editor Apps Script tersebut.
3. Klik tombol **Save (Simpan)** (ikon disket / `Ctrl+S`).

### Langkah 3: Inisialisasi Sheet & Struktur Database
1. Pada menu dropdown fungsi di toolbar atas Apps Script, pilih fungsi `setupSheet`.
2. Klik tombol **Run (Jalankan)**.
3. Berikan izin akses Google (*Review Permissions* → pilih akun Google → *Advanced* → *Go to script* → *Allow*).
4. Setelah selesai, periksa Google Spreadsheet:
   - Tab `Respon` otomatis terbuat dengan **82 header kolom**.
   - Tab `Pengaturan` otomatis terisi parameter token dan PIN.
   - Tab `Rekap` otomatis berisi formula analitik eksekutif.
   - Tab `Visualisasi` otomatis berisi grafik donut dan bar chart.

### Langkah 4: Terapkan Sebagai Web App
1. Klik tombol **Deploy (Terapkan)** di pojok kanan atas → **New deployment (Penerapan baru)**.
2. Klik ikon gerigi di sebelah kiri → pilih **Web app**.
3. Isi parameter konfigurasi:
   - **Description**: `SIMTA Survey Backend v1`
   - **Execute as (Jalankan sebagai)**: `Me (Email Anda)`
   - **Who has access (Siapa yang memiliki akses)**: **`Anyone (Siapa saja)`** *(WAJIB agar responden dapat mengirim data tanpa perlu login akun Google)*.
4. Klik **Deploy**.
5. Salin **Web app URL** yang berakhiran `/exec`.

### Langkah 5: Hubungkan ke Frontend Web
1. Buka berkas [`assets/config.js`](file:///d:/Meoww-Sleep/survey-simta/assets/config.js).
2. Tempelkan URL Apps Script yang disalin pada variabel `WEB_APP_URL`:
   ```javascript
   window.CONFIG = {
     WEB_APP_URL: 'https://script.google.com/macros/s/AKfycb.../exec',
     TOKEN: 'simta-survey-token',
     VERSION: 'v1',
     APP_URL: 'https://simta.politeknikidn.id',
     // ...
   };
   ```
3. Simpan berkas. Kuesioner kini siap digunakan secara publik!

---

## 5. Fitur Keamanan & Privasi (*Zero-PII Leak Guarantee*)

- **Pemisahan Identitas dan Analisis**:
  Saat responden mengisi kuesioner, Nama dan NIM tersimpan aman di tab `Respon` spreadsheet pengelola untuk pencatatan partisipasi institusi.
- **Enkapsulasi Endpoint Dashboard**:
  Endpoint agregat `doGet(?mode=rekap)` di backend `Code.gs` secara matematis memfilter baris sebelum dikirim ke peramban. Variabel Nama dan NIM **tidak pernah dimuat atau dikirimkan ke dashboard publik**.
- **Proteksi PIN Dinamis**:
  Dashboard dapat diproteksi menggunakan PIN yang diatur fleksibel melalui tab `Pengaturan` cell B2. Pengelola dapat mengganti atau mengosongkan PIN kapan saja tanpa mengubah kode program.
- **Offline Resilient Queue**:
  Jika responden mengisi kuesioner saat jaringan terputus, formulir akan menyimpan draf payload secara aman di `localStorage` peramban dan otomatis mengirimkannya saat perangkat kembali online.

---

## 6. Akses & Lisensi

- **Formulir Pengisian**: Buka [`index.html`](file:///d:/Meoww-Sleep/survey-simta/index.html)
- **Laporan Dashboard**: Buka [`dashboard.html`](file:///d:/Meoww-Sleep/survey-simta/dashboard.html)
- **Aplikasi Utama**: [https://simta.politeknikidn.id](https://simta.politeknikidn.id)
- Dikelola oleh Tim Pengembang & Penjaminan Mutu Politeknik IDN Bogor.

