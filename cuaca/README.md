# Langit — Prakiraan Cuaca Realtime

Halaman web prakiraan cuaca yang memakai **lokasi perangkat** (Geolocation API browser), bukan lokasi dari alamat IP. Cukup buka halaman, izinkan akses lokasi, dan cuaca di sekitar kamu langsung tampil.

## Fitur

- Cuaca saat ini: suhu, terasa seperti, kondisi, ringkasan insight cerdas, kelembapan & titik embun, kompas angin, barometer tekanan, tutupan awan, curah hujan, dan spektrum indeks UV.
- Prakiraan 24 jam ke depan dilengkapi grafik kurva gelombang suhu SVG & dukungan geser cepat (drag-to-scroll).
- Prakiraan 7 hari interaktif (klik baris hari untuk membuka detail terbit/terbenam, total curah hujan, UV maks, dan angin maksimum).
- Kualitas udara lengkap (European AQI, spektrum status, PM2.5, dan PM10).
- Jam digital hingga detik, zona waktu otomatis (WIB/WITA/WIT/UTC), dan tanggal lokal sesuai lokasi.
- Siklus posisi matahari & horizon (terbit, terbenam, persentase siang, dan panjang hari).
- Tema latar otomatis mengikuti kondisi cuaca dan waktu siang/malam.
- Latar langit animatif yang menyesuaikan cuaca: matahari bersinar saat cerah, awan bergerak saat berawan, garis hujan saat hujan/gerimis, salju saat salju, kabut saat berkabut, dan kilat saat badai.
- Posisi matahari/bulan mengikuti jam lokal, terbit, dan terbenam; ada cahaya keemasan saat fajar/senja serta bintang dan meteor saat malam cerah.
- Animasi otomatis meredup di layar kecil dan berhenti bagi pengguna yang mengaktifkan `prefers-reduced-motion`.
- Pencarian kota dengan geocoding, pintasan keyboard `/`, riwayat lokasi terakhir & kota populer, tombol "Lokasi saya", serta satuan °C/°F.
- Pembaruan otomatis tiap 10 menit, plus muat ulang manual.
- Desain Atmospheric Bento Grid yang responsif untuk ponsel, tablet, dan desktop.

## Menjalankan

Deteksi lokasi browser hanya bekerja pada **secure context**: `https://` atau `http://localhost`. Membuka `index.html` langsung lewat `file://` umumnya akan membuat izin lokasi gagal.

Jalankan server statis dari folder ini:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Lalu buka <http://localhost:4173>.

Alternatif tanpa Python:

```powershell
npx serve .
```

Saat pertama kali dibuka, browser akan meminta izin lokasi. Jika ditolak, halaman menampilkan pesan dan sementara memakai Jakarta sebagai lokasi cadangan. Klik **Lokasi saya** setelah izin diaktifkan untuk mencoba lagi.

## Struktur

```
index.html   Markup, ikon SVG, dan kerangka halaman
styles.css   Tema langit, efek cuaca animatif, tata letak, responsif
app.js       Geolocation, pengambilan data, render, pencarian, cache lokal
```

## Sumber data

- [Open-Meteo](https://open-meteo.com/) — prakiraan cuaca, geocoding, dan kualitas udara. Tanpa API key.
- [BigDataCloud](https://www.bigdatacloud.com/) — reverse geocoding untuk nama kota/provinsi. Tanpa API key.

Koordinat perangkat dikirim ke kedua layanan tersebut hanya untuk mengambil data cuaca dan nama tempat. Tidak ada backend, akun, atau API key di proyek ini. Lokasi terakhir dan preferensi satuan disimpan di `localStorage` perangkat.

## Kustomisasi cepat

- Lokasi cadangan: ubah `DEFAULT_PLACE` di `app.js`.
- Interval pembaruan: ubah `REFRESH_MS` di `app.js`.
- Jumlah hari prakiraan: ubah `forecast_days` pada `forecastURL()`.
- Warna tema: ubah variabel `--sky-*`, `--accent`, dan `--glow-*` per `body[data-theme="..."]` di `styles.css`.
- Efek cuaca: atur jumlah partikel di `buildWeatherParticles()` (`app.js`) dan gaya animasi per `body[data-sky="..."]` di `styles.css`.
