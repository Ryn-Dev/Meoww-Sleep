# Executive Comparison Dashboard — Survei Kepuasan Layanan Digital Politeknik IDN

Dashboard Komparatif Terpadu Kinerja & Kepuasan Pengguna 4 Platform Digital Politeknik IDN Bogor:
1. **PintarUji** — *Computer-Based Testing (CBT)* (`https://pintaruji.politeknikidn.id`)
2. **Portofolio** — *Platform Showcasing Karya Mahasiswa* (`https://portofolio.politeknikidn.id`)
3. **LMS** — *Learning Management System* (`https://lms.politeknikidn.id`)
4. **SIMTA** — *Sistem Informasi Tugas Akhir & Bimbingan* (`https://simta.politeknikidn.id`)

---

## 1. Latar Belakang & Tujuan

Politeknik IDN Bogor mengoperasikan ekosistem aplikasi digital untuk menunjang tridharma perguruan tinggi dan administrasi akademik. Setiap sistem memiliki kuesioner evaluasi kepuasan pengguna mandiri berbasis kerangka kerja baku **End-User Computing Satisfaction (EUCS)** dan **Net Promoter Score (NPS)**.

Dashboard komparatif ini hadir untuk menyajikan **analisis komparasi lintas platform secara *apple-to-apple***, memberikan wawasan strategis (*executive insights*) bagi:
* **Pimpinan & Manajemen Kampus**: Mengetahui platform mana yang paling diapresiasi dan platform mana yang membutuhkan peningkatan prioritas.
* **Satuan Penjaminan Mutu (SPM)**: Menyediakan bukti audit numerik dan grafik ilmiah untuk akreditasi program studi dan institusi.
* **Tim Pengembang & Tim IT**: Mengidentifikasi aspek teknis (*kecepatan, kemudahan akses, tampilan, keakuratan informasi*) yang perlu disempurnakan di tiap produk.

---

## 2. Arsitektur Teknis & Aliran Data

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       EXECUTIVE COMPARISON DASHBOARD                        │
│                (survey-komparasi/index.html — Client-Side)                  │
└──────┬───────────────────┬───────────────────┬───────────────────┬──────────┘
       │                   │                   │                   │
  Parallel Fetch      Parallel Fetch      Parallel Fetch      Parallel Fetch
 (Promise.allSettled)(Promise.allSettled)(Promise.allSettled)(Promise.allSettled)
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  PintarUji   │    │  Portofolio  │    │     LMS      │    │    SIMTA     │
│   AppsScript │    │   AppsScript │    │   AppsScript │    │   AppsScript │
│  ?mode=rekap │    │  ?mode=rekap │    │  ?mode=rekap │    │  ?mode=rekap │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Spreadsheet  │    │ Spreadsheet  │    │ Spreadsheet  │    │ Spreadsheet  │
│  PintarUji   │    │  Portofolio  │    │     LMS      │    │    SIMTA     │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

### Prinsip Utama Arsitektur:
1. **Zero Backend Changes**: File `Code.gs` di keempat repositori survei sama sekali tidak perlu diubah atau di-deploy ulang.
2. **Resilience & Fault Tolerance**: Pengambilan data dilakukan secara paralel (`Promise.allSettled`). Jika salah satu spreadsheet sedang lambat atau offline, ketiga platform lainnya tetap tampil normal tanpa crash.
3. **Data Simulation Mode**: Menyediakan tombol simulasi data *offline* lengkap untuk keperluan demo, presentasi, atau saat respons kuesioner baru dimulai.
4. **Client-Side Lightweight**: Dibangun dengan Native Vanilla JavaScript, CSS Grid modern, dan SVG tanpa dependensi library eksternal berat (Chart.js / D3 / jQuery) sehingga cepat diakses dan ringan dibuka di perangkat mobile.

---

## 3. Metrik Komparasi Standar

Dashboard ini membandingkan 4 platform menggunakan indikator standar:

