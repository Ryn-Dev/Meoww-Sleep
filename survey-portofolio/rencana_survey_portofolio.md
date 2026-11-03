# Rencana Arsitektur: Kuesioner Kepuasan Layanan Portofolio IDN → Google Spreadsheet

Dokumen perencanaan teknis pengimplementasian formulir kuesioner evaluasi kepuasan layanan pengguna platform **Portofolio Mahasiswa Politeknik IDN** (`portofolio-idn`) menggunakan arsitektur web statis (HTML/CSS/JS) dengan penyimpanan data terintegrasi ke **Google Spreadsheet** melalui **Google Apps Script Web App**.

---

## 1. Ringkasan Eksekutif & Hasil Analisis Proyek `portofolio-idn`

Berdasarkan analisis mendalam terhadap basis kode Laravel di `D:\PROJECT FEBRYAN\portofolio-idn`:
- **Nama Sistem**: Portofolio Mahasiswa Politeknik IDN (`portofolio-idn`).
- **Domain Layanan**: Platform etalase digital, kurasi karya, dan direktori portofolio mahasiswa vokasi Politeknik IDN untuk menghubungkan mahasiswa dengan dunia industri, dosen/pembimbing, dan publik.
- **Pilar Fitur Utama**:
  1. *Mahasiswa*: Registrasi akun (dengan captcha & verifikasi email/admin), profil keahlian publik (sosmed, GitHub, LinkedIn), form upload karya (konversi WebP otomatis, ringkasan, multiple screenshot carousel, deskripsi berbab/rinci), pengajuan kurasi publish, metrik views & likes, serta keamanan akun.
  2. *Dosen / Pembimbing / Kurator*: Pemantauan karya mahasiswa bimbingan per jurusan/angkatan, verifikasi kualitas karya capstone/tugas akhir, peninjauan statistik sebaran portofolio (`/grafik`), dan leaderboard mahasiswa berprestasi (`/leaderboard`).
  3. *Pimpinan / Admin*: Dashboard analitik pusat (`/a/dashboard`), verifikasi pendaftaran akun mahasiswa baru, moderasi & persetujuan publish karya (`verify-publish`), manajemen master data Jurusan & Angkatan, pengelolaan pengumuman event/showcase terjadwal (`/a/pengumuman`), dan pengaturan platform.
  4. *Publik / Industri*: Showcase landing page dengan filter jurusan (Programmer, Engineer, Designer) & pencarian, leaderboard, direktori profil mahasiswa (`/mahasiswas`) untuk rekrutmen magang/kerja, serta fitur Like karya.

---

## 2. Keputusan Arsitektur Utama

| Parameter | Keputusan Desain | Alasan & Dampak Teknis |
|---|---|---|
| **Penyedia Hosting** | **GitHub Pages** (repositori `Ryn-Dev/Meoww-Sleep`, direktori `survey-portofolio/`) | Bebas biaya server, latensi rendah, CDN global, dan deployment mudah via Git. |
| **Endpoint Pengumpulan** | **Google Apps Script Web App** (`/exec`) | Backend *serverless*. Menggunakan `LockService` untuk mencegah data race condition saat submit simultan. |
| **Struktur Spreadsheet** | **1 Sheet Utama `Respon`** (format mendatar/wide 67 kolom) | 1 baris mewakili 1 responden. Kolom peran lain dikosongkan secara rapi sehingga pivot table dan agregasi tetap konsisten. |
| **Daftar Program Studi / Jurusan** | **3 Jurusan Resmi Politeknik IDN**: <br>• `58302` - Teknologi Rekayasa Perangkat Lunak (Programmer)<br>• `90346` - Teknologi Rekayasa Komputer Jaringan (Engineer)<br>• `90343` - Teknologi Rekayasa Multimedia Grafis (Designer) | Selaras dengan seeder database `jurusans` dan kurikulum Politeknik IDN. |
| **Aturan Identitas** | • **Mahasiswa**: Nama + NIM + Program Studi<br>• **Dosen / Kurator**: Nama + Program Studi<br>• **Pimpinan / Admin**: Nama saja (tanpa NIM & tanpa Prodi) | Input NIM disimpan sebagai plain text (`@`) agar angka nol di awal tidak terpotong di Spreadsheet. |
| **Verifikasi Responden** | **Tanpa Verifikasi Akun Database** | Menjamin kemudahan dan fleksibilitas responden mengisi kuesioner dari berbagai perangkat tanpa hambatan login database. |
| **Visualisasi Hasil** | **Dua Media Visualisasi**: <br>1. Sheet `Visualisasi` (5 grafik otomatis Google Sheets)<br>2. Halaman web `dashboard.html` (interaktif, radar EUCS SVG, Donut chart, zero-PII leak) | Memenuhi kebutuhan pimpinan untuk laporan cetak resmi sekaligus menyajikan dashboard analitik interaktif publik/terproteksi. |
| **Proteksi Dashboard** | **PIN Dinamis via Sheet `Pengaturan` (Cell B2)** | Pengelola dapat mengunci atau membuka dashboard langsung dari Spreadsheet tanpa ubah kode script. |
| **Design System** | **Space Grotesk + Inter, Micro-Box 4px** | Tampilan modern, rapi, proporsional, serta dilengkapi toggle Dark & Light mode yang teduh di mata. |

