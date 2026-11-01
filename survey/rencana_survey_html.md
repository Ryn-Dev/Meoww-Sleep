# Rencana: Kuesioner LMS versi HTML → Google Spreadsheet

> Menggantikan Google Form di [`kuesioner_kepuasan_lms.md`](./kuesioner_kepuasan_lms.md) dengan form HTML biasa (static), tanpa server sendiri, tapi jawaban tetap masuk ke Google Spreadsheet.

## Keputusan yang sudah disepakati

| Hal | Keputusan |
|---|---|
| Hosting | **GitHub Pages** — `https://ryn-dev.github.io/Meoww-Sleep/survey/` (verifikasi di Settings → Pages) |
| Struktur data | **1 sheet `Respon`**, 1 baris = 1 responden |
| Identitas | **Mahasiswa: nama + NIM** (NIM teks bebas, tanpa validasi). **Mentor & Pimpinan: cukup nama** (tanpa NIM). Semua diisi manual, **satu sheet** dengan jawaban |
| Verifikasi | **Tidak ada** — tidak ada cek NIM, tidak ada dedupe, tidak ada validasi ke daftar |
| Prodi | 3 pilihan tetap (lihat bagian 3) |
| Dashboard | **Sheet `Rekap` saja**, tanpa Looker Studio |
| Durasi | **Tanpa deadline** — form terbuka setiap saat |
| Status | **Sudah diimplementasikan** — lihat [`README.md`](./README.md) untuk cara pasang |

Konsekuensi yang perlu disadari: karena identitas diisi manual dan **tanpa verifikasi**, data tidak anonim (perlu persetujuan di intro) dan tidak ada jaminan "1 orang = 1 respons". Satu orang bisa mengisi berkali-kali, dan NIM/nama bisa salah ketik atau asal. Itu diterima demi kesederhanaan; pengaruhnya ke analisis dijelaskan di bagian 6.

Karena aturan identitas berbeda per peran, **pemilihan peran dipindah ke paling awal** (setelah persetujuan). Tanpa itu, form tidak tahu harus menampilkan kolom NIM atau tidak.

---

## 1. Jawaban singkat: bisa?

**Bisa, tanpa backend sama sekali.** Pola yang dipakai:

```
Browser (HTML/CSS/JS statis)
        │  fetch POST (JSON)
        ▼
Google Apps Script Web App  (/exec)
        │  appendRow + LockService
        ▼
Google Spreadsheet  →  Sheet "Respon"
        │
        └─► Sheet "Rekap" (formula: rata-rata, EUCS, NPS, indeks)
```

Kenapa Apps Script, bukan yang lain:

| Opsi | Biaya | Tanpa backend | Catatan |
|---|---|---|---|
| **Apps Script Web App → Spreadsheet** ✅ | Gratis | Ya | Milik sendiri, data mentah di Sheets, bisa dikembangkan |
| Google Form embedded/prefill | Gratis | Ya | Kembali ke Google Form — tidak sesuai permintaan |
| SheetDB / Sheet.best | Freemium | Ya | Bergantung layanan pihak ketiga, ada limit kuota gratis |
| Formspree / Getform | Freemium | Ya | Datanya di email/dashboard mereka, bukan Sheets asli |
| Firebase / Supabase | Gratis | Ya | Overkill, butuh setting auth + export ke Sheets manual |

Yang perlu diterima sebagai konsekuensi: **endpoint form itu publik** (siapa pun yang buka form bisa melihat URL-nya), dan karena tidak ada verifikasi, siapa pun yang tahu tautannya bisa mengisi. Yang tersisa hanya penjagaan teknis agar data tidak rusak (bagian 6).

Karena form di-host di **GitHub Pages** (murni file statis), tidak ada PHP/Node yang bisa menerima kiriman. Justru di sinilah Apps Script berperan: halaman tetap statis, satu-satunya "backend" adalah Web App milik Google. Tanpa build step, tanpa biaya, deploy cukup `git push` ke `master`.

**Langkah hosting (sekali saja):**
1. Repo: `https://github.com/Ryn-Dev/Meoww-Sleep` (branch `master`).
2. Settings → Pages → Source: *Deploy from a branch* → `master` / `/ (root)`.
3. URL form menjadi `https://ryn-dev.github.io/Meoww-Sleep/survey/` — karena `index.html` ada di dalam folder `survey/`, tidak perlu mengubah root repo.
4. Semua path di `index.html` **relatif** (`./assets/...`), jangan absolut, supaya jalan di lokal maupun Pages.
5. Repo publik = source form publik. Jangan taruh data responden di repo; simpan hanya di Spreadsheet.