| Indikator | Skala / Satuan | Keterangan & Rumus |
| :--- | :--- | :--- |
| **Total Responden ($N$)** | Jiwa / Respons | Akumulasi partisipasi civitas (Mahasiswa, Dosen, Admin/Pimpinan). |
| **Kepuasan Umum ($Z1$)** | $1.00 - 5.00$ | Rata-rata skor butir kepuasan menyeluruh. |
| **Indeks Kepuasan Mutu** | $0.0\% - 100.0\%$ | $\text{Indeks} = \frac{\overline{Z1}}{5} \times 100\%$ |
| **Net Promoter Score (NPS)** | $-100 \text{ s.d. } +100$ | $\% \text{Promoter (skor 9-10)} - \% \text{Detractor (skor 0-6)}$ |
| **5 Dimensi Mutu EUCS** | $1.00 - 5.00$ | 1. **Content (C)**: Kelengkapan & relevansi informasi.<br>2. **Accuracy (A)**: Ketepatan & integritas data.<br>3. **Format (F)**: Kejelasan layout, tipografi & estetika.<br>4. **Ease of Use (E)**: Kemudahan navigasi & alur interaksi.<br>5. **Timeliness (T)**: Kecepatan respon & ketepatan waktu sistem. |
| **Cross-Prodi Breakdown** | Rata-rata Skor | Persepsi kepuasan spesifik mahasiswa & dosen TRPL, TRKJ, dan TRMG. |

---

## 4. Struktur Visualisasi Dashboard

1. **Executive Leaderboard**:
   * Papan skor 4 kartu komparatif menampilkan Skor Z1, Indeks Mutu %, Predikat Kategori, NPS, dan Responden masing-masing aplikasi.
   * Penanda *Top Performer* dan *Most Engaging Platform*.
2. **Spider Radar Benchmark 4 Platform**:
   * Satu diagram radar terpadu yang memvisualisasikan poligon profil 4 aplikasi secara bertumpuk dengan kode warna khas:
     * **PintarUji (CBT)**: Hijau Zamrud (`#10b981`)
     * **Portofolio**: Biru Indigo (`#6366f1`)
     * **LMS**: Biru Langit (`#0284c7`)
     * **SIMTA**: Ungu (*Violet*) (`#8b5cf6`)
   * Fitur interaktif untuk menyalakan/mematikan garis poligon aplikasi tertentu.
3. **Grouped Bar EUCS (Perbandingan per Dimensi)**:
   * Grafik batang komparatif 5 pilar mutu untuk melihat langsung keunggulan komparatif tiap sistem.
4. **Matriks NPS & Komposisi Loyalitas Responden**:
   * Stacked bar berdampingan: porsi Promoter ($9-10$), Passive ($7-8$), dan Detractor ($0-6$).
5. **Analisis Lintas Program Studi (TRPL, TRKJ, TRMG)**:
   * Membandingkan kepuasan mahasiswa & dosen per jurusan di masing-masing platform.
6. **Matriks Fitur Unggulan vs Prioritas Evaluasi**:
   * Ringkasan 3 fitur paling diapresiasi vs 3 evaluasi paling mendesak di setiap platform digital.

---

## 5. Struktur Berkas

```text
survey-komparasi/
├── README.md               # Dokumentasi rencana, formula & panduan arsitektur
├── index.html              # Halaman antarmuka dashboard komparasi
└── assets/
    ├── config.js           # Konfigurasi endpoint 4 Web App URL dan metadata
    ├── style.css           # Design system dasar (Space Grotesk + Inter, dark/light)
    ├── dashboard.css       # Layout CSS visualisasi komparatif, charts & print
    └── dashboard.js        # Controller parallel fetch, normalisasi & render chart
```

---

## 6. Pengaturan & Akses Cepat

* **URL Lokal**: Buka `survey-komparasi/index.html` pada peramban web modern (Chrome, Edge, Firefox, Safari).
* **Mode Simulasi**: Klik tombol **Data Simulasi** pada header dashboard untuk melihat visualisasi perbandingan lengkap tanpa perlu menunggu respons survei riil.
* **Ekspor Laporan**: Klik tombol **Cetak / PDF** untuk menghasilkan laporan komparasi format cetak landscape/A4 yang bersih dan rapi.