---

## 3. Alur Pengiriman & Penyimpanan Data

```
[Browser Responden]
        │
        │ 1. fetch POST JSON (Content-Type: text/plain;charset=utf-8)
        ▼
[Google Apps Script: /exec]
        │
        ├─ 2. ScriptLock (tunggu hingga 15 detik)
        ├─ 3. Validasi Token (opsional) & Nilai Skor (1–5)
        ├─ 4. Cek pencegahan duplikasi teknis (id_respon)
        │
        ▼
[Google Spreadsheet]
        ├─ Sheet "Respon" ──────► appendRow(data) + set format teks NIM
        ├─ Sheet "Rekap"  ──────► Formula otomatis (AVERAGE, COUNTIF, EUCS, NPS)
        ├─ Sheet "Visualisasi" ─► 5 Grafik bawaan Sheets (Donat, Batang, Komposisi)
        └─ Sheet "Pengaturan" ──► Konfigurasi PIN dashboard (B2) & Token rahasia (B3)
```

---

## 4. Struktur Berkas Sistem Survei

```
survey-portofolio/
├── README.md                      # Petunjuk deployment & manual penggunaan
├── kuesioner_kepuasan_portofolio.md # Bank butir instrumen penelitian & pemetaan EUCS
├── rencana_survey_portofolio.md    # Dokumen arsitektur teknis (dokumen ini)
├── index.html                     # Halaman kuesioner multi-langkah interaktif
├── hasil.html                     # Halaman konfirmasi submit & antrean offline
├── dashboard.html                 # Dashboard visualisasi agregat analitik & PIN Gate
├── assets/
│   ├── config.js                  # Endpoint Web App, token, daftar prodi, versi form
│   ├── questions.js               # Single Source of Truth 45 butir EUCS & 6 esai
│   ├── app.js                     # Logika form wizard, autosave, offline queue, tema
│   ├── style.css                  # Design system Micro-Box 4px & Dark/Light mode
│   ├── dashboard.js               # Logika dashboard, chart SVG radar EUCS, filter data
│   └── dashboard.css              # Styling layout dashboard analitik & print stylesheet
└── apps-script/
    └── Code.gs                    # Kode backend serverless Google Apps Script
```

---

## 5. Metodologi Pengukuran: EUCS & Net Promoter Score (NPS)

Survei menggunakan model **EUCS (End-User Computing Satisfaction)** oleh Doll & Torkzadeh:
1. **Content (C - Isi Informasi)**: Kelengkapan profil, kejelasan deskripsi proyek berbab, transparansi status verifikasi kurasi, dan visibilitas metrik karya.
2. **Accuracy (A - Keakuratan & Keandalan)**: Ketepatan konversi WebP otomatis, keandalan counter views/likes, keamanan ganti password, dan akurasi filter pencarian.
3. **Format (F - Tampilan & Tata Letak)**: Kerapian antarmuka showcase landing page, estetika kartu karya, kenyamanan galeri carousel, dan responsivitas desain.
4. **Ease of Use (E - Kemudahan Penggunaan)**: Kemudahan pendaftaran akun, input portofolio baru, penambahan media carousel, preview karya, dan moderasi admin.
5. **Timeliness (T - Kecepatan & Ketepatan Waktu)**: Kecepatan memuat gambar portofolio terkompresi, responsivitas filter/pencarian, dan kecepatan kurasi verifikasi terbit.

### Skala Penilaian:
- **Skala Likert 1–5 Berlabel Penuh**:
  - `1` = Sangat Tidak Setuju (STS)
  - `2` = Tidak Setuju (TS)
  - `3` = Netral (N)
  - `4` = Setuju (S)
  - `5` = Sangat Setuju (SS)
- **Net Promoter Score (NPS - Z2)**:
  - Pertanyaan 0–10 untuk mengukur loyalitas dan kesediaan merekomendasikan platform Portofolio IDN.
  - Promoter (9–10), Passive (7–8), Detractor (0–6).
- **Kepuasan Keseluruhan (Z1)**: Skala 1–5 (Sangat tidak puas s/d Sangat puas).
- **Kritik & Saran (Z3)**: Masukan kualitatif bebas perbaikan layanan.

---

## 6. Penjaminan Kualitas & Zero PII Leak

1. **Privasi Responden**:
   - Responden diinformasikan bahwa data Nama & NIM hanya disimpan untuk evaluasi layanan.
   - Endpoint `doGet(?mode=rekap)` melakukan pembersihan mutlak; kolom Nama dan NIM tidak disertakan dalam JSON respons ke publik.
2. **Ketahanan Offline & Jaringan Tidak Stabil**:
   - Fitur *Autosave* lokal di browser (`localStorage`) selama 14 hari.
   - Fitur *Offline Queue*: Jika pengiriman gagal karena putus koneksi, draf antrean disimpan dan dikirim otomatis saat koneksi pulih kembali.
3. **Pencegahan Duplikasi & Serangan**:
   - Sanitasi formula injection (`=` di awal teks dinetralkan menjadi `'=`).
   - Deduplikasi teknis berbasis `id_respon` acak unik per pengisian.

