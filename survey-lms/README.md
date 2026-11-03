# Kuesioner Kepuasan LMS — form statis + Google Spreadsheet

Form HTML/CSS/JS tanpa framework dan tanpa build step. Jawaban dikirim ke Google
Apps Script, lalu ditulis sebagai satu baris baru di Spreadsheet. Hasil rekap
dihitung dengan formula di sheet `Rekap`.

```
index.html ──► Apps Script Web App (/exec) ──► Spreadsheet: Respon
   │                     │                        ├─ Rekap (formula)
   └─ hasil.html         ▼                        └─ Visualisasi (5 grafik Sheets)
                   dashboard.html (?mode=rekap, agregat tanpa Nama/NIM)
```

## Isi folder

| File | Fungsi |
|---|---|
| `index.html` | Form multi-step (intro → peran → identitas → profil → Likert → penutup) |
| `hasil.html` | Halaman terima kasih; membedakan status `sent`, `queued`, dan `unverified` |
| `dashboard.html` | Dashboard visualisasi web interaktif (radar EUCS, NPS, prodi, 47 butir, saran anonim) |
| `assets/questions.js` | Bank soal (satu-satunya sumber teks soal, skala, dan daftar peran) |
| `assets/config.js` | `WEB_APP_URL`, `TOKEN`, versi form, daftar prodi |
| `assets/app.js` | Render, validasi, autosave, submit, antrean offline |
| `assets/dashboard.js` | Pengambilan data agregat (`?mode=rekap`), filter peran/tanggal, grafik SVG & mode simulasi |
| `assets/style.css` | Tampilan mobile-first formulir |
| `assets/dashboard.css` | Tampilan grid dashboard, grafik, dan mode cetak PDF |
| `apps-script/Code.gs` | `doGet` (`?mode=rekap`), `doPost`, `setupSheet`, `buildRekap`, `buildVisualisasi` |
| `kuesioner_kepuasan_lms.md` | Rancangan soal asli (acuan) |
| `rencana_survey_html.md` | Dokumen rencana/arsitektur |

## 1. Siapkan Spreadsheet dan Apps Script

Cara paling mudah: script **terpasang di Spreadsheet** (bound), jadi tidak perlu
menyalin ID spreadsheet.

1. Buat Google Spreadsheet baru, beri nama misalnya `Kuesioner LMS`.
2. Buka **Extensions → Apps Script**.
3. Hapus isi `Code.gs`, tempel seluruh isi `survey/apps-script/Code.gs`.
4. Sesuaikan `SECRET` di bagian atas. Nilai ini harus sama dengan `TOKEN` di
   `assets/config.js`. Boleh dikosongkan (`''`) kalau tidak ingin memakai token.
5. Simpan (`Ctrl+S`), lalu pilih fungsi **`setupSheet`** dari dropdown di toolbar
   editor dan klik **Run**. Izinkan akses saat diminta (*Review permissions →
   Advanced → Go to ... (unsafe) → Allow*). Fungsi ini:
   - membuat sheet `Respon` + header sesuai urutan `HEADERS`;
   - memformat kolom `nim` dan `kode_prodi` sebagai **teks** (`@`) supaya NIM
     seperti `00123456` tidak berubah menjadi `123456`;
   - membuat sheet `Rekap` beserta formula rata-rata, EUCS, NPS, dan per prodi;
   - membuat sheet `Visualisasi` berisi kartu KPI dan 5 grafik bawaan Google Sheets.
6. Setelah ada perubahan kode, jalankan `setupSheet()` lagi **hanya** kalau
   struktur berubah. Untuk memperbarui tata letak rekap atau grafik, jalankan
   `buildRekap()` atau `buildVisualisasi()` (tersedia juga di menu **Kuesioner LMS** pada Spreadsheet).

> `SHEET_ID` boleh dikosongkan karena script terpasang di Spreadsheet. Isi hanya
> jika memakai script standalone.

## 2. Deploy Web App

1. Di editor Apps Script: **Deploy → New deployment**.
2. Pilih tipe **Web app**.
3. **Execute as**: `Me`.
4. **Who has access**: `Anyone` (bukan "Anyone with Google account").
5. Klik Deploy, lalu salin URL yang berakhiran **`/exec`**.
   (Opsional: buka URL `/exec` tersebut di tab browser — jika muncul JSON
   `{"ok":true,"service":"Kuesioner Kepuasan LMS",...}`, berarti Web App sudah aktif.)
