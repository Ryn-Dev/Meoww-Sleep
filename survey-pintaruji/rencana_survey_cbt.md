# Rencana Arsitektur: Kuesioner PintarUji (CBT) Statis → Google Spreadsheet

Dokumen perencanaan teknis pengimplementasian formulir kuesioner evaluasi kepuasan pengguna **PintarUji (Computer-Based Test)** Politeknik IDN menggunakan arsitektur web statis (HTML/CSS/JS) dengan penyimpanan data terintegrasi ke **Google Spreadsheet** melalui **Google Apps Script Web App**.

---

## 1. Keputusan Arsitektur Utama

| Parameter | Keputusan Desain | Alasan & Dampak Teknis |
|---|---|---|
| **Penyedia Hosting** | **GitHub Pages** (repositori `Ryn-Dev/Meoww-Sleep`, direktori `survey-pintaruji/`) | Tanpa server web sewa, gratis, performa CDN tinggi, dan deploy cukup via `git push`. |
| **Endpoint Pengumpulan** | **Google Apps Script Web App** (`/exec`) | Bertindak sebagai backend *serverless*. Menggunakan `LockService` untuk mencegah tabrakan data saat pengiriman simultan. |
| **Struktur Spreadsheet** | **1 Sheet Utama `Respon`** (format mendatar/wide) | 1 baris mewakili 1 responden. Kolom milik peran lain dikosongkan secara bersih sehingga analisis pivot table tetap konsisten. |
| **Daftar Program Studi** | **3 Program Studi Resmi Politeknik IDN**: <br>• `58302` - Teknik Rekayasa Perangkat Lunak (TRPL)<br>• `90346` - Teknik Rekayasa Komputer Jaringan (TRKJ)<br>• `90343` - Teknologi Rekayasa Multimedia Grafis (TRMG) | Dropdown terpadu; menyimpan `kode_prodi` dan `prodi` (nama) agar memudahkan agregasi angka dan pelaporan. |
| **Aturan Identitas** | • **Mahasiswa**: Nama + NIM + Program Studi<br>• **Dosen / Pengawas**: Nama + Program Studi<br>• **Pimpinan / Admin**: Nama saja (tanpa NIM & tanpa Prodi) | NIM disimpan murni sebagai teks (`@`) agar digit nol di depan (misal `0123456`) tidak hilang di Google Sheets. |
| **Verifikasi Responden** | **Tanpa Verifikasi Akun Database** | Responden tidak diwajibkan login database PintarUji demi fleksibilitas pengisian di berbagai perangkat dan kelancaran survei massal. |
| **Visualisasi Hasil** | **Dua Media Visualisasi**: <br>1. Sheet `Visualisasi` (5 grafik bawaan Google Sheets)<br>2. Halaman web `dashboard.html` (interaktif, radar EUCS SVG, dan anonim tanpa memuat Nama/NIM) | Memberikan kemudahan bagi dosen/pimpinan untuk mengunduh grafik ke dokumen cetak sekaligus menyajikan dashboard analitik interaktif. |
| **Masa Aktif Survei** | **Terbuka Sepanjang Waktu (Continuous)** | Dilengkapi filter waktu server (`timestamp`) pada sheet rekap dan dashboard web untuk membedakan evaluasi per semester. |

---

## 2. Alur Pengiriman & Penyimpanan Data

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
        └─ Sheet "Pengaturan" ──► Konfigurasi PIN dashboard & Token rahasia
```

### Mengapa Menggunakan `Content-Type: text/plain`?
Google Apps Script tidak mendukung metode HTTP preflight `OPTIONS` yang secara otomatis dipicu oleh browser jika kita mengirimkan header `Content-Type: application/json`. Dengan mengirimkan data berformat string JSON namun berheader `text/plain;charset=utf-8`, browser langsung menjalankan `POST` murni tanpa terhalang galat CORS.

---

## 3. Struktur Berkas Sistem Survei

```
survey-pintaruji/
├── README.md                  # Petunjuk lengkap deployment & penggunaan
├── kuesioner_kepuasan_cbt.md  # Bank butir soal & rancangan instrumen penelitian
├── rencana_survey_cbt.md      # Dokumen arsitektur teknis (dokumen ini)
├── index.html                 # Halaman utama formulir kuesioner multi-langkah
├── hasil.html                 # Halaman konfirmasi setelah berhasil submit
├── dashboard.html             # Dashboard analitik web agregat interaktif
├── assets/
│   ├── config.js              # URL Web App, token, daftar prodi, versi form
│   ├── questions.js           # Single Source of Truth bank soal & skala
│   ├── app.js                 # Logika form, validasi step, autosave, offline queue
│   ├── style.css              # Styling formulir mobile-first & dark/light theme
│   ├── dashboard.js           # Logika dashboard, chart SVG radar EUCS, filter data
│   └── dashboard.css          # Styling layout dashboard analitik & print stylesheet
└── apps-script/
    └── Code.gs                # Kode backend Google Apps Script
