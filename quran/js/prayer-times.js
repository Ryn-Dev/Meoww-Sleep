/**
 * Jadwal Sholat Module (Al-Qur'anul Karim)
 * Menggunakan API Resmi equran.id (Sumber yang sama dengan Quran Player)
 * Fitur:
 * - Geolocation GPS browser user dengan reverse geocoding otomatis
 * - Fallback IP-based geolocation & fallback default DKI Jakarta jika akses GPS dibatasi
 * - Pemilihan manual Kota & Provinsi dari 34 provinsi dan 517 kabupaten/kota se-Indonesia
 * - Hitung mundur (live countdown) realtime menuju waktu sholat berikutnya
 * - Highlight visual kartu sholat aktif & berikutnya
 * - Modal jadwal sholat lengkap 1 bulan penuh
 * - Notifikasi & nada pengingat adzan/waktu sholat (Web Audio API)
 * - Cache offline di localStorage agar cepat & hemat kuota
 */

(function () {
  'use strict';

  // API Endpoints (equran.id)
  const PRAYER_API = {
    PROVINSI: 'https://equran.id/api/v2/shalat/provinsi',
    KABKOTA: 'https://equran.id/api/v2/shalat/kabkota',
    JADWAL: 'https://equran.id/api/v2/shalat'
  };

  // Daftar 34 Provinsi di Indonesia sesuai API equran.id
  const PROVINCES_LIST = [
    'Aceh', 'Bali', 'Banten', 'Bengkulu', 'D.I. Yogyakarta', 'DKI Jakarta',
    'Gorontalo', 'Jambi', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur',
    'Kalimantan Barat', 'Kalimantan Selatan', 'Kalimantan Tengah', 'Kalimantan Timur', 'Kalimantan Utara',
    'Kepulauan Bangka Belitung', 'Kepulauan Riau', 'Lampung', 'Maluku', 'Maluku Utara',
    'Nusa Tenggara Barat', 'Nusa Tenggara Timur', 'Papua', 'Papua Barat', 'Riau',
    'Sulawesi Barat', 'Sulawesi Selatan', 'Sulawesi Tengah', 'Sulawesi Tenggara', 'Sulawesi Utara',
    'Sumatera Barat', 'Sumatera Selatan', 'Sumatera Utara'
  ];

  // Metadata 8 Waktu Sholat & Waktu Penting
  const PRAYER_KEYS = [
    { key: 'imsak', name: 'Imsak', arabic: 'الإمساك', icon: 'fa-moon', isFardhu: false },
    { key: 'subuh', name: 'Subuh', arabic: 'الفجر', icon: 'fa-cloud-sun', isFardhu: true },
    { key: 'terbit', name: 'Terbit', arabic: 'الشروق', icon: 'fa-sun', isFardhu: false },
    { key: 'dhuha', name: 'Dhuha', arabic: 'الضحى', icon: 'fa-sun', isFardhu: false },
    { key: 'dzuhur', name: 'Dzuhur', arabic: 'الظهر', icon: 'fa-sun', isFardhu: true },
    { key: 'ashar', name: 'Ashar', arabic: 'العصر', icon: 'fa-cloud-sun', isFardhu: true },
    { key: 'maghrib', name: 'Maghrib', arabic: 'المغرب', icon: 'fa-cloud-moon', isFardhu: true },
    { key: 'isya', name: 'Isya', arabic: 'العشاء', icon: 'fa-moon', isFardhu: true }
  ];

  // Helper safe storage
  function safeGet(key, fallback = null) {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? val : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function safeSet(key, val) {
    try {
      localStorage.setItem(key, val);
    } catch (e) {}
  }

  // App State
  let currentProvince = safeGet('quran_prayer_province', 'DKI Jakarta');
  let currentCity = safeGet('quran_prayer_city', 'Kota Jakarta');
  let locationSource = safeGet('quran_prayer_source', 'default'); // 'gps' | 'manual' | 'ip' | 'default'
  let isSoundEnabled = safeGet('quran_prayer_sound', 'true') === 'true';
  let isWidgetCollapsed = safeGet('quran_prayer_collapsed', 'false') === 'true';

  let currentMonthlyData = null;
  let todaySchedule = null;
  let countdownInterval = null;
  let lastNotifiedPrayer = null;
  let kabkotaCache = {}; // { provinceName: [kabkotaList] }

  // DOM Elements References
  const els = {
    widget: document.getElementById('prayerTimesWidget'),
    widgetBody: document.getElementById('prayerWidgetBody'),
    toggleCollapseBtn: document.getElementById('togglePrayerCollapseBtn'),
    collapseIcon: document.getElementById('prayerCollapseIcon'),
    currentLocationText: document.getElementById('prayerLocationText'),
    locationSourceBadge: document.getElementById('prayerSourceBadge'),
    prayerDateText: document.getElementById('prayerDateText'),
    hijriDateText: document.getElementById('prayerHijriDateText'),
    changeLocationBtn: document.getElementById('changePrayerLocationBtn'),
    detectGpsBtn: document.getElementById('detectPrayerGpsBtn'),
    monthlyBtn: document.getElementById('viewMonthlyPrayerBtn'),
    soundToggleBtn: document.getElementById('prayerSoundToggleBtn'),
    soundIcon: document.getElementById('prayerSoundIcon'),
    cardsContainer: document.getElementById('prayerCardsContainer'),
    loadingState: document.getElementById('prayerLoadingState'),
    contentState: document.getElementById('prayerContentState'),
    errorState: document.getElementById('prayerErrorState'),
    errorMessage: document.getElementById('prayerErrorMessage'),
    retryBtn: document.getElementById('retryPrayerBtn'),

    // Next prayer countdown elements
    nextPrayerName: document.getElementById('nextPrayerName'),
    nextPrayerTime: document.getElementById('nextPrayerTime'),
    nextPrayerDiff: document.getElementById('nextPrayerCountdown'),
    nextPrayerArabic: document.getElementById('nextPrayerArabic'),

    // Compact bar when collapsed
    collapsedBar: document.getElementById('prayerCollapsedBar'),
    collapsedText: document.getElementById('prayerCollapsedText'),

    // Location Modal Elements
    locationModal: document.getElementById('prayerLocationModal'),
    closeLocationModalBtn: document.getElementById('closePrayerLocationModalBtn'),
    modalGpsBtn: document.getElementById('modalPrayerGpsBtn'),
    modalProvSelect: document.getElementById('modalPrayerProvSelect'),
    modalCitySelect: document.getElementById('modalPrayerCitySelect'),
    modalCitySearch: document.getElementById('modalPrayerCitySearch'),
    saveLocationBtn: document.getElementById('savePrayerLocationBtn'),
    modalLocationLoading: document.getElementById('modalLocationLoading'),

    // Monthly Schedule Modal Elements
    monthlyModal: document.getElementById('prayerMonthlyModal'),
    closeMonthlyModalBtn: document.getElementById('closePrayerMonthlyModalBtn'),
    monthlyTitle: document.getElementById('monthlyModalTitle'),
    monthlyMonthSelect: document.getElementById('monthlyMonthSelect'),
    monthlyYearSelect: document.getElementById('monthlyYearSelect'),
    monthlyTableBody: document.getElementById('monthlyTableBody'),
    monthlyLoading: document.getElementById('monthlyLoading')
  };

  // ==========================================
  // WEB AUDIO API PLEASANT CHIME / ADZAN TONE
  // ==========================================
  function playPrayerNotificationSound() {
    if (!isSoundEnabled) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const tones = [
        { freq: 523.25, time: 0.0, dur: 0.6 },  // C5
        { freq: 659.25, time: 0.3, dur: 0.6 },  // E5
        { freq: 783.99, time: 0.6, dur: 0.8 },  // G5
        { freq: 1046.50, time: 1.0, dur: 1.2 }  // C6
      ];

      tones.forEach(t => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(t.freq, ctx.currentTime + t.time);

        gain.gain.setValueAtTime(0, ctx.currentTime + t.time);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + t.time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t.time + t.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + t.time);
        osc.stop(ctx.currentTime + t.time + t.dur);
      });
    } catch (e) {
      console.warn('Audio tone play failed:', e);
    }
  }

  // ==========================================
  // GEOLOCATION & REVERSE GEOCODING
  // ==========================================

  function normalizeName(str) {
    return (str || '')
      .toLowerCase()
      .replace(/^(provinsi|prov\.|daerah istimewa|d\.i\.|dki)\s+/i, '')
      .replace(/[^a-z0-9]/g, '');
  }

  function matchProvince(rawProv, adminList = []) {
    const candidates = [rawProv, ...(adminList || [])].filter(Boolean);

    for (const c of candidates) {
      const norm = normalizeName(c);
      for (const p of PROVINCES_LIST) {
        const pNorm = normalizeName(p);
        if (norm === pNorm || norm.includes(pNorm) || pNorm.includes(norm)) {
          return p;
        }
      }
    }
    return 'DKI Jakarta';
  }

  function matchCity(rawCity, kabkotaList = [], adminList = []) {
    if (!kabkotaList || kabkotaList.length === 0) return 'Kota Jakarta';

    const cleanRaw = (rawCity || '').toLowerCase().trim();
    const isKotaExpected = cleanRaw.includes('kota');

    const searchWords = [rawCity, ...(adminList || [])]
      .filter(Boolean)
      .map(w => w.toLowerCase().replace(/^(kota|kab\.|kabupaten)\s+/i, '').trim());

    // 1. Exact match with prefix
    for (const k of kabkotaList) {
      if (k.toLowerCase() === cleanRaw) return k;
    }

    // 2. Exact word match without prefix
    for (const word of searchWords) {
      if (!word || word.length < 3) continue;
      const matches = kabkotaList.filter(k => {
        const kWord = k.toLowerCase().replace(/^(kota|kab\.|kabupaten)\s+/i, '').trim();
        return kWord === word;
      });

      if (matches.length === 1) return matches[0];
      if (matches.length > 1) {
        // Prefer Kota if expected or general, otherwise first
        const kotaMatch = matches.find(m => m.startsWith('Kota'));
        return isKotaExpected ? (kotaMatch || matches[0]) : (matches.find(m => m.startsWith('Kab.')) || matches[0]);
      }
    }

    // 3. Partial substring match
    for (const word of searchWords) {
      if (!word || word.length < 3) continue;
      const found = kabkotaList.find(k => {
        const kWord = k.toLowerCase().replace(/^(kota|kab\.|kabupaten)\s+/i, '').trim();
        return kWord.includes(word) || word.includes(kWord);
      });
      if (found) return found;
    }

    return kabkotaList[0];
  }

  async function reverseGeocodeCoords(lat, lon) {
    // 1. Coba BigDataCloud (Cepat, gratis, mendukung nama administratif Indonesia)
    try {
      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`, {
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const data = await res.json();
        const city = data.city || data.locality || '';
        const adminNames = (data.localityInfo?.administrative || []).map(a => a.name);
        return { city, adminNames };
      }
    } catch (e) {
      console.warn('BigDataCloud geocode failed, trying OSM Nominatim...', e);
    }

    // 2. Fallback ke OpenStreetMap Nominatim
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
        headers: { 'User-Agent': 'MeowwQuranApp/1.0' },
        signal: AbortSignal.timeout(6000)
      });
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const city = addr.city || addr.town || addr.municipality || addr.county || addr.state_district || '';
        const adminNames = [addr.state, addr.region, city].filter(Boolean);
        return { city, adminNames };
      }
    } catch (e) {
      console.warn('Nominatim geocode failed:', e);
    }

    return null;
  }

  async function detectLocationViaIP() {
    try {
      const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.country_code === 'ID') {
          return {
            city: data.city || 'Jakarta',
            adminNames: [data.region, data.city].filter(Boolean)
          };
        }
      }
    } catch (e) {
      console.warn('IP geolocation failed:', e);
    }
    return null;
  }

  async function autoDetectUserLocation(isUserInitiated = false) {
    if (isUserInitiated) {
      showToast('Sedang meminta izin GPS dan membaca koordinat Anda...', 'info');
    }

    return new Promise(async (resolve) => {
      if (!('geolocation' in navigator)) {
        if (isUserInitiated) showToast('Browser Anda tidak mendukung Geolocation GPS.', 'warning');
        resolve(await fallbackDetection(isUserInitiated));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          try {
            const geoResult = await reverseGeocodeCoords(lat, lon);
            if (geoResult) {
              const matchedProv = matchProvince(null, geoResult.adminNames);
              const citiesList = await fetchKabkotaList(matchedProv);
              const matchedCity = matchCity(geoResult.city, citiesList, geoResult.adminNames);

              currentProvince = matchedProv;
              currentCity = matchedCity;
              locationSource = 'gps';

              safeSet('quran_prayer_province', currentProvince);
              safeSet('quran_prayer_city', currentCity);
              safeSet('quran_prayer_source', 'gps');

              if (isUserInitiated) {
                showToast(`📍 Lokasi GPS terdeteksi: ${currentCity}, ${currentProvince}`, 'success');
              }
              resolve({ province: currentProvince, city: currentCity, source: 'gps' });
              return;
            }
          } catch (e) {
            console.error('Error during reverse geocoding:', e);
          }

          resolve(await fallbackDetection(isUserInitiated));
        },
        async (error) => {
          console.warn('Geolocation permission or error:', error.message);
          if (isUserInitiated) {
            if (error.code === error.PERMISSION_DENIED) {
              showToast('Izin GPS ditolak. Silakan pilih lokasi secara manual.', 'warning');
            } else {
              showToast('GPS tidak dapat diakses saat ini. Mencoba deteksi IP...', 'info');
            }
          }
          resolve(await fallbackDetection(isUserInitiated));
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
      );
    });
  }

  async function fallbackDetection(isUserInitiated = false) {
    // Coba via IP
    const ipResult = await detectLocationViaIP();
    if (ipResult) {
      const matchedProv = matchProvince(null, ipResult.adminNames);
      const citiesList = await fetchKabkotaList(matchedProv);
      const matchedCity = matchCity(ipResult.city, citiesList, ipResult.adminNames);

      currentProvince = matchedProv;
      currentCity = matchedCity;
      locationSource = 'ip';

      safeSet('quran_prayer_province', currentProvince);
      safeSet('quran_prayer_city', currentCity);
      safeSet('quran_prayer_source', 'ip');

      if (isUserInitiated) {
        showToast(`📍 Lokasi terdeteksi (IP): ${currentCity}, ${currentProvince}`, 'info');
      }
      return { province: currentProvince, city: currentCity, source: 'ip' };
    }

    // Default ke DKI Jakarta jika belum pernah diset
    if (!currentProvince || !currentCity) {
      currentProvince = 'DKI Jakarta';
      currentCity = 'Kota Jakarta';
      locationSource = 'default';
      safeSet('quran_prayer_province', currentProvince);
      safeSet('quran_prayer_city', currentCity);
      safeSet('quran_prayer_source', 'default');
    }

    return { province: currentProvince, city: currentCity, source: locationSource };
  }

  // ==========================================
  // API FETCH FUNCTIONS
  // ==========================================

  async function fetchKabkotaList(province) {
    if (kabkotaCache[province] && kabkotaCache[province].length > 0) {
      return kabkotaCache[province];
    }

    try {
      const res = await fetch(PRAYER_API.KABKOTA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provinsi: province })
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (data && data.code === 200 && Array.isArray(data.data)) {
        kabkotaCache[province] = data.data;
        return data.data;
      }
    } catch (e) {
      console.error(`Gagal memuat kabkota untuk ${province}:`, e);
    }

    // Fallback jika API gagal
    return [currentCity || 'Kota Jakarta'];
  }

  async function fetchPrayerTimes(province, city, month, year) {
    const targetMonth = month || (new Date().getMonth() + 1);
    const targetYear = year || new Date().getFullYear();

    const cacheKey = `prayer_cache_${province}_${city}_${targetYear}_${targetMonth}`;
    const cached = safeGet(cacheKey);

    try {
      const res = await fetch(PRAYER_API.JADWAL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provinsi: province,
          kabkota: city,
          bulan: targetMonth,
          tahun: targetYear
        })
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();

      if (data && data.code === 200 && data.data && Array.isArray(data.data.jadwal)) {
        safeSet(cacheKey, JSON.stringify(data.data));
        return data.data;
      } else {
        throw new Error(data.message || 'Format data API tidak valid');
      }
    } catch (err) {
      console.warn('Gagal fetch jadwal sholat, mengecek cache offline...', err);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {}
      }
      throw err;
    }
  }

  // ==========================================
  // UI RENDERING
  // ==========================================

  function getHijriDate(date = new Date()) {
    try {
      // Intl format kalender Hijriah
      const formatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      return formatter.format(date);
    } catch (e) {
      return '';
    }
  }

  function getIndonesianDate(date = new Date()) {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  function renderPrayerCards(todayData, nextPrayerKey) {
    if (!els.cardsContainer || !todayData) return;

    els.cardsContainer.innerHTML = '';

    PRAYER_KEYS.forEach(item => {
      const timeVal = todayData[item.key] || '--:--';
      const isNext = item.key === nextPrayerKey;

      const card = document.createElement('div');
      card.className = `prayer-card rounded-2xl p-3 sm:p-3.5 flex flex-col items-center justify-between transition-all duration-300 relative select-none ${
        isNext
          ? 'prayer-card-active bg-gradient-to-b from-amber-500/25 via-slate-800 to-amber-500/10 border-2 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02] -translate-y-1'
          : 'bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 hover:border-slate-600'
      }`;

      card.innerHTML = `
        <!-- Header: Nama Sholat & Badge -->
        <div class="w-full flex items-center justify-between mb-1.5">
          <span class="text-xs font-bold tracking-wide uppercase ${isNext ? 'text-amber-300' : 'text-slate-300'}">
            ${item.name}
          </span>
          <span class="font-arabic text-xs sm:text-sm ${isNext ? 'text-amber-400 font-bold' : 'text-slate-400'}">
            ${item.arabic}
          </span>
        </div>

        <!-- Jam Waktu Sholat -->
        <div class="my-1 text-center">
          <div class="font-mono text-lg sm:text-xl font-extrabold ${isNext ? 'text-amber-300 text-glow-gold' : 'text-white'}">
            ${timeVal}
          </div>
        </div>

        <!-- Footer Icon & Status -->
        <div class="w-full pt-1 border-t ${isNext ? 'border-amber-400/40' : 'border-slate-700/60'} flex items-center justify-between text-[11px]">
          <i class="fas ${item.icon} ${isNext ? 'text-amber-400' : 'text-slate-500'}"></i>
          ${
            isNext
              ? '<span class="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded-full animate-pulse">Berikutnya</span>'
              : `<span class="text-slate-500 text-[10px]">${item.isFardhu ? 'Fardhu' : 'Sunnah'}</span>`
          }
        </div>
      `;

      els.cardsContainer.appendChild(card);
    });
  }

  function calculateNextPrayer(todayData) {
    if (!todayData) return null;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const currentSeconds = now.getSeconds();
    const totalCurrentSec = currentMinutes * 60 + currentSeconds;

    // Cari jadwal sholat berikutnya hari ini
    for (const item of PRAYER_KEYS) {
      const timeStr = todayData[item.key];
      if (!timeStr) continue;

      const [hh, mm] = timeStr.split(':').map(Number);
      const targetSec = (hh * 60 + mm) * 60;

      if (targetSec > totalCurrentSec) {
        const diffSec = targetSec - totalCurrentSec;
        return {
          item,
          time: timeStr,
          diffSec,
          isTomorrow: false
        };
      }
    }

    // Jika semua waktu hari ini sudah lewat (setelah Isya), maka sholat berikutnya adalah Imsak/Subuh besok
    const tomorrowImsak = todayData['imsak'] || '04:15';
    const [hh, mm] = tomorrowImsak.split(':').map(Number);
    const tomorrowSec = (24 * 60 * 60) - totalCurrentSec + (hh * 60 + mm) * 60;

    return {
      item: PRAYER_KEYS[0], // Imsak
      time: tomorrowImsak,
      diffSec: tomorrowSec,
      isTomorrow: true
    };
  }

  function formatCountdown(seconds) {
    if (seconds <= 0) return '00:00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);

    const tick = () => {
      if (!todaySchedule) return;

      const next = calculateNextPrayer(todaySchedule);
      if (!next) return;

      const formatted = formatCountdown(next.diffSec);

      // Update banner
      if (els.nextPrayerName) els.nextPrayerName.textContent = next.item.name + (next.isTomorrow ? ' (Besok)' : '');
      if (els.nextPrayerTime) els.nextPrayerTime.textContent = next.time;
      if (els.nextPrayerDiff) els.nextPrayerDiff.textContent = '-' + formatted;
      if (els.nextPrayerArabic) els.nextPrayerArabic.textContent = next.item.arabic;

      // Update collapsed bar text
      if (els.collapsedText) {
        els.collapsedText.innerHTML = `Berikutnya: <strong class="text-amber-400 font-bold">${next.item.name} ${next.time}</strong> • Sisa <span class="font-mono text-amber-300">-${formatted}</span> • ${currentCity}`;
      }

      // Check jika tepat waktu sholat tiba (0 detik tersisa)
      if (next.diffSec === 0) {
        handlePrayerTimeReached(next.item.name);
      }
    };

    tick();
    countdownInterval = setInterval(tick, 1000);
  }

  function handlePrayerTimeReached(prayerName) {
    if (lastNotifiedPrayer === prayerName) return;
    lastNotifiedPrayer = prayerName;

    playPrayerNotificationSound();

    showToast(`🕌 Telah masuk waktu sholat ${prayerName} untuk ${currentCity} dan sekitarnya.`, 'info');

    // Trigger update kartu sholat
    setTimeout(() => {
      if (todaySchedule) {
        const next = calculateNextPrayer(todaySchedule);
        renderPrayerCards(todaySchedule, next ? next.item.key : null);
      }
    }, 1500);
  }

  function updateWidgetUI(data) {
    if (!data || !Array.isArray(data.jadwal)) return;

    currentMonthlyData = data;
    const todayDateNum = new Date().getDate();
    todaySchedule = data.jadwal.find(j => j.tanggal === todayDateNum) || data.jadwal[0];

    // Info Lokasi
    if (els.currentLocationText) {
      els.currentLocationText.textContent = `${currentCity}, ${currentProvince}`;
    }

    if (els.locationSourceBadge) {
      if (locationSource === 'gps') {
        els.locationSourceBadge.innerHTML = '<i class="fas fa-satellite-dish text-[10px] text-emerald-400 mr-1"></i>GPS';
        els.locationSourceBadge.className = 'text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300';
      } else if (locationSource === 'ip') {
        els.locationSourceBadge.innerHTML = '<i class="fas fa-network-wired text-[10px] text-sky-400 mr-1"></i>IP';
        els.locationSourceBadge.className = 'text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300';
      } else {
        els.locationSourceBadge.innerHTML = '<i class="fas fa-sliders text-[10px] text-amber-400 mr-1"></i>Manual';
        els.locationSourceBadge.className = 'text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300';
      }
    }

    // Tanggal Masehi & Hijriah
    if (els.prayerDateText) {
      els.prayerDateText.textContent = getIndonesianDate();
    }
    if (els.hijriDateText) {
      const hijri = getHijriDate();
      els.hijriDateText.textContent = hijri ? `• ${hijri}` : '';
    }

    // Hitung waktu sholat berikutnya
    const nextPrayer = calculateNextPrayer(todaySchedule);
    renderPrayerCards(todaySchedule, nextPrayer ? nextPrayer.item.key : null);

    // Mulai hitung mundur realtime
    startCountdown();

    // Toggle tampilan loading / content
    if (els.loadingState) els.loadingState.classList.add('hidden');
    if (els.errorState) els.errorState.classList.add('hidden');
    if (els.contentState) els.contentState.classList.remove('hidden');
  }

  function showLoading(show) {
    if (els.loadingState && els.contentState && els.errorState) {
      if (show) {
        els.loadingState.classList.remove('hidden');
        els.contentState.classList.add('hidden');
        els.errorState.classList.add('hidden');
      } else {
        els.loadingState.classList.add('hidden');
      }
    }
  }

  function showError(msg) {
    if (els.loadingState && els.contentState && els.errorState) {
      els.loadingState.classList.add('hidden');
      els.contentState.classList.add('hidden');
      els.errorState.classList.remove('hidden');
      if (els.errorMessage) {
        els.errorMessage.textContent = msg || 'Gagal memuat jadwal sholat.';
      }
    }
  }

  function showToast(message, type = 'info') {
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: type,
        title: message,
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        background: '#1e293b',
        color: '#f8fafc'
      });
    } else {
      console.log(`[Toast ${type}]`, message);
    }
  }

  // ==========================================
  // COLLAPSE / EXPAND WIDGET
  // ==========================================
  function setWidgetCollapsed(collapsed) {
    isWidgetCollapsed = collapsed;
    safeSet('quran_prayer_collapsed', collapsed ? 'true' : 'false');

    if (els.widgetBody && els.collapsedBar && els.collapseIcon) {
      if (collapsed) {
        els.widgetBody.classList.add('hidden');
        els.collapsedBar.classList.remove('hidden');
        els.collapseIcon.className = 'fas fa-chevron-down text-xs';
      } else {
        els.widgetBody.classList.remove('hidden');
        els.collapsedBar.classList.add('hidden');
        els.collapseIcon.className = 'fas fa-chevron-up text-xs';
      }
    }
  }

  // ==========================================
  // LOCATION MODAL LOGIC
  // ==========================================

  function populateProvinceDropdown() {
    if (!els.modalProvSelect) return;
    els.modalProvSelect.innerHTML = '';

    PROVINCES_LIST.forEach(prov => {
      const opt = document.createElement('option');
      opt.value = prov;
      opt.textContent = prov;
      if (prov === currentProvince) opt.selected = true;
      els.modalProvSelect.appendChild(opt);
    });
  }

  async function loadCitiesForSelectedProvince(selectedProv, selectCityName = null) {
    if (!els.modalCitySelect) return;

    els.modalCitySelect.disabled = true;
    if (els.modalLocationLoading) els.modalLocationLoading.classList.remove('hidden');

    try {
      const cities = await fetchKabkotaList(selectedProv);
      els.modalCitySelect.innerHTML = '';

      cities.forEach(city => {
        const opt = document.createElement('option');
        opt.value = city;
        opt.textContent = city;
        if (selectCityName && city === selectCityName) {
          opt.selected = true;
        } else if (!selectCityName && city === currentCity) {
          opt.selected = true;
        }
        els.modalCitySelect.appendChild(opt);
      });
    } catch (e) {
      console.error('Error loading cities for modal:', e);
    } finally {
      els.modalCitySelect.disabled = false;
      if (els.modalLocationLoading) els.modalLocationLoading.classList.add('hidden');
    }
  }

  function openLocationModal() {
    if (!els.locationModal) return;

    populateProvinceDropdown();
    loadCitiesForSelectedProvince(currentProvince, currentCity);

    if (els.modalCitySearch) els.modalCitySearch.value = '';

    els.locationModal.showModal();
  }

  function closeLocationModal() {
    if (els.locationModal) els.locationModal.close();
  }

  // ==========================================
  // MONTHLY SCHEDULE MODAL
  // ==========================================

  async function openMonthlyModal() {
    if (!els.monthlyModal) return;

    const now = new Date();
    const currMonth = now.getMonth() + 1;
    const currYear = now.getFullYear();

    if (els.monthlyMonthSelect) els.monthlyMonthSelect.value = currMonth;
    if (els.monthlyYearSelect) els.monthlyYearSelect.value = currYear;

    els.monthlyModal.showModal();
    await loadMonthlyTable(currMonth, currYear);
  }

  function closeMonthlyModal() {
    if (els.monthlyModal) els.monthlyModal.close();
  }

  async function loadMonthlyTable(month, year) {
    if (!els.monthlyTableBody) return;

    if (els.monthlyLoading) els.monthlyLoading.classList.remove('hidden');
    els.monthlyTableBody.innerHTML = '';

    const monthNames = [
      '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    if (els.monthlyTitle) {
      els.monthlyTitle.textContent = `Jadwal Sholat ${monthNames[month]} ${year} - ${currentCity}, ${currentProvince}`;
    }

    try {
      let data = currentMonthlyData;
      // Fetch jika bukan bulan yang sedang aktif
      if (!data || data.bulan !== parseInt(month) || data.tahun !== parseInt(year) || data.kabkota !== currentCity) {
        data = await fetchPrayerTimes(currentProvince, currentCity, month, year);
      }

      if (data && Array.isArray(data.jadwal)) {
        const todayNum = new Date().getDate();
        const isCurrentMonthNow = new Date().getMonth() + 1 === parseInt(month) && new Date().getFullYear() === parseInt(year);

        data.jadwal.forEach(day => {
          const isToday = isCurrentMonthNow && day.tanggal === todayNum;
          const tr = document.createElement('tr');
          tr.className = `border-b border-slate-700/60 transition ${
            isToday ? 'bg-amber-500/20 font-bold text-amber-300' : 'hover:bg-slate-800/70 text-slate-200'
          }`;

          tr.innerHTML = `
            <td class="px-3 py-2.5 text-center font-mono ${isToday ? 'text-amber-400 font-extrabold' : 'text-slate-400'}">
              ${day.tanggal} ${isToday ? '<span class="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded ml-1">HARI INI</span>' : ''}
            </td>
            <td class="px-3 py-2.5">${day.hari}</td>
            <td class="px-3 py-2.5 font-mono text-center">${day.imsak}</td>
            <td class="px-3 py-2.5 font-mono text-center">${day.subuh}</td>
            <td class="px-3 py-2.5 font-mono text-center">${day.terbit}</td>
            <td class="px-3 py-2.5 font-mono text-center">${day.dhuha}</td>
            <td class="px-3 py-2.5 font-mono text-center">${day.dzuhur}</td>
            <td class="px-3 py-2.5 font-mono text-center">${day.ashar}</td>
            <td class="px-3 py-2.5 font-mono text-center">${day.maghrib}</td>
            <td class="px-3 py-2.5 font-mono text-center">${day.isya}</td>
          `;

          els.monthlyTableBody.appendChild(tr);
        });
      }
    } catch (e) {
      els.monthlyTableBody.innerHTML = `
        <tr>
          <td colspan="10" class="text-center py-8 text-rose-400 text-sm">
            <i class="fas fa-triangle-exclamation mr-2"></i> Gagal memuat jadwal bulanan: ${e.message}
          </td>
        </tr>
      `;
    } finally {
      if (els.monthlyLoading) els.monthlyLoading.classList.add('hidden');
    }
  }

  // ==========================================
  // EVENT LISTENERS & HOOKS
  // ==========================================

  function bindEvents() {
    // Tombol Ganti Lokasi (Buka Modal)
    if (els.changeLocationBtn) {
      els.changeLocationBtn.addEventListener('click', openLocationModal);
    }

    // Tombol Deteksi GPS di Widget
    if (els.detectGpsBtn) {
      els.detectGpsBtn.addEventListener('click', async () => {
        showLoading(true);
        const loc = await autoDetectUserLocation(true);
        try {
          const data = await fetchPrayerTimes(loc.province, loc.city);
          updateWidgetUI(data);
        } catch (e) {
          showError(e.message);
        }
      });
    }

    // Tombol GPS di Dalam Modal
    if (els.modalGpsBtn) {
      els.modalGpsBtn.addEventListener('click', async () => {
        closeLocationModal();
        showLoading(true);
        const loc = await autoDetectUserLocation(true);
        try {
          const data = await fetchPrayerTimes(loc.province, loc.city);
          updateWidgetUI(data);
        } catch (e) {
          showError(e.message);
        }
      });
    }

    // Modal Dropdown Provinsi Berubah
    if (els.modalProvSelect) {
      els.modalProvSelect.addEventListener('change', (e) => {
        loadCitiesForSelectedProvince(e.target.value);
      });
    }

    // Search filter di modal kota
    if (els.modalCitySearch && els.modalCitySelect) {
      els.modalCitySearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const options = els.modalCitySelect.options;
        for (let i = 0; i < options.length; i++) {
          const text = options[i].text.toLowerCase();
          options[i].hidden = query && !text.includes(query);
        }
      });
    }

    // Tombol Simpan Lokasi Manual
    if (els.saveLocationBtn) {
      els.saveLocationBtn.addEventListener('click', async () => {
        const selProv = els.modalProvSelect ? els.modalProvSelect.value : currentProvince;
        const selCity = els.modalCitySelect ? els.modalCitySelect.value : currentCity;

        if (!selCity) {
          showToast('Silakan pilih kota / kabupaten terlebih dahulu.', 'warning');
          return;
        }

        currentProvince = selProv;
        currentCity = selCity;
        locationSource = 'manual';

        safeSet('quran_prayer_province', currentProvince);
        safeSet('quran_prayer_city', currentCity);
        safeSet('quran_prayer_source', 'manual');

        closeLocationModal();
        showLoading(true);

        try {
          const data = await fetchPrayerTimes(currentProvince, currentCity);
          updateWidgetUI(data);
          showToast(`Lokasi diperbarui: ${currentCity}, ${currentProvince}`, 'success');
        } catch (e) {
          showError(e.message);
        }
      });
    }

    if (els.closeLocationModalBtn) {
      els.closeLocationModalBtn.addEventListener('click', closeLocationModal);
    }
    if (els.locationModal) {
      els.locationModal.addEventListener('click', (e) => {
        if (e.target === els.locationModal) closeLocationModal();
      });
    }

    // Jadwal Bulanan Modal
    if (els.monthlyBtn) {
      els.monthlyBtn.addEventListener('click', openMonthlyModal);
    }
    if (els.closeMonthlyModalBtn) {
      els.closeMonthlyModalBtn.addEventListener('click', closeMonthlyModal);
    }
    if (els.monthlyModal) {
      els.monthlyModal.addEventListener('click', (e) => {
        if (e.target === els.monthlyModal) closeMonthlyModal();
      });
    }
    if (els.monthlyMonthSelect) {
      els.monthlyMonthSelect.addEventListener('change', () => {
        loadMonthlyTable(els.monthlyMonthSelect.value, els.monthlyYearSelect.value);
      });
    }
    if (els.monthlyYearSelect) {
      els.monthlyYearSelect.addEventListener('change', () => {
        loadMonthlyTable(els.monthlyMonthSelect.value, els.monthlyYearSelect.value);
      });
    }

    // Sound Notification Toggle
    if (els.soundToggleBtn) {
      els.soundToggleBtn.addEventListener('click', () => {
        isSoundEnabled = !isSoundEnabled;
        safeSet('quran_prayer_sound', isSoundEnabled ? 'true' : 'false');
        updateSoundUI();
        if (isSoundEnabled) {
          playPrayerNotificationSound();
          showToast('Pengingat suara waktu sholat DIAKTIFKAN 🔔 (Tes suara diputar)', 'success');
        } else {
          showToast('Pengingat suara waktu sholat DINONAKTIFKAN 🔕', 'info');
        }
      });
    }

    // Widget Collapse Toggle
    if (els.toggleCollapseBtn) {
      els.toggleCollapseBtn.addEventListener('click', () => {
        setWidgetCollapsed(!isWidgetCollapsed);
      });
    }
    if (els.collapsedBar) {
      els.collapsedBar.addEventListener('click', () => {
        setWidgetCollapsed(false);
      });
    }

    // Retry Fetch Btn
    if (els.retryBtn) {
      els.retryBtn.addEventListener('click', async () => {
        showLoading(true);
        try {
          const data = await fetchPrayerTimes(currentProvince, currentCity);
          updateWidgetUI(data);
        } catch (e) {
          showError(e.message);
        }
      });
    }
  }

  function updateSoundUI() {
    if (els.soundIcon) {
      if (isSoundEnabled) {
        els.soundIcon.className = 'fas fa-bell text-amber-400';
        if (els.soundToggleBtn) els.soundToggleBtn.title = 'Pengingat Suara Aktif (Klik untuk Matikan)';
      } else {
        els.soundIcon.className = 'fas fa-bell-slash text-slate-500';
        if (els.soundToggleBtn) els.soundToggleBtn.title = 'Pengingat Suara Mati (Klik untuk Nyalakan)';
      }
    }
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================

  async function initPrayerModule() {
    bindEvents();
    updateSoundUI();
    setWidgetCollapsed(isWidgetCollapsed);

    // Cek apakah lokasi sudah pernah disimpan di localStorage
    const savedProv = safeGet('quran_prayer_province');
    const savedCity = safeGet('quran_prayer_city');

    showLoading(true);

    if (savedProv && savedCity) {
      currentProvince = savedProv;
      currentCity = savedCity;

      try {
        const data = await fetchPrayerTimes(currentProvince, currentCity);
        updateWidgetUI(data);
      } catch (err) {
        showError(err.message);
      }
    } else {
      // Pertama kali akses: Lakukan deteksi lokasi user otomatis via GPS browser
      try {
        const loc = await autoDetectUserLocation(false);
        const data = await fetchPrayerTimes(loc.province, loc.city);
        updateWidgetUI(data);
      } catch (err) {
        showError(err.message);
      }
    }
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPrayerModule);
  } else {
    initPrayerModule();
  }

})();
