# Kuesioner Kepuasan Platform Portofolio Mahasiswa IDN

Instrumen evaluasi kepuasan layanan pengguna untuk platform **Portofolio Mahasiswa Politeknik IDN** (`portofolio-idn`). Dibangun menggunakan antarmuka web modern berbasis **Micro-Box 4px Design System**, ditenagai oleh **Google Spreadsheet & Apps Script** sebagai basis data dan backend agregasi tanpa biaya server, serta dilengkapi dengan **Dashboard Hasil Interaktif (SVG Radar EUCS & Donut)** yang diproteksi kode PIN.

---

## 1. Struktur Berkas Proyek

```
survey-portofolio/
├── index.html                           # Formulir kuesioner interaktif multi-langkah (Wizard)
├── hasil.html                           # Halaman konfirmasi penerimaan tanggapan responden
├── dashboard.html                       # Dashboard analitik & visualisasi hasil survei anonim
├── assets/
│   ├── style.css                        # Design system: Space Grotesk + Inter, Micro-Box 4px, Dark/Light Mode
│   ├── dashboard.css                    # Styling khusus komponen dashboard, SVG radar, dan modal istilah
│   ├── config.js                        # Konfigurasi endpoint WEB_APP_URL, TOKEN, versi, dan daftar prodi
│   ├── questions.js                     # Single source of truth bank butir pernyataan (45 butir + Z1–Z3 + esai)
│   ├── app.js                           # Form wizard engine: validasi, autosave draft, dan offline queue
│   └── dashboard.js                     # Visualisasi SVG radar & donat, filter tanggal, tabel, dan proteksi PIN
├── apps-script/
│   └── Code.gs                          # Backend Google Apps Script (doGet, doPost, setup sheet, 5 chart otomatis)
├── rencana_survey_portofolio.md         # Dokumen arsitektur teknis dan analisis sistem portofolio-idn
├── kuesioner_kepuasan_portofolio.md     # Instrumen kuesioner psikometri lengkap & pemetaan 5 dimensi EUCS
└── README.md                            # Panduan instalasi, konfigurasi, dan pemeliharaan sistem
```

---

## 2. Cakupan Evaluasi & Peran Pengguna

Instrumen kuesioner dipetakan secara spesifik terhadap fitur nyata aplikasi Laravel `portofolio-idn`:

1. **Mahasiswa (`mahasiswa`) — 18 Butir Likert 1–5 + 2 Pertanyaan Terbuka**:
   - Registrasi akun mandiri dengan captcha, verifikasi email, login, dan ganti password.
   - Manajemen profil mahasiswa (biodata, foto profil, keahlian, link GitHub/LinkedIn/kontak).
   - Formulir pembuatan portofolio baru (judul, ringkasan, slug).
   - Fitur optimasi cover gambar WebP otomatis terkompresi tanpa mengurangi kualitas visual.
   - Fitur galeri carousel gambar tangkapan layar/dokumentasi karya.
   - Penulisan deskripsi proyek berbab terstruktur (latar belakang, teknologi, alur, hasil).
   - Fitur pratinjau (*preview*) karya sebelum diajukan publikasi.
   - Transparansi status kurasi (draf vs terbit), counter *views* & *likes*, dan Leaderboard.
   - Dampak platform terhadap personal branding dan kesiapan karir industri.

2. **Dosen / Kurator (`dosen`) — 14 Butir Likert 1–5 + 2 Pertanyaan Terbuka**:
   - Kemudahan navigasi dan peninjauan portofolio mahasiswa bimbingan.
   - Struktur penyajian karya per jurusan (`Programmer`, `Engineer`, `Designer`) dan angkatan.
   - Efektivitas format dokumentasi bab proyek dan carousel untuk evaluasi capaian praktikum & tugas akhir.
   - Fitur pencarian, filter jurusan, dan direktori profil keahlian mahasiswa.
   - Halaman grafik statistik sebaran karya (`/grafik`) dan leaderboard.
   - Efisiensi waktu administrasi peninjauan karya dibanding berkas manual.

3. **Pimpinan / Admin (`admin`) — 13 Butir Likert 1–5 + 2 Pertanyaan Terbuka**:
   - Dashboard analitik eksekutif (`/a/dashboard`): statistik total karya, draf vs terbit, dan keaktifan mahasiswa.
   - Pengelolaan master data Jurusan (`/a/jurusans`) dan Angkatan (`/a/angkatans`).
   - Verifikasi pendaftaran akun mahasiswa baru (`verify`/`unverify`) dan moderasi karya (`verify-publish`).
   - Manajemen pengumuman kampus terjadwal otomatis (`schedule`).
   - Kesiapan platform sebagai etalase resmi kampus untuk akreditasi dan sinergi *link and match* industri.

4. **Pertanyaan Penutup (Wajib Diisi Seluruh Peran)**:
   - **Z1**: Kepuasan umum terhadap kualitas layanan platform Portofolio IDN (Skala Likert 1–5).
   - **Z2**: Net Promoter Score / NPS (Skala Rekomendasi 0–10).
   - **Z3**: Kritik, saran, atau masukan bebas untuk peningkatan sistem.

---

## 3. Petunjuk Pemasangan Google Spreadsheet & Apps Script