6. Buka `assets/config.js`, isi:

```js
WEB_APP_URL: 'https://script.google.com/macros/s/XXXXXXXX/exec',
TOKEN: 'ganti-token-acak', // samakan dengan SECRET
```

7. Buka form, isi satu respons uji, lalu cek sheet `Respon`. Kalau baris muncul,
   endpoint sudah benar.

Setiap kali `Code.gs` diubah, buat **New deployment** (atau edit deployment yang
ada) agar URL `/exec` memakai versi terbaru.

## 3. Hosting GitHub Pages

Repo: `https://github.com/Ryn-Dev/Meoww-Sleep` (branch `master`).

1. Push folder `survey/` ke repo.
2. Settings → Pages → Source: **Deploy from a branch** → `master` / `/ (root)`.
3. Form tersedia di `https://ryn-dev.github.io/Meoww-Sleep/survey/`.
4. Semua path di HTML sudah relatif (`./assets/...`), jadi jalan di lokal maupun
   GitHub Pages.

Jangan menyimpan data responden di repo. Data hanya ada di Spreadsheet.

## 4. Cara mengisi dan menyimpan data

| Hal | Perilaku |
|---|---|
| Peran | Mahasiswa (`mahasiswa`), Mentor (`dosen`), Pimpinan (`admin`) |
| Identitas | Mahasiswa: nama + NIM + prodi. Mentor: nama + prodi. Pimpinan: cukup nama (tanpa NIM & tanpa prodi) |
| Verifikasi | Tidak ada. NIM tidak dicocokkan, tidak ada dedupe, boleh mengisi ulang |
| Prodi | Dropdown 3 pilihan (Mahasiswa & Mentor); disimpan sebagai `kode_prodi` dan `prodi` |
| NIM | `type="text"` + `inputmode="numeric"` + kolom sheet format teks |
| Autosave | Draf disimpan di `localStorage` selama 14 hari |
| Timer | `durasi_detik` dihitung dari form dibuka sampai dikirim |
| Offline | Jika kirim gagal, jawaban masuk antrean `localStorage` dan dicoba lagi saat form dibuka |
| Reset | Buka `index.html?reset=1` untuk menghapus draf di browser |

Nama dan NIM **tetap terlihat** oleh pengelola spreadsheet. Karena itu jangan
share sheet `Respon` ke mentor/dosen; bagikan hanya angka agregat.

## 5. Membaca hasil & visualisasi (`Rekap`, `Visualisasi`, dan `dashboard.html`)

Ada 3 tempat membaca hasil survei:

1. **Sheet `Rekap`** (tabel angka otomatis di Spreadsheet):
   - **Ringkasan**: jumlah respons per peran, rata-rata Z1, indeks kepuasan, NPS, kategori NPS, rata-rata durasi pengisian.
   - **Rata-rata per butir** (47 butir): rata-rata 1–5, jumlah jawaban, indeks, kategori, plus tag fitur dan dimensi EUCS.
   - **Rata-rata per dimensi EUCS** (C/A/F/E/T) per peran.
   - **Rata-rata per program studi**: jumlah respons, rata-rata Z1, indeks, NPS.
   - **Profil responden**: sebaran lama penggunaan, frekuensi akses, perangkat.
2. **Sheet `Visualisasi`** (5 grafik bawaan Google Sheets):
   - Berisi diagram donat sebaran peran, komposisi NPS, grafik batang 5 dimensi EUCS per peran, kepuasan per prodi, dan perangkat utama.
   - Cocok untuk langsung disalin (*Copy chart*) atau diunduh sebagai PNG/PDF ke Word/Skripsi/PPT.
3. **Halaman Web `dashboard.html`**:
   - Mengambil data agregat lewat `GET /exec?mode=rekap` **tanpa memuat `nama` maupun `nim`**.
   - Dilengkapi filter peran instan, filter rentang tanggal, peta radar EUCS, sorotan 3 skor tertinggi/terendah, pencarian 47 butir, masukan terbuka anonim, tombol **Data Simulasi**, dan **Cetak / PDF**.
   - Opsional: isi `DASHBOARD_PIN` di `apps-script/Code.gs` jika halaman `dashboard.html` ingin dikunci dengan PIN.

