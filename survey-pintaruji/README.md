# Kuesioner Kepuasan PintarUji (CBT) — Form Statis + Google Spreadsheet

Formulir kuesioner evaluasi kepuasan layanan pengguna untuk aplikasi **PintarUji (Computer-Based Test)** Politeknik IDN Bogor. Dibangun menggunakan HTML, CSS, dan JavaScript murni (tanpa framework dan tanpa build step). Seluruh jawaban dikirim langsung ke endpoint Google Apps Script Web App dan tersimpan secara rapi dalam satu baris baru di sheet `Respon` pada Google Spreadsheet. Hasil rekapitulasi, indikator kepuasan (Likert 1–5), dimensi EUCS (C/A/F/E/T), dan Net Promoter Score (NPS) dihitung otomatis menggunakan formula spreadsheet serta divisualisasikan dalam dashboard web interaktif.

```
index.html ──► Apps Script Web App (/exec) ──► Spreadsheet: Respon
   │                     │                        ├─ Rekap (formula otomatis)
   └─ hasil.html         ▼                        ├─ Visualisasi (5 grafik Sheets)
                   dashboard.html (?mode=rekap)   └─ Pengaturan (PIN & Token)
```

---

## Daftar Isi Berkas

| Berkas / Direktori | Deskripsi & Fungsi |
|---|---|
| `README.md` | Petunjuk lengkap pemasangan, alur data, hosting, dan pemecahan masalah |
| `kuesioner_kepuasan_cbt.md` | Dokumen rancangan soal evaluasi CBT berbasis EUCS & NPS hasil analisis kode PintarUji |
| `rencana_survey_cbt.md` | Dokumen arsitektur teknis data flow, skema kolom spreadsheet, dan formula rekapitulasi |
| `index.html` | Antarmuka formulir pengisian kuesioner multi-tahap (intro → peran → identitas → kebiasaan → Likert → penutup) |
| `hasil.html` | Halaman konfirmasi pengiriman; membedakan status `sent` (terkirim), `queued` (antrean offline), dan `unverified` |
| `dashboard.html` | Dashboard visualisasi analitik interaktif (radar EUCS, komposisi NPS, ranking butir, prodi, saran anonim) |
| `assets/questions.js` | Bank soal tunggal (skala Likert, dimensi EUCS, rincian butir per peran, prodi Politeknik IDN) |
| `assets/config.js` | Berkas konfigurasi (`WEB_APP_URL`, `TOKEN`, `VERSION`, daftar prodi, masa simpan draf) |
| `assets/app.js` | Logika formulir (render dinamis, validasi wajib isi per tahap, autosave draf, submit AJAX, antrean offline) |
| `assets/style.css` | Tampilan antarmuka modern mobile-first, radio card 1–5 ramah sentuh, dan tema terang/gelap |
| `assets/dashboard.js` | Logika visualisasi dashboard web, grafik radar SVG, filter peran/tanggal, mode simulasi, dan proteksi PIN |
| `assets/dashboard.css` | Tata letak grid dashboard modern, kartu KPI, diagram batang distribusi, dan style cetak/PDF |
| `apps-script/Code.gs` | Skrip Google Apps Script (`doPost`, `doGet ?mode=rekap`, `setupSheet`, `buildRekap`, `buildVisualisasi`, `setupPengaturan`) |

---

## 1. Menyiapkan Spreadsheet dan Apps Script

Cara paling praktis adalah memasang script langsung di dalam Google Spreadsheet (*bound script*), sehingga ID Spreadsheet tidak perlu disalin manual.