---

## 2. Struktur file yang akan dibuat

```
survey/
├─ kuesioner_kepuasan_lms.md      (sudah ada — jadi acuan isi soal)
├─ rencana_survey_html.md         (dokumen ini)
├─ index.html                     ← form (multi-step)
├─ hasil.html                     ← halaman "terima kasih" / ringkasan jawaban
├─ assets/
│  ├─ style.css                   ← tema, radio card 1–5, progress bar
│  ├─ questions.js                ← BANK SOAL (satu-satunya sumber isi soal)
│  ├─ config.js                   ← WEB_APP_URL + versi form + daftar prodi + token
│  └─ app.js                      ← render, validasi, autosave, submit
└─ apps-script/
   └─ Code.gs                     ← kode untuk di-paste ke Apps Script
```

Prinsip penting: **soal tidak ditulis di HTML**, tapi sebagai data di `questions.js`. Jadi kalau ada revisi kalimat soal, cukup ubah satu file dan kolom spreadsheet tetap konsisten.

Bentuk `questions.js` (contoh potongan):

```js
export const SECTIONS = {
  mahasiswa: [
    {
      id: 'mahasiswa_inti',
      title: 'Pengalaman Belajar',
      items: [
        { id: 'M1', text: 'Proses login ke LMS mudah dan lancar', fitur: 'Login', eucs: 'E' },
        { id: 'M2', text: 'Tampilan LMS menarik dan rapi', fitur: 'Umum', eucs: 'F' },
        // ... M3–M20
      ],
    },
  ],
  dosen: [ /* D1–D14 */ ],
  admin: [ /* P1–P13 */ ],
};

export const OPEN_QUESTIONS = {
  mahasiswa: [
    { id: 'M_OPEN_1', text: 'Fitur apa yang paling bermanfaat bagi Anda?' },
    { id: 'M_OPEN_2', text: 'Kendala apa yang paling sering Anda alami?' },
  ],
  // dosen, admin ...
};
```

Alasan bank soal dipisah: bisa dipakai juga untuk generator kolom spreadsheet & validasi, sehingga tidak ada soal yang "hilang" antara HTML dan sheet.

---

## 3. Alur UI (pengganti branching Google Form)

```
[0] Intro + Persetujuan ──► [1] Pilih Peran ──┬─► [2A] Identitas Mahasiswa (nama + NIM) ──┐
                                              ├─► [2B] Identitas Mentor    (nama)        ──┤
                                              └─► [2C] Identitas Pimpinan (nama)        ──┘
                                                                                          │
                                              ┌───────────────────────────────────────────┘
                                              ▼
                                     [3] Data Responden ──► [4A/4B/4C] Soal sesuai peran
                                                                  │
                                                                  ▼
                                              [5] Penutup (Z1, Z2 NPS, Z3) ──► [6] Terima kasih
```

Detail per layar:

| Layar | Isi | Catatan UX |
|---|---|---|
| Intro + Persetujuan | Judul, tujuan, "±7 menit", estimasi, **pernyataan tujuan data + checkbox "Saya bersedia"** | Wajib dicentang sebelum "Mulai" aktif |
| Pilih Peran | 3 kartu: Mahasiswa / Mentor / Pimpinan | **Paling awal**, karena menentukan ada/tidaknya kolom NIM |
| Identitas — Mahasiswa | **Nama** + **NIM** (teks bebas, tanpa format), + Prodi (dropdown) | Tidak ada pengecekan NIM. NIM `type="text"` + `inputmode="numeric"` agar angka 0 di depan tidak hilang |
| Identitas — Mentor / Pimpinan | **Nama** saja (tanpa NIM), + Prodi (dropdown yang sama) | Cukup "wajib diisi", tanpa aturan tambahan |
| Data Responden | Lama pakai, Frekuensi, Perangkat | 3 pertanyaan saja |
| Section role | Soal Likert dikelompokkan per fitur (bukan 20 soal sekaligus) | 1 grup = 1 kartu, progress bar sticky, wajib lengkap sebelum "Lanjut" |
| Penutup | Z1 (1–5), Z2 (NPS 0–10), Z3 (textarea opsional) | NPS pakai bar 0–10, bukan bintang |
| Terima kasih | Konfirmasi + tombol "Isi lagi" (boleh, tanpa batas) | Tidak ada kunci 24 jam karena tidak ada verifikasi |

