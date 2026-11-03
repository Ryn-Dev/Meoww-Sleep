# Instrumen Kuesioner Kepuasan Layanan SIMTA Politeknik IDN

Instrumen kuesioner evaluasi kepuasan layanan pengguna untuk platform **SIMTA (Sistem Informasi Manajemen Tugas Akhir)** Politeknik IDN Bogor. Dirancang berdasarkan pemetaan menyeluruh terhadap fitur, alur kerja, dan basis data aktual pada kode aplikasi Laravel di `D:\PROJECT FEBRYAN\SIMTA-With-Faisal`.

Tautan Aplikasi Resmi:
🌐 **[https://simta.politeknikidn.id](https://simta.politeknikidn.id)**

---

## 1. Analisis Peran Pengguna (Sesuai Kode Aplikasi SIMTA)

| Role Sistem | Label Tampilan | Cakupan Fitur Utama yang Dinilai |
|---|---|---|
| `mahasiswa` | **Mahasiswa** | Login (NIM/Email), Profil Lengkap, Pengumuman (*mark as read*), Pengaduan & Aspirasi, Pengajuan Topik/Judul TA, Pemilihan Dosen Pembimbing, Pusat Unduhan template pedoman TA, Direktori Data Dosen & kuota bimbingan, Referensi Judul TA terdahulu, Pengunggahan berkas syarat & pendaftaran Seminar Proposal, Pemantauan jadwal & penguji proposal, Cetak SK Pembimbing & SK Proposal ber-QR Code, Pengunggahan berkas syarat & pendaftaran Sidang TA, Riwayat Ujian & perolehan nilai kelulusan, dan Cetak SK Sidang TA. |
| `dosen` | **Dosen** | Dashboard Dosen & pemantauan kuota bimbingan, Permintaan Bimbingan (*acc*, revisi, atau tolak judul mahasiswa), Pembaruan link grup bimbingan WhatsApp/Telegram, Akses & cetak SK Dosen Pembimbing ber-QR Code, Penelusuran Judul Mahasiswa (referensi judul kampus), Pengisian Penilaian Ujian Seminar Proposal per komponen bobot nilai, Pengisian Penilaian Ujian Sidang Tugas Akhir berbasis rubrik/komponen baku, dan Efisiensi waktu pembimbingan. |
| `admin_prodi` | **Admin Prodi** | Dashboard Admin Prodi spesifik per program studi (`TRPL`, `TRKJ`, `TRMG`), Pemantauan & verifikasi usulan judul tugas akhir mahasiswa prodi (*acc*, tolak, ganti pembimbing), Validasi berkas persyaratan seminar proposal mahasiswa prodi, Validasi berkas persyaratan sidang tugas akhir mahasiswa prodi, Pengaturan *quick-kuota* bimbingan dosen prodi, Ekspor data rekapitulasi progres TA prodi ke Excel, dan Kecepatan pelayanan administrasi jurusan. |
| `admin` | **Administrator** | Dashboard analitik eksekutif kampus, Pengumuman broadcast terpusat, Manajemen tindak lanjut Pengaduan/Aspirasi, Master Data (Tahun Angkatan, Program Studi, Bidang Topik Penelitian, Ruangan Sidang, Pejabat Penandatangan SK), Manajemen User (import Excel mahasiswa/dosen, reset password massal, kuota bimbingan), Manajemen Periode Pengajuan Judul, SK Pembimbing resmi & SK Dibatalkan, Manajemen Seminar Proposal (**Auto-Ploting penguji & jadwal**, cetak jadwal & presensi, SK Proposal, rekap nilai & berita acara), Manajemen Sidang TA (**Auto-Ploting penguji & ruangan**, cetak jadwal & presensi, SK Sidang TA, rekap nilai kelulusan & berita acara yudisium), dan Validasi keaslian SK publik via QR Code (`/validasi-sk/{uuid}`). |

---

## 2. Metodologi Pengukuran: Skala Likert 1–5, NPS, dan EUCS

### Standar Skala Likert 1–5 Berlabel Penuh
- `1` = Sangat Tidak Setuju (STS)
- `2` = Tidak Setuju (TS)
- `3` = Netral (N) — *pilihan netral atau belum pernah mencoba fiturnya*
- `4` = Setuju (S)
- `5` = Sangat Setuju (SS)

### Net Promoter Score (NPS 0–10)
> *"Seberapa besar kemungkinan Anda merekomendasikan penggunaan platform SIMTA kepada rekan mahasiswa, dosen, atau institusi lain?"*
- **Promoter (Skor 9–10)**: Pengguna yang puas dan aktif merekomendasikan sistem.
- **Passive (Skor 7–8)**: Pengguna yang merasa sistem cukup baik namun belum sepenuhnya terkesan.
- **Detractor (Skor 0–6)**: Pengguna yang mengalami kendala teknis atau merasa sistem belum memenuhi ekspektasi.

### 5 Dimensi EUCS (*End-User Computing Satisfaction*)
- **C (Content / Isi Informasi)**: Kelengkapan rincian usulan judul, kejelasan status revisi bimbingan, transparansi komponen nilai ujian, dan kelengkapan berita acara/SK.
- **A (Accuracy / Keakuratan & Keandalan)**: Ketepatan perhitungan nilai akhir berbobot, keabsahan kuota dosen, keandalan verifikasi QR Code SK publik, dan stabilitas server saat upload naskah.
- **F (Format / Tampilan & Tata Letak)**: Kerapian antarmuka, kenyamanan navigasi menu, kejelasan tampilan status, dan keterbacaan dokumen cetak resmi PDF (SK, jadwal, presensi, berita acara).
- **E (Ease of Use / Kemudahan Penggunaan)**: Kemudahan login NIM/NIDN, pengajuan judul, pengunggahan berkas syarat, input nilai oleh dosen, auto-ploting jadwal, dan validasi berkas.
- **T (Timeliness / Kecepatan & Ketepatan Waktu)**: Kecepatan memuat halaman, responsivitas upload berkas, ketepatan notifikasi pengumuman, dan efisiensi waktu penjadwalan ujian.

---

## 3. Bagian 1 — Data Responden & Profil Penggunaan

| No | Pertanyaan Profil | Tipe Input | Pilihan Jawaban |
|---|---|---|---|
| 1 | Peran Anda di Platform SIMTA | Pilihan Kartu | Mahasiswa / Dosen / Admin Prodi / Administrator |
| 2 | Nama Lengkap | Isian Teks | Wajib diisi seluruh peran |
| 3 | Nomor Induk Mahasiswa (NIM) | Isian Teks Angka | Khusus Mahasiswa (Dosen, Admin Prodi, dan Administrator tanpa NIM) |
| 4 | Program Studi / Jurusan | Pilihan Dropdown | Khusus Mahasiswa, Dosen, dan Admin Prodi:<br>• `58302` - Teknologi Rekayasa Perangkat Lunak (TRPL)<br>• `90346` - Teknologi Rekayasa Komputer Jaringan (TRKJ)<br>• `90343` - Teknologi Rekayasa Multimedia Grafis (TRMG)<br>*(Administrator mengelola seluruh prodi secara terpusat sehingga tidak perlu memilih)* |
| 5 | Tahapan Tugas Akhir yang sedang/telah Anda jalani di SIMTA | Pilihan Radio | Persiapan/Pengajuan Judul / Bimbingan Proposal / Pasca Seminar Proposal / Bimbingan Sidang TA / Lulus Sidang Akhir / Mengelola Seluruh Tahapan |
| 6 | Berapa rata-rata frekuensi mengakses platform SIMTA? | Pilihan Radio | Setiap hari / Beberapa kali seminggu / Sebulan sekali / Saat masa pengajuan & ujian saja |
| 7 | Perangkat utama yang Anda gunakan saat mengakses SIMTA | Pilihan Radio | Laptop / PC / HP (Smartphone) / Tablet |

---

## 4. Bagian 2A — Butir Evaluasi Mahasiswa (18 Butir Likert 1–5)

### Grup 1: Akses, Antarmuka & Layanan Pengaduan (M1 – M5)
| Kode | Pernyataan | Fitur Aplikasi | Dimensi EUCS |
|---|---|---|:---:|
| **M1** | Proses login ke SIMTA (menggunakan NIM atau Email) mudah dan lancar | Login & Otentikasi | **E** |
| **M2** | Tampilan antarmuka dashboard mahasiswa modern, informatif, dan nyaman digunakan | Desain Antarmuka | **F** |
| **M3** | Menu navigasi dan penanda kelengkapan profil mahasiswa mudah dipahami | Navigasi & Profil | **E** |
| **M4** | Fitur pengumuman resmi dan penanda pesan telah dibaca (*mark as read*) membantu mendapatkan informasi terkini | Pengumuman Mahasiswa | **C** |
| **M5** | Layanan Pengaduan & Aspirasi mempermudah pelaporan kendala bimbingan dan cepat mendapatkan tanggapan | Pengaduan Mahasiswa | **T** |

### Grup 2: Pengajuan Judul, Bimbingan & Referensi (M6 – M10)
| Kode | Pernyataan | Fitur Aplikasi | Dimensi EUCS |
|---|---|---|:---:|
| **M6** | Formulir pengajuan judul/topik tugas akhir dan pemilihan dosen pembimbing terstruktur rapi | Pengajuan Judul | **E** |
| **M7** | Informasi status usulan judul (menunggu, disetujui, revisi, atau ditolak) disajikan secara jelas dan transparan | Transparansi Status Judul | **C** |
| **M8** | Fitur Pusat Unduhan memudahkan akses berkas template dokumen dan pedoman penulisan tugas akhir resmi | Pusat Unduhan | **E** |
| **M9** | Fitur direktori Data Dosen membantu mengetahui bidang keahlian dan ketersediaan kuota bimbingan dosen | Direktori Dosen & Kuota | **C** |
| **M10** | Fitur Referensi Judul mempermudah penelusuran ide dan topik tugas akhir terdahulu di kampus | Referensi Judul | **C** |

### Grup 3: Ujian Proposal, SK Resmi & Sidang TA (M11 – M15)
| Kode | Pernyataan | Fitur Aplikasi | Dimensi EUCS |
|---|---|---|:---:|
| **M11** | Alur pengunggahan berkas syarat seminar proposal (*syarat-proposal*) dan pendaftaran ujian praktis dijalani | Syarat Seminar Proposal | **E** |
| **M12** | Informasi jadwal seminar proposal, ruangan, dan dosen penguji tersaji lengkap serta tepat waktu | Jadwal Seminar Proposal | **T** |
| **M13** | Berkas dokumen SK Pembimbing, SK Proposal, dan SK Sidang TA terformat rapi sesuai kop resmi kampus | Format Dokumen SK | **F** |
| **M14** | Fitur verifikasi QR Code pada dokumen SK menjamin keaslian dan legalitas surat keputusan | Validasi SK QR Code | **A** |
| **M15** | Alur pengunggahan berkas syarat sidang tugas akhir (*syarat-sidang-ta*) dan pendaftaran ujian sidang jelas dan mudah | Syarat Sidang TA | **E** |

### Grup 4: Riwayat Ujian, Stabilitas & Manfaat (M16 – M18)
| Kode | Pernyataan | Fitur Aplikasi | Dimensi EUCS |
|---|---|---|:---:|
| **M16** | Riwayat Ujian menyajikan rekam jejak penilaian, catatan revisi penguji, dan status kelulusan secara akurat | Riwayat & Nilai Ujian | **A** |
| **M17** | Platform SIMTA stabil, responsif, dan tidak mengalami kendala teknis saat mengunggah berkas naskah | Stabilitas & Kecepatan | **A** |
| **M18** | Platform SIMTA sangat membantu memperlancar dan mempercepat proses penyelesaian tugas akhir hingga lulus | Efektivitas Layanan TA | **C** |

#### Pertanyaan Terbuka Mahasiswa:
- **M_OPEN_1**: Fitur apa pada SIMTA yang paling mempermudah proses penyelesaian tugas akhir Anda? *(Misalnya pengajuan judul online, template unduhan, pantau jadwal sidang, validasi SK QR code, dll.)*
- **M_OPEN_2**: Kendala teknis atau administrasi apa yang pernah Anda alami selama menggunakan SIMTA? *(Misalnya format unggah berkas, kejelasan revisi, waktu respon pengaduan, tampilan mobile, dll.)*

---

## 5. Bagian 2B — Butir Evaluasi Dosen (14 Butir Likert 1–5)

### Grup 1: Dashboard, Usulan Judul & Pembimbingan (D1 – D5)
| Kode | Pernyataan | Fitur Aplikasi | Dimensi EUCS |
|---|---|---|:---:|
| **D1** | Antarmuka dashboard dosen mudah dipahami dan memberikan gambaran jelas terkait aktivitas bimbingan & ujian | Dashboard Dosen | **F** |
| **D2** | Informasi daftar usulan judul dan mahasiswa bimbingan yang masuk disajikan lengkap dan terstruktur | Permintaan Bimbingan | **C** |
| **D3** | Proses persetujuan (*acc*), pemberian catatan revisi, atau penolakan usulan judul mahasiswa mudah dilakukan | Moderasi Usulan Judul | **E** |
| **D4** | Fitur pembaruan tautan grup koordinasi (*link group* WhatsApp/Telegram) mempermudah komunikasi bimbingan | Link Grup Bimbingan | **E** |
| **D5** | Dokumen SK Pembimbing Dosen dapat diakses dan dicetak dengan mudah kapan pun dibutuhkan | Akses SK Pembimbing | **E** |

### Grup 2: Referensi Judul & Penilaian Ujian (D6 – D10)
| Kode | Pernyataan | Fitur Aplikasi | Dimensi EUCS |
|---|---|---|:---:|
| **D6** | Fitur penelusuran Judul Mahasiswa mempermudah pengecekan topik yang sedang dibimbing agar tidak terjadi duplikasi | Referensi Judul Kampus | **C** |
| **D7** | Formulir penilaian Ujian Seminar Proposal terstruktur jelas sesuai rincian komponen bobot nilai | Form Nilai Proposal | **E** |
| **D8** | Penilaian Ujian Sidang Tugas Akhir berbasis rubrik/komponen baku memudahkan penilaian yang objektif dan adil | Form Nilai Sidang TA | **A** |
| **D9** | Informasi naskah laporan, berkas lampiran, dan syarat mahasiswa dapat ditinjau dosen dengan jelas sebelum ujian | Peninjauan Berkas Ujian | **C** |
| **D10** | Sistem kalkulasi otomatis nilai akhir ujian seminar proposal dan sidang TA berjalan akurat tanpa kesalahan hitung | Akurasi Nilai Otomatis | **A** |

### Grup 3: Efisiensi, Notifikasi & Keandalan (D11 – D14)
| Kode | Pernyataan | Fitur Aplikasi | Dimensi EUCS |
|---|---|---|:---:|
| **D11** | SIMTA menghemat waktu dan memangkas beban administrasi dosen dibanding proses bimbingan/ujian konvensional | Efisiensi Waktu Bimbingan | **T** |
| **D12** | Notifikasi dan jadwal penugasan sebagai dosen pembimbing atau dosen penguji tersampaikan tepat waktu | Ketepatan Jadwal Tugas | **T** |
| **D13** | Keabsahan data mahasiswa, judul tugas akhir, dan riwayat bimbingan yang tercatat di SIMTA akurat dan valid | Keandalan Data Akademik | **A** |
| **D14** | Implementasi SIMTA meningkatkan standar mutu pembimbingan dan objektivitas evaluasi kelulusan tugas akhir | Mutu Evaluasi TA | **C** |

#### Pertanyaan Terbuka Dosen:
- **D_OPEN_1**: Aspek apa dalam alur bimbingan atau penilaian ujian di SIMTA yang menurut Anda masih memerlukan penyempurnaan? *(Misalnya fleksibilitas form nilai, reminder tenggat bimbingan, catatan revisi, dll.)*
- **D_OPEN_2**: Fitur tambahan apa yang paling Anda harapkan untuk mendukung proses pembimbingan dan pengujian tugas akhir ke depan? *(Misalnya log bimbingan mandiri mahasiswa, integrasi cek plagiarisme/turnitin, tanda tangan digital berita acara, dll.)*

---

## 6. Bagian 2C — Butir Evaluasi Admin Prodi (12 Butir Likert 1–5)

### Grup 1: Dashboard Prodi & Moderasi Judul (AP1 – AP4)
| Kode | Pernyataan | Fitur Aplikasi | Dimensi EUCS |
|---|---|---|:---:|
| **AP1** | Dashboard Admin Prodi menyajikan ringkasan statistik tugas akhir program studi yang informatif dan tepat sasaran | Dashboard Prodi | **C** |
| **AP2** | Pemantauan usulan judul tugas akhir mahasiswa di lingkup program studi mudah dipantau dan difilter | Monitoring Judul Prodi | **E** |
| **AP3** | Fitur persetujuan, penolakan, atau pembatalan *acc* pembimbing pada usulan judul mahasiswa prodi berjalan efektif | Verifikasi Judul Prodi | **E** |
| **AP4** | Fitur pergantian dosen pembimbing mempermudah penyesuaian bila terjadi kendala bimbingan di tingkat program studi | Penggantian Pembimbing | **E** |

### Grup 2: Validasi Berkas Proposal & Sidang TA (AP5 – AP8)
| Kode | Pernyataan | Fitur Aplikasi | Dimensi EUCS |
|---|---|---|:---:|
| **AP5** | Proses validasi berkas persyaratan seminar proposal mahasiswa prodi praktis dan mudah diverifikasi kelengkapannya | Validasi Berkas Proposal | **E** |
| **AP6** | Proses validasi berkas persyaratan sidang tugas akhir mahasiswa prodi berjalan cepat dan transparan | Validasi Berkas Sidang | **E** |
| **AP7** | Fitur *quick-kuota* dosen program studi memudahkan pengaturan alokasi beban bimbingan agar merata | Kontrol Kuota Dosen | **A** |
| **AP8** | Fitur ekspor data rekapitulasi usulan judul dan progres tugas akhir mahasiswa prodi ke Excel akurat dan rapi | Ekspor Data Prodi | **F** |

### Grup 3: Transparansi, Antarmuka & Kecepatan Layanan (AP9 – AP12)
| Kode | Pernyataan | Fitur Aplikasi | Dimensi EUCS |
|---|---|---|:---:|
| **AP9** | Informasi catatan revisi dan riwayat verifikasi berkas disajikan secara transparan bagi mahasiswa dan prodi | Transparansi Verifikasi | **C** |
| **AP10** | Tampilan antarmuka khusus Admin Prodi rapi, responsif, dan memudahkan alur kerja tata kelola jurusan | Antarmuka Admin Prodi | **F** |
| **AP11** | Akses data program studi terisolasi secara aman dan tidak tercampur dengan data program studi lain | Keamanan Akses Data | **A** |
| **AP12** | Platform SIMTA mempercepat waktu pelayanan administrasi tugas akhir mahasiswa di tingkat program studi | Kecepatan Layanan Prodi | **T** |

#### Pertanyaan Terbuka Admin Prodi:
- **AP_OPEN_1**: Kendala apa yang paling sering dihadapi Admin Prodi saat memvalidasi berkas atau memoderasi usulan judul mahasiswa? *(Misalnya format berkas yang salah, batas kuota pembimbing, waktu verifikasi, dll.)*
- **AP_OPEN_2**: Fitur pelaporan atau analitik apa yang paling dibutuhkan program studi untuk monitoring masa studi mahasiswa? *(Misalnya grafik kelulusan per angkatan, tren topik penelitian prodi, rekap mahasiswa macet TA, dll.)*

---

## 7. Bagian 2D — Butir Evaluasi Administrator (14 Butir Likert 1–5)

### Grup 1: Dashboard Eksekutif & Manajemen Data (P1 – P5)
| Kode | Pernyataan | Fitur Aplikasi | Dimensi EUCS |
|---|---|---|:---:|
| **P1** | Dashboard analitik eksekutif menyajikan statistik komprehensif terkait perkembangan tugas akhir se-Politeknik IDN | Dashboard Eksekutif | **C** |
| **P2** | Manajemen master data (Tahun Angkatan, Program Studi, Topik Penelitian, Ruangan Sidang, Pejabat) mudah dikelola | Master Data Sistem | **E** |
| **P3** | Fitur import massal dan kelola data mahasiswa serta dosen melalui template Excel berjalan akurat dan andal | Integrasi Data User | **A** |
| **P4** | Fitur broadcast Pengumuman massal efektif menyampaikan informasi tenggat waktu dan kebijakan tugas akhir kampus | Pengumuman Terpusat | **T** |
| **P5** | Fitur tindak lanjut Pengaduan & Aspirasi mempermudah penanganan keluhan teknis maupun administratif civitas akademika | Manajemen Pengaduan | **E** |

### Grup 2: Penjadwalan Cerdas & Manajemen Ujian (P6 – P9)
| Kode | Pernyataan | Fitur Aplikasi | Dimensi EUCS |
|---|---|---|:---:|
| **P6** | Pengaturan periode pengajuan judul, periode seminar proposal, dan periode sidang TA fleksibel sesuai kalender akademik | Kalender & Periode TA | **E** |
| **P7** | Fitur cerdas Auto-Ploting Dosen Penguji & Jadwal Seminar Proposal sangat menghemat waktu penjadwalan | Auto-Ploting Proposal | **E** |
| **P8** | Fitur cerdas Auto-Ploting Dosen Penguji & Ruangan Sidang Tugas Akhir efektif mencegah bentrok jadwal dosen dan ruangan | Auto-Ploting Sidang TA | **A** |
| **P9** | Fitur cetak jadwal ujian dan presensi sidang otomatis terformat rapi sesuai tata naskah dinas resmi kampus | Dokumen Jadwal & Presensi | **F** |

### Grup 3: Penerbitan SK, Legalitas & Dampak Lembaga (P10 – P14)
| Kode | Pernyataan | Fitur Aplikasi | Dimensi EUCS |
|---|---|---|:---:|
| **P10** | Penerbitan berkas resmi SK Pembimbing, SK Ujian Proposal, dan SK Sidang TA terintegrasi dengan penomoran surat resmi | Penerbitan SK Terpadu | **F** |
| **P11** | Sistem verifikasi publik keaslian SK berbasis QR Code (`/validasi-sk/{uuid}`) memperkuat akuntabilitas dan integritas dokumen | Integritas Validasi SK | **A** |
| **P12** | Rekapitulasi nilai akhir dan pencetakan Berita Acara Ujian resmi siap digunakan untuk yudisium dan kelulusan mahasiswa | Berita Acara Yudisium | **C** |
| **P13** | Kecepatan akses, keandalan server, dan keamanan hak akses multi-role pada SIMTA terjamin dengan baik | Keandalan Sistem Pusat | **T** |
| **P14** | Implementasi SIMTA berhasil mewujudkan tata kelola tugas akhir 100% paperless, transparan, dan mendukung akreditasi institusi | Dampak Mutu Lembaga | **C** |

#### Pertanyaan Terbuka Administrator:
- **P_OPEN_1**: Informasi atau indikator apa yang belum terangkum pada dashboard administrator dan penting untuk evaluasi pimpinan institusi? *(Misalnya durasi rata-rata pengerjaan TA dari proposal ke sidang, produktivitas dosen membimbing, dll.)*
- **P_OPEN_2**: Apa prioritas utama integrasi dan pengembangan SIMTA Politeknik IDN ke depan? *(Misalnya integrasi otomatis ke SIAKAD, sinkronisasi PDDIKTI, repositori perpustakaan digital, dll.)*

---

## 8. Bagian 3 — Pertanyaan Penutup (Wajib Diisi Seluruh Peran)

| Kode | Pertanyaan | Tipe Input | Skala / Opsi |
|---|---|---|---|
| **Z1** | Secara keseluruhan, seberapa puas Anda dengan kualitas layanan platform SIMTA Politeknik IDN? | Skala Likert 1–5 | 1 = Sangat tidak puas<br>2 = Tidak puas<br>3 = Cukup<br>4 = Puas<br>5 = Sangat puas |
| **Z2** | Seberapa besar kemungkinan Anda merekomendasikan penggunaan platform SIMTA kepada rekan mahasiswa, dosen, atau institusi lain? | Skala NPS 0–10 | 0 = Sangat tidak mungkin merekomendasikan<br>10 = Sangat mungkin merekomendasikan |
| **Z3** | Kritik, saran, atau masukan bebas untuk peningkatan kualitas layanan sistem informasi SIMTA Politeknik IDN | Isian Teks Bebas | Opsional (Saran peningkatan fitur, tampilan antarmuka, alur bimbingan, atau layanan sistem) |

---

## 9. Rekapitulasi Distribusi Dimensi EUCS

| Dimensi EUCS | Mahasiswa (M) | Dosen (D) | Admin Prodi (AP) | Administrator (P) | Total Butir | Persentase |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **C - Content** (Isi Informasi) | 5 | 4 | 2 | 3 | **14** | 24,1% |
| **A - Accuracy** (Keakuratan & Keandalan) | 3 | 3 | 2 | 3 | **11** | 19,0% |
| **F - Format** (Tampilan & Tata Letak) | 2 | 1 | 2 | 2 | **7** | 12,1% |
| **E - Ease of Use** (Kemudahan Penggunaan) | 6 | 4 | 5 | 4 | **19** | 32,8% |
| **T - Timeliness** (Kecepatan & Waktu) | 2 | 2 | 1 | 2 | **7** | 12,1% |
| **Total Butir Likert** | **18** | **14** | **12** | **14** | **58** | **100%** |

