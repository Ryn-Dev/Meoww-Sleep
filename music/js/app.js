/**
 * ============================================================================
 * FEBRYAN MUSIC - WEB LINK MUSIC PLAYER
 * Main JavaScript Engine with Font Awesome Icons & Controller Mode Settings
 * ============================================================================
 */

(() => {
  "use strict";

  // --- Constants & Config ---
  const STORAGE_KEY = "fm_music_links_v2";
  const LEGACY_KEY = "febryanMusicPlaylist_v1";
  const CTRL_MODE_KEY = "fm_ctrl_mode_v2";
  const DEFAULT_LOGO = "images/fm1.png";

  // Font Awesome Icon Definitions
  const FA_PLAY = '<i class="fa-solid fa-play"></i>';
  const FA_PAUSE = '<i class="fa-solid fa-pause"></i>';
  const FA_REPEAT = '<i class="fa-solid fa-repeat"></i>';
  const FA_REPEAT_ONE = '<i class="fa-solid fa-arrows-rotate"></i>';
  const FA_VOL_HIGH = '<i class="fa-solid fa-volume-high"></i>';
  const FA_VOL_LOW = '<i class="fa-solid fa-volume-low"></i>';
  const FA_VOL_MUTE = '<i class="fa-solid fa-volume-xmark"></i>';

  // --- State Variables ---
  let playlist = [];
  let currentId = null;
  let isPlaying = false;
  let isShuffle = false;
  let repeatMode = "off"; // "off" | "all" | "one"
  let playbackSpeed = 1.0;
  let lastVolume = 0.85;
  let isMuted = false;
  let controllerDisplayMode = "both"; // "both" | "hero" | "bottom"

  // YouTube Audio-Only Player State
  let ytPlayer = null;
  let ytReady = false;
  let ytScriptLoaded = false;
  let ytInterval = null;
  let pendingYtId = null;

  // Timers
  let toastTimer = null;
  let ytDetectTimeout = null;

  // Mobile Background Playback & Screen Wake Lock
  let wakeLockSentinel = null;
  const SILENT_AUDIO_URI = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
  const silentCarrierEl = document.getElementById("silentCarrierAudio");

  // --- DOM Elements Cache ---
  const audio = document.getElementById("audioEngine");
  const toastEl = document.getElementById("toastPill");
  const toastText = document.getElementById("toastText");

  // Hero Display
  const nowHeroTitle = document.getElementById("nowHeroTitle");
  const nowHeroArtist = document.getElementById("nowHeroArtist");
  const nowHeroCover = document.getElementById("nowHeroCover");
  const nowHeroSourceTag = document.getElementById("nowHeroSourceTag");
  const liveStatusText = document.getElementById("liveStatusText");
  const liveStatusDot = document.getElementById("liveStatusDot");
  const vinylDeck = document.getElementById("vinylDeck");
  const vinylRecord = document.getElementById("vinylRecord");
  const soundWave = document.getElementById("soundWave");
  const totalCountLabel = document.getElementById("totalCountLabel");

  // Hero Controls & Scrubber ("Tombol kontrol di card utama & bisa dilompati durasinya")
  const heroProgressBar = document.getElementById("heroProgressBar");
  const heroCurTime = document.getElementById("heroCurTime");
  const heroDurTime = document.getElementById("heroDurTime");
  const heroPlayBtn = document.getElementById("heroPlayBtn");
  const heroPrevBtn = document.getElementById("heroPrevBtn");
  const heroNextBtn = document.getElementById("heroNextBtn");
  const heroShuffleBtn = document.getElementById("heroShuffleBtn");
  const heroRepeatBtn = document.getElementById("heroRepeatBtn");
  const heroMuteBtn = document.getElementById("heroMuteBtn");
  const heroVolumeSlider = document.getElementById("heroVolumeSlider");

  // Playlist Display
  const tracksListEl = document.getElementById("tracksList");
  const searchFieldInput = document.getElementById("searchFieldInput");
  const searchCountBadge = document.getElementById("searchCountBadge");

  // Bottom Fixed Player
  const miniCoverArt = document.getElementById("miniCoverArt");
  const miniTitleText = document.getElementById("miniTitleText");
  const miniArtistText = document.getElementById("miniArtistText");
  const mainPlayBtn = document.getElementById("mainPlayBtn");
  const prevTrackBtn = document.getElementById("prevTrackBtn");
  const nextTrackBtn = document.getElementById("nextTrackBtn");
  const shuffleToggleBtn = document.getElementById("shuffleToggleBtn");
  const repeatToggleBtn = document.getElementById("repeatToggleBtn");
  const progressBar = document.getElementById("progressBar");
  const curTimeDisplay = document.getElementById("curTimeDisplay");
  const durTimeDisplay = document.getElementById("durTimeDisplay");
  const volumeSlider = document.getElementById("volumeSlider");
  const muteToggleBtn = document.getElementById("muteToggleBtn");
  const speedToggleBtn = document.getElementById("speedToggleBtn");

  // Modal Form & Auto-Detection Status
  const addMusicForm = document.getElementById("addMusicForm");
  const inputTrackUrl = document.getElementById("inputTrackUrl");
  const inputTrackTitle = document.getElementById("inputTrackTitle");
  const inputTrackArtist = document.getElementById("inputTrackArtist");
  const inputTrackCover = document.getElementById("inputTrackCover");
  const ytDetectStatus = document.getElementById("ytDetectStatus");

  // Preset Samples (Reliable & Instant Testing)
  const PRESET_SAMPLES = [
    {
      id: "preset_lofi",
      title: "Morning Study Lofi",
      artist: "Lofi Beats Archive",
      url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
      cover: DEFAULT_LOGO,
      type: "audio"
    },
    {
      id: "preset_ambient",
      title: "Peaceful Ambient Strings",
      artist: "Chill Waves",
      url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-amp-strings-10711.mp3",
      cover: DEFAULT_LOGO,
      type: "audio"
    },
    {
      id: "preset_synth",
      title: "Retro 80s Synthwave",
      artist: "Synth City",
      url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=synthwave-80s-110045.mp3",
      cover: DEFAULT_LOGO,
      type: "audio"
    }
  ];

  // --- Helper Functions ---
  function showToast(msg) {
    if (!toastEl || !toastText) return;
    toastText.textContent = msg;
    toastEl.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("visible");
    }, 3200);
  }

  function makeUniqueId() {
    return "fm_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  }

  function formatSeconds(sec) {
    if (!Number.isFinite(sec) || sec < 0) return "0:00";
    const total = Math.floor(sec);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/[&<>"']/g, m => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[m]));
  }

  // --- Screen Wake Lock API (Mencegah Layar HP Mati Otomatis Saat Mendengarkan Musik) ---
  async function requestScreenWakeLock() {
    if ("wakeLock" in navigator && document.visibilityState === "visible") {
      try {
        if (!wakeLockSentinel) {
          wakeLockSentinel = await navigator.wakeLock.request("screen");
          wakeLockSentinel.addEventListener("release", () => {
            wakeLockSentinel = null;
          });
        }
      } catch (err) {
        // Mode hemat baterai atau pembatasan OS ditangani secara aman
      }
    }
  }

  function releaseScreenWakeLock() {
    if (wakeLockSentinel) {
      try {
        wakeLockSentinel.release();
      } catch (e) {}
      wakeLockSentinel = null;
    }
  }

  // --- Silent Audio Carrier Bridge (Mencegah OS Menutup Audio di Latar Belakang) ---
  function startSilentCarrier() {
    if (silentCarrierEl) {
      if (!silentCarrierEl.src || silentCarrierEl.src === "") {
        silentCarrierEl.src = SILENT_AUDIO_URI;
      }
      silentCarrierEl.volume = 0.01;
      silentCarrierEl.play().catch(() => {});
    }
  }

  function stopSilentCarrier() {
    if (silentCarrierEl) {
      try {
        silentCarrierEl.pause();
        silentCarrierEl.currentTime = 0;
      } catch (e) {}
    }
  }

  // --- Controller Display Mode Management ---
  function loadControllerDisplayMode() {
    try {
      const saved = localStorage.getItem(CTRL_MODE_KEY);
      if (saved === "hero" || saved === "bottom" || saved === "both") {
        controllerDisplayMode = saved;
      } else {
        controllerDisplayMode = "both";
      }
    } catch (e) {
      controllerDisplayMode = "both";
    }
    applyControllerDisplayMode(controllerDisplayMode, false);
  }

  function applyControllerDisplayMode(mode, showNotice = true) {
    controllerDisplayMode = mode;
    document.body.classList.remove("ctrl-mode-both", "ctrl-mode-hero", "ctrl-mode-bottom");
    document.body.classList.add(`ctrl-mode-${mode}`);

    try {
      localStorage.setItem(CTRL_MODE_KEY, mode);
    } catch (e) {}

    // Sync radio inputs in settings modal
    const radio = document.querySelector(`input[name="ctrlDisplayMode"][value="${mode}"]`);
    if (radio) radio.checked = true;

    if (showNotice) {
      const modeNames = {
        both: "Kedua Controller (Card Utama & Bar Bawah)",
        hero: "Hanya Card Utama (Bar Bawah Disembunyikan)",
        bottom: "Hanya Bar Bawah (Card Utama Disembunyikan)"
      };
      showToast(`Tampilan controller diubah: ${modeNames[mode] || mode}`);
    }
  }

  // Listen to radio changes in Settings Modal
  document.querySelectorAll('input[name="ctrlDisplayMode"]').forEach(radio => {
    radio.addEventListener("change", (e) => {
      applyControllerDisplayMode(e.target.value, true);
    });
  });

  // Detect YouTube ID from various URL patterns
  function extractYouTubeId(url) {
    try {
      const u = new URL(url);
      if (u.hostname === "youtu.be" || u.hostname.endsWith(".youtu.be")) {
        return u.pathname.split("/").filter(Boolean)[0] || null;
      }
      if (u.hostname.includes("youtube.com") || u.hostname.includes("youtube-nocookie.com")) {
        if (u.searchParams.get("v")) return u.searchParams.get("v");
        const parts = u.pathname.split("/").filter(Boolean);
        if (["embed", "shorts", "live"].includes(parts[0])) return parts[1] || null;
      }
    } catch (e) {}
    return null;
  }

  // Derive song title from URL if not given
  function deriveTitleFromUrl(url) {
    try {
      const ytId = extractYouTubeId(url);
      if (ytId) return "YouTube Track (" + ytId + ")";

      const u = new URL(url);
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts.length > 0) {
        let name = decodeURIComponent(parts[parts.length - 1]);
        name = name.replace(/\.[a-zA-Z0-9]+$/, ""); // Remove extension
        name = name.replace(/[_-]+/g, " ").trim();
        if (name.length > 0) {
          return name.charAt(0).toUpperCase() + name.slice(1);
        }
      }
    } catch (e) {}
    return "Audio Stream Link";
  }

  // --- Check Duplicate Track (Ensures Playlist Links are strictly UNIQUE) ---
  function findDuplicateTrack(url, excludeId = null, extraPool = null) {
    if (!url) return null;
    const cleanUrl = String(url).trim();
    if (!cleanUrl) return null;

    const ytId = extractYouTubeId(cleanUrl);
    const normUrl = cleanUrl.replace(/\/+$/, "").toLowerCase();
    const sourcePool = extraPool || playlist;

    return sourcePool.find(t => {
      if (!t || !t.url) return false;
      if (excludeId && t.id === excludeId) return false;

      const existingUrl = String(t.url).trim();
      // 1. YouTube ID matching (handles youtube.com/watch?v=, youtu.be, shorts, extra parameters)
      if (ytId) {
        const existingYtId = extractYouTubeId(existingUrl);
        if (existingYtId && existingYtId === ytId) return true;
      }

      // 2. Direct normalized URL matching (case-insensitive, trailing slash ignored)
      const existingNorm = existingUrl.replace(/\/+$/, "").toLowerCase();
      return existingNorm === normUrl;
    }) || null;
  }

  // Deduplicate array of tracks (preserves earliest added track)
  function deduplicateTracks(tracks) {
    if (!Array.isArray(tracks)) return [];
    const seenYtIds = new Set();
    const seenUrls = new Set();
    const unique = [];

    tracks.forEach(t => {
      if (!t || !t.url) return;
      const cleanUrl = String(t.url).trim().replace(/\/+$/, "").toLowerCase();
      const ytId = extractYouTubeId(t.url);

      if (ytId) {
        if (seenYtIds.has(ytId)) return;
        seenYtIds.add(ytId);
      } else {
        if (seenUrls.has(cleanUrl)) return;
        seenUrls.add(cleanUrl);
      }
      unique.push(t);
    });

    return unique;
  }

  // Fetch YouTube Title & Info Asynchronously (Auto-Retrieve)
  async function fetchYouTubeInfo(url) {
    const ytId = extractYouTubeId(url);
    if (!ytId) return null;

    // 1. Coba endpoint resmi YouTube oEmbed (CORS supported)
    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
      if (res.ok) {
        const data = await res.json();
        return {
          title: data.title || null,
          author: data.author_name || null,
          cover: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
        };
      }
    } catch (e) {}

    // 2. Fallback ke noembed
    try {
      const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        return {
          title: data.title || null,
          author: data.author_name || null,
          cover: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
        };
      }
    } catch (e) {}

    return null;
  }

  // Otomatis deteksi & ambil judul saat link YouTube diketik atau di-paste
  function triggerYouTubeAutoDetection() {
    if (!inputTrackUrl) return;
    const url = inputTrackUrl.value.trim();
    if (!url) {
      if (ytDetectStatus) ytDetectStatus.style.display = "none";
      return;
    }

    // Pengecekan real-time: jika link sudah ada di playlist, beri peringatan langsung
    const duplicate = findDuplicateTrack(url);
    if (duplicate) {
      if (ytDetectStatus) {
        ytDetectStatus.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color:var(--accent-gold)"></i> Lagu ini sudah ada: <strong>${duplicate.title}</strong>`;
        ytDetectStatus.style.display = "inline";
      }
      return;
    }

    const ytId = extractYouTubeId(url);
    if (!ytId) {
      if (ytDetectStatus) ytDetectStatus.style.display = "none";
      return;
    }

    if (ytDetectStatus) {
      ytDetectStatus.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengambil info YouTube...';
      ytDetectStatus.style.display = "inline";
    }

    clearTimeout(ytDetectTimeout);
    ytDetectTimeout = setTimeout(async () => {
      // Periksa kembali duplikasi sebelum proses fetch selesai
      const dupCheck = findDuplicateTrack(url);
      if (dupCheck) {
        if (ytDetectStatus) {
          ytDetectStatus.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color:var(--accent-gold)"></i> Lagu ini sudah ada: <strong>${dupCheck.title}</strong>`;
          ytDetectStatus.style.display = "inline";
        }
        return;
      }

      const info = await fetchYouTubeInfo(url);
      if (info && info.title) {
        if (inputTrackTitle && (!inputTrackTitle.value || inputTrackTitle.value.startsWith("YouTube Track"))) {
          inputTrackTitle.value = info.title;
        }
        if (inputTrackArtist && (!inputTrackArtist.value || inputTrackArtist.value === "Febryan Music")) {
          inputTrackArtist.value = info.author || "YouTube Channel";
        }
        if (inputTrackCover && !inputTrackCover.value) {
          inputTrackCover.value = info.cover;
        }
        if (ytDetectStatus) {
          ytDetectStatus.innerHTML = '<i class="fa-solid fa-check"></i> Judul & Artis otomatis terisi!';
          setTimeout(() => { if (ytDetectStatus) ytDetectStatus.style.display = "none"; }, 3500);
        }
        showToast(`Judul YouTube berhasil diambil: ${info.title.substring(0, 32)}...`);
      } else {
        if (ytDetectStatus) ytDetectStatus.style.display = "none";
      }
    }, 250);
  }

  if (inputTrackUrl) {
    inputTrackUrl.addEventListener("input", triggerYouTubeAutoDetection);
    inputTrackUrl.addEventListener("paste", () => setTimeout(triggerYouTubeAutoDetection, 60));
    inputTrackUrl.addEventListener("change", triggerYouTubeAutoDetection);
  }

  // --- LocalStorage Operations ---
  function loadPlaylistFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(t => t && t.id && t.url);
          const deduped = deduplicateTracks(valid);
          if (deduped.length !== valid.length) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));
          }
          return deduped;
        }
      }

      // Check legacy migration
      const legacyRaw = localStorage.getItem(LEGACY_KEY);
      if (legacyRaw) {
        const legacyParsed = JSON.parse(legacyRaw);
        if (Array.isArray(legacyParsed)) {
          const migrated = legacyParsed
            .filter(t => t && t.url && t.type === "youtube")
            .map(t => ({
              id: t.id || makeUniqueId(),
              title: t.title || "YouTube Audio",
              artist: "YouTube",
              url: t.url.startsWith("http") ? t.url : `https://www.youtube.com/watch?v=${t.url}`,
              cover: `https://img.youtube.com/vi/${t.url}/hqdefault.jpg`,
              type: "youtube",
              addedAt: t.addedAt || Date.now()
            }));
          if (migrated.length > 0) {
            const dedupedMigrated = deduplicateTracks(migrated);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dedupedMigrated));
            return dedupedMigrated;
          }
        }
      }
    } catch (e) {
      console.error("Gagal membaca LocalStorage:", e);
    }
    return [];
  }

  function savePlaylistToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(playlist));
    } catch (e) {
      showToast("Penyimpanan LocalStorage browser penuh.");
    }
    updateListCounters();
  }

  function updateListCounters() {
    const total = playlist.length;
    if (totalCountLabel) totalCountLabel.textContent = `${total} lagu tersimpan`;
    const q = (searchFieldInput ? searchFieldInput.value : "").trim().toLowerCase();
    const count = playlist.filter(t => t.title.toLowerCase().includes(q) || (t.artist && t.artist.toLowerCase().includes(q))).length;
    if (searchCountBadge) searchCountBadge.textContent = `${count} lagu`;
  }

  // --- Render Playlist UI with Font Awesome Icons ---
  function renderPlaylistUI() {
    if (!tracksListEl) return;
    const q = (searchFieldInput ? searchFieldInput.value : "").trim().toLowerCase();
    const filtered = playlist.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.artist && t.artist.toLowerCase().includes(q))
    );

    updateListCounters();

    if (filtered.length === 0) {
      tracksListEl.innerHTML = `
        <div class="empty-placeholder">
          <div class="icon"><i class="fa-solid fa-music"></i></div>
          <strong>${playlist.length === 0 ? "Belum ada link musik yang disimpan." : "Tidak ada lagu yang cocok dengan pencarian."}</strong>
          <p>${playlist.length === 0 ? "Klik tombol '＋ Tambah Musik' untuk memasukkan link audio langsung / YouTube." : "Coba cari dengan kata kunci lain."}</p>
        </div>
      `;
      return;
    }

    tracksListEl.innerHTML = "";
    filtered.forEach((track, index) => {
      const isCurrent = track.id === currentId;
      const card = document.createElement("div");
      card.className = `track-card ${isCurrent ? "active-playing" : ""}`;
      card.id = `track-card-${track.id}`;
      card.setAttribute("draggable", "true");
      card.setAttribute("data-id", track.id);
      card.setAttribute("data-index", String(index));

      const coverUrl = track.cover && track.cover.trim() !== "" ? track.cover : DEFAULT_LOGO;
      const typeLabel = track.type === "youtube" ? "YOUTUBE AUDIO" : "AUDIO LINK";
      const typeClass = track.type === "youtube" ? "youtube" : "audio";
      const typeIcon = track.type === "youtube" ? '<i class="fa-brands fa-youtube"></i>' : '<i class="fa-solid fa-wave-square"></i>';

      card.innerHTML = `
        <div class="drag-handle" title="Tekan & geser untuk mengatur urutan lagu" aria-label="Geser urutan lagu">
          <i class="fa-solid fa-grip-vertical"></i>
        </div>
        <div class="track-index-num">${isCurrent && isPlaying ? '<i class="fa-solid fa-volume-high"></i>' : (index + 1)}</div>
        <img src="${coverUrl}" alt="Cover" class="track-thumbnail" onerror="this.src='${DEFAULT_LOGO}'">
        <div class="track-details">
          <div class="track-title-text" title="${escapeHtml(track.title)}">${escapeHtml(track.title)}</div>
          <div class="track-subtitle-text">
            <span>${escapeHtml(track.artist || "Febryan Music")}</span>
            <span>·</span>
            <span class="track-type-badge ${typeClass}">${typeIcon} ${typeLabel}</span>
          </div>
        </div>
        <div class="track-buttons-row">
          <button class="btn-track-action play-indicator" data-action="play" data-id="${track.id}" title="${isCurrent && isPlaying ? "Pause" : "Putar"}">
            ${isCurrent && isPlaying ? FA_PAUSE : FA_PLAY}
          </button>
          <button class="btn-track-action reorder-btn" data-action="up" data-id="${track.id}" title="Pindah ke Atas">
            <i class="fa-solid fa-chevron-up"></i>
          </button>
          <button class="btn-track-action reorder-btn" data-action="down" data-id="${track.id}" title="Pindah ke Bawah">
            <i class="fa-solid fa-chevron-down"></i>
          </button>
          <button class="btn-track-action" data-action="edit" data-id="${track.id}" title="Edit Data">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn-track-action btn-delete" data-action="delete" data-id="${track.id}" title="Hapus Lagu">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `;

      card.addEventListener("dblclick", () => playTrackById(track.id));
      tracksListEl.appendChild(card);
    });

    setupPlaylistDragAndDrop();
  }

  // --- YouTube Audio-Only Engine (Invisible IFrame) ---
  function initYouTubeAudioAPI() {
    if (ytScriptLoaded) return;
    ytScriptLoaded = true;

    const scriptTag = document.createElement("script");
    scriptTag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(scriptTag);

    window.onYouTubeIframeAPIReady = () => {
      ytPlayer = new YT.Player("hiddenYtPlayerSlot", {
        width: "100%",
        height: "100%",
        videoId: pendingYtId || "",
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          autoplay: 1,
          playsinline: 1,
          controls: 1, // Memungkinkan tombol 'Lewati Iklan' / Skip Ad milik YouTube diklik saat diintip
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: () => {
            ytReady = true;
            ytPlayer.setVolume(isMuted ? 0 : Math.round(volumeSlider.value * 100));
            if (pendingYtId) {
              ytPlayer.loadVideoById(pendingYtId);
              pendingYtId = null;
            }
            startYtTracking();
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
              setPlaybackActive(true, "Memutar YouTube Audio");
            } else if (event.data === YT.PlayerState.PAUSED) {
              setPlaybackActive(false, "YouTube Audio Dijeda");
            } else if (event.data === YT.PlayerState.ENDED) {
              // Otomatis pindah ketika musik YouTube selesai
              handleTrackCompletion();
            }
          },
          onError: () => {
            showToast("Audio YouTube tidak dapat dimuat (mungkin dibatasi hak cipta).");
            setPlaybackActive(false, "Gagal memutar YouTube");
          }
        }
      });
    };
  }

  function startYtTracking() {
    clearInterval(ytInterval);
    ytInterval = setInterval(() => {
      if (ytPlayer && ytReady && isPlaying) {
        if (typeof ytPlayer.getCurrentTime === "function") {
          const cur = ytPlayer.getCurrentTime() || 0;
          const dur = ytPlayer.getDuration() || 0;
          syncTimeDisplays(cur, dur);
        }

        // Deteksi apakah YouTube sedang menayangkan iklan
        if (typeof ytPlayer.getVideoData === "function") {
          const vData = ytPlayer.getVideoData();
          const curTrack = playlist.find(t => t.id === currentId);
          const expectedYtId = curTrack ? extractYouTubeId(curTrack.url) : null;
          const isAd = vData && (vData.isAd || (expectedYtId && vData.video_id && vData.video_id !== expectedYtId));
          if (isAd) {
            if (liveStatusText) liveStatusText.textContent = "Memutar Iklan (Klik 'Intip Video' jika ingin Skip)";
          }
        }
      }
    }, 500);
  }

  // Sync Progress Bar and Time across Hero Deck & Bottom Player Bar
  function syncTimeDisplays(cur, dur) {
    const curStr = formatSeconds(cur);
    const durStr = (Number.isFinite(dur) && dur > 0) ? formatSeconds(dur) : (dur === 0 ? "0:00" : "LIVE");
    const progressVal = (Number.isFinite(dur) && dur > 0) ? Math.floor((cur / dur) * 1000) : 0;

    if (curTimeDisplay) curTimeDisplay.textContent = curStr;
    if (heroCurTime) heroCurTime.textContent = curStr;

    if (durTimeDisplay) durTimeDisplay.textContent = durStr;
    if (heroDurTime) heroDurTime.textContent = durStr;

    if (progressBar) progressBar.value = progressVal;
    if (heroProgressBar) heroProgressBar.value = progressVal;

    // Sinkronisasi posisi waktu secara langsung ke MediaSession OS / Lock Screen HP
    if ("mediaSession" in navigator && typeof navigator.mediaSession.setPositionState === "function") {
      if (Number.isFinite(dur) && dur > 0 && Number.isFinite(cur) && cur >= 0 && cur <= dur) {
        try {
          navigator.mediaSession.setPositionState({
            duration: dur,
            playbackRate: playbackSpeed || 1.0,
            position: Math.min(cur, dur)
          });
        } catch (e) {}
      }
    }
  }

  // Seek / Jump to track position ("Bisa dilompati durasinya")
  function seekToFraction(ratio) {
    const track = playlist.find(t => t.id === currentId);
    if (!track) return;

    if (track.type === "youtube" && ytPlayer && ytReady) {
      const dur = ytPlayer.getDuration() || 0;
      if (dur > 0) {
        const targetSec = ratio * dur;
        ytPlayer.seekTo(targetSec, true);
        syncTimeDisplays(targetSec, dur);
      }
    } else if (Number.isFinite(audio.duration) && audio.duration > 0) {
      const targetSec = ratio * audio.duration;
      audio.currentTime = targetSec;
      syncTimeDisplays(targetSec, audio.duration);
    }
  }

  function seekToSeconds(sec) {
    const track = playlist.find(t => t.id === currentId);
    if (!track || !Number.isFinite(sec)) return;

    if (track.type === "youtube" && ytPlayer && ytReady) {
      const dur = ytPlayer.getDuration() || 0;
      const targetSec = Math.max(0, Math.min(sec, dur || sec));
      ytPlayer.seekTo(targetSec, true);
      syncTimeDisplays(targetSec, dur);
    } else if (Number.isFinite(audio.duration) && audio.duration > 0) {
      const targetSec = Math.max(0, Math.min(sec, audio.duration));
      audio.currentTime = targetSec;
      syncTimeDisplays(targetSec, audio.duration);
    }
  }

  function seekRelative(offsetSec) {
    const track = playlist.find(t => t.id === currentId);
    if (!track) return;
    if (track.type === "youtube" && ytPlayer && ytReady) {
      const cur = ytPlayer.getCurrentTime() || 0;
      seekToSeconds(cur + offsetSec);
    } else {
      const cur = audio.currentTime || 0;
      seekToSeconds(cur + offsetSec);
    }
  }

  // --- Core Playback Execution ---
  async function playTrackById(id) {
    const track = playlist.find(t => t.id === id);
    if (!track) return;

    currentId = id;
    updateHeroAndMiniDisplay(track);

    // Stop current media completely
    stopMediaEngines();

    if (track.type === "youtube") {
      const ytId = extractYouTubeId(track.url);
      if (!ytId) {
        showToast("Format URL YouTube tidak valid.");
        return;
      }

      if (!ytReady) {
        pendingYtId = ytId;
        initYouTubeAudioAPI();
        setPlaybackActive(true, "Memuat YouTube Audio...");
      } else {
        ytPlayer.loadVideoById(ytId);
        ytPlayer.setPlaybackRate(playbackSpeed);
        ytPlayer.setVolume(isMuted ? 0 : Math.round(volumeSlider.value * 100));
        startYtTracking();
      }
    } else {
      // Direct Audio link
      audio.src = track.url;
      audio.playbackRate = playbackSpeed;
      audio.volume = isMuted ? 0 : volumeSlider.value;

      audio.play().then(() => {
        setPlaybackActive(true, "Sedang Memutar Audio Link");
      }).catch(err => {
        console.warn("Direct audio playback failed:", err);
        showToast("Gagal memutar audio. Pastikan link langsung memiliki izin CORS.");
        setPlaybackActive(false, "Gagal memutar (CORS/URL)");
      });
    }

    renderPlaylistUI();
    registerMediaSession(track);
  }

  function stopMediaEngines() {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();

    if (ytPlayer && ytReady && typeof ytPlayer.stopVideo === "function") {
      try { ytPlayer.stopVideo(); } catch (e) {}
    }
    clearInterval(ytInterval);
    stopSilentCarrier();
    releaseScreenWakeLock();

    setPlaybackActive(false, "Dijeda");
  }

  function setPlaybackActive(active, statusMessage) {
    isPlaying = active;
    const playIconHtml = active ? FA_PAUSE : FA_PLAY;

    // Sinkronisasi status MediaSession ke OS / Lock Screen HP
    if ("mediaSession" in navigator) {
      try {
        navigator.mediaSession.playbackState = active ? "playing" : "paused";
      } catch (e) {}
    }

    if (active) {
      requestScreenWakeLock();
      const currentTrack = playlist.find(t => t.id === currentId);
      if (currentTrack && currentTrack.type === "youtube") {
        startSilentCarrier();
      } else {
        stopSilentCarrier();
      }
    } else {
      releaseScreenWakeLock();
      stopSilentCarrier();
    }

    if (mainPlayBtn) {
      mainPlayBtn.innerHTML = playIconHtml;
      mainPlayBtn.setAttribute("aria-label", active ? "Pause" : "Play");
    }
    if (heroPlayBtn) {
      heroPlayBtn.innerHTML = playIconHtml;
      heroPlayBtn.setAttribute("aria-label", active ? "Pause" : "Play");
    }

    if (liveStatusDot) {
      liveStatusDot.classList.toggle("idle", !active);
    }
    if (liveStatusText && statusMessage) {
      liveStatusText.textContent = statusMessage;
    }

    // Animasi piringan berputar & stik mekanis tonearm
    if (vinylDeck) {
      vinylDeck.classList.toggle("playing", active);
    }
    if (vinylRecord) {
      vinylRecord.classList.toggle("spinning", active);
    }
    if (soundWave) {
      soundWave.classList.toggle("active", active);
    }

    // Update mini play buttons in playlist table
    document.querySelectorAll(".btn-track-action.play-indicator").forEach(btn => {
      const id = btn.getAttribute("data-id");
      btn.innerHTML = (id === currentId && active) ? FA_PAUSE : FA_PLAY;
    });
  }

  function togglePlayPause() {
    const track = playlist.find(t => t.id === currentId);
    if (!track) {
      if (playlist.length > 0) {
        playTrackById(playlist[0].id);
      } else {
        showToast("Tambahkan link musik terlebih dahulu.");
      }
      return;
    }

    if (track.type === "youtube") {
      if (!ytPlayer || !ytReady) {
        playTrackById(track.id);
        return;
      }
      const state = ytPlayer.getPlayerState();
      if (state === YT.PlayerState.PLAYING) {
        ytPlayer.pauseVideo();
      } else {
        ytPlayer.playVideo();
      }
    } else {
      if (!audio.src || audio.src === "") {
        playTrackById(track.id);
        return;
      }
      if (audio.paused) {
        audio.play().then(() => {
          setPlaybackActive(true, "Sedang Memutar");
        }).catch(() => {
          showToast("Gagal melanjutkan audio.");
        });
      } else {
        audio.pause();
        setPlaybackActive(false, "Dijeda");
      }
    }
    renderPlaylistUI();
  }

  // Next Track dengan pemutaran otomatis berkelanjutan
  function playNextTrack() {
    if (playlist.length === 0) return;
    let idx = playlist.findIndex(t => t.id === currentId);

    if (isShuffle && playlist.length > 1) {
      let rand = idx;
      while (rand === idx) {
        rand = Math.floor(Math.random() * playlist.length);
      }
      playTrackById(playlist[rand].id);
      return;
    }

    idx++;
    if (idx >= playlist.length) {
      // Loop kembali ke lagu awal agar terus berputar otomatis
      idx = 0;
    }
    playTrackById(playlist[idx].id);
  }

  function playPreviousTrack() {
    if (playlist.length === 0) return;
    const track = playlist.find(t => t.id === currentId);

    // If already playing for > 4 seconds, rewind to start
    if (track && track.type !== "youtube" && audio.currentTime > 4) {
      audio.currentTime = 0;
      return;
    }

    let idx = playlist.findIndex(t => t.id === currentId);
    idx--;
    if (idx < 0) {
      idx = playlist.length - 1;
    }
    playTrackById(playlist[idx].id);
  }

  // Otomatis pindah saat musik selesai ("ada pindah otomatisnya ketika musik satu selesai")
  function handleTrackCompletion() {
    if (repeatMode === "one") {
      const track = playlist.find(t => t.id === currentId);
      if (track) playTrackById(track.id);
    } else {
      playNextTrack();
    }
  }

  // --- Update UI Metadata Display ---
  function updateHeroAndMiniDisplay(track) {
    const title = track.title || "Tanpa Judul";
    const artist = track.artist || "Febryan Music";
    const cover = track.cover && track.cover.trim() !== "" ? track.cover : DEFAULT_LOGO;

    if (nowHeroTitle) nowHeroTitle.textContent = title;
    if (nowHeroArtist) nowHeroArtist.textContent = artist;
    if (nowHeroCover) {
      nowHeroCover.src = cover;
      nowHeroCover.onerror = () => { nowHeroCover.src = DEFAULT_LOGO; };
    }

    if (nowHeroSourceTag) {
      nowHeroSourceTag.style.display = "inline-flex";
      const icon = track.type === "youtube" ? '<i class="fa-brands fa-youtube"></i>' : '<i class="fa-solid fa-wave-square"></i>';
      const label = track.type === "youtube" ? "YOUTUBE AUDIO" : "AUDIO LINK";
      nowHeroSourceTag.innerHTML = `${icon} ${label}`;
      nowHeroSourceTag.className = `track-type-badge ${track.type === "youtube" ? "youtube" : "audio"}`;
    }

    // Tampilkan tombol intip video jika sedang memutar YouTube
    const isYt = track.type === "youtube";
    const btnYtPeekHero = document.getElementById("btnYtPeekHero");
    const btnYtPeekBottom = document.getElementById("btnYtPeekBottom");

    if (btnYtPeekHero) btnYtPeekHero.style.display = isYt ? "inline-flex" : "none";
    if (btnYtPeekBottom) btnYtPeekBottom.style.display = isYt ? "inline-flex" : "none";
    if (!isYt) closeYtPeek();

    if (miniTitleText) miniTitleText.textContent = title;
    if (miniArtistText) miniArtistText.textContent = artist;
    if (miniCoverArt) {
      miniCoverArt.src = cover;
      miniCoverArt.onerror = () => { miniCoverArt.src = DEFAULT_LOGO; };
    }
  }

  // --- YouTube Video Peek Window (Melihat video & mengklik 'Lewati Iklan' / Skip Ad) ---
  const ytAudioContainer = document.getElementById("ytAudioContainer");
  const btnYtPeekHero = document.getElementById("btnYtPeekHero");
  const btnYtPeekBottom = document.getElementById("btnYtPeekBottom");
  const closeYtPeekBtn = document.getElementById("closeYtPeekBtn");

  function toggleYtPeek() {
    if (!ytAudioContainer) return;
    const isPeek = ytAudioContainer.classList.toggle("peek-active");
    if (isPeek) {
      showToast("Jendela video YouTube dibuka. Klik 'Lewati Iklan' jika ada.");
    }
  }

  function closeYtPeek() {
    if (ytAudioContainer) {
      ytAudioContainer.classList.remove("peek-active");
    }
  }

  if (btnYtPeekHero) btnYtPeekHero.addEventListener("click", toggleYtPeek);
  if (btnYtPeekBottom) btnYtPeekBottom.addEventListener("click", toggleYtPeek);
  if (closeYtPeekBtn) closeYtPeekBtn.addEventListener("click", closeYtPeek);

  // --- Audio Element Events ---
  audio.addEventListener("timeupdate", () => {
    syncTimeDisplays(audio.currentTime, audio.duration);
  });

  // Otomatis pindah saat direct audio selesai
  audio.addEventListener("ended", handleTrackCompletion);

  audio.addEventListener("play", () => {
    setPlaybackActive(true, "Sedang Memutar Audio Link");
  });

  audio.addEventListener("pause", () => {
    setPlaybackActive(false, "Dijeda");
  });

  // --- Seek Bar Events (Bottom Player & Hero Card) ---
  if (progressBar) {
    progressBar.addEventListener("input", () => {
      seekToFraction(progressBar.value / 1000);
    });
  }

  if (heroProgressBar) {
    heroProgressBar.addEventListener("input", () => {
      seekToFraction(heroProgressBar.value / 1000);
    });
  }

  // --- Volume & Mute Controls (Synchronized Hero & Bottom Player) ---
  function applyVolume(vol) {
    vol = Math.max(0, Math.min(1, vol));
    audio.volume = vol;
    lastVolume = vol > 0 ? vol : lastVolume;
    isMuted = (vol === 0);

    if (volumeSlider) volumeSlider.value = vol;
    if (heroVolumeSlider) heroVolumeSlider.value = vol;
    updateMuteIcons();

    if (ytPlayer && ytReady && typeof ytPlayer.setVolume === "function") {
      ytPlayer.setVolume(Math.round(vol * 100));
      if (vol === 0) ytPlayer.mute(); else ytPlayer.unMute();
    }
  }

  function updateMuteIcons() {
    const curVal = volumeSlider ? parseFloat(volumeSlider.value) : (heroVolumeSlider ? parseFloat(heroVolumeSlider.value) : 0.85);
    const iconHtml = (isMuted || curVal === 0) ? FA_VOL_MUTE : (curVal < 0.4 ? FA_VOL_LOW : FA_VOL_HIGH);
    if (muteToggleBtn) muteToggleBtn.innerHTML = iconHtml;
    if (heroMuteBtn) heroMuteBtn.innerHTML = iconHtml;
  }

  function toggleMute() {
    if (isMuted) {
      applyVolume(lastVolume || 0.85);
    } else {
      const cur = volumeSlider ? parseFloat(volumeSlider.value) : 0.85;
      lastVolume = cur > 0 ? cur : 0.85;
      applyVolume(0);
    }
  }

  if (volumeSlider) {
    volumeSlider.addEventListener("input", () => applyVolume(parseFloat(volumeSlider.value)));
  }
  if (heroVolumeSlider) {
    heroVolumeSlider.addEventListener("input", () => applyVolume(parseFloat(heroVolumeSlider.value)));
  }
  if (muteToggleBtn) {
    muteToggleBtn.addEventListener("click", toggleMute);
  }
  if (heroMuteBtn) {
    heroMuteBtn.addEventListener("click", toggleMute);
  }

  // --- Playback Speed Toggle ---
  const SPEED_CHOICES = [1.0, 1.25, 1.5, 2.0, 0.75];
  let speedIndex = 0;
  if (speedToggleBtn) {
    speedToggleBtn.addEventListener("click", () => {
      speedIndex = (speedIndex + 1) % SPEED_CHOICES.length;
      playbackSpeed = SPEED_CHOICES[speedIndex];
      speedToggleBtn.textContent = playbackSpeed + "x";
      audio.playbackRate = playbackSpeed;

      if (ytPlayer && ytReady && typeof ytPlayer.setPlaybackRate === "function") {
        ytPlayer.setPlaybackRate(playbackSpeed);
      }
      showToast(`Kecepatan pemutaran diubah ke ${playbackSpeed}x`);
    });
  }

  // --- Shuffle & Repeat Toggles (Synced Hero & Bottom Player) ---
  function toggleShuffle() {
    isShuffle = !isShuffle;
    if (shuffleToggleBtn) shuffleToggleBtn.classList.toggle("active", isShuffle);
    if (heroShuffleBtn) heroShuffleBtn.classList.toggle("active", isShuffle);
    showToast(isShuffle ? "Mode Acak (Shuffle) Aktif" : "Mode Acak Nonaktif");
  }

  function cycleRepeatMode() {
    if (repeatMode === "off") {
      repeatMode = "all";
      updateRepeatUI(FA_REPEAT, true, "Repeat: Ulangi Seluruh Playlist");
    } else if (repeatMode === "all") {
      repeatMode = "one";
      updateRepeatUI(FA_REPEAT_ONE, true, "Repeat: Ulangi Lagu Ini Terus");
    } else {
      repeatMode = "off";
      updateRepeatUI(FA_REPEAT, false, "Repeat: Nonaktif");
    }
  }

  function updateRepeatUI(iconHtml, active, toastMsg) {
    if (repeatToggleBtn) {
      repeatToggleBtn.innerHTML = iconHtml;
      repeatToggleBtn.classList.toggle("active", active);
    }
    if (heroRepeatBtn) {
      heroRepeatBtn.innerHTML = iconHtml;
      heroRepeatBtn.classList.toggle("active", active);
    }
    showToast(toastMsg);
  }

  if (shuffleToggleBtn) shuffleToggleBtn.addEventListener("click", toggleShuffle);
  if (heroShuffleBtn) heroShuffleBtn.addEventListener("click", toggleShuffle);

  if (repeatToggleBtn) repeatToggleBtn.addEventListener("click", cycleRepeatMode);
  if (heroRepeatBtn) heroRepeatBtn.addEventListener("click", cycleRepeatMode);

  // Hero Play, Next, Prev Click Listeners
  if (heroPlayBtn) heroPlayBtn.addEventListener("click", togglePlayPause);
  if (heroNextBtn) heroNextBtn.addEventListener("click", playNextTrack);
  if (heroPrevBtn) heroPrevBtn.addEventListener("click", playPreviousTrack);

  // Bottom Player Play, Next, Prev
  if (mainPlayBtn) mainPlayBtn.addEventListener("click", togglePlayPause);
  if (nextTrackBtn) nextTrackBtn.addEventListener("click", playNextTrack);
  if (prevTrackBtn) prevTrackBtn.addEventListener("click", playPreviousTrack);

  // --- MediaSession OS API (Widget Kontrol Layar Kunci / Background HP) ---
  function registerMediaSession(track) {
    if (!("mediaSession" in navigator) || !track) return;
    try {
      const coverUrl = track.cover && track.cover.trim() !== "" ? track.cover : (window.location.origin + "/" + DEFAULT_LOGO);
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist || "Febryan Music",
        album: "Febryan Music Player",
        artwork: [
          { src: coverUrl, sizes: "96x96", type: "image/png" },
          { src: coverUrl, sizes: "128x128", type: "image/png" },
          { src: coverUrl, sizes: "192x192", type: "image/png" },
          { src: coverUrl, sizes: "256x256", type: "image/png" },
          { src: coverUrl, sizes: "384x384", type: "image/png" },
          { src: coverUrl, sizes: "512x512", type: "image/png" }
        ]
      });

      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

      navigator.mediaSession.setActionHandler("play", () => togglePlayPause());
      navigator.mediaSession.setActionHandler("pause", () => togglePlayPause());
      navigator.mediaSession.setActionHandler("previoustrack", () => playPreviousTrack());
      navigator.mediaSession.setActionHandler("nexttrack", () => playNextTrack());

      try {
        navigator.mediaSession.setActionHandler("seekto", (details) => {
          if (details && typeof details.seekTime === "number") {
            seekToSeconds(details.seekTime);
          }
        });
      } catch (e) {}

      try {
        navigator.mediaSession.setActionHandler("seekforward", (details) => {
          seekRelative((details && details.seekOffset) || 10);
        });
      } catch (e) {}

      try {
        navigator.mediaSession.setActionHandler("seekbackward", (details) => {
          seekRelative(-((details && details.seekOffset) || 10));
        });
      } catch (e) {}

      try {
        navigator.mediaSession.setActionHandler("stop", () => {
          stopMediaEngines();
        });
      } catch (e) {}
    } catch (e) {}
  }

  // --- Add Music Form Event ---
  if (addMusicForm) {
    addMusicForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const url = inputTrackUrl.value.trim();
      if (!url) {
        showToast("Masukkan URL musik terlebih dahulu.");
        return;
      }

      try {
        new URL(url);
      } catch (err) {
        showToast("Format URL tidak valid. Pastikan menggunakan http:// atau https://");
        return;
      }

      // Pastikan lagu unik: jika sudah ada, jangan input lagi!
      const duplicate = findDuplicateTrack(url);
      if (duplicate) {
        showToast(`⚠️ Lagu "${duplicate.title}" sudah ada di playlist!`);
        if (ytDetectStatus) {
          ytDetectStatus.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color:var(--accent-gold)"></i> Lagu sudah ada di playlist: "${duplicate.title}"`;
          ytDetectStatus.style.display = "inline";
        }
        if (inputTrackUrl) inputTrackUrl.focus();
        return;
      }

      const ytId = extractYouTubeId(url);
      const isYt = !!ytId;

      let title = inputTrackTitle.value.trim();
      let artist = inputTrackArtist.value.trim();
      let cover = inputTrackCover.value.trim();

      // Jika judul kosong dan link YouTube, ambil info secara instan
      if (!title && isYt) {
        title = "Memuat info YouTube...";
        fetchYouTubeInfo(url).then(info => {
          if (info && info.title) {
            const item = playlist.find(t => t.url === url);
            if (item) {
              item.title = info.title;
              if (info.author && (!item.artist || item.artist === "YouTube Audio")) item.artist = info.author;
              if (info.cover && (!item.cover || item.cover === DEFAULT_LOGO)) item.cover = info.cover;
              savePlaylistToStorage();
              renderPlaylistUI();
              if (currentId === item.id) updateHeroAndMiniDisplay(item);
            }
          }
        });
      } else if (!title) {
        title = deriveTitleFromUrl(url);
      }

      if (!artist) {
        artist = isYt ? "YouTube Audio" : "Febryan Music";
      }

      if (!cover) {
        cover = isYt ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : DEFAULT_LOGO;
      }

      const newTrack = {
        id: makeUniqueId(),
        title,
        artist,
        url,
        cover,
        type: isYt ? "youtube" : "audio",
        addedAt: Date.now()
      };

      playlist.push(newTrack);
      savePlaylistToStorage();
      renderPlaylistUI();

      addMusicForm.reset();
      if (ytDetectStatus) ytDetectStatus.style.display = "none";
      closeModal("addMusicModalLayer");
      showToast(`Berhasil ditambahkan: ${title}`);

      // Auto-play if nothing is currently selected
      if (!currentId) {
        playTrackById(newTrack.id);
      }
    });
  }

  // Quick Paste Button
  const btnPasteClipboard = document.getElementById("btnPasteClipboard");
  if (btnPasteClipboard) {
    btnPasteClipboard.addEventListener("click", async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && inputTrackUrl) {
          inputTrackUrl.value = text.trim();
          showToast("Link berhasil ditempel dari clipboard.");
          triggerYouTubeAutoDetection();
          if (!inputTrackTitle.value) {
            inputTrackTitle.value = deriveTitleFromUrl(text.trim());
          }
        }
      } catch (e) {
        showToast("Izin clipboard browser belum diberikan.");
      }
    });
  }

  // Preset Chips inside Modal
  document.querySelectorAll(".preset-chip-btn[data-preset]").forEach(chip => {
    chip.addEventListener("click", () => {
      const type = chip.getAttribute("data-preset");
      let sample = PRESET_SAMPLES[0];
      if (type === "ambient") sample = PRESET_SAMPLES[1];
      if (type === "synth") sample = PRESET_SAMPLES[2];

      if (inputTrackUrl) inputTrackUrl.value = sample.url;
      if (inputTrackTitle) inputTrackTitle.value = sample.title;
      if (inputTrackArtist) inputTrackArtist.value = sample.artist;
      if (inputTrackCover) inputTrackCover.value = sample.cover;
      triggerYouTubeAutoDetection();
      showToast(`Preset dimuat: ${sample.title}`);
    });
  });

  // Quick 3 Sample Tracks Button
  const loadSamplesBtn = document.getElementById("loadSamplesBtn");
  if (loadSamplesBtn) {
    loadSamplesBtn.addEventListener("click", () => {
      let added = 0;
      let skipped = 0;

      PRESET_SAMPLES.forEach(sample => {
        if (!findDuplicateTrack(sample.url)) {
          playlist.push({
            ...sample,
            id: makeUniqueId(),
            addedAt: Date.now() + added
          });
          added++;
        } else {
          skipped++;
        }
      });

      if (added > 0) {
        savePlaylistToStorage();
        renderPlaylistUI();
        const note = skipped > 0 ? ` (${skipped} lagu sudah ada dilewati)` : "";
        showToast(`✅ ${added} lagu preset berhasil ditambahkan${note}!`);
        if (!currentId && playlist.length > 0) {
          playTrackById(playlist[0].id);
        }
      } else {
        showToast("⚠️ Semua lagu preset sudah ada di dalam playlist.");
      }
    });
  }

  // Search Filter
  if (searchFieldInput) {
    searchFieldInput.addEventListener("input", renderPlaylistUI);
  }

  // Track Action Click Delegator
  if (tracksListEl) {
    tracksListEl.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      const action = btn.getAttribute("data-action");
      const id = btn.getAttribute("data-id");
      if (!action || !id) return;

      if (action === "play") {
        if (id === currentId) {
          togglePlayPause();
        } else {
          playTrackById(id);
        }
      } else if (action === "delete") {
        const track = playlist.find(t => t.id === id);
        if (track) {
          requestDeleteTrack(track);
        }
      } else if (action === "edit") {
        openEditModal(id);
      } else if (action === "up") {
        reorderTrack(id, -1);
      } else if (action === "down") {
        reorderTrack(id, 1);
      }
    });
  }

  // --- Confirmation Modal Management (Replaces browser default confirm/alert) ---
  let pendingDeleteAction = null;

  function openConfirmDeleteModal({ title, desc, track = null, isClearAll = false, onConfirm }) {
    const titleEl = document.getElementById("confirmDeleteTitle");
    const descEl = document.getElementById("confirmDeleteDesc");
    const previewCard = document.getElementById("confirmTrackPreviewCard");
    const clearAllBanner = document.getElementById("confirmClearAllBanner");
    const clearAllText = document.getElementById("confirmClearAllText");
    const btnText = document.getElementById("executeDeleteBtnText");
    const iconBadge = document.getElementById("confirmIconBadge");
    const cancelBtn = document.getElementById("cancelDeleteBtn");

    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = desc;

    if (isClearAll) {
      if (previewCard) previewCard.style.display = "none";
      if (clearAllBanner) clearAllBanner.style.display = "flex";
      if (clearAllText) {
        clearAllText.innerHTML = `Anda akan menghapus <strong>${playlist.length} lagu</strong> dari LocalStorage browser. Seluruh daftar putar akan dikosongkan.`;
      }
      if (btnText) btnText.textContent = "Ya, Bersihkan Semua";
      if (iconBadge) {
        iconBadge.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
        iconBadge.classList.add("warning-mode");
      }
    } else if (track) {
      if (previewCard) previewCard.style.display = "flex";
      if (clearAllBanner) clearAllBanner.style.display = "none";
      if (btnText) btnText.textContent = "Ya, Hapus Musik";
      if (iconBadge) {
        iconBadge.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        iconBadge.classList.remove("warning-mode");
      }

      const thumbEl = document.getElementById("confirmTrackThumb");
      const trackTitleEl = document.getElementById("confirmTrackTitle");
      const trackArtistEl = document.getElementById("confirmTrackArtist");
      const trackTypeEl = document.getElementById("confirmTrackType");

      if (thumbEl) thumbEl.src = track.cover || DEFAULT_LOGO;
      if (trackTitleEl) trackTitleEl.textContent = track.title;
      if (trackArtistEl) trackArtistEl.textContent = track.artist || "Febryan Music";
      if (trackTypeEl) {
        trackTypeEl.textContent = track.type === "youtube" ? "YouTube" : "Audio Link";
        trackTypeEl.className = "confirm-source-tag " + (track.type === "youtube" ? "tag-yt" : "tag-audio");
      }
    }

    pendingDeleteAction = onConfirm;
    openModal("confirmDeleteModalLayer");

    // Focus cancel button by default to prevent accidental deletion
    if (cancelBtn) {
      setTimeout(() => cancelBtn.focus(), 50);
    }
  }

  function requestDeleteTrack(track) {
    if (!track) return;
    openConfirmDeleteModal({
      title: "Hapus Lagu dari Playlist?",
      desc: "Lagu berikut akan dihapus dari antrean musik browser Anda:",
      track,
      isClearAll: false,
      onConfirm: () => {
        deleteTrackById(track.id);
      }
    });
  }

  function requestClearPlaylist() {
    if (playlist.length === 0) {
      showToast("Playlist sudah kosong.");
      return;
    }
    openConfirmDeleteModal({
      title: "Kosongkan Seluruh Playlist?",
      desc: "Apakah Anda yakin ingin menghapus semua lagu dari LocalStorage?",
      isClearAll: true,
      onConfirm: () => {
        stopMediaEngines();
        const count = playlist.length;
        playlist = [];
        currentId = null;
        savePlaylistToStorage();
        renderPlaylistUI();
        if (nowHeroTitle) nowHeroTitle.textContent = "Belum ada lagu dipilih";
        if (nowHeroArtist) nowHeroArtist.textContent = "Pilih dari playlist atau masukkan link";
        if (nowHeroCover) nowHeroCover.src = DEFAULT_LOGO;
        if (miniTitleText) miniTitleText.textContent = "Belum ada lagu";
        if (miniArtistText) miniArtistText.textContent = "Pilih lagu dari playlist";
        if (miniCoverArt) miniCoverArt.src = DEFAULT_LOGO;
        if (liveStatusText) liveStatusText.textContent = "Siap Memutar";
        if (liveStatusDot) liveStatusDot.classList.add("idle");
        showToast(`Semua lagu (${count}) telah dibersihkan.`);
      }
    });
  }

  // Confirm delete modal execution button
  const executeDeleteBtn = document.getElementById("executeDeleteBtn");
  if (executeDeleteBtn) {
    executeDeleteBtn.addEventListener("click", () => {
      if (typeof pendingDeleteAction === "function") {
        const action = pendingDeleteAction;
        pendingDeleteAction = null;
        closeModal("confirmDeleteModalLayer");
        action();
      } else {
        closeModal("confirmDeleteModalLayer");
      }
    });
  }

  function deleteTrackById(id) {
    const track = playlist.find(t => t.id === id);
    if (!track) return;

    if (currentId === id) {
      stopMediaEngines();
      currentId = null;
      if (nowHeroTitle) nowHeroTitle.textContent = "Belum ada lagu dipilih";
      if (nowHeroArtist) nowHeroArtist.textContent = "Pilih dari playlist atau masukkan link";
      if (nowHeroCover) nowHeroCover.src = DEFAULT_LOGO;
      if (miniTitleText) miniTitleText.textContent = "Belum ada lagu";
      if (miniArtistText) miniArtistText.textContent = "Pilih lagu dari playlist";
      if (miniCoverArt) miniCoverArt.src = DEFAULT_LOGO;
      if (liveStatusText) liveStatusText.textContent = "Siap Memutar";
      if (liveStatusDot) liveStatusDot.classList.add("idle");
    }

    playlist = playlist.filter(t => t.id !== id);
    savePlaylistToStorage();
    renderPlaylistUI();
    showToast(`Lagu "${track.title}" telah dihapus.`);
  }

  // --- Drag & Drop Reordering Engine (Desktop Mouse & Mobile Touch) ---
  let draggedTrackId = null;
  let touchDraggedCard = null;

  function setupPlaylistDragAndDrop() {
    if (!tracksListEl) return;
    const cards = tracksListEl.querySelectorAll(".track-card");

    cards.forEach(card => {
      // 1. Desktop HTML5 Drag Events
      card.addEventListener("dragstart", (e) => {
        // Jangan aktifkan drag jika user mengklik tombol kontrol atau input
        if (e.target.closest("button") || e.target.closest("input")) {
          e.preventDefault();
          return;
        }

        draggedTrackId = card.getAttribute("data-id");
        card.classList.add("is-dragging");

        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", draggedTrackId);
          try {
            e.dataTransfer.setDragImage(card, 25, 20);
          } catch (err) {}
        }
      });

      card.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (!draggedTrackId) return;

        const currentTargetId = card.getAttribute("data-id");
        if (currentTargetId === draggedTrackId) return;

        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = "move";
        }

        const rect = card.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const isTop = e.clientY < midY;

        card.classList.toggle("drag-over-top", isTop);
        card.classList.toggle("drag-over-bottom", !isTop);
      });

      card.addEventListener("dragleave", () => {
        card.classList.remove("drag-over-top", "drag-over-bottom");
      });

      card.addEventListener("drop", (e) => {
        e.preventDefault();
        card.classList.remove("drag-over-top", "drag-over-bottom");

        const fromId = (e.dataTransfer ? e.dataTransfer.getData("text/plain") : null) || draggedTrackId;
        const toId = card.getAttribute("data-id");

        if (!fromId || !toId || fromId === toId) return;

        const rect = card.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const insertBefore = e.clientY < midY;

        executeTrackReorder(fromId, toId, insertBefore);
      });

      card.addEventListener("dragend", () => {
        cleanupDragStates();
      });

      // 2. Mobile Touch Event Drag & Drop ("Tekan lalu geser-geser lagu")
      const grip = card.querySelector(".drag-handle");
      if (grip) {
        grip.addEventListener("touchstart", (e) => {
          if (e.touches.length !== 1) return;
          draggedTrackId = card.getAttribute("data-id");
          touchDraggedCard = card;
          card.classList.add("is-dragging");
        }, { passive: true });

        grip.addEventListener("touchmove", (e) => {
          if (!touchDraggedCard || e.touches.length !== 1) return;
          const touch = e.touches[0];
          e.preventDefault(); // Mencegah scrolling saat menggeser lagu

          const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
          const targetCard = targetEl ? targetEl.closest(".track-card") : null;

          cards.forEach(c => {
            if (c !== targetCard) c.classList.remove("drag-over-top", "drag-over-bottom");
          });

          if (targetCard && targetCard !== touchDraggedCard) {
            const rect = targetCard.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            const isTop = touch.clientY < midY;
            targetCard.classList.toggle("drag-over-top", isTop);
            targetCard.classList.toggle("drag-over-bottom", !isTop);
          }
        }, { passive: false });

        grip.addEventListener("touchend", () => {
          if (!touchDraggedCard) return;

          const activeTarget = tracksListEl.querySelector(".drag-over-top, .drag-over-bottom");
          if (activeTarget && activeTarget !== touchDraggedCard) {
            const fromId = touchDraggedCard.getAttribute("data-id");
            const toId = activeTarget.getAttribute("data-id");
            const isTop = activeTarget.classList.contains("drag-over-top");
            executeTrackReorder(fromId, toId, isTop);
          }

          cleanupDragStates();
        });

        grip.addEventListener("touchcancel", () => {
          cleanupDragStates();
        });
      }
    });
  }

  function cleanupDragStates() {
    draggedTrackId = null;
    touchDraggedCard = null;
    if (!tracksListEl) return;
    tracksListEl.querySelectorAll(".track-card").forEach(c => {
      c.classList.remove("is-dragging", "drag-over-top", "drag-over-bottom");
    });
  }

  function executeTrackReorder(fromId, toId, insertBefore) {
    const fromIdx = playlist.findIndex(t => t.id === fromId);
    let toIdx = playlist.findIndex(t => t.id === toId);

    if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return;

    const [movedTrack] = playlist.splice(fromIdx, 1);
    const newTargetIdx = playlist.findIndex(t => t.id === toId);
    const destIdx = insertBefore ? newTargetIdx : (newTargetIdx + 1);

    playlist.splice(destIdx, 0, movedTrack);
    savePlaylistToStorage();
    renderPlaylistUI();
    showToast(`Urutan diubah: "${movedTrack.title}" dipindah ke posisi #${destIdx + 1}`);
  }

  function reorderTrack(id, offset) {
    const idx = playlist.findIndex(t => t.id === id);
    if (idx < 0) return;
    const dest = idx + offset;
    if (dest < 0 || dest >= playlist.length) return;

    const [item] = playlist.splice(idx, 1);
    playlist.splice(dest, 0, item);
    savePlaylistToStorage();
    renderPlaylistUI();
    showToast(`Urutan diubah: "${item.title}" dipindah ke posisi #${dest + 1}`);
  }

  // Clear All Tracks
  const clearPlaylistBtn = document.getElementById("clearPlaylistBtn");
  if (clearPlaylistBtn) {
    clearPlaylistBtn.addEventListener("click", () => {
      requestClearPlaylist();
    });
  }

  // --- Modals Management ---
  function openModal(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      el.classList.add("active");
    }
  }

  function closeModal(id) {
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove("active");
    }
  }

  // Robust Global Event Delegation for all Modals (opens/closes reliably from icons, buttons, or custom triggers)
  document.addEventListener("click", (e) => {
    // 1. Open modal via data-open-modal
    const openBtn = e.target.closest("[data-open-modal]");
    if (openBtn) {
      e.preventDefault();
      const modalId = openBtn.getAttribute("data-open-modal");
      if (modalId) openModal(modalId);
      return;
    }

    // 2. Close modal via data-close-modal
    const closeBtn = e.target.closest("[data-close-modal]");
    if (closeBtn) {
      e.preventDefault();
      const modalId = closeBtn.getAttribute("data-close-modal");
      if (modalId) closeModal(modalId);
      return;
    }

    // 3. Click outside modal-card on modal-layer backdrop
    if (e.target.classList.contains("modal-layer")) {
      e.target.classList.remove("active");
    }
  });

  // Explicit Direct Listeners for Navigation Actions
  const openInfoBtn = document.getElementById("openInfoBtn");
  if (openInfoBtn) {
    openInfoBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal("infoModalLayer");
    });
  }

  const openBatchBtn = document.getElementById("openBatchBtn");
  if (openBatchBtn) {
    openBatchBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal("batchModalLayer");
    });
  }

  const saveBatchLinksBtn = document.getElementById("saveBatchLinksBtn");
  if (saveBatchLinksBtn) {
    saveBatchLinksBtn.addEventListener("click", () => {
      const textarea = document.getElementById("batchInputTextarea");
      const text = textarea ? textarea.value.trim() : "";
      if (!text) {
        showToast("Masukkan link terlebih dahulu.");
        return;
      }

      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
      let count = 0;
      let skippedDuplicates = 0;
      const batchSeenUrls = new Set();
      const batchSeenYtIds = new Set();

      lines.forEach(line => {
        const parts = line.split("|").map(p => p.trim());
        const url = parts[0];
        if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
          const ytId = extractYouTubeId(url);
          const isYt = !!ytId;
          const cleanNorm = url.replace(/\/+$/, "").toLowerCase();

          // Cek duplikasi di playlist saat ini dan antar-link di dalam batch
          const duplicateInPlaylist = findDuplicateTrack(url);
          const duplicateInBatch = ytId ? batchSeenYtIds.has(ytId) : batchSeenUrls.has(cleanNorm);

          if (duplicateInPlaylist || duplicateInBatch) {
            skippedDuplicates++;
            return;
          }

          if (ytId) batchSeenYtIds.add(ytId);
          batchSeenUrls.add(cleanNorm);

          const title = parts[1] || deriveTitleFromUrl(url);
          const artist = parts[2] || (isYt ? "YouTube Audio" : "Febryan Music");
          const cover = isYt ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : DEFAULT_LOGO;

          playlist.push({
            id: makeUniqueId(),
            title,
            artist,
            url,
            cover,
            type: isYt ? "youtube" : "audio",
            addedAt: Date.now() + count
          });
          count++;
        }
      });

      if (count > 0) {
        savePlaylistToStorage();
        renderPlaylistUI();
        closeModal("batchModalLayer");
        if (textarea) textarea.value = "";
        const note = skippedDuplicates > 0 ? ` (${skippedDuplicates} lagu duplikat dilewati)` : "";
        showToast(`✅ ${count} link lagu berhasil ditambahkan${note}!`);
      } else if (skippedDuplicates > 0) {
        showToast(`⚠️ Semua ${skippedDuplicates} link yang dimasukkan sudah ada di playlist!`);
      } else {
        showToast("Tidak ada link valid yang ditemukan.");
      }
    });
  }

  // Edit Track Modal
  function openEditModal(id) {
    const track = playlist.find(t => t.id === id);
    if (!track) return;

    document.getElementById("editTrackId").value = track.id;
    document.getElementById("editTrackUrl").value = track.url;
    document.getElementById("editTrackTitle").value = track.title;
    document.getElementById("editTrackArtist").value = track.artist || "";
    document.getElementById("editTrackCover").value = (track.cover === DEFAULT_LOGO ? "" : track.cover) || "";

    openModal("editModalLayer");
  }

  const editTrackForm = document.getElementById("editTrackForm");
  if (editTrackForm) {
    editTrackForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("editTrackId").value;
      const track = playlist.find(t => t.id === id);
      if (!track) return;

      const url = document.getElementById("editTrackUrl").value.trim();
      if (!url) {
        showToast("URL musik tidak boleh kosong.");
        return;
      }

      // Pastikan URL yang diedit tidak menduplikasi lagu lain
      const duplicate = findDuplicateTrack(url, id);
      if (duplicate) {
        showToast(`⚠️ Link musik ini sudah digunakan oleh lagu "${duplicate.title}".`);
        return;
      }

      const isYt = !!extractYouTubeId(url);

      track.url = url;
      track.title = document.getElementById("editTrackTitle").value.trim() || deriveTitleFromUrl(url);
      track.artist = document.getElementById("editTrackArtist").value.trim() || (isYt ? "YouTube Audio" : "Febryan Music");
      const customCover = document.getElementById("editTrackCover").value.trim();
      track.cover = customCover || (isYt ? `https://img.youtube.com/vi/${extractYouTubeId(url)}/hqdefault.jpg` : DEFAULT_LOGO);
      track.type = isYt ? "youtube" : "audio";

      savePlaylistToStorage();
      renderPlaylistUI();

      if (currentId === id) {
        updateHeroAndMiniDisplay(track);
      }

      closeModal("editModalLayer");
      showToast("Data lagu berhasil diperbarui.");
    });
  }

  // Export Playlist JSON
  const exportJsonBtn = document.getElementById("exportJsonBtn");
  if (exportJsonBtn) {
    exportJsonBtn.addEventListener("click", () => {
      if (playlist.length === 0) {
        showToast("Playlist masih kosong.");
        return;
      }
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(playlist, null, 2));
      const a = document.createElement("a");
      a.setAttribute("href", dataStr);
      a.setAttribute("download", `febryan_music_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast("File backup playlist berhasil diunduh.");
    });
  }

  // Import Playlist JSON
  const importFileInput = document.getElementById("importFileInput");
  const importJsonBtn = document.getElementById("importJsonBtn");

  if (importJsonBtn && importFileInput) {
    importJsonBtn.addEventListener("click", () => importFileInput.click());

    importFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported)) {
            let count = 0;
            let skippedDuplicates = 0;
            const batchSeenUrls = new Set();
            const batchSeenYtIds = new Set();

            imported.forEach(item => {
              if (item && item.url) {
                const url = String(item.url).trim();
                const ytId = extractYouTubeId(url);
                const isYt = !!ytId;
                const cleanNorm = url.replace(/\/+$/, "").toLowerCase();

                const inPlaylist = findDuplicateTrack(url);
                const inBatch = ytId ? batchSeenYtIds.has(ytId) : batchSeenUrls.has(cleanNorm);

                if (inPlaylist || inBatch) {
                  skippedDuplicates++;
                  return;
                }

                if (ytId) batchSeenYtIds.add(ytId);
                batchSeenUrls.add(cleanNorm);

                playlist.push({
                  id: makeUniqueId(),
                  title: item.title || deriveTitleFromUrl(url),
                  artist: item.artist || (isYt ? "YouTube Audio" : "Febryan Music"),
                  url: url,
                  cover: item.cover || (isYt ? `https://img.youtube.com/vi/${extractYouTubeId(url)}/hqdefault.jpg` : DEFAULT_LOGO),
                  type: item.type || (isYt ? "youtube" : "audio"),
                  addedAt: Date.now() + count
                });
                count++;
              }
            });

            if (count > 0) {
              savePlaylistToStorage();
              renderPlaylistUI();
              const note = skippedDuplicates > 0 ? ` (${skippedDuplicates} duplikat dilewati)` : "";
              showToast(`✅ ${count} lagu berhasil diimpor dari file JSON${note}!`);
            } else if (skippedDuplicates > 0) {
              showToast(`⚠️ Semua ${skippedDuplicates} lagu dari file JSON sudah ada di playlist.`);
            } else {
              showToast("File JSON tidak berisi lagu valid.");
            }
          } else {
            showToast("Format JSON playlist tidak valid.");
          }
        } catch (err) {
          showToast("Gagal membaca file JSON.");
        }
      };
      reader.readAsText(file);
      importFileInput.value = "";
    });
  }

  // --- Keyboard Shortcuts ---
  window.addEventListener("keydown", (e) => {
    if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;

    if (e.code === "Space") {
      e.preventDefault();
      togglePlayPause();
    } else if (e.code === "ArrowRight") {
      if (e.shiftKey) {
        e.preventDefault();
        playNextTrack();
      } else if (audio.src && audio.duration) {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
      }
    } else if (e.code === "ArrowLeft") {
      if (e.shiftKey) {
        e.preventDefault();
        playPreviousTrack();
      } else if (audio.src) {
        audio.currentTime = Math.max(0, audio.currentTime - 5);
      }
    } else if (e.code === "KeyM") {
      toggleMute();
    } else if (e.code === "Escape") {
      document.querySelectorAll(".modal-layer.active").forEach(m => m.classList.remove("active"));
    }
  });

  // --- Visibility Change Listener (Perbarui Screen Wake Lock saat kembali ke Tab) ---
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && isPlaying) {
      requestScreenWakeLock();
    }
  });

  // --- Application Bootstrap ---
  function initApp() {
    loadControllerDisplayMode();
    playlist = loadPlaylistFromStorage();
    renderPlaylistUI();

    if (playlist.length > 0) {
      currentId = playlist[0].id;
      updateHeroAndMiniDisplay(playlist[0]);
    }
  }

  initApp();

})();