**Teks persetujuan (draft, perlu disesuaikan):**

> Data yang Anda isi (nama, NIM untuk mahasiswa, dan jawaban) digunakan **hanya** untuk evaluasi dan pengembangan LMS. Hasil dilaporkan dalam bentuk **agregat/rata-rata**, bukan per individu. Data disimpan di spreadsheet internal, hanya diakses oleh pengelola, dan dihapus setelah periode evaluasi selesai.

**Daftar prodi (dropdown, dipakai semua peran):**

| Kode | Nama Prodi |
|---|---|
| `58302` | Teknologi Rekayasa Perangkat Lunak |
| `90343` | Teknologi Rekayasa Multimedia Grafis |
| `90346` | Teknologi Rekayasa Komputer Jaringan |

Disimpan di `config.js` sebagai satu konstanta (bukan ditulis ulang di HTML), misalnya:

```js
export const PRODI = [
  { kode: '58302', nama: 'Teknologi Rekayasa Perangkat Lunak' },
  { kode: '90343', nama: 'Teknologi Rekayasa Multimedia Grafis' },
  { kode: '90346', nama: 'Teknologi Rekayasa Komputer Jaringan' },
];
```

Yang dikirim ke sheet: `kode_prodi` **dan** `prodi` (nama), supaya rekap bisa dikelompokkan dengan angka kode maupun nama yang mudah dibaca. Nilai dropdown memakai kode, label menampilkan nama — mencegah variasi penulisan tanpa perlu verifikasi.

**Aturan identitas per peran (tanpa verifikasi):**

| Peran | Yang diketik | Kolom `nim` di sheet | Dicek? |
|---|---|---|---|
| Mahasiswa | Nama + NIM + prodi | Terisi (teks) | Tidak |
| Mentor | Nama + prodi | Kosong | Tidak |
| Pimpinan | Nama + prodi | Kosong | Tidak |

Konsekuensi yang sudah disepakati: tidak ada jaminan NIM valid, tidak ada jaminan 1 orang hanya mengisi sekali, dan nama bisa salah ketik. Karena itu **jangan** menjadikan kolom `nim`/`nama` sebagai dasar penilaian individu, dan saat analisis cukup lihat pola duplikat secara manual (bagian 6).

Pengelompokan soal mahasiswa (biar tidak terasa panjang):

1. **Akses & Tampilan** → M1–M4
2. **Kelas & Materi** → M5–M8
3. **Tugas & Nilai** → M9–M11
4. **Absensi, Ibadah, SKL, Performa** → M12–M20 + 2 pertanyaan terbuka

Mentor: *Jadwal & Kelas* (D1–D3), *Materi & Tugas* (D4–D7), *Absensi & SKL* (D8–D9), *Monitoring & Performa* (D10–D14) + 2 terbuka.
Pimpinan: *Dashboard & Grafik* (P1–P4), *Monitoring & Data* (P5–P9), *Laporan & Keamanan* (P10–P13) + 2 terbuka.

Komponen input Likert (rencananya):

```
[1]      [2]      [3]      [4]      [5]
Sangat   Tidak    Netral   Setuju   Sangat
Tidak    Setuju                     Setuju
Setuju
```
- Radio asli (`<input type="radio">`) yang disembunyikan, label dibuat kartu besar → tetap bisa diakses keyboard & screen reader.
- Target sentuh minimal 44px, layout 5 kolom di HP (angka saja + label di bawah, label penuh hanya di baris pertama).
- Header label skala diulang di setiap grup supaya responden tidak lupa arah skala (aturan "arah skala konsisten").

Fitur tambahan yang murah tapi berdampak:
- **Autosave draft** ke `localStorage` (kembali lagi tidak hilang).
- **Validasi per grup** + pesan SweetAlert2 (sudah dipakai di `forms/`).
- **Timer** mulai → submit, dikirim sebagai `durasi_detik` untuk filter isian asal-asalan.
- **Mobile-first**, karena mayoritas mahasiswa pakai HP.
- **Tombol kembali** antar grup tanpa kehilangan jawaban.

---

## 4. Skema data di Spreadsheet

**Rekomendasi: 1 sheet `Respon`, 1 baris = 1 responden** (wide format). Kolom role yang tidak dipakai dibiarkan kosong — pivot table tetap aman karena sel kosong diabaikan.

### Sheet `Respon`