1. Buat Google Spreadsheet baru di Google Drive Anda, beri nama misalnya: **`Kuesioner Kepuasan PintarUji`**.
2. Klik menu **Extensions (Ekstensi) → Apps Script**.
3. Hapus seluruh isi default pada `Code.gs`, lalu salin seluruh baris kode dari berkas [`apps-script/Code.gs`](./apps-script/Code.gs) ke editor tersebut.
4. Simpan dengan menekan `Ctrl + S`.
5. Di toolbar bagian atas editor, pastikan dropdown fungsi memilih **`setupSheet`**, lalu klik tombol **Run**.
6. Setujui permintaan perizinan akun Google (*Review permissions → Advanced → Go to ... (unsafe) → Allow*).
7. Fungsi `setupSheet()` akan secara otomatis membuat dan menata 4 sheet:
   - **`Respon`**: Menampung data mentah jawaban (59 kolom) dengan format teks `@` pada kolom `nim` dan `kode_prodi` agar digit nol di depan (misal `0123456`) tidak hilang.
   - **`Rekap`**: Tabel formula otomatis untuk menghitung jumlah responden, rata-rata kepuasan Z1, indeks kepuasan (%), NPS, rata-rata 45 butir pertanyaan, dan agregasi 5 dimensi EUCS.
   - **`Visualisasi`**: Kartu KPI ringkasan dan 5 grafik bawaan Google Sheets (sebaran peran, komposisi NPS, radar/batang dimensi EUCS, kepuasan per prodi, dan perangkat utama).
   - **`Pengaturan`**: Tempat mengatur **Kode Akses Dashboard (PIN)** di cell `B2` dan **Token Formulir (Secret)** di cell `B3` tanpa perlu mengedit kode skrip lagi.

> [!TIP]
> Jika di kemudian hari struktur pertanyaan diperbarui, Anda dapat memperbarui tata letak sheet kapan saja melalui menu baru di Google Spreadsheet: **PintarUji Survey → Bangun ulang sheet Rekap** atau **Bangun ulang sheet Visualisasi (Grafik)**.

---

## 2. Deploy Web App Google Apps Script

Agar formulir di web dapat mengirimkan data ke spreadsheet, skrip harus dipublikasikan sebagai Web App:

1. Di editor Apps Script, klik tombol biru **Deploy → New deployment**.
2. Klik ikon gerigi (Select type) dan pilih **Web app**.
3. Isi deskripsi, misalnya: `PintarUji Survey API v1`.
4. Atur konfigurasi wajib berikut:
   - **Execute as**: `Me (email Anda)`
   - **Who has access**: **`Anyone`** *(Sangat penting: pilih Anyone, bukan "Anyone with Google account", agar pengisi formulir tidak dicegat form login Google).*
5. Klik tombol **Deploy**.
6. Salin URL Web App yang dihasilkan (pastikan URL berakhiran **`/exec`**).
7. Buka berkas [`assets/config.js`](./assets/config.js), lalu tempel URL tersebut:
   ```javascript
   WEB_APP_URL: 'https://script.google.com/macros/s/AKfycb.../exec',
   TOKEN: 'ganti-token-acak', // Samakan dengan cell B3 pada tab Pengaturan di Spreadsheet
   ```
8. Buka formulir `index.html` di browser Anda, lakukan satu kali pengisian simulasi, dan periksa apakah baris baru muncul di sheet `Respon`.

> [!WARNING]
> Setiap kali Anda melakukan perubahan kode pada `Code.gs`, lakukan **Deploy → Manage deployments → Edit (ikon pensil) → Version: New version → Deploy** agar URL `/exec` menjalankan versi kode terbaru.

---

## 3. Hosting melalui GitHub Pages

Repositori induk: `https://github.com/Ryn-Dev/Meoww-Sleep` (branch `master`).

1. Masukkan folder `survey-pintaruji/` ke dalam repositori GitHub Anda.
2. Buka menu **Settings → Pages** pada repositori GitHub.
3. Pada opsi **Source**, pilih **Deploy from a branch** → Branch: `master` / Folder: `/ (root)`.
4. Formulir kuesioner akan aktif dan dapat diakses publik pada alamat:
   - **Formulir Survey**: `https://ryn-dev.github.io/Meoww-Sleep/survey-pintaruji/`
   - **Dashboard Hasil**: `https://ryn-dev.github.io/Meoww-Sleep/survey-pintaruji/dashboard.html`
5. Seluruh pemanggilan aset (`./assets/...`) menggunakan path relatif, sehingga aman dijalankan baik di server web lokal (Live Server) maupun di hosting GitHub Pages.

---

## 4. Karakteristik Pengisian & Privasi Data