```

---

## 4. Alur Layar Pengisian (UX Flow)

```
[0] Intro & Persetujuan
         │
         ▼
[1] Pilih Peran (Mahasiswa / Dosen / Pimpinan)
         │
         ▼
[2] Identitas Responden (Kondisional sesuai peran yang dipilih)
         │
         ▼
[3] Profil Kebiasaan Penggunaan PintarUji (Pengalaman CBT, Frekuensi, Perangkat)
         │
         ▼
[4] Butir Evaluasi Likert 1–5 (Dikelompokkan rapi per grup fitur)
         │
         ▼
[5] Pertanyaan Terbuka (Kualitatif / Cerita pengalaman)
         │
         ▼
[6] Penutup (Kepuasan Umum Z1, NPS Z2, Kritik Saran Z3)
         │
         ▼
[7] Kirim Jawaban ──► Selesai (hasil.html)
```

### Fitur UX Utama
1. **Pilihan Peran di Awal**: Memastikan form hanya menampilkan field identitas yang relevan (input NIM hanya muncul untuk mahasiswa).
2. **Penyimpanan Draf Otomatis (`localStorage`)**: Setiap klik dan ketikan otomatis dicadangkan dengan TTL 14 hari. Jika browser tidak sengaja tertutup, jawaban tidak akan hilang.
3. **Ketahanan Jaringan (Offline Queue)**: Jika koneksi internet terputus saat menekan tombol kirim, data akan disimpan ke dalam antrean lokal (`queued`) dan otomatis dikirim ulang (*auto-flush*) saat peramban kembali daring (*online event*).
4. **Deteksi Duplikasi Teknis**: Formulir men-generate `id_respon` unik (UUID klien). Jika terjadi *double-click* atau *network retry*, backend Apps Script mengenali ID yang sama dan tidak membuat baris ganda di Spreadsheet.

---

## 5. Skema Kolom Sheet `Respon` (59 Kolom)

| Urutan Kolom | Nama Kolom Header | Tipe Data | Keterangan & Perilaku |
|---|---|---|---|
| 1 | `timestamp` | Datetime | Waktu pencatatan server (`new Date()`) |
| 2 | `id_respon` | Teks | UUID acak dari peramban untuk mencegah baris ganda |
| 3 | `versi_form` | Teks | Penanda versi form (misal `v1`) |
| 4 | `peran` | Teks | `mahasiswa`, `dosen`, atau `admin` |
| 5 | `nama` | Teks | Nama lengkap responden (semua peran) |
| 6 | `nim` | Teks (`@`) | Nomor Induk Mahasiswa (kosong untuk dosen/admin) |
| 7 | `prodi` | Teks | Nama program studi |
| 8 | `kode_prodi` | Teks (`@`) | Kode prodi (`58302`, `90346`, `90343`) |
| 9 | `pengalaman_cbt` | Teks | Pengalaman mengikuti/mengelola ujian di PintarUji |
| 10 | `frekuensi_akses` | Teks | Frekuensi akses sistem per semester |
| 11 | `perangkat` | Teks | Laptop / PC / HP / Tablet |
| 12 | `durasi_detik` | Angka | Total durasi pengisian formulir dalam satuan detik |
| 13 | `user_agent` | Teks | Data diagnostik perangkat peramban responden |
| 14 – 31 | `M1` s.d. `M18` | Angka 1–5 | Skor evaluasi mahasiswa (kosong untuk peran lain) |
| 32 – 45 | `D1` s.d. `D14` | Angka 1–5 | Skor evaluasi dosen (kosong untuk peran lain) |
| 46 – 58 | `P1` s.d. `P13` | Angka 1–5 | Skor evaluasi pimpinan (kosong untuk peran lain) |
| 59 | `Z1` | Angka 1–5 | Skor kepuasan keseluruhan (seluruh peran) |
| 60 | `Z2` | Angka 0–10 | Skor Net Promoter Score (seluruh peran) |
| 61 | `M_OPEN_1` | Teks | Fitur ruang ujian yang paling membantu mahasiswa |
| 62 | `M_OPEN_2` | Teks | Kendala teknis yang dialami mahasiswa |
| 63 | `D_OPEN_1` | Teks | Proses yang masih memakan waktu bagi dosen |
| 64 | `D_OPEN_2` | Teks | Kebutuhan fitur evaluasi tambahan dosen |
| 65 | `P_OPEN_1` | Teks | Indikator evaluasi yang dibutuhkan pimpinan |
| 66 | `P_OPEN_2` | Teks | Prioritas pengembangan sistem ke depan |
| 67 | `Z3` | Teks | Kritik dan saran umum seluruh responden |

---

## 6. Formula Otomatis pada Sheet `Rekap`

Sheet `Rekap` dibangun secara otomatis oleh fungsi `buildRekap()` di Apps Script dengan formula dinamis:

1. **Jumlah Responden**:
   ```excel
   =COUNTA(Respon!$A$2:$A)
   ```
2. **Jumlah per Peran**:
   ```excel
   =COUNTIF(Respon!$D$2:$D, "mahasiswa")
   ```
3. **Rata-rata Kepuasan Keseluruhan (Z1)**:
   ```excel
   =IFERROR(AVERAGE(Respon!$BG$2:$BG), "")
   ```
4. **Indeks Kepuasan (%)**:
   ```excel
   =IFERROR(Rata_Rata_Z1 / 5, "")
   ```
5. **Skor Net Promoter Score (NPS)**:
   ```excel
   =IFERROR((COUNTIF(Respon!$BH$2:$BH, ">=9") - COUNTIF(Respon!$BH$2:$BH, "<=6")) / COUNT(Respon!$BH$2:$BH), "")
   ```
6. **Rata-rata per Butir Pernyataan**:
   ```excel
   =IFERROR(AVERAGE(Respon!$N$2:$N), "")
   ```
7. **Rata-rata per Dimensi EUCS**:
   ```excel
   =IFERROR(AVERAGEIFS(Range_Rata_Rata_Butir, Range_Peran, "mahasiswa", Range_Kode_EUCS, "E"), "")
   ```

---

## 7. Desain Keamanan & Kerahasiaan Data

1. **Privasi Dashboard Web (`?mode=rekap`)**:
   - Pemanggilan API GET ke Web App untuk keperluan dashboard hanya mengembalikan data agregat (rata-rata, distribusi angka 1–5, dan persentase).
   - **Kolom `nama` dan `nim` tidak pernah dikirimkan ke dashboard**, sehingga kerahasiaan identitas responden tetap terjamin 100% saat dashboard diakses.
2. **Proteksi Akses Dashboard (PIN Opsional)**:
   - Pengelola dapat mengunci halaman dashboard dengan memasukkan PIN di sheet `Pengaturan` cell `B2`.
   - Jika PIN terisi, pemanggilan data dashboard wajib menyertakan parameter `&pin=...`.
3. **Penghalang Bot Ringan (Secret Token)**:
   - Formulir menyertakan token verifikasi yang dicocokkan dengan cell `B3` pada sheet `Pengaturan`.

---

## 8. Panduan Verifikasi & QA Sebelum Peluncuran

- [ ] Sheet `Respon`, `Rekap`, `Visualisasi`, dan `Pengaturan` berhasil dibuat oleh `setupSheet`.
- [ ] Dropdown program studi memuat 3 prodi resmi: TRPL (`58302`), TRKJ (`90346`), dan TRMG (`90343`).
- [ ] Memilih peran **Mahasiswa** menampilkan input Nama, NIM, dan Prodi.
- [ ] Memilih peran **Dosen** menampilkan input Nama dan Prodi (tanpa input NIM).
- [ ] Memilih peran **Pimpinan** hanya menampilkan input Nama (tanpa NIM dan tanpa Prodi).
- [ ] Input NIM berawalan angka 0 (misal `0123456`) tersimpan utuh di sheet `Respon` tanpa terpotong menjadi `123456`.
- [ ] Mengosongkan isian wajib akan menahan langkah dan menampilkan peringatan yang ramah.
- [ ] Menjawab seluruh pertanyaan mengarahkan ke halaman `hasil.html` dengan pesan konfirmasi.
- [ ] Simulasi pemutusan koneksi internet (mode offline) menyimpan respons di antrean `localStorage` dan mengirimkan secara otomatis saat kembali online.
- [ ] Sheet `Visualisasi` menampilkan 5 grafik analitik yang siap disalin ke dokumen laporan resmi.
- [ ] Halaman `dashboard.html` dapat memuat data simulasi maupun data asli dengan peta radar EUCS yang responsif.

