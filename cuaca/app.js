/* ============================================================
   Langit — Prakiraan Cuaca Realtime
   Lokasi perangkat (Geolocation API), data Open-Meteo & BigDataCloud.
   ============================================================ */
(() => {
  "use strict";

  const API = {
    forecast: "https://api.open-meteo.com/v1/forecast",
    air: "https://air-quality-api.open-meteo.com/v1/air-quality",
    geo: "https://geocoding-api.open-meteo.com/v1/search",
    reverse: "https://api.bigdatacloud.net/data/reverse-geocode-client"
  };

  const DEFAULT_PLACE = {
    name: "Jakarta",
    region: "DKI Jakarta",
    country: "Indonesia",
    latitude: -6.2088,
    longitude: 106.8456,
    source: "default"
  };

  const POPULAR_PLACES = [
    { name: "Jakarta", region: "DKI Jakarta", country: "Indonesia", latitude: -6.2088, longitude: 106.8456 },
    { name: "Bandung", region: "Jawa Barat", country: "Indonesia", latitude: -6.9175, longitude: 107.6191 },
    { name: "Surabaya", region: "Jawa Timur", country: "Indonesia", latitude: -7.2575, longitude: 112.7521 },
    { name: "Yogyakarta", region: "DI Yogyakarta", country: "Indonesia", latitude: -7.7956, longitude: 110.3695 },
    { name: "Denpasar", region: "Bali", country: "Indonesia", latitude: -8.6705, longitude: 115.2126 },
    { name: "Makassar", region: "Sulawesi Selatan", country: "Indonesia", latitude: -5.1477, longitude: 119.4327 }
  ];

  const STORE_KEY = "langit.v1";
  const REFRESH_MS = 10 * 60 * 1000;
  const MAX_RECENT = 5;

  const WMO_LABELS = {
    0: "Cerah",
    1: "Sebagian besar cerah",
    2: "Berawan sebagian",
    3: "Mendung",
    45: "Kabut",
    48: "Kabut berembun",
    51: "Gerimis ringan",
    53: "Gerimis",
    55: "Gerimis lebat",
    56: "Gerimis membeku ringan",
    57: "Gerimis membeku",
    61: "Hujan ringan",
    63: "Hujan sedang",
    65: "Hujan lebat",
    66: "Hujan membeku ringan",
    67: "Hujan membeku",
    71: "Salju ringan",
    73: "Salju sedang",
    75: "Salju lebat",
    77: "Butiran salju",
    80: "Hujan lokal ringan",
    81: "Hujan lokal sedang",
    82: "Hujan lokal lebat",
    85: "Hujan salju ringan",
    86: "Hujan salju lebat",
    95: "Badai petir",
    96: "Badai petir dengan hujan es",
    99: "Badai petir dengan hujan es lebat"
  };

  const THEME_COLORS = {
    "clear-day": "#0c56a6",
    "clear-night": "#081533",
    "cloudy-day": "#354c63",
    "cloudy-night": "#141f2e",
    "rain-day": "#0d3a54",
    "rain-night": "#071e30",
    "snow-day": "#3f5c79",
    "snow-night": "#13273b",
    "thunder-day": "#281645",
    "thunder-night": "#160c29",
    "fog-day": "#3f4d58",
    "fog-night": "#19232d"
  };

  const $ = (selector) => document.querySelector(selector);

  const el = {
    loader: $("#loader"),
    loaderText: $("#loaderText"),
    banner: $("#banner"),
    bannerText: $("#bannerText"),
    bannerIcon: $("#bannerIcon"),
    bannerAction: $("#bannerAction"),
    bannerClose: $("#bannerClose"),
    searchForm: $("#searchForm"),
    searchInput: $("#searchInput"),
    searchClear: $("#searchClear"),
    searchKbd: $("#searchKbd"),
    searchResults: $("#searchResults"),
    locateBtn: $("#locateBtn"),
    unitButtons: Array.from(document.querySelectorAll("[data-unit]")),
    placeBadge: $("#placeBadge"),
    placeCoords: $("#placeCoords"),
    placeName: $("#placeName"),
    placeMeta: $("#placeMeta"),
    heroIcon: $("#heroIcon"),
    tempValue: $("#tempValue"),
    tempUnit: $("#tempUnit"),
    conditionText: $("#conditionText"),
    feelsLike: $("#feelsLike"),
    todayRange: $("#todayRange"),
    weatherInsightText: $("#weatherInsightText"),
    heroPills: $("#heroPills"),
    tzBadge: $("#tzBadge"),
    localClock: $("#localClock"),
    localSeconds: $("#localSeconds"),
    localDate: $("#localDate"),
    updatedAt: $("#updatedAt"),
    refreshBtn: $("#refreshBtn"),
    windArrow: $("#windArrow"),
    windValue: $("#windValue"),
    windBar: $("#windBar"),
    windNote: $("#windNote"),
    humidityValue: $("#humidityValue"),
    humidityBar: $("#humidityBar"),
    humidityNote: $("#humidityNote"),
    uvValue: $("#uvValue"),
    uvMarker: $("#uvMarker"),
    uvNote: $("#uvNote"),
    pressureValue: $("#pressureValue"),
    pressureMarker: $("#pressureMarker"),
    pressureNote: $("#pressureNote"),
    cloudValue: $("#cloudValue"),
    cloudBar: $("#cloudBar"),
    cloudNote: $("#cloudNote"),
    rainValue: $("#rainValue"),
    rainBar: $("#rainBar"),
    rainNote: $("#rainNote"),
    aqiValue: $("#aqiValue"),
    aqiBadge: $("#aqiBadge"),
    aqiMarker: $("#aqiMarker"),
    aqiNote: $("#aqiNote"),
    pm25Value: $("#pm25Value"),
    pm10Value: $("#pm10Value"),
    sunCard: $(".sun-card"),
    daylightBadge: $("#daylightBadge"),
    sunArcProgress: $("#sunArcProgress"),
    sunDot: $("#sunDot"),
    sunDotHalo: $("#sunDotHalo"),
    sunriseValue: $("#sunriseValue"),
    sunsetValue: $("#sunsetValue"),
    sunNote: $("#sunNote"),
    hourly: $("#hourly"),
    hourPrev: $("#hourPrev"),
    hourNext: $("#hourNext"),
    daily: $("#daily"),
    metaTheme: $("#metaTheme"),
    fxRain: $("#fxRain"),
    fxSnow: $("#fxSnow")
  };

  const state = {
    unit: "c",
    place: null,
    recent: [],
    data: null,
    air: null,
    lastFetch: 0,
    requestId: 0,
    locating: false,
    clockTimer: null,
    bannerTimer: null,
    searchToken: 0,
    searchItems: [],
    searchMode: "geo",
    searchIndex: -1,
    openDayIndex: -1,
    celestialMinute: -1,
    geoPermissionStatus: null,
    geoAwaitingPermission: false
  };

  /* ---------------- Penyimpanan lokal ---------------- */

  function loadStore() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      return parsed;
    } catch {
      return null;
    }
  }

  function saveStore(patch) {
    try {
      const current = loadStore() || {};
      localStorage.setItem(STORE_KEY, JSON.stringify({ ...current, ...patch }));
    } catch {
      /* localStorage bisa diblokir — abaikan */
    }
  }

  function pushRecentPlace(place) {
    if (!place || place.latitude == null || place.longitude == null) return;
    if (place.source === "default") return;
    const entry = {
      name: place.name || "Lokasi",
      region: place.region || "",
      country: place.country || "",
      latitude: Number(place.latitude),
      longitude: Number(place.longitude),
      source: place.source || "search"
    };
    const filtered = state.recent.filter((item) => haversineKm(item, entry) >= 2);
    state.recent = [entry, ...filtered].slice(0, MAX_RECENT);
    saveStore({ recent: state.recent });
  }

  function removeRecentPlace(index) {
    state.recent.splice(index, 1);
    saveStore({ recent: state.recent });
    renderQuickLocations();
  }

  /* ---------------- Utilitas umum ---------------- */

  const round = (value) => Math.round(Number(value) || 0);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (char) => {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function weatherLabel(code) {
    return WMO_LABELS[code] || "Cuaca tidak diketahui";
  }

  function weatherVisual(code, isDay = 1) {
    const day = Boolean(Number(isDay));
    if (code === 0 || code === 1) {
      return { icon: day ? "sun" : "moon", sky: "clear", theme: day ? "clear-day" : "clear-night" };
    }
    if (code === 2) {
      return { icon: day ? "cloud-sun" : "cloud-moon", sky: "cloudy", theme: day ? "cloudy-day" : "cloudy-night" };
    }
    if (code === 3) {
      return { icon: "overcast", sky: "cloudy", theme: day ? "cloudy-day" : "cloudy-night" };
    }
    if (code === 45 || code === 48) {
      return { icon: "fog", sky: "fog", theme: day ? "fog-day" : "fog-night" };
    }
    if ([51, 53, 55, 56, 57].includes(code)) {
      return { icon: "drizzle", sky: "drizzle", theme: day ? "rain-day" : "rain-night" };
    }
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
      return { icon: "rain", sky: "rain", theme: day ? "rain-day" : "rain-night" };
    }
    if ([71, 73, 75, 77, 85, 86].includes(code)) {
      return { icon: "snow", sky: "snow", theme: day ? "snow-day" : "snow-night" };
    }
    if ([95, 96, 99].includes(code)) {
      return { icon: "thunder", sky: "thunder", theme: day ? "thunder-day" : "thunder-night" };
    }
    return { icon: day ? "cloud-sun" : "cloud-moon", sky: "cloudy", theme: day ? "cloudy-day" : "cloudy-night" };
  }

  function iconSVG(icon, extraClass = "") {
    return '<svg class="wx ' + extraClass + '" viewBox="0 0 64 64" aria-hidden="true" focusable="false">' +
      '<use href="#i-' + icon + '"></use></svg>';
  }

  function lineIcon(name) {
    return '<svg class="icon" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';
  }

  function fmtTemp(celsius) {
    if (celsius == null || Number.isNaN(Number(celsius))) return "—";
    const value = state.unit === "f" ? Number(celsius) * 9 / 5 + 32 : Number(celsius);
    return String(Math.round(value));
  }

  function fmtTempNumber(celsius) {
    if (celsius == null || Number.isNaN(Number(celsius))) return 0;
    const value = state.unit === "f" ? Number(celsius) * 9 / 5 + 32 : Number(celsius);
    return Math.round(value);
  }

  function tempUnitLabel() {
    return state.unit === "f" ? "°F" : "°C";
  }

  function dewPointCelsius(tempC, humidity) {
    const t = Number(tempC);
    const rh = clamp(Number(humidity) || 50, 1, 100);
    if (Number.isNaN(t)) return null;
    const a = 17.27;
    const b = 237.7;
    const gamma = (a * t) / (b + t) + Math.log(rh / 100);
    return (b * gamma) / (a - gamma);
  }

  function hhmm(iso) {
    if (!iso || iso.length < 16) return "—";
    return iso.slice(11, 16).replace(":", ".");
  }

  function dateParts(iso) {
    const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function shortDate(iso) {
    try {
      return dateParts(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    } catch {
      return iso.slice(8, 10);
    }
  }

  function weekdayName(iso) {
    try {
      return dateParts(iso).toLocaleDateString("id-ID", { weekday: "long" });
    } catch {
      return shortDate(iso);
    }
  }

  function minutesOfDay(iso) {
    if (!iso || iso.length < 16) return 0;
    const [hour, minute] = iso.slice(11, 16).split(":").map(Number);
    return hour * 60 + minute;
  }

  function formatCoords(lat, lon) {
    if (lat == null || lon == null || Number.isNaN(Number(lat)) || Number.isNaN(Number(lon))) return "";
    const latNum = Number(lat);
    const lonNum = Number(lon);
    const latDir = latNum < 0 ? "LS" : "LU";
    const lonDir = lonNum < 0 ? "BB" : "BT";
    return Math.abs(latNum).toFixed(2) + "° " + latDir + " · " + Math.abs(lonNum).toFixed(2) + "° " + lonDir;
  }

  function formatTimezoneBadge(tzName, offsetSeconds) {
    const sec = Number(offsetSeconds) || 0;
    const sign = sec >= 0 ? "+" : "-";
    const absMin = Math.round(Math.abs(sec) / 60);
    const h = Math.floor(absMin / 60);
    const m = absMin % 60;
    const utc = "UTC" + sign + h + (m ? ":" + String(m).padStart(2, "0") : "");
    const tz = String(tzName || "");
    if (tz === "Asia/Jakarta" || tz === "Asia/Pontianak") return "WIB · " + utc;
    if (tz === "Asia/Makassar") return "WITA · " + utc;
    if (tz === "Asia/Jayapura") return "WIT · " + utc;
    return utc;
  }

  function relativeTime(timestamp) {
    if (!timestamp) return "—";
    const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    if (seconds < 45) return "baru saja";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + " menit lalu";
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + " jam lalu";
    return Math.floor(hours / 24) + " hari lalu";
  }

  function directionLabel(degrees) {
    const names = ["U", "TL", "T", "TG", "S", "BD", "B", "BL"];
    const index = Math.round((((Number(degrees) || 0) % 360) + 360) % 360 / 45) % 8;
    return names[index];
  }

  function uvCategory(value) {
    const v = Number(value) || 0;
    if (v < 3) return { label: "Rendah", color: "#4ade80" };
    if (v < 6) return { label: "Sedang", color: "#facc15" };
    if (v < 8) return { label: "Tinggi", color: "#fb923c" };
    if (v < 11) return { label: "Sangat tinggi", color: "#f87171" };
    return { label: "Ekstrem", color: "#c084fc" };
  }

  function aqiCategory(value) {
    const v = Number(value);
    if (Number.isNaN(v)) return null;
    if (v <= 20) return { label: "Baik", color: "#4ade80", desc: "Udara segar, ideal untuk beraktivitas di luar" };
    if (v <= 40) return { label: "Cukup baik", color: "#a3e635", desc: "Kualitas udara aman bagi mayoritas orang" };
    if (v <= 60) return { label: "Sedang", color: "#facc15", desc: "Kelompok sensitif sebaiknya membatasi aktivitas berat" };
    if (v <= 80) return { label: "Buruk", color: "#fb923c", desc: "Kurangi durasi aktivitas fisik di luar ruangan" };
    if (v <= 100) return { label: "Sangat buruk", color: "#f87171", desc: "Disarankan memakai masker saat berada di luar" };
    return { label: "Ekstrem", color: "#c084fc", desc: "Hindari paparan udara luar sebisa mungkin" };
  }

  function cloudLabel(value) {
    const v = Number(value) || 0;
    if (v < 15) return "Langit cerah terbuka";
    if (v < 45) return "Sedikit berawan";
    if (v < 80) return "Berawan merata";
    return "Langit mendung tebal";
  }

  function humidityLabel(value) {
    const v = Number(value) || 0;
    if (v < 35) return "Udara cukup kering";
    if (v < 65) return "Kelembapan nyaman";
    if (v < 85) return "Udara terasa lembap";
    return "Sangat lembap";
  }

  function pressureLabel(value) {
    const v = Number(value) || 1013;
    if (v < 1006) return "Tekanan rendah · potensi awan/hujan";
    if (v > 1020) return "Tekanan tinggi · atmosfer stabil";
    return "Tekanan normal · standar 1013 hPa";
  }

  function buildWeatherInsight(current, daily, air) {
    const code = Number(current.weather_code);
    const isDay = Boolean(Number(current.is_day));
    const precip = Number(current.precipitation) || 0;
    const apparent = Number(current.apparent_temperature);
    const wind = Number(current.wind_speed_10m) || 0;
    const gusts = Number(current.wind_gusts_10m) || wind;
    const humidity = round(current.relative_humidity_2m);
    const rainChance = daily && daily.precipitation_probability_max ? round(daily.precipitation_probability_max[0]) : 0;
    const uv = daily && daily.uv_index_max ? Number(daily.uv_index_max[0]) : 0;
    const aqi = air && air.current ? Number(air.current.european_aqi) : NaN;

    if ([95, 96, 99].includes(code)) {
      return "Potensi badai petir terdeteksi di area ini — utamakan berada di dalam ruangan yang aman.";
    }
    if (precip >= 0.4 || [61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
      return "Hujan sedang berlangsung — siapkan payung atau jas hujan dan waspadai jalanan licin.";
    }
    if ([51, 53, 55, 56, 57].includes(code)) {
      return "Gerimis membasahi wilayah sekitar — bawa pelindung hujan ringan bila bepergian.";
    }
    if ([71, 73, 75, 77, 85, 86].includes(code)) {
      return "Salju turun di kawasan ini — kenakan pakaian hangat berlapis saat keluar ruangan.";
    }
    if (rainChance >= 65) {
      return "Peluang hujan hari ini cukup tinggi (" + rainChance + "%) — sedia payung sebelum beraktivitas di luar.";
    }
    if (!Number.isNaN(aqi) && aqi > 65) {
      return "Kualitas udara kurang optimal (AQI " + Math.round(aqi) + ") — batasi olahraga berat di ruang terbuka.";
    }
    if (isDay && uv >= 8 && (code === 0 || code === 1 || code === 2)) {
      return "Sinar UV cukup menyengat siang ini (UV " + Math.round(uv) + ") — gunakan tabir surya & pelindung mata.";
    }
    if (!Number.isNaN(apparent) && apparent >= 34) {
      return "Suhu terasa cukup terik (" + fmtTemp(apparent) + "°) — perbanyak minum air putih agar tetap terhidrasi.";
    }
    if (wind >= 30 || gusts >= 45) {
      return "Angin bertiup cukup kencang dengan hembusan " + round(gusts) + " km/j — perhatikan benda ringan di luar.";
    }
    if (!isDay && (code === 0 || code === 1)) {
      return "Langit malam cerah dengan kelembapan " + humidity + "% — suasana tenang untuk beristirahat.";
    }
    return "Kondisi atmosfer terpantau kondusif dengan kelembapan " + humidity + "% dan angin " + round(wind) + " km/j.";
  }

  function placeMetaText(place) {
    if (!place) return "";
    const bits = [place.region, place.country].filter(Boolean);
    const unique = bits.filter((item, index) => bits.indexOf(item) === index && item !== place.name);
    if (unique.length) return unique.join(" · ");
    if (place.latitude != null && place.longitude != null) {
      return formatCoords(place.latitude, place.longitude);
    }
    return "";
  }

  /* ---------------- Jaringan ---------------- */

  async function fetchJSON(url, timeout = 15000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
      if (!response.ok) throw new Error("HTTP " + response.status);
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  function forecastURL(place) {
    const params = new URLSearchParams({
      latitude: String(place.latitude),
      longitude: String(place.longitude),
      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "is_day",
        "precipitation",
        "weather_code",
        "cloud_cover",
        "pressure_msl",
        "wind_speed_10m",
        "wind_direction_10m",
        "wind_gusts_10m"
      ].join(","),
      hourly: ["temperature_2m", "weather_code", "precipitation_probability", "is_day"].join(","),
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "sunrise",
        "sunset",
        "uv_index_max",
        "precipitation_probability_max",
        "precipitation_sum",
        "wind_speed_10m_max"
      ].join(","),
      timezone: "auto",
      forecast_days: "7",
      temperature_unit: "celsius",
      wind_speed_unit: "kmh",
      precipitation_unit: "mm"
    });
    return API.forecast + "?" + params.toString();
  }

  function airURL(place) {
    const params = new URLSearchParams({
      latitude: String(place.latitude),
      longitude: String(place.longitude),
      current: "european_aqi,pm2_5,pm10",
      timezone: "auto"
    });
    return API.air + "?" + params.toString();
  }

  /* ---------------- Render ---------------- */

  function renderAll() {
    if (!state.data) return;
    renderPlace();
    renderCurrent();
    renderDetails();
    renderSun();
    renderHourly();
    renderDaily();
    applyTheme();
    startClock();
  }

  function renderPlace() {
    if (!state.place) return;
    const name = state.place.name || "Lokasi saat ini";
    el.placeName.textContent = name;
    el.placeMeta.textContent = placeMetaText(state.place);

    let badgeIcon = "pin";
    let badgeLabel = "Lokasi Tersimpan";
    if (state.place.source === "device") {
      badgeIcon = "locate";
      badgeLabel = "Lokasi Perangkat";
    } else if (state.place.source === "network") {
      badgeIcon = "compass";
      badgeLabel = "Estimasi Jaringan";
    } else if (state.place.source === "search") {
      badgeIcon = "search";
      badgeLabel = "Hasil Pencarian";
    } else if (state.place.source === "default") {
      badgeIcon = "pin";
      badgeLabel = "Lokasi Cadangan";
    }
    el.placeBadge.innerHTML = lineIcon(badgeIcon) + "<span>" + badgeLabel + "</span>";

    const coordsText = formatCoords(state.place.latitude, state.place.longitude);
    if (coordsText) {
      el.placeCoords.textContent = coordsText;
      el.placeCoords.hidden = false;
    } else {
      el.placeCoords.hidden = true;
    }

    document.title = "Cuaca " + name + " — Langit";
  }

  function renderCurrent() {
    const current = state.data.current;
    const daily = state.data.daily;
    const air = state.air && state.air.current ? state.air.current : null;
    const visual = weatherVisual(current.weather_code, current.is_day);
    const label = weatherLabel(current.weather_code);
    const max = daily && daily.temperature_2m_max ? daily.temperature_2m_max[0] : null;
    const min = daily && daily.temperature_2m_min ? daily.temperature_2m_min[0] : null;
    const rainChance = daily && daily.precipitation_probability_max ? round(daily.precipitation_probability_max[0]) : null;
    const uv = daily && daily.uv_index_max ? Number(daily.uv_index_max[0]) : null;
    const uvCat = uvCategory(uv);
    const aqi = air ? Number(air.european_aqi) : NaN;
    const aqiCat = aqiCategory(aqi);

    el.heroIcon.innerHTML = iconSVG(visual.icon);
    el.tempValue.textContent = fmtTemp(current.temperature_2m);
    el.tempUnit.textContent = tempUnitLabel();
    el.conditionText.textContent = label;
    el.feelsLike.textContent = "Terasa seperti " + fmtTemp(current.apparent_temperature) + "°";
    el.todayRange.textContent = "Tertinggi " + fmtTemp(max) + "° · Terendah " + fmtTemp(min) + "°";

    el.weatherInsightText.textContent = buildWeatherInsight(current, daily, state.air);

    const pills = [];
    if (rainChance != null) {
      pills.push('<span class="pill">' + lineIcon("rain-ui") + "Peluang hujan <strong>" + rainChance + "%</strong></span>");
    }
    if (uv != null) {
      pills.push('<span class="pill">' + lineIcon("uv") + "UV <strong>" + Math.round(uv) + "</strong> " + uvCat.label + "</span>");
    }
    pills.push('<span class="pill">' + lineIcon("wind") + "Angin <strong>" + round(current.wind_speed_10m) + " km/j</strong></span>");
    if (aqiCat) {
      pills.push('<span class="pill">' + lineIcon("leaf") + "Udara <strong>" + aqiCat.label + "</strong></span>");
    }
    el.heroPills.innerHTML = pills.join("");

    el.tzBadge.textContent = formatTimezoneBadge(state.data.timezone, state.data.utc_offset_seconds);
    document.title = fmtTemp(current.temperature_2m) + "° " + label + " di " + (state.place ? state.place.name : "lokasi ini") + " — Langit";
  }

  function renderDetails() {
    const current = state.data.current;
    const daily = state.data.daily;
    const air = state.air && state.air.current ? state.air.current : null;

    // 1. Angin
    const windSpeed = round(current.wind_speed_10m);
    const windGusts = round(current.wind_gusts_10m);
    const windDir = round(current.wind_direction_10m);
    el.windValue.textContent = String(windSpeed);
    el.windNote.textContent = "Dari arah " + directionLabel(windDir) + " · Hembusan " + windGusts + " km/j";
    el.windArrow.style.transform = "rotate(" + windDir + "deg)";
    el.windArrow.title = "Angin dari " + directionLabel(windDir);
    el.windBar.style.width = clamp((windSpeed / 50) * 100, 5, 100).toFixed(1) + "%";

    // 2. Kelembapan + Titik Embun
    const rh = round(current.relative_humidity_2m);
    const dewC = dewPointCelsius(current.temperature_2m, rh);
    el.humidityValue.textContent = String(rh);
    el.humidityBar.style.width = clamp(rh, 0, 100) + "%";
    el.humidityNote.textContent = humidityLabel(rh) + (dewC == null ? "" : " · Titik embun " + fmtTemp(dewC) + "°");

    // 3. Indeks UV
    const uv = daily && daily.uv_index_max ? Number(daily.uv_index_max[0]) : null;
    const uvCat = uvCategory(uv);
    el.uvValue.textContent = uv == null ? "—" : String(Math.round(uv));
    el.uvMarker.style.left = (uv == null ? 4 : clamp((uv / 12) * 100, 3, 97)).toFixed(1) + "%";
    el.uvNote.innerHTML = uv == null
      ? "Data tidak tersedia"
      : '<span class="dot" style="background:' + uvCat.color + '"></span>' + uvCat.label + " · puncak hari ini";

    // 4. Tekanan Udara
    const pressure = round(current.pressure_msl);
    el.pressureValue.textContent = String(pressure);
    el.pressureMarker.style.left = clamp(((pressure - 985) / 56) * 100, 4, 96).toFixed(1) + "%";
    el.pressureNote.textContent = pressureLabel(pressure);

    // 5. Tutupan Awan
    const clouds = round(current.cloud_cover);
    el.cloudValue.textContent = String(clouds);
    el.cloudBar.style.width = clamp(clouds, 0, 100) + "%";
    el.cloudNote.textContent = cloudLabel(clouds);

    // 6. Curah Hujan
    const precip = Number(current.precipitation) || 0;
    const rainChance = daily && daily.precipitation_probability_max ? round(daily.precipitation_probability_max[0]) : null;
    const rainTotal = daily && daily.precipitation_sum ? Number(daily.precipitation_sum[0]) : null;
    el.rainValue.textContent = precip < 0.05 ? "0" : precip.toFixed(1);
    const rainMeterPct = precip >= 0.05
      ? clamp((precip / 10) * 100, 12, 100)
      : clamp(rainChance || 0, 0, 100);
    el.rainBar.style.width = rainMeterPct.toFixed(1) + "%";
    el.rainNote.textContent = rainChance == null
      ? "Curah hujan saat ini"
      : "Peluang hari ini " + rainChance + "%" + (rainTotal != null ? " · akumulasi " + rainTotal.toFixed(1) + " mm" : "");

    // 7. Kualitas Udara & Polutan (AQI, PM2.5, PM10)
    const aqi = air ? Number(air.european_aqi) : NaN;
    const aqiCat = aqiCategory(aqi);
    if (aqiCat) {
      el.aqiValue.textContent = String(Math.round(aqi));
      el.aqiBadge.textContent = aqiCat.label;
      el.aqiBadge.style.borderColor = aqiCat.color;
      el.aqiBadge.style.color = aqiCat.color;
      el.aqiMarker.style.left = clamp((aqi / 115) * 100, 3, 97).toFixed(1) + "%";
      el.aqiNote.innerHTML = '<span class="dot" style="background:' + aqiCat.color + '"></span>' + aqiCat.desc;

      const pm25 = air.pm2_5 == null ? NaN : Number(air.pm2_5);
      const pm10 = air.pm10 == null ? NaN : Number(air.pm10);
      el.pm25Value.textContent = Number.isNaN(pm25) ? "—" : pm25.toFixed(1);
      el.pm10Value.textContent = Number.isNaN(pm10) ? "—" : pm10.toFixed(1);
    } else {
      el.aqiValue.textContent = "—";
      el.aqiBadge.textContent = "N/A";
      el.aqiBadge.style.borderColor = "";
      el.aqiBadge.style.color = "";
      el.aqiMarker.style.left = "4%";
      el.aqiNote.textContent = "Data kualitas udara tidak tersedia untuk wilayah ini";
      el.pm25Value.textContent = "—";
      el.pm10Value.textContent = "—";
    }
  }

  function renderSun() {
    if (!state.data) return;
    const daily = state.data.daily;
    const current = state.data.current;
    if (!daily || !daily.sunrise || !daily.sunset) {
      el.sunNote.textContent = "Data matahari tidak tersedia";
      return;
    }
    const rise = daily.sunrise[0];
    const set = daily.sunset[0];
    const nextRise = daily.sunrise[1] || rise;
    const riseMin = minutesOfDay(rise);
    const setMin = minutesOfDay(set);

    const offset = Number(state.data.utc_offset_seconds);
    let nowMin = minutesOfDay(current.time);
    if (Number.isFinite(offset)) {
      const local = new Date(Date.now() + offset * 1000);
      nowMin = local.getUTCHours() * 60 + local.getUTCMinutes();
    }

    const length = Math.max(0, setMin - riseMin);
    const isDaytime = nowMin >= riseMin && nowMin <= setMin;
    const progress = clamp((nowMin - riseMin) / Math.max(1, length), 0, 1);

    el.sunriseValue.textContent = hhmm(rise);
    el.sunsetValue.textContent = hhmm(set);

    // Path semicircle: pusat (130, 100), jari-jari 92, pathLength="100"
    el.sunArcProgress.style.strokeDashoffset = (100 * (1 - progress)).toFixed(2);
    const angle = Math.PI * progress;
    const cx = (130 - 92 * Math.cos(angle)).toFixed(2);
    const cy = (100 - 92 * Math.sin(angle)).toFixed(2);
    el.sunDot.setAttribute("cx", cx);
    el.sunDot.setAttribute("cy", cy);
    el.sunDotHalo.setAttribute("cx", cx);
    el.sunDotHalo.setAttribute("cy", cy);

    el.sunCard.classList.toggle("is-night-cycle", !isDaytime);

    const hours = Math.floor(length / 60);
    const minutes = length % 60;

    if (nowMin < riseMin) {
      el.daylightBadge.textContent = "Pra-Terbit";
      el.sunNote.textContent = "Panjang hari " + hours + "j " + minutes + "m · Matahari terbit pukul " + hhmm(rise);
    } else if (nowMin > setMin) {
      el.daylightBadge.textContent = "Malam Hari";
      el.sunNote.textContent = "Panjang hari " + hours + "j " + minutes + "m · Terbit besok pukul " + hhmm(nextRise);
    } else {
      el.daylightBadge.textContent = "Siang · " + Math.round(progress * 100) + "%";
      el.sunNote.textContent = "Panjang hari " + hours + "j " + minutes + "m · Terbenam pukul " + hhmm(set);
    }
  }

  function renderHourly() {
    const hourly = state.data.hourly;
    if (!hourly || !hourly.time) {
      el.hourly.innerHTML = '<p class="card-note">Data per jam tidak tersedia.</p>';
      return;
    }
    let start = 0;
    const currentHour = state.data.current.time.slice(0, 13);
    for (let index = 0; index < hourly.time.length; index += 1) {
      if (hourly.time[index].slice(0, 13) <= currentHour) start = index;
      else break;
    }
    const end = Math.min(hourly.time.length, start + 24);
    const count = end - start;
    if (count <= 0) return;

    const COL_W = 86;
    const GAP = 10;
    const STEP = COL_W + GAP;
    const totalW = count * COL_W + (count - 1) * GAP;
    const chartH = 68;

    const sliceTemps = [];
    for (let i = start; i < end; i += 1) {
      sliceTemps.push(fmtTempNumber(hourly.temperature_2m[i]));
    }
    const minT = Math.min.apply(null, sliceTemps);
    const maxT = Math.max.apply(null, sliceTemps);
    const spanT = Math.max(1, maxT - minT);

    const pts = sliceTemps.map((t, idx) => {
      const x = idx * STEP + COL_W / 2;
      const norm = maxT === minT ? 0.5 : (t - minT) / spanT;
      const y = 52 - norm * 28;
      return { x: x, y: y, t: t };
    });

    let lineD = "M " + pts[0].x.toFixed(1) + " " + pts[0].y.toFixed(1);
    for (let i = 1; i < pts.length; i += 1) {
      const p0 = pts[i - 1];
      const p1 = pts[i];
      const dx = (p1.x - p0.x) * 0.42;
      lineD += " C " + (p0.x + dx).toFixed(1) + " " + p0.y.toFixed(1) +
        ", " + (p1.x - dx).toFixed(1) + " " + p1.y.toFixed(1) +
        ", " + p1.x.toFixed(1) + " " + p1.y.toFixed(1);
    }
    const areaD = lineD +
      " L " + pts[pts.length - 1].x.toFixed(1) + " " + chartH +
      " L " + pts[0].x.toFixed(1) + " " + chartH + " Z";

    const hasExtrema = maxT > minT;
    const nodesSVG = pts.map((p, idx) => {
      const isNow = idx === 0;
      const showLabel = isNow || idx % 2 === 0 || (hasExtrema && (p.t === maxT || p.t === minT));
      return (
        '<line class="hc-guide" x1="' + p.x.toFixed(1) + '" y1="' + (p.y + 4).toFixed(1) + '" x2="' + p.x.toFixed(1) + '" y2="' + chartH + '"/>' +
        (isNow ? '<circle class="hc-dot-halo" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="9"/>' : "") +
        '<circle class="hc-dot' + (isNow ? " is-now" : "") + '" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + (isNow ? "4.2" : "3.2") + '"/>' +
        (showLabel
          ? '<text class="hc-label' + (isNow ? " is-now" : "") + '" x="' + p.x.toFixed(1) + '" y="' + (p.y - 9).toFixed(1) + '">' + p.t + "°</text>"
          : "")
      );
    }).join("");

    const chartSVG =
      '<svg class="hourly-chart" width="' + totalW + '" height="' + chartH + '" viewBox="0 0 ' + totalW + " " + chartH + '" aria-hidden="true">' +
        "<defs>" +
          '<linearGradient id="hourlyCurveFill" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="var(--accent)" stop-opacity="0.26"/>' +
            '<stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>' +
          "</linearGradient>" +
        "</defs>" +
        '<path d="' + areaD + '" fill="url(#hourlyCurveFill)"/>' +
        '<path class="hc-line" d="' + lineD + '"/>' +
        nodesSVG +
      "</svg>";

    const cards = [];
    for (let index = start; index < end; index += 1) {
      const isNow = index === start;
      const time = isNow ? "Sekarang" : hhmm(hourly.time[index]);
      const visual = weatherVisual(hourly.weather_code[index], hourly.is_day ? hourly.is_day[index] : 1);
      const probability = hourly.precipitation_probability ? hourly.precipitation_probability[index] : null;
      const probText = probability == null ? "—" : probability + "%";
      cards.push(
        '<div class="hour' + (isNow ? " is-now" : "") + '">' +
          '<p class="hour-time">' + time + "</p>" +
          '<div class="hour-icon">' + iconSVG(visual.icon) + "</div>" +
          '<p class="hour-temp">' + fmtTemp(hourly.temperature_2m[index]) + "°</p>" +
          '<p class="hour-rain' + (probability ? "" : " is-empty") + '">' + lineIcon("drop") + probText + "</p>" +
        "</div>"
      );
    }

    el.hourly.innerHTML =
      '<div class="hourly-track">' +
        chartSVG +
        '<div class="hourly-cards">' + cards.join("") + "</div>" +
      "</div>";
    el.hourly.scrollLeft = 0;
    updateHourScrollButtons();
  }

  function renderDaily() {
    const daily = state.data.daily;
    if (!daily || !daily.time) {
      el.daily.innerHTML = '<p class="card-note">Data harian tidak tersedia.</p>';
      return;
    }
    const minValues = daily.temperature_2m_min || [];
    const maxValues = daily.temperature_2m_max || [];
    const weekMin = Math.min.apply(null, minValues);
    const weekMax = Math.max.apply(null, maxValues);
    const span = Math.max(1, weekMax - weekMin);
    const rows = [];

    daily.time.forEach((date, index) => {
      const code = daily.weather_code[index];
      const low = Number(minValues[index]);
      const high = Number(maxValues[index]);
      const prob = daily.precipitation_probability_max ? round(daily.precipitation_probability_max[index]) : null;
      const precipSum = daily.precipitation_sum ? Number(daily.precipitation_sum[index]) : 0;
      const uvMax = daily.uv_index_max ? Math.round(Number(daily.uv_index_max[index]) || 0) : null;
      const windMax = daily.wind_speed_10m_max ? round(daily.wind_speed_10m_max[index]) : null;
      const rise = daily.sunrise ? hhmm(daily.sunrise[index]) : "—";
      const set = daily.sunset ? hhmm(daily.sunset[index]) : "—";

      const visual = weatherVisual(code, 1);
      const left = clamp(((low - weekMin) / span) * 100, 0, 100);
      const width = clamp(((high - low) / span) * 100, 4, 100 - left);
      const label = weatherLabel(code);
      const isToday = index === 0;
      const isOpen = index === state.openDayIndex;

      let dayName;
      if (index === 0) dayName = "Hari ini";
      else if (index === 1) dayName = "Besok";
      else {
        const name = weekdayName(date);
        dayName = name.charAt(0).toUpperCase() + name.slice(1);
      }

      const uvCat = uvCategory(uvMax);

      rows.push(
        '<div class="day-item' + (isToday ? " is-today" : "") + (isOpen ? " is-open" : "") + '" role="listitem" data-day-index="' + index + '">' +
          '<button type="button" class="day" aria-expanded="' + String(isOpen) + '" aria-label="' + escapeHTML(dayName + ": " + label + ", " + fmtTemp(low) + " sampai " + fmtTemp(high) + " derajat") + '">' +
            '<div class="day-name"><strong>' + dayName + (isToday ? '<em class="today-tag" style="font-style:normal">Kini</em>' : "") + "</strong><span>" + shortDate(date) + "</span></div>" +
            '<div class="day-cond">' + iconSVG(visual.icon) + "<span>" + escapeHTML(label) + "</span></div>" +
            '<div class="day-rain' + (prob ? "" : " is-empty") + '">' + lineIcon("drop") + (prob == null ? "—" : prob + "%") + "</div>" +
            '<div class="day-range">' +
              '<span class="lo">' + fmtTemp(low) + "°</span>" +
              '<div class="track"><span class="fill" style="left:' + left.toFixed(1) + "%;width:" + width.toFixed(1) + '%"></span></div>' +
              '<span class="hi">' + fmtTemp(high) + "°</span>" +
            "</div>" +
            '<span class="day-chevron" aria-hidden="true">' + lineIcon("chevron-down") + "</span>" +
          "</button>" +
          '<div class="day-drawer">' +
            '<div class="day-drawer-inner">' +
              '<div class="day-drawer-grid">' +
                '<div class="day-stat">' + lineIcon("sunrise") + '<div><small>Terbit / Terbenam</small><strong>' + rise + " · " + set + "</strong></div></div>" +
                '<div class="day-stat">' + lineIcon("rain-ui") + '<div><small>Total Presipitasi</small><strong>' + precipSum.toFixed(1) + " mm</strong></div></div>" +
                '<div class="day-stat">' + lineIcon("uv") + '<div><small>Indeks UV Maks</small><strong>' + (uvMax == null ? "—" : uvMax + " (" + uvCat.label + ")") + "</strong></div></div>" +
                '<div class="day-stat">' + lineIcon("wind") + '<div><small>Angin Maksimum</small><strong>' + (windMax == null ? "—" : windMax + " km/j") + "</strong></div></div>" +
              "</div>" +
            "</div>" +
          "</div>" +
        "</div>"
      );
    });

    el.daily.innerHTML = rows.join("");
  }

  function applyTheme() {
    const current = state.data.current;
    const visual = weatherVisual(current.weather_code, current.is_day);
    const isDay = current.is_day == null ? true : Boolean(Number(current.is_day));
    document.body.dataset.theme = visual.theme;
    document.body.dataset.sky = visual.sky;
    document.body.dataset.night = String(!isDay);
    el.metaTheme.setAttribute("content", THEME_COLORS[visual.theme] || "#0c56a6");
    updateCelestial();
  }

  /* ---------------- Posisi matahari/bulan & fase hari ---------------- */

  function updateCelestial() {
    if (!state.data) return;
    const daily = state.data.daily || {};
    const rise = daily.sunrise && daily.sunrise[0];
    const set = daily.sunset && daily.sunset[0];
    if (!rise || !set) return;

    const riseMin = minutesOfDay(rise);
    const setMin = minutesOfDay(set);
    const offset = Number(state.data.utc_offset_seconds) || 0;
    const local = new Date(Date.now() + offset * 1000);
    const nowMin = local.getUTCHours() * 60 + local.getUTCMinutes();
    const dayLength = Math.max(1, setMin - riseMin);
    const nightLength = Math.max(1, 1440 - dayLength);
    const isDay = nowMin >= riseMin && nowMin <= setMin;

    let progress;
    if (isDay) {
      progress = clamp((nowMin - riseMin) / dayLength, 0, 1);
    } else {
      progress = clamp((nowMin > setMin ? nowMin - setMin : nowMin + 1440 - setMin) / nightLength, 0, 1);
    }

    const x = 12 + progress * 76;
    const y = 78 - Math.sin(Math.PI * progress) * 64;
    document.body.style.setProperty("--orb-x", x.toFixed(2) + "%");
    document.body.style.setProperty("--orb-y", y.toFixed(2) + "%");

    let phase = "night";
    if (nowMin >= riseMin - 60 && nowMin < riseMin + 60) phase = "dawn";
    else if (nowMin > setMin - 60 && nowMin <= setMin + 60) phase = "dusk";
    else if (nowMin >= riseMin && nowMin <= setMin) phase = "day";
    document.body.dataset.phase = phase;
  }

  /* ---------------- Partikel hujan & salju ---------------- */

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function buildWeatherParticles() {
    if (!el.fxRain || !el.fxSnow) return;
    const narrow = window.matchMedia("(max-width: 700px)").matches;

    const drops = [];
    const dropCount = narrow ? 55 : 95;
    for (let i = 0; i < dropCount; i += 1) {
      drops.push(
        '<span style="left:' + randomBetween(0, 100).toFixed(2) + "%;" +
        "--h:" + randomBetween(12, 30).toFixed(1) + "px;" +
        "--dur:" + randomBetween(0.55, 1.05).toFixed(2) + "s;" +
        "--delay:" + randomBetween(-3, 0).toFixed(2) + "s;" +
        "--o:" + randomBetween(0.35, 0.85).toFixed(2) + '"></span>'
      );
    }
    el.fxRain.innerHTML = drops.join("");

    const flakes = [];
    const flakeCount = narrow ? 34 : 58;
    for (let i = 0; i < flakeCount; i += 1) {
      flakes.push(
        '<span style="left:' + randomBetween(0, 100).toFixed(2) + "%;" +
        "--s:" + randomBetween(3, 7).toFixed(1) + "px;" +
        "--dur:" + randomBetween(7, 15).toFixed(1) + "s;" +
        "--delay:" + randomBetween(-14, 0).toFixed(1) + "s;" +
        "--drift:" + randomBetween(-6, 6).toFixed(1) + "vw;" +
        "--o:" + randomBetween(0.55, 0.95).toFixed(2) + '"></span>'
      );
    }
    el.fxSnow.innerHTML = flakes.join("");
  }

  /* ---------------- Jam lokal ---------------- */

  function startClock() {
    if (state.clockTimer) clearInterval(state.clockTimer);
    tickClock();
    state.clockTimer = setInterval(tickClock, 1000);
  }

  function tickClock() {
    if (!state.data) {
      el.updatedAt.textContent = relativeTime(state.lastFetch);
      return;
    }
    const offset = Number(state.data.utc_offset_seconds) || 0;
    const local = new Date(Date.now() + offset * 1000);
    const hh = String(local.getUTCHours()).padStart(2, "0");
    const mm = String(local.getUTCMinutes()).padStart(2, "0");
    const ss = String(local.getUTCSeconds()).padStart(2, "0");
    el.localClock.textContent = hh + "." + mm;
    el.localSeconds.textContent = ":" + ss;

    try {
      el.localDate.textContent = local.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC"
      });
    } catch {
      /* abaikan */
    }

    const minute = local.getUTCMinutes();
    if (minute !== state.celestialMinute) {
      state.celestialMinute = minute;
      updateCelestial();
      renderSun();
    }
    el.updatedAt.textContent = relativeTime(state.lastFetch);
  }

  /* ---------------- Loader, banner, unit ---------------- */

  function setLoader(visible, text) {
    if (text) el.loaderText.textContent = text;
    el.loader.classList.toggle("is-hidden", !visible);
    el.loader.setAttribute("aria-hidden", String(!visible));
  }

  function hideBanner() {
    if (state.bannerTimer) clearTimeout(state.bannerTimer);
    state.bannerTimer = null;
    el.banner.hidden = true;
  }

  function showBanner(options) {
    const opts = options || {};
    if (state.bannerTimer) clearTimeout(state.bannerTimer);
    state.bannerTimer = null;

    el.banner.hidden = false;
    el.banner.dataset.type = opts.type || "info";
    el.bannerIcon.innerHTML = lineIcon(opts.type === "error" || opts.type === "warn" ? "alert" : opts.type === "success" ? "check" : "info");
    el.bannerText.textContent = opts.message || "";

    if (opts.actionLabel && typeof opts.onAction === "function") {
      el.bannerAction.hidden = false;
      el.bannerAction.textContent = opts.actionLabel;
      el.bannerAction.onclick = () => {
        hideBanner();
        opts.onAction();
      };
    } else {
      el.bannerAction.hidden = true;
      el.bannerAction.onclick = null;
    }

    if (opts.autoHide) {
      state.bannerTimer = setTimeout(hideBanner, opts.autoHide);
    }
  }

  function applyUnitUI() {
    el.unitButtons.forEach((button) => {
      const active = button.dataset.unit === state.unit;
      button.setAttribute("aria-pressed", String(active));
    });
    el.tempUnit.textContent = tempUnitLabel();
  }

  function setLocateBusy(busy) {
    el.locateBtn.classList.toggle("is-busy", busy);
    el.locateBtn.disabled = busy;
  }

  function updateHourScrollButtons() {
    const max = el.hourly.scrollWidth - el.hourly.clientWidth;
    el.hourPrev.disabled = el.hourly.scrollLeft <= 2;
    el.hourNext.disabled = max <= 2 || el.hourly.scrollLeft >= max - 2;
  }

  function updateSearchClearButton() {
    const hasText = el.searchInput.value.length > 0;
    el.searchClear.hidden = !hasText;
    if (el.searchKbd) el.searchKbd.hidden = hasText;
  }

  /* ---------------- Muat data ---------------- */

  async function loadPlace(place, options) {
    const opts = options || {};
    const save = opts.save !== false;
    state.place = place;
    if (save) {
      saveStore({ place: place });
      pushRecentPlace(place);
    }
    renderPlace();

    const requestId = ++state.requestId;
    el.refreshBtn.classList.add("is-spinning");
    el.refreshBtn.disabled = true;
    if (!state.data) {
      setLoader(true, place.source === "device" ? "Mengambil cuaca di lokasi kamu…" : "Mengambil data cuaca…");
    }

    try {
      const results = await Promise.all([
        fetchJSON(forecastURL(place), 15000),
        fetchJSON(airURL(place), 12000).catch(() => null)
      ]);

      if (requestId !== state.requestId) return false;

      state.data = results[0];
      state.air = results[1];
      state.lastFetch = Date.now();
      state.celestialMinute = -1;
      renderAll();
      setLoader(false);
      return true;
    } catch (error) {
      if (requestId !== state.requestId) return false;
      console.error("Gagal memuat cuaca:", error);
      setLoader(false);
      if (!state.data) el.conditionText.textContent = "Data cuaca tidak tersedia";
      showBanner({
        type: "error",
        message: "Gagal mengambil data cuaca. Periksa koneksi internetmu, lalu coba lagi.",
        actionLabel: "Coba lagi",
        onAction: () => loadPlace(state.place || DEFAULT_PLACE, { save: false })
      });
      return false;
    } finally {
      if (requestId === state.requestId) {
        el.refreshBtn.classList.remove("is-spinning");
        el.refreshBtn.disabled = false;
      }
    }
  }

  /* ---------------- Lokasi perangkat ---------------- */

  function geoOnce(options) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  async function getGeoPermissionState() {
    if (!navigator.permissions || typeof navigator.permissions.query !== "function") return null;
    try {
      if (!state.geoPermissionStatus) {
        state.geoPermissionStatus = await navigator.permissions.query({ name: "geolocation" });
        state.geoPermissionStatus.onchange = () => {
          if (state.geoPermissionStatus.state === "granted" && state.geoAwaitingPermission) {
            state.geoAwaitingPermission = false;
            locate({ manual: true });
          }
        };
      }
      return state.geoPermissionStatus.state;
    } catch {
      return null;
    }
  }

  async function getPosition() {
    if (!navigator.geolocation) {
      const error = new Error("Geolocation tidak didukung");
      error.geoUnsupported = true;
      throw error;
    }

    try {
      return await geoOnce({
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 2 * 60 * 1000
      });
    } catch (firstError) {
      if (!firstError || (firstError.code !== 1 && firstError.code !== 2 && firstError.code !== 3)) {
        throw firstError;
      }
      await new Promise((resolve) => setTimeout(resolve, 400));
      return geoOnce({
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 5 * 60 * 1000
      });
    }
  }

  async function reverseGeocode(latitude, longitude) {
    try {
      const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        localityLanguage: "id"
      });
      const data = await fetchJSON(API.reverse + "?" + params.toString(), 8000);
      const name = data.city || data.locality || data.principalSubdivision || "Lokasi saat ini";
      const admin = data.localityInfo && Array.isArray(data.localityInfo.administrative)
        ? data.localityInfo.administrative
        : [];
      const province = admin.find((item) => Number(item.adminLevel) === 4);
      let region = (province && province.name) || data.principalSubdivision || data.locality || "";
      if (region === name) region = "";
      return {
        name: name,
        region: region,
        country: data.countryName || "",
        latitude: latitude,
        longitude: longitude,
        source: "device"
      };
    } catch (error) {
      console.warn("Reverse geocoding gagal:", error);
      return {
        name: "Lokasi saat ini",
        region: "",
        country: "",
        latitude: latitude,
        longitude: longitude,
        source: "device"
      };
    }
  }

  function haversineKm(a, b) {
    const toRad = (deg) => (Number(deg) * Math.PI) / 180;
    const earth = 6371;
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);
    const h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * earth * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  async function locate(options) {
    const opts = options || {};
    const manual = Boolean(opts.manual);
    if (state.locating) return;

    state.locating = true;
    setLocateBusy(true);
    if (!state.data) setLoader(true, "Mendeteksi lokasi kamu…");

    try {
      const position = await getPosition();
      state.geoAwaitingPermission = false;
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const place = await reverseGeocode(latitude, longitude);

      const samePlace = state.place && state.data && state.place.latitude != null &&
        haversineKm(place, state.place) < 3;

      if (samePlace) {
        state.place = Object.assign({}, state.place, {
          name: place.name,
          region: place.region,
          country: place.country,
          source: "device"
        });
        renderPlace();
        saveStore({ place: state.place });
        pushRecentPlace(state.place);
        if (manual) {
          showBanner({ type: "success", message: "Cuaca di " + state.place.name + " sudah paling baru.", autoHide: 4000 });
        }
        setLoader(false);
        return;
      }

      const loaded = await loadPlace(place, { save: true });
      if (manual && loaded) {
        showBanner({ type: "success", message: "Menampilkan cuaca di " + place.name + ".", autoHide: 4000 });
      }
    } catch (error) {
      console.warn("Deteksi lokasi gagal:", error);
      await handleGeoError(error);
    } finally {
      state.locating = false;
      setLocateBusy(false);
    }
  }

  async function networkGeocodeFallback() {
    try {
      const data = await fetchJSON(API.reverse + "?localityLanguage=id", 7000);
      const lat = Number(data && data.latitude);
      const lon = Number(data && data.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lon) || (Math.abs(lat) < 0.001 && Math.abs(lon) < 0.001)) {
        return null;
      }
      const name = data.city || data.locality || data.principalSubdivision || "Lokasi jaringan";
      const admin = data.localityInfo && Array.isArray(data.localityInfo.administrative)
        ? data.localityInfo.administrative
        : [];
      const province = admin.find((item) => Number(item.adminLevel) === 4);
      let region = (province && province.name) || data.principalSubdivision || data.locality || "";
      if (region === name) region = "";
      return {
        name: name,
        region: region,
        country: data.countryName || "",
        latitude: lat,
        longitude: lon,
        source: "network"
      };
    } catch {
      return null;
    }
  }

  async function handleGeoError(error) {
    const code = error && typeof error.code === "number" ? error.code : null;
    const rawMsg = error && error.message ? String(error.message) : "";
    const isPolicyBlocked = /permissions policy/i.test(rawMsg);
    const permission = code === 1 ? await getGeoPermissionState() : null;
    const isWindows = /Windows/i.test(navigator.userAgent || "");

    let message;
    let actionLabel = "Coba lagi";
    let onAction = () => locate({ manual: true });

    if (error && error.geoUnsupported) {
      message = "Browser ini tidak mendukung deteksi lokasi perangkat.";
    } else if (!window.isSecureContext) {
      message = "Halaman ini tidak dianggap aman oleh browser. Buka lewat http://localhost:8788 atau alamat https://, lalu coba lagi.";
    } else if (isPolicyBlocked) {
      message = "Akses GPS dibatasi oleh iframe pembungkus. Buka halaman cuaca di tab baru agar GPS perangkat aktif.";
      actionLabel = "Buka Tab Penuh";
      onAction = () => window.open(window.location.href, "_blank", "noopener");
    } else if (code === 1 && permission === "granted") {
      message = isWindows
        ? "Izin browser sudah aktif, namun Location Services di Windows masih mati (Settings › Privacy & security › Location › aktifkan 'Location services' & 'Let desktop apps access your location')."
        : "Izin situs sudah aktif, tetapi layanan lokasi sistem perangkat masih nonaktif.";
      state.geoAwaitingPermission = false;
      if (isWindows) {
        actionLabel = "Buka Settings Lokasi";
        onAction = () => {
          window.location.href = "ms-settings:privacy-location";
        };
      }
    } else if (code === 1 && permission === "denied") {
      message = "Izin lokasi untuk situs ini masih diblokir. Buka ikon kunci/pengaturan di address bar → Location → Allow, lalu muat ulang halaman.";
      state.geoAwaitingPermission = true;
      actionLabel = "Muat ulang";
      onAction = () => window.location.reload();
    } else if (code === 1) {
      message = "Izin lokasi ditolak. Aktifkan izin lokasi di pengaturan browser, lalu coba lagi.";
      state.geoAwaitingPermission = true;
    } else if (code === 2) {
      message = "Sinyal GPS perangkat tidak tersedia saat ini.";
    } else if (code === 3) {
      message = "Deteksi GPS perangkat terlalu lama.";
    } else {
      message = "Tidak dapat mendeteksi GPS perangkat.";
    }

    // Jika user tidak menolak izin situs (misal OS Location Windows mati / sinyal GPS gagal),
    // coba estimasi lokasi otomatis lewat jaringan agar tidak mentok di kota default.
    const canTryNetwork = permission !== "denied" && (!code || (code === 1 && permission === "granted") || code === 2 || code === 3);
    if (canTryNetwork) {
      const netPlace = await networkGeocodeFallback();
      if (netPlace) {
        await loadPlace(netPlace, { save: true });
        showBanner({
          type: "info",
          message: message + " Menampilkan estimasi lokasi jaringan: " + netPlace.name + ".",
          actionLabel: actionLabel,
          onAction: onAction
        });
        return;
      }
    }

    if (!state.data) {
      const stored = loadStore();
      const fallback = state.place || (stored && stored.place) || DEFAULT_PLACE;
      showBanner({
        type: code === 1 ? "warn" : "error",
        message: message + " Sementara ini menampilkan cuaca " + fallback.name + ".",
        actionLabel: actionLabel,
        onAction: onAction
      });
      loadPlace(fallback, { save: false });
    } else {
      setLoader(false);
      showBanner({
        type: "warn",
        message: message,
        actionLabel: actionLabel,
        onAction: onAction
      });
    }
  }

  /* ---------------- Pencarian kota & riwayat cepat ---------------- */

  function setSearchOpen(open) {
    el.searchResults.hidden = !open;
    el.searchInput.setAttribute("aria-expanded", String(open));
    if (!open) {
      state.searchToken += 1;
      state.searchItems = [];
      state.searchIndex = -1;
    }
  }

  function renderQuickLocations() {
    state.searchMode = "quick";
    state.searchItems = state.recent.slice();
    state.searchIndex = -1;

    let html = "";
    if (state.recent.length) {
      html += '<div class="sr-group-label"><span>Lokasi Terakhir</span></div>';
      html += state.recent.map((item, index) => {
        const meta = [item.region, item.country].filter(Boolean).join(" · ");
        const iconName = item.source === "device" ? "locate" : "history";
        return (
          '<div class="search-result-row">' +
            '<button type="button" class="search-result" role="option" aria-selected="false" data-index="' + index + '">' +
              '<span class="sr-mark">' + lineIcon(iconName) + "</span>" +
              '<span class="sr-text"><strong>' + escapeHTML(item.name) + "</strong>" +
              "<small>" + escapeHTML(meta || formatCoords(item.latitude, item.longitude)) + "</small></span>" +
            "</button>" +
            '<button type="button" class="sr-remove" data-remove-index="' + index + '" aria-label="Hapus dari riwayat" title="Hapus">' +
              lineIcon("close") +
            "</button>" +
          "</div>"
        );
      }).join("");
    }

    html += '<div class="sr-group-label"><span>Kota Populer</span></div>';
    html += '<div class="sr-chips">' + POPULAR_PLACES.map((city, idx) => {
      return '<button type="button" class="sr-chip" data-popular-index="' + idx + '">' +
        lineIcon("pin") + "<span>" + escapeHTML(city.name) + "</span></button>";
    }).join("") + "</div>";

    html += '<div class="sr-hint">Ketik minimal 2 huruf untuk mencari kota di seluruh dunia</div>';
    el.searchResults.innerHTML = html;
    setSearchOpen(true);
    state.searchItems = state.recent.slice();
  }

  function renderSearchState(message, icon) {
    el.searchResults.innerHTML = '<div class="sr-state">' + lineIcon(icon || "search") +
      "<span>" + escapeHTML(message) + "</span></div>";
    setSearchOpen(true);
  }

  async function runSearch(query) {
    const keyword = query.trim();
    if (keyword.length < 2) {
      renderQuickLocations();
      return;
    }

    const token = ++state.searchToken;
    state.searchMode = "geo";
    renderSearchState("Mencari “" + keyword + "”…");

    try {
      const params = new URLSearchParams({
        name: keyword,
        count: "6",
        language: "id",
        format: "json"
      });
      const data = await fetchJSON(API.geo + "?" + params.toString(), 10000);
      if (token !== state.searchToken) return;

      const results = data.results || [];
      if (!results.length) {
        renderSearchState("Tidak ada kota yang cocok. Coba kata kunci lain.", "info");
        return;
      }

      state.searchItems = results;
      state.searchIndex = -1;
      el.searchResults.innerHTML =
        '<div class="sr-group-label"><span>Hasil Pencarian</span></div>' +
        results.map((item, index) => {
          const meta = [item.admin1, item.country].filter(Boolean).join(" · ");
          const mark = item.country_code
            ? escapeHTML(String(item.country_code).toUpperCase())
            : lineIcon("pin");
          return '<button type="button" class="search-result" role="option" aria-selected="false" data-index="' + index + '">' +
            '<span class="sr-mark">' + mark + "</span>" +
            '<span class="sr-text"><strong>' + escapeHTML(item.name) + "</strong>" +
            "<small>" + escapeHTML(meta) + "</small></span></button>";
        }).join("") + '<div class="sr-hint">Didukung oleh Open-Meteo Geocoding</div>';

      setSearchOpen(true);
      state.searchItems = results;
    } catch (error) {
      if (token !== state.searchToken) return;
      console.error("Pencarian gagal:", error);
      renderSearchState("Pencarian gagal. Periksa koneksi internetmu.", "alert");
    }
  }

  function setSearchActive(index) {
    const nodes = el.searchResults.querySelectorAll(".search-result");
    if (!nodes.length) return;
    state.searchIndex = (index + nodes.length) % nodes.length;
    nodes.forEach((node, i) => {
      const active = i === state.searchIndex;
      node.classList.toggle("is-active", active);
      node.setAttribute("aria-selected", String(active));
    });
    nodes[state.searchIndex].scrollIntoView({ block: "nearest" });
  }

  function choosePlaceFromObject(raw, source = "search") {
    if (!raw) return;
    const place = {
      name: raw.name,
      region: raw.region || raw.admin1 || "",
      country: raw.country || "",
      latitude: raw.latitude,
      longitude: raw.longitude,
      source: source
    };
    el.searchInput.value = "";
    updateSearchClearButton();
    setSearchOpen(false);
    el.searchInput.blur();
    hideBanner();
    loadPlace(place, { save: true });
  }

  function selectSearchResult(index) {
    const item = state.searchItems[index];
    if (!item) return;
    choosePlaceFromObject(item, item.source === "device" ? "device" : "search");
  }

  /* ---------------- Drag-scroll untuk prakiraan per jam ---------------- */

  function bindHourlyDragScroll() {
    let isDown = false;
    let startX = 0;
    let startScroll = 0;

    el.hourly.addEventListener("mousedown", (event) => {
      if (event.button !== 0) return;
      isDown = true;
      startX = event.pageX;
      startScroll = el.hourly.scrollLeft;
      el.hourly.classList.add("is-dragging");
    });

    window.addEventListener("mousemove", (event) => {
      if (!isDown) return;
      event.preventDefault();
      const walk = event.pageX - startX;
      el.hourly.scrollLeft = startScroll - walk;
    });

    window.addEventListener("mouseup", () => {
      if (!isDown) return;
      isDown = false;
      el.hourly.classList.remove("is-dragging");
    });
  }

  /* ---------------- Event ---------------- */

  function bindEvents() {
    el.unitButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const unit = button.dataset.unit;
        if (unit === state.unit) return;
        state.unit = unit;
        saveStore({ unit: unit });
        applyUnitUI();
        if (state.data) {
          const scrollLeft = el.hourly.scrollLeft;
          renderAll();
          el.hourly.scrollLeft = scrollLeft;
          updateHourScrollButtons();
        }
      });
    });

    el.refreshBtn.addEventListener("click", () => {
      if (!state.place) return;
      loadPlace(state.place, { save: false });
    });

    el.locateBtn.addEventListener("click", () => locate({ manual: true }));
    el.bannerClose.addEventListener("click", hideBanner);

    el.hourPrev.addEventListener("click", () => el.hourly.scrollBy({ left: -288, behavior: "smooth" }));
    el.hourNext.addEventListener("click", () => el.hourly.scrollBy({ left: 288, behavior: "smooth" }));
    el.hourly.addEventListener("scroll", updateHourScrollButtons, { passive: true });
    window.addEventListener("resize", updateHourScrollButtons);
    bindHourlyDragScroll();

    // Klik baris harian untuk membuka/menutup detail harian
    el.daily.addEventListener("click", (event) => {
      const btn = event.target.closest(".day");
      if (!btn) return;
      const item = btn.closest(".day-item");
      if (!item) return;
      const idx = Number(item.dataset.dayIndex);
      const willOpen = state.openDayIndex !== idx;
      state.openDayIndex = willOpen ? idx : -1;

      el.daily.querySelectorAll(".day-item").forEach((node) => {
        const open = Number(node.dataset.dayIndex) === state.openDayIndex;
        node.classList.toggle("is-open", open);
        const rowBtn = node.querySelector(".day");
        if (rowBtn) rowBtn.setAttribute("aria-expanded", String(open));
      });
    });

    let debounce = null;
    el.searchInput.addEventListener("focus", () => {
      if (el.searchInput.value.trim().length < 2) {
        renderQuickLocations();
      }
    });

    el.searchInput.addEventListener("input", () => {
      updateSearchClearButton();
      if (debounce) clearTimeout(debounce);
      const value = el.searchInput.value;
      if (value.trim().length < 2) {
        renderQuickLocations();
        return;
      }
      debounce = setTimeout(() => runSearch(value), 300);
    });

    el.searchClear.addEventListener("click", () => {
      el.searchInput.value = "";
      updateSearchClearButton();
      el.searchInput.focus();
      renderQuickLocations();
    });

    el.searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (state.searchIndex >= 0) {
        selectSearchResult(state.searchIndex);
        return;
      }
      if (state.searchMode === "geo" && state.searchItems.length) {
        selectSearchResult(0);
        return;
      }
      if (el.searchInput.value.trim().length >= 2) runSearch(el.searchInput.value);
    });

    el.searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        el.searchInput.blur();
        return;
      }
      if (el.searchResults.hidden) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSearchActive(state.searchIndex + 1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSearchActive(state.searchIndex - 1);
      }
    });

    // Pintasan keyboard '/' untuk langsung mencari kota
    document.addEventListener("keydown", (event) => {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) return;
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (document.activeElement && document.activeElement.isContentEditable)) {
        return;
      }
      event.preventDefault();
      el.searchInput.focus();
      el.searchInput.select();
    });

    el.searchResults.addEventListener("click", (event) => {
      const removeBtn = event.target.closest("[data-remove-index]");
      if (removeBtn) {
        event.stopPropagation();
        removeRecentPlace(Number(removeBtn.dataset.removeIndex));
        return;
      }
      const popularBtn = event.target.closest("[data-popular-index]");
      if (popularBtn) {
        const city = POPULAR_PLACES[Number(popularBtn.dataset.popularIndex)];
        if (city) choosePlaceFromObject(city, "search");
        return;
      }
      const target = event.target.closest(".search-result");
      if (!target) return;
      selectSearchResult(Number(target.dataset.index));
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest("#searchWrap")) setSearchOpen(false);
    });

    window.addEventListener("online", () => {
      if (state.place && (!state.lastFetch || Date.now() - state.lastFetch > 5 * 60 * 1000)) {
        loadPlace(state.place, { save: false });
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "visible" || !state.place) return;
      if (!state.lastFetch || Date.now() - state.lastFetch > REFRESH_MS) {
        loadPlace(state.place, { save: false });
      }
    });
  }

  /* ---------------- Mulai ---------------- */

  function init() {
    const stored = loadStore() || {};
    if (stored.unit === "f" || stored.unit === "c") state.unit = stored.unit;
    if (Array.isArray(stored.recent)) {
      state.recent = stored.recent.filter((p) => p && Number.isFinite(Number(p.latitude)) && Number.isFinite(Number(p.longitude))).slice(0, MAX_RECENT);
    }

    applyUnitUI();
    updateSearchClearButton();
    buildWeatherParticles();
    bindEvents();
    startClock();

    const saved = stored.place;
    const valid = saved && Number.isFinite(Number(saved.latitude)) && Number.isFinite(Number(saved.longitude));

    if (valid) {
      loadPlace(saved, { save: false });
      if (saved.source !== "search") locate();
    } else {
      locate();
    }

    setInterval(() => {
      if (document.visibilityState !== "visible" || !state.place) return;
      if (Date.now() - state.lastFetch >= REFRESH_MS) loadPlace(state.place, { save: false });
    }, 60000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