Kategori rata-rata: `≥4,20` Sangat puas · `3,40–4,19` Puas · `2,60–3,39` Cukup ·
`1,80–2,59` Tidak puas · `<1,80` Sangat tidak puas. NPS: `≥50%` Sangat baik ·
`0–49%` Baik · `<0%` Perlu perbaikan.

Rekap menghitung **semua** baris. Untuk periode tertentu, tambahkan filter pada
kolom `timestamp` atau buat salinan sheet lalu filter di sana.

### Duplikat

Karena tidak ada dedupe, **jumlah respons ≠ jumlah orang**. Sebelum analisis:

- `id_respon` sama → kemungkinan kirim ulang/double click.
- `nim` sama → bisa isian ulang, bisa NIM salah ketik.
- `nama` sama dengan ejaan berbeda → relevan untuk mentor/pimpinan.

Cek cepat duplikat NIM (kolom `nim` ada di kolom F):

```
=COUNTIF(Respon!F:F, F2) > 1
```

## 6. Kalau soal diubah

1. Ubah teks/grup di `assets/questions.js`.
2. Naikkan `version` di `questions.js` dan `VERSION` di `config.js` (mis. `v2`).
   Ini memisahkan data lama dan baru lewat kolom `versi_form`.
3. Jika **menambah/menghapus butir**, ubah juga `ITEMS` dan `HEADERS` di
   `apps-script/Code.gs`, lalu:
   - jangan mengubah arti kolom lama;
   - jalankan `setupSheet()` hanya pada spreadsheet baru, karena header lama
     yang tidak cocok akan ditolak (agar data tidak bergeser);
   - jalankan `buildRekap()` untuk membangun ulang rekap.
4. Jika hanya mengubah kalimat soal tanpa mengubah ID, cukup perbarui
   `questions.js` + `ITEMS` di `Code.gs` (teks di Rekap), lalu `buildRekap()`.

## 7. Troubleshooting

| Gejala | Penyebab umum | Solusi |
|---|---|---|
| Muncul banner "Mode uji" | `WEB_APP_URL` kosong | Isi URL `/exec` di `assets/config.js` |
| Muncul banner "Konfigurasi URL belum tepat" | URL memakai link Spreadsheet, `/dev`, atau `/edit` | Ganti dengan Web app URL berakhiran `/exec` dari **Deploy → Manage deployments** |
| Jawaban tidak masuk, halaman malah minta login Google / muncul status catatan teknis | Deployment bukan `Anyone` | Edit deployment → Who has access: `Anyone` |
| Pesan "respons server tidak dikenali" | URL salah atau halaman login | Pastikan URL berakhiran `/exec` dan akses `Anyone` |
| Pesan "Token form tidak cocok" | `TOKEN` ≠ `SECRET` | Samakan nilainya |
| Pesan "Header sheet Respon tidak cocok" | Urutan kolom diubah manual | Kembalikan header, atau pakai spreadsheet baru + `setupSheet()` |
| NIM `00123456` jadi `123456` | Kolom belum format teks | Jalankan `setupSheet()`; jangan ubah format kolom |
| Submit terasa lambat | Cold start Apps Script (1–3 detik) | Normal; tombol menampilkan status "Mengirim…" |
| Jawaban "tersimpan" tapi tidak ada di sheet | Antrean offline | Buka kembali form dengan internet aktif; antrean dikirim otomatis |
| Rekap tidak berubah setelah data baru | Formula belum dihitung ulang | Jalankan `buildRekap()` dari menu **Kuesioner LMS** |

## 8. Batasan yang disengaja

- Tanpa cek NIM, tanpa daftar mahasiswa, tanpa dedupe, tanpa blokir pengisian ulang.
- Satu orang bisa mengisi berkali-kali; data self-selected dan tidak anonim.
- `TOKEN`/`SECRET` hanya penghalang bot ringan karena terlihat di source publik.
- Endpoint publik: siapa pun yang tahu tautan bisa mengirim data.
- `no-cors` fallback tidak bisa membaca respons server; kalau deployment salah,
  jawaban bisa tampak terkirim padahal tidak. **Selalu tes satu respons dan cek
  sheet setelah deploy.**