| Komponen | Penjelasan & Perilaku Sistem |
|---|---|
| **Pilihan Peran** | Mahasiswa (`mahasiswa`), Dosen / Pengawas Ujian (`dosen`), dan Admin / Pimpinan Akademik (`admin`) |
| **Identitas Responden** | Mahasiswa: Nama + NIM + Program Studi.<br>Dosen: Nama + Program Studi.<br>Pimpinan: Cukup Nama (tanpa NIM & tanpa Prodi). |
| **Verifikasi Akun** | Tanpa integrasi login database; tidak ada pencocokan ke daftar NIM kampus dan pengisian ulang diperbolehkan demi fleksibilitas. |
| **Daftar Program Studi** | 3 Program Studi resmi Politeknik IDN:<br>• `58302` - Teknik Rekayasa Perangkat Lunak (TRPL)<br>• `90346` - Teknik Rekayasa Komputer Jaringan (TRKJ)<br>• `90343` - Teknologi Rekayasa Multimedia Grafis (TRMG) |
| **Penyimpanan NIM** | Disimpan sebagai teks murni (`type="text"` + `inputmode="numeric"` di web, dan format `@` di Spreadsheet) sehingga digit `0` di awal tidak hilang. |
| **Autosave Draf** | Setiap klik dan isian otomatis dicadangkan di `localStorage` peramban selama 14 hari. |
| **Durasi Pengisian** | Dihitung otomatis (`durasi_detik`) mulai dari layar dibuka hingga tombol submit ditekan. |
| **Ketahanan Jaringan** | Jika jaringan putus saat submit, data disimpan di antrean lokal (`queued`) dan otomatis dikirim saat koneksi internet kembali aktif. |

---

## 5. Membaca Hasil & Visualisasi Analitik

Terdapat tiga cara untuk mengevaluasi data kepuasan layanan PintarUji:

### 1. Sheet `Rekap` (Angka & Indikator Otomatis)
- **Ringkasan Eksekutif**: Total respons per peran, rata-rata kepuasan umum (Z1), indeks kepuasan keseluruhan (skala 100%), skor NPS, dan rata-rata durasi pengerjaan.
- **Rata-rata 45 Butir Evaluasi**: Nilai rata-rata 1–5, jumlah respons, indeks (%), dan kategori (Sangat Puas, Puas, Cukup, Tidak Puas, Sangat Tidak Puas) yang dikelompokkan berdasarkan fitur CBT dan dimensi EUCS.
- **Rata-rata 5 Dimensi EUCS**: Nilai agregat dimensi Content, Accuracy, Format, Ease of Use, dan Timeliness untuk masing-masing peran.
- **Performa per Program Studi**: Membandingkan indeks kepuasan dan NPS antara mahasiswa dan dosen dari TRPL, TRKJ, dan TRMG.

### 2. Sheet `Visualisasi` (Grafik Siap Cetak Google Sheets)
- **Diagram Donat Sebaran Peran Responden** (Mahasiswa vs Dosen vs Admin).
- **Komposisi Responden NPS** (Promoter 9–10, Passive 7–8, Detractor 0–6).
- **Grafik Batang Perbandingan 5 Dimensi EUCS** antar ketiga peran.
- **Grafik Batang Kepuasan per Program Studi**.
- **Sebaran Perangkat Utama yang Digunakan Responden** (Laptop/PC vs HP vs Tablet).
- Dapat langsung disalin (*Copy chart*) atau diunduh sebagai gambar PNG/PDF untuk dimasukkan ke laporan akademik atau slide presentasi pimpinan.