| Grup kolom | Nama kolom | Isi |
|---|---|---|
| Identitas | `nama` | Semua peran, diketik responden |
| | `nim` | **Hanya mahasiswa**, teks bebas. Kosong untuk mentor/pimpinan |
| Meta | `timestamp` | Waktu server (`new Date()`) |
| | `id_respon` | UUID dari browser — untuk melacak **submit ganda tak sengaja** (double click), bukan untuk menolak |
| | `versi_form` | mis. `v1` (penting saat soal berubah) |
| | `peran` | `mahasiswa` / `dosen` / `admin` (dari pilihan responden) |
| | `prodi` | Nama prodi dari dropdown |
| | `kode_prodi` | Kode prodi (`58302` dst.), disimpan sebagai teks |
| | `lama_penggunaan`, `frekuensi_akses`, `perangkat` | Diisi responden |
| | `durasi_detik` | Lama pengisian (informasi saja, tidak ada penolakan) |
| | `user_agent` | Diagnostik (bukan untuk analisis) |
| Likert | `M1`–`M20` | 1–5, kosong untuk mentor/pimpinan |
| | `D1`–`D14` | 1–5, kosong untuk role lain |
| | `P1`–`P13` | 1–5, kosong untuk role lain |
| Umum | `Z1` | 1–5 kepuasan keseluruhan |
| | `Z2` | 0–10 NPS |
| Terbuka | `M_OPEN_1`, `M_OPEN_2`, `D_OPEN_1`, `D_OPEN_2`, `P_OPEN_1`, `P_OPEN_2`, `Z3` | Teks |

Total ± 68 kolom. Baris 1 = header, dibuat otomatis oleh Apps Script saat pertama kali jalan (jangan diketik manual agar tidak beda urutan).

**NIM harus tersimpan sebagai teks, bukan angka.** Kalau tidak, Google Sheets akan mengubah `00123456` menjadi `123456`. Dua lapis pencegahan:

1. Kolom `nim` di-set format **Plain text** (`@`) saat setup. `kode_prodi` juga di-set teks agar konsisten:
   ```js
   sheet.getRange(1, NIM_COL).setValue('nim');
   sheet.getRange(2, NIM_COL, sheet.getMaxRows() - 1, 1).setNumberFormat('@');
   sheet.getRange(2, KODE_PRODI_COL, sheet.getMaxRows() - 1, 1).setNumberFormat('@');
   ```
2. Di frontend: `<input type="text" inputmode="numeric" autocomplete="off">`, bukan `type="number"`.

### Tidak ada sheet `Master`

Karena tidak ada verifikasi, daftar mahasiswa **tidak dipakai form**. Kalau tetap ingin punya daftar manual untuk mengecek siapa yang belum mengisi, buat sheet `Daftar` (`nim | nama | sudah_isi`) dan isi `sudah_isi` dengan formula, misalnya:

```
=IF(COUNTIF(Respon!F:F, A2) > 0, "sudah", "belum")
```

Ini murni untuk pemantauan manual — tidak memengaruhi form dan tidak memblokir apa pun.

Alternatif bila nanti butuh analisis lebih rapi: sheet tambahan **`Detail`** (long format: `id_respon | kode_butir | skor | fitur | eucs`), dibuat otomatis dari `Respon` dengan formula. Ini memudahkan pivot per dimensi EUCS tanpa 47 kolom. Rencana awal: **tidak** dibuat dulu, cukup `Respon` + `Rekap`.

### Sheet `Rekap` (otomatis, formula)

- Rata-rata per butir & per role: `=IFERROR(AVERAGEIFS([kolom_butir], [kolom_peran], "mahasiswa"), "")`
- Rata-rata per prodi: `=IFERROR(AVERAGEIFS([kolom_butir], [kolom_prodi], "Teknologi Rekayasa Perangkat Lunak"), "")`
- Rata-rata per dimensi EUCS (C/A/F/E/T) → mapping butir→dimensi di-generate Apps Script ke sheet `Mapping`, supaya tidak hardcode di formula.
- Indeks kepuasan: `(total skor / (5 × jumlah butir × jumlah responden)) × 100%`
- NPS: `(COUNTIF([kolom_Z2],">=9") - COUNTIF([kolom_Z2],"<=6")) / COUNT([kolom_Z2]) × 100`
- Kategori (Sangat Puas … Sangat Tidak Puas) pakai `IFS` sesuai tabel di dokumen lama.