### Langkah 1: Siapkan Spreadsheet Baru
1. Buka [Google Spreadsheet](https://sheets.new) di browser Anda.
2. Beri nama file, misalnya: `Survey Kepuasan Platform Portofolio IDN`.

### Langkah 2: Salin Kode Backend Apps Script
1. Di menu spreadsheet, klik **Ekstensi (Extensions)** → **Apps Script**.
2. Hapus seluruh isi default file `Code.gs`.
3. Buka file `survey-portofolio/apps-script/Code.gs` di komputer Anda, salin seluruh isinya, dan tempelkan ke editor Apps Script.
4. Simpan dengan menekan `Ctrl + S`.

### Langkah 3: Inisialisasi Sheet Otomatis
1. Pada toolbar atas Apps Script, pilih fungsi `setupSheet` dari dropdown fungsi.
2. Klik tombol **Jalankan (Run)**.
3. Google akan meminta izin akses spreadsheet (OAuth). Klik *Review Permissions* → pilih akun Google Anda → klik *Advanced* → klik *Go to (unsafe)* → klik *Allow*.
4. Tunggu beberapa detik hingga proses selesai. Di Google Spreadsheet Anda akan otomatis terbentuk 4 tab:
   - **Respon**: Menampung 67 kolom data mentah pengisian responden.
   - **Rekap**: Menghitung rata-rata skor per butir (Likert 1–5), rata-rata 5 dimensi EUCS, NPS, dan per program studi secara dinamis.
   - **Visualisasi**: 4 kartu ringkasan KPI dan 5 grafik interaktif Google Sheets (Donut Peran, Donut NPS, Bar Perangkat, Bar Prodi, dan Column Dimensi EUCS).
   - **Pengaturan**: Tempat mengatur kode akses PIN dashboard (cell B2) dan token formulir (cell B3).

### Langkah 4: Publikasikan sebagai Web App
1. Di editor Apps Script, klik tombol biru **Deploy** (kanan atas) → **New deployment**.
2. Klik ikon gear (Select type) → pilih **Web app**.
3. Isi konfigurasi deployment:
   - **Description**: `Portofolio IDN Survey Web App v1`
   - **Execute as**: `Me (email-anda@gmail.com)`
   - **Who has access**: `Anyone` *(WAJIB dipilih Anyone agar responden dan dashboard dapat mengirim/membaca data)*.
4. Klik **Deploy**.
5. Salin **Web app URL** yang diberikan (URL harus berakhiran `/exec`).

### Langkah 5: Hubungkan ke Frontend
1. Buka file `survey-portofolio/assets/config.js` di teks editor.
2. Tempelkan URL yang disalin ke properti `WEB_APP_URL`:
   ```javascript
   window.CONFIG = {
     WEB_APP_URL: 'https://script.google.com/macros/s/AKfycb.../exec',
     TOKEN: 'portofolio-survey-token',
     VERSION: 'v1',
     PRODI: [
       { kode: '58302', nama: 'Teknologi Rekayasa Perangkat Lunak (Programmer)' },
       { kode: '90346', nama: 'Teknologi Rekayasa Komputer Jaringan (Engineer)' },
       { kode: '90343', nama: 'Teknologi Rekayasa Multimedia Grafis (Designer)' }
     ],
     DRAFT_TTL_DAYS: 14
   };
   ```
3. Simpan file `config.js`.

---

## 4. Fitur Keamanan & Privasi Responden

- **Zero-PII Leak pada Dashboard**:
  Endpoint agregasi publik `doGet(?mode=rekap)` mengekstrak nilai numerik, persentase, dan jawaban terbuka esai secara anonim. Nama lengkap dan NIM responden tersimpan aman hanya di tab spreadsheet `Respon` dan **tidak pernah dikirimkan ke dashboard**.
- **Proteksi Akses PIN Dinamis**:
  Dashboard dapat dikunci menggunakan PIN yang dikelola langsung dari tab `Pengaturan` cell B2. Bila dikosongkan, dashboard terbuka bebas; bila diisi, pengguna wajib memasukkan PIN untuk membuka laporan.
- **Pembersihan Injeksi Formula Spreadsheet**:
  Input teks yang diawali karakter berbahaya (`=`, `+`, `-`, `@`, `'`) otomatis dibersihkan sebelum disimpan ke baris spreadsheet untuk mencegah eksploitasi CSV/Formula Injection.
- **Idempotensi & Anti Duplikasi**:
  Setiap pengisian form memiliki `id_respon` unik acak berbasis UUID lokal. Bila koneksi internet responden terputus-putus dan melakukan *retry*, server mendeteksi duplikat `id_respon` dan memperbarui baris tanpa menggandakan data.
- **Antrean Offline & Fallback**:
  Bila responden mengirim saat offline atau sinyal buruk, draf jawaban disimpan di `localStorage` peramban dan otomatis dikirim saat koneksi internet pulih.

---

## 5. Cara Menjalankan & Membuka

Anda dapat membuka file formulir kuesioner dan dashboard langsung di browser atau menggunakan live server lokal:

```powershell
# Contoh menggunakan python local server:
cd D:\Meoww-Sleep\survey-portofolio
python -m http.server 8080

# Lalu buka di browser:
# Formulir Survey: http://localhost:8080/index.html
# Dashboard Hasil: http://localhost:8080/dashboard.html
```

Atau cukup klik dua kali pada file `index.html` dan `dashboard.html` di Windows Explorer.