### 3. Halaman Web `dashboard.html` (Dashboard Interaktif)
- Mengakses data agregat langsung dari Google Spreadsheet melalui pemanggilan `GET /exec?mode=rekap` **tanpa pernah memuat Nama maupun NIM responden**, sehingga kerahasiaan identitas tetap aman.
- Dilengkapi **Peta Radar Segi Lima (SVG) EUCS** interaktif untuk melihat keseimbangan mutu sistem.
- **Filter Peran Cepat** (Semua Peran, Mahasiswa, Dosen, Admin) dan **Filter Rentang Tanggal**.
- **Sorotan Utama**: Menampilkan otomatis 3 fitur dengan apresiasi tertinggi serta 3 area prioritas evaluasi.
- **Tabel Interaktif**: Fitur pencarian instan (kode soal/fitur/teks), filter dimensi EUCS, dan pengurutan skor.
- **Masukan Terbuka Anonim**: Daftar kritik dan saran responden yang diformat dalam kartu rapi.
- **Mode Simulasi**: Tombol *Data Simulasi* untuk mempratinjau visualisasi grafik saat data spreadsheet asli masih kosong.
- **Proteksi PIN Opsional**: Dashboard dapat dikunci dengan PIN melalui cell `B2` pada sheet `Pengaturan`.

---

## 6. Klasifikasi Skor dan Tolok Ukur

### Skala Likert 1–5 & Kepuasan Umum (Z1)
| Nilai Rata-rata | Indeks Kepuasan (%) | Kategori Mutu | Interpretasi Praktis |
|---|---|---|---|
| **4,20 – 5,00** | 84,0% – 100% | **Sangat Puas** | Layanan CBT sangat memuaskan dan berkinerja prima |
| **3,40 – 4,19** | 68,0% – 83,8% | **Puas** | Sistem berjalan lancar dan memenuhi ekspektasi pengguna |
| **2,60 – 3,39** | 52,0% – 67,8% | **Cukup** | Fungsional, namun terdapat aspek yang perlu disempurnakan |
| **1,80 – 2,59** | 36,0% – 51,8% | **Tidak Puas** | Terdapat kendala signifikan yang dirasakan pengguna |
| **< 1,80** | < 36,0% | **Sangat Tidak Puas** | Kritis; membutuhkan penanganan dan perbaikan mendesak |

### Net Promoter Score (NPS / Z2)
$$\text{NPS} = \%\,\text{Promoter (Skor 9–10)} - \%\,\text{Detractor (Skor 0–6)}$$
- **NPS $\ge$ +50%**: *Sangat Baik* (Tingkat loyalitas dan rekomendasi pengguna sangat tinggi).
- **NPS 0% s.d. +49%**: *Baik* (Pengguna yang puas melampaui jumlah pengguna yang mengeluh).
- **NPS < 0%**: *Perlu Perbaikan* (Keluhan dan resistensi pengguna memerlukan evaluasi mendalam).

---

## 7. Pemecahan Masalah (Troubleshooting)

| Gejala Masalah | Kemungkinan Penyebab | Tindakan Solusi |
|---|---|---|
| Muncul banner kuning *"Mode uji"* di form | `WEB_APP_URL` di `assets/config.js` masih kosong | Buka `assets/config.js` dan isi variabel `WEB_APP_URL` dengan tautan Web App `/exec`. |
| Muncul banner *"Konfigurasi URL belum tepat"* | URL yang dimasukkan adalah tautan Spreadsheet atau berakhiran `/dev` | Salin URL Web App yang berakhiran `/exec` dari menu **Deploy → Manage deployments**. |
| Pengiriman gagal, muncul halaman login Google | Hak akses deployment salah diset ke akun internal | Edit deployment Web App di Apps Script, ubah opsi **Who has access** menjadi **`Anyone`**. |
| Pesan error *"Token form tidak cocok"* | Variabel `TOKEN` di web berbeda dengan `SECRET` di Spreadsheet | Samakan nilai `TOKEN` di `assets/config.js` dengan nilai cell `B3` pada tab `Pengaturan`. |
| Nilai NIM `0123456` terpotong menjadi `123456` | Format kolom NIM di spreadsheet berubah menjadi angka | Jalankan kembali fungsi `setupSheet` dari editor Apps Script atau menu spreadsheet. |
| Angka di sheet `Rekap` belum terhitung | Google Sheets belum merefresh kalkulasi formula | Pilih menu spreadsheet: **PintarUji Survey → Bangun ulang sheet Rekap**. |
| Jawaban tidak langsung muncul di sheet saat sinyal buruk | Jawaban tersimpan di antrean offline `localStorage` | Buka kembali form dengan koneksi internet aktif; sistem akan otomatis melakukan flushing antrean. |