`[kolom_butir]` dan kawan-kawan diisi otomatis oleh Apps Script saat membuat sheet `Rekap` (dicari dari baris header), jadi tidak akan salah kolom kalau urutan `HEADERS` berubah. Tidak ada dashboard tambahan — semua angka dibaca langsung di Sheets.

### Karena form terbuka setiap saat

Tanpa deadline, data akan terus bertambah dan bercampur antar periode. Supaya rekap tetap masuk akal:

| Kebutuhan | Cara |
|---|---|
| Filter periode | Selalu ada kolom `timestamp`; buat Rekap per rentang dengan `AVERAGEIFS(..., [kolom_timestamp], ">="&A1, [kolom_timestamp], "<="&B1)` |
| Label periode | Tidak ada field semester (keputusan akhir); kelompokkan dari kolom `timestamp` |
| Soal berubah | Naikkan `versi_form`; jangan ubah arti kolom lama, dan filter rekap per versi bila perlu |
| Backup | Salin sheet `Respon` ke `Backup_YYYYMM` secara berkala (manual atau trigger bulanan Apps Script) |
| Data lama | Karena tanpa batas waktu, tinjau ulang tiap semester: arsipkan atau hapus data yang sudah tidak dipakai |

---

## 5. Rancangan Apps Script (`apps-script/Code.gs`)

Poin teknis yang menentukan berhasil/gagal:

1. **Deploy sebagai Web App**: *Execute as* = **Me**, *Who has access* = **Anyone**. Tanpa "Anyone", responden akan diminta login Google dan gagal kirim.
2. URL yang dipakai harus yang berakhiran **`/exec`**, bukan `/dev`.
3. Setiap kali `Code.gs` diubah → **New deployment** (atau kelola deployment → edit versi), karena URL `/exec` menunjuk versi tertentu.
4. **LockService** wajib: dua submit bersamaan tanpa lock bisa menimpa baris.
5. **CORS**: kirim dengan `Content-Type: text/plain;charset=utf-8` agar tidak memicu preflight `OPTIONS` yang tidak didukung Apps Script. Body tetap JSON, di-parse manual di server.
6. **NIM sebagai teks**: kolom `nim` di-format `@` **sekali** saat setup, sebelum ada data.

Kerangka kode:

```js
const SHEET_ID   = 'xxx';                 // ID spreadsheet
const SHEET_NAME = 'Respon';
const SECRET     = 'ganti-token-acak';    // opsional, hanya penghalang bot ringan

const HEADERS = [
  'timestamp', 'id_respon', 'versi_form', 'peran', 'nama', 'nim', 'prodi', 'kode_prodi',
  'lama_penggunaan', 'frekuensi_akses', 'perangkat', 'durasi_detik', 'user_agent',
  // M1..M20, D1..D14, P1..P13, Z1, Z2, lalu kolom teks terbuka
];

const NIM_COL        = HEADERS.indexOf('nim') + 1;
const KODE_PRODI_COL = HEADERS.indexOf('kode_prodi') + 1;

/* ---------- jalankan SEKALI dari editor, bukan dari web ---------- */
function setupSheet_() {
  const sheet = getSheet_();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  // paksa kolom identitas jadi teks → "00123456" tidak berubah jadi 123456
  for (const col of [NIM_COL, KODE_PRODI_COL]) {
    sheet.getRange(2, col, sheet.getMaxRows() - 1, 1).setNumberFormat('@');
  }
}

/* ---------- simpan jawaban ---------- */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents);

    // 1) penghalang teknis minimal (bukan verifikasi responden)
    if (SECRET && data.token !== SECRET) return json({ ok: false, error: 'token' });
    if (!['mahasiswa', 'dosen', 'admin'].includes(data.peran)) {
      return json({ ok: false, error: 'peran_tidak_valid' });
    }

    // 2) field wajib: nama selalu, nim hanya untuk mahasiswa — tanpa cek ke daftar apa pun
    if (!String(data.nama || '').trim()) return json({ ok: false, error: 'nama_kosong' });
    if (data.peran === 'mahasiswa' && !String(data.nim || '').trim()) {
      return json({ ok: false, error: 'nim_kosong' });
    }

    // 3) validasi bentuk data: butir wajib terisi, skor 1–5, NPS 0–10
    const err = validateScores_(data.peran, data);
    if (err) return json({ ok: false, error: err });

    // 4) simpan — tanpa cek duplikat
    const sheet = getSheet_();
    sheet.appendRow(buildRow_(data));   // urutan kolom mengikuti HEADERS
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Catatan desain:

- **Tidak ada `doGet`, tidak ada `Master`, tidak ada dedupe.** Server hanya memeriksa: peran valid, nama terisi, NIM terisi (mahasiswa), dan skor dalam rentang. Selebihnya data dipercaya apa adanya.
- `nim` disimpan sebagai string apa adanya (`trim` saja, tanpa format). Tidak ada pencocokan, sehingga NIM yang salah ketik tetap masuk — konsekuensi yang sudah disepakati.
- `validateScores_()` **bukan verifikasi responden**, hanya penjaga agar baris tidak kosong/rusak. Kalau ingin benar-benar tanpa pengecekan, fungsi ini bisa dihapus dan semua nilai langsung ditulis.
- `id_respon` tetap dikirim hanya untuk melacak submit ganda tak sengaja (double click). Tidak ada penolakan, tapi saat rekap baris dengan `id_respon` sama bisa dianggap satu.
- `SECRET` sifatnya opsional dan tidak melindungi apa pun secara nyata (terlihat di source). Kalau mau paling sederhana, boleh dikosongkan.
- `setupSheet_()` dijalankan **sekali** dari editor Apps Script, jangan dipanggil di setiap request (format kolom cukup di-set sekali).

Di sisi klien, alur submit:

```js
try {
  const res = await fetch(WEB_APP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  const out = await res.json();
  if (!out.ok) throw new Error(out.error);
  location.href = 'hasil.html';
} catch (err) {
  // Fallback: kirim no-cors (respons tak terbaca) + simpan antrean di localStorage
  // lalu tampilkan "tersimpan, akan dikirim ulang otomatis"
}
```

**Fallback antrean** penting: kalau sinyal responden jelek (HP, kuota), jawaban disimpan di `localStorage` dan dikirim ulang saat halaman dibuka lagi / online. Tanpa ini, satu timeout = responden malas mengulang.

---

## 6. Integritas data & privasi (tanpa verifikasi)

Sesuai keputusan: **tidak ada verifikasi pengisian**. Yang tersisa hanya penjagaan teknis agar data tidak rusak.

| Lapisan | Ada? | Cara | Efek |
|---|---|---|---|
| Cek NIM | ❌ | — | NIM diisi apa adanya, salah ketik tetap masuk |
| Cek 1 orang = 1 respons | ❌ | — | Satu orang bisa mengisi berkali-kali |
| Cek nama vs daftar | ❌ | — | Nama bisa beda ejaan antar pengisian |
| Cek peran | ❌ | — | Responden memilih peran sendiri |
| Field wajib | ✅ | Nama selalu; NIM hanya untuk mahasiswa | Tidak ada baris tanpa identitas |
| Rentang skor | ✅ | Butir 1–5, NPS 0–10 | Tidak ada nilai mustahil (mis. 9 pada Likert) |
| `type="text"` untuk NIM | ✅ | Bukan `type="number"` | Angka 0 di depan tidak hilang |
| LockService | ✅ | Kunci saat menulis | Dua submit bersamaan tidak saling menimpa |
| Antrean `localStorage` | ✅ | Kirim ulang saat online | Jawaban tidak hilang saat sinyal putus |

### Konsekuensi ke analisis (penting)

Karena tidak ada dedupe, **jumlah respons ≠ jumlah orang**. Sebelum menghitung rata-rata:

1. Cek baris dengan `id_respon` sama → kemungkinan double click, buang duplikatnya.
2. Cek `nim` yang muncul lebih dari sekali → bisa isian ulang, bisa orang berbeda dengan NIM salah. Putuskan: pakai yang terakhir, atau buang semua.
3. Cek `nama` yang sama dengan ejaan berbeda → hanya relevan untuk mentor/pimpinan.
4. Sebutkan di laporan bahwa data **self-selected** dan tidak terverifikasi, sebagai keterbatasan.

Cara cepat di Sheets untuk hitung duplikat NIM:

```
=COUNTIF(Respon!F:F, F2)>1
```

### Privasi

Walau tanpa verifikasi, nama dan NIM tetap data pribadi:

| Hal | Rekomendasi |
|---|---|
| Persetujuan | Checkbox di intro, sebelum form bisa dimulai |
| Tujuan | Tulis jelas: evaluasi & pengembangan LMS, bukan penilaian individu |
| Akses | Spreadsheet hanya di-share ke pengelola (jangan "anyone with link") |
| Pelaporan | Laporkan agregat per role/dimensi. **Jangan** tampilkan skor per mentor |
| Retensi | Sepakati kapan data mentah dihapus (mis. 1 semester setelah laporan selesai) |

Identitas disimpan **satu sheet** dengan jawaban (keputusan). Artinya siapa pun yang membuka spreadsheet bisa melihat nama, NIM, dan skornya sekaligus — jadi pembatasan akses ke file menjadi satu-satunya pengaman. Jangan pernah share sheet `Respon` ke mentor/dosen.

### Bias yang perlu disadari

Responden yang tahu namanya tercatat cenderung menilai lebih tinggi, terutama mahasiswa yang menilai mentor yang masih mengajar mereka. Cara menekan bias tanpa mengorbankan identitas:

1. **Nyatakan tegas di intro**: "Jawaban tidak memengaruhi nilai/penilaian Anda" (kalau memang benar).
2. **Halaman terima kasih tidak menampilkan nama atau skor** — cukup ucapan terima kasih.
3. **Pisahkan pengolah data**: dosen/mentor tidak diberi akses ke data mentah, hanya ke rekap agregat.
4. **Sebutkan di laporan** bahwa instrumen self-report dengan identitas, sebagai keterbatasan penelitian.

Karena identitas menyatu dengan jawaban, bias ini tidak bisa dikurangi lewat struktur data — hanya lewat kalimat di intro dan pembatasan akses. Kalau nanti (misal untuk skripsi) bias ini jadi masalah serius, pemisahan sheet `Identitas` masih bisa ditambahkan tanpa mengubah form; tapi untuk sekarang tidak dipakai.

---

## 7. Risiko teknis & mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Kuota Apps Script (±20.000 request/hari akun gratis) | Submit gagal saat puncak | Pantau; untuk < 1.000 responden sangat aman. Bisa pakai 2 deployment terpisah bila perlu |
| Cold start 1–3 detik | Terasa lambat | Tombol submit → state loading + teks "mengirim…", jangan disable feedback |
| CORS ditolak browser | Data tidak terkirim | `text/plain` + fallback `no-cors` + antrean lokal |
| Spreadsheet tidak sengaja diedit | Data rusak | Sheet `Respon` diproteksi (hanya script yang boleh append), kirim salinan harian ke sheet `Backup` |
| URL form tersebar ke luar target | Responden tidak relevan | Tidak dicegah (tanpa verifikasi); filter manual saat analisis + sebar tautan hanya ke grup target |
| NIM/nama salah ketik atau asal | Data identitas tidak akurat | Terima apa adanya; bersihkan saat analisis; jangan pakai identitas sebagai dasar penilaian |
| Satu orang mengisi berkali-kali | Jumlah respons menggelembung | Deteksi manual lewat `id_respon`/`nim` yang sama, buang duplikat sebelum analisis |
| NIM berubah jadi angka / 0 di depan hilang | NIM tidak sesuai aslinya | Kolom `nim` format teks `@` + input `type="text"` |
| Data identitas bocor / disalahgunakan | Masalah privasi & kepercayaan | Sheet tidak di-share publik, akses hanya pengelola, laporkan agregat, hapus data mentah setelah periode yang disepakati |
| Bias jawaban karena tidak anonim | Skor cenderung lebih tinggi | Pernyataan "tidak memengaruhi nilai", data mentah tidak diakses mentor, sebut sebagai keterbatasan di laporan |
| Soal direvisi setelah data masuk | Kolom bercampur | `versi_form` di setiap baris; revisi = naikkan versi, jangan ubah arti kolom lama |
| Form terbuka terus (tanpa deadline) | Data menumpuk & bercampur antar periode | Filter `timestamp` di rekap, backup bulanan, arsipkan data lama tiap semester |
| Responden tutup browser di tengah | Data hilang | Autosave draft `localStorage` |

---

## 8. Tahapan pengerjaan

| # | Tahap | Output | Estimasi |
|---|---|---|---|
| 1 | Finalisasi bank soal (`questions.js`) dari md | Semua butir + grup + dimensi EUCS | 0,5 hari |
| 2 | Buat Spreadsheet (`Respon`, `Rekap`) + `Code.gs` + deploy | Endpoint `/exec` aktif, kolom `nim` format teks, tes 1 baris masuk | 0,5 hari |
| 3 | UI: intro + persetujuan + pilih peran + identitas kondisional (nama + NIM untuk mahasiswa) | Form identitas tanpa pengecekan, prodi dropdown | 1 hari |
| 4 | UI: grup Likert + NPS + pertanyaan terbuka + validasi wajib isi | Form lengkap sesuai role | 1 hari |
| 5 | Submit + fallback antrean + halaman terima kasih | Data benar-benar masuk sheet | 0,5 hari |
| 6 | Sheet `Rekap` + formula EUCS/NPS/indeks | Angka langsung jadi | 0,5 hari |
| 7 | QA: mobile, NIM teks, sinyal putus, aksesibilitas | Checklist lolos | 0,5 hari |
| 8 | Deploy GitHub Pages + link + QR code | Siap sebar | 0,25 hari |

Total realistis: **±4–5 hari kerja** (lebih cepat dari rencana sebelumnya karena tanpa master list & dedupe).

### Checklist QA sebelum sebar

- [ ] Dropdown prodi berisi **tepat 3 pilihan** dengan kode `58302`, `90343`, `90346`
- [ ] `kode_prodi` dan `prodi` sama-sama tersimpan, nilainya cocok
- [ ] Pilih Mahasiswa → muncul input **nama + NIM + prodi**
- [ ] Pilih Mentor/Pimpinan → hanya **nama + prodi** (tidak ada input NIM)
- [ ] NIM `00123456` tersimpan **persis** dengan 0 di depan (bukan `123456`)
- [ ] NIM diketik asal (`abc`) → tetap diterima (memang tanpa verifikasi)
- [ ] Nama kosong → tidak bisa lanjut
- [ ] Isi sebagai mahasiswa → baris masuk, `nim` terisi, kolom D/P kosong
- [ ] Isi sebagai mentor & pimpinan → `nim` kosong, `nama` sesuai input
- [ ] Submit 2x dengan NIM sama → **2 baris** (memang tanpa dedupe), `id_respon` sama jika double click
- [ ] Klik "Lanjut" tanpa menjawab → tidak bisa lewat
- [ ] Matikan internet saat submit → muncul pesan antrean, lalu terkirim saat online
- [ ] Buka di HP (Chrome + Safari) → tidak ada horizontal scroll
- [ ] Uji keyboard-only → semua radio bisa dipilih
- [ ] Checkbox persetujuan wajib sebelum "Mulai" aktif
- [ ] `Z1`, `Z2`, `Z3` masuk kolom yang benar
- [ ] Timestamp memakai waktu server (bukan waktu HP responden)
- [ ] Buka URL GitHub Pages (bukan `file://`) → submit tetap jalan

---

## 9. Status keputusan

**Sudah diputuskan:**

1. Hosting → **GitHub Pages**, folder `survey/` di repo `Ryn-Dev/Meoww-Sleep`.
2. Struktur data → **1 sheet `Respon`** + sheet `Rekap`. **Tanpa** sheet `Master`. Identitas **menyatu** di sheet `Respon` (tidak dipisah).
3. Identitas → **Mahasiswa: nama + NIM** (NIM teks bebas). **Mentor & Pimpinan: cukup nama**, tanpa NIM.
4. Verifikasi → **tidak ada**: tanpa cek NIM, tanpa dedupe, tanpa pencocokan nama, tanpa blokir pengisian ulang.
5. Prodi → **3 pilihan tetap**: `58302` Teknologi Rekayasa Perangkat Lunak, `90343` Teknologi Rekayasa Multimedia Grafis, `90346` Teknologi Rekayasa Komputer Jaringan. Dipakai semua peran.
6. Dashboard → **tidak ada Looker Studio**; hasil dibaca di sheet `Rekap`.
7. Narahubung → **tidak ada**; halaman pendukung tidak mencantumkan kontak.
8. Durasi → **tanpa deadline**, form terbuka setiap saat. Rekap memakai filter `timestamp` bila perlu per periode.

**Catatan implementasi (sudah selesai):**

1. Kode prodi `90343` memakai ejaan **Teknologi Rekayasa Multimedia Grafis**.
2. Teks persetujuan memakai nama generik "LMS" (tanpa nama institusi).
3. Field **semester tidak dipakai**; periode dipisahkan lewat kolom `timestamp`.
4. File yang dibuat: `index.html`, `hasil.html`, `assets/{config,questions,app}.js`,
   `assets/style.css`, `apps-script/Code.gs`, dan `README.md`.
5. Form siap diuji lokal dengan `?reset=1`, lalu di-hosting di GitHub Pages
   setelah `WEB_APP_URL` diisi.
