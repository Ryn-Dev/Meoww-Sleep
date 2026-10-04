/**
 * Pemutar Audio Al-Qur'an (Al-Qur'anul Karim)
 * Robust, Feature-Rich & Production-Ready Audio Player
 */

// API Endpoint
const API_URL = "https://equran.id/api/v2/surat";

// Reciter Metadata
const QARI_LIST = {
  '01': 'Abdullah Al-Juhany',
  '02': 'Abdul-Muhsin Al-Qasim',
  '03': 'Abdurrahman as-Sudais',
  '04': 'Ibrahim Al-Dossari',
  '05': 'Misyari Rasyid Al-Afasi',
  '06': 'Yasser Al-Dosari'
};

// Safe Storage Helpers (Handles private browsing / file:// restrictions)
function safeGetStorage(key, defaultVal) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function safeSetStorage(key, val) {
  try {
    localStorage.setItem(key, val);
  } catch (e) {
    // Ignore storage quota/security restrictions
  }
}

// Audio Player Instance
const audioPlayer = new Audio();
audioPlayer.preload = "metadata";

// DOM Elements
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const prevSurahBtn = document.getElementById('prevSurahBtn');
const nextSurahBtn = document.getElementById('nextSurahBtn');
const repeatBtn = document.getElementById('repeatBtn');
const repeatIcon = document.getElementById('repeatIcon');
const repeatBadge = document.getElementById('repeatBadge');
const speedSelect = document.getElementById('speedSelect');
const qariSelect = document.getElementById('qariSelect');
const timerSelect = document.getElementById('timerSelect');
const timerBanner = document.getElementById('timerBanner');
const timerCountdownText = document.getElementById('timerCountdownText');
const cancelTimerBtn = document.getElementById('cancelTimerBtn');

// Progress & Volume Elements
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const totalDurationEl = document.getElementById('totalDuration');
const volumeBtn = document.getElementById('volumeBtn');
const volumeIcon = document.getElementById('volumeIcon');
const volumeBar = document.getElementById('volumeBar');

// Track Display Elements
const songTitleEl = document.getElementById('songTitle');
const arabicTitleEl = document.getElementById('arabicTitle');
const surahMetaEl = document.getElementById('surahMeta');
const qariNameEl = document.getElementById('qariName');
const discContainer = document.getElementById('discContainer');
const soundWave = document.getElementById('soundWave');
const audioLoadingSpinner = document.getElementById('audioLoadingSpinner');

// Playlist & Search Elements
const playlistEl = document.getElementById('playlist');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const revelationFilters = document.querySelectorAll('.revelation-filter');
const perPageSelect = document.getElementById('perPageSelect');
const paginationInfo = document.getElementById('paginationInfo');
const paginationNav = document.getElementById('paginationNav');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageNumbersEl = document.getElementById('pageNumbers');
const emptyState = document.getElementById('emptyState');
const loadingSkeleton = document.getElementById('loadingSkeleton');
const errorBanner = document.getElementById('errorBanner');
const retryFetchBtn = document.getElementById('retryFetchBtn');

// State Variables
let surahs = [];
let filteredSurahs = [];
let currentSurahNum = parseInt(safeGetStorage('quran_last_surah', '1')) || 1;
let currentQari = safeGetStorage('quran_qari', '01');
let currentPlaybackSpeed = parseFloat(safeGetStorage('quran_speed', '1.0')) || 1.0;
let repeatMode = safeGetStorage('quran_repeat', 'off'); // 'off' | 'one' | 'all'
let currentVolume = parseFloat(safeGetStorage('quran_volume', '0.85')) ?? 0.85;
let isMuted = false;
let previousVolume = currentVolume;

let currentPage = 1;
let surahPerPage = parseInt(safeGetStorage('quran_per_page', '10')) || 10;
let savedPageBeforeSearch = 1;
let activeFilter = 'all'; // 'all' | 'mekah' | 'madinah'
let isDraggingProgressBar = false;

// Sleep Timer State
let timerMode = 'off'; // 'off' | 'minutes' | 'surah_end'
let timerRemainingSeconds = 0;
let timerCountdownInterval = null;

// ==========================================
// 1. DATA INITIALIZATION & API FETCH
// ==========================================

async function fetchSurahs() {
  showLoading(true);
  hideError();

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    const result = await response.json();

    if (result && result.code === 200 && Array.isArray(result.data) && result.data.length > 0) {
      surahs = result.data;
      // Cache data for offline resilience
      safeSetStorage('quran_surahs_cache', JSON.stringify(surahs));

      // Successfully got data, hide loading skeleton immediately
      showLoading(false);

      // Render the surah playlist
      applyFilters();

      // Prepare preview of surah (Al-Fatihah or last played)
      const targetSurahNum = (currentSurahNum >= 1 && currentSurahNum <= 114) ? currentSurahNum : 1;
      currentSurahNum = targetSurahNum;
      
      try {
        loadSurah(targetSurahNum, false);
      } catch (loadErr) {
        console.warn("Surah initial preview error:", loadErr);
      }
      
      syncPageWithSurah(targetSurahNum);
      return;
    } else {
      throw new Error(result ? result.message : "Format data tidak sesuai.");
    }
  } catch (error) {
    console.error("Gagal memuat surah dari API:", error);

    // Attempt to load from offline cache if available
    try {
      const cached = safeGetStorage('quran_surahs_cache', null);
      if (cached) {
        const cachedSurahs = JSON.parse(cached);
        if (Array.isArray(cachedSurahs) && cachedSurahs.length > 0) {
          console.info("Memuat data surah dari cache lokal.");
          surahs = cachedSurahs;
          showLoading(false);
          applyFilters();
          loadSurah(currentSurahNum, false);
          syncPageWithSurah(currentSurahNum);
          return;
        }
      }
    } catch (cacheErr) {
      console.warn("Gagal membaca cache:", cacheErr);
    }

    showLoading(false);
    showError("Gagal mengambil data Al-Qur'an dari server. Periksa koneksi internet Anda dan coba lagi.");
  }
}

function showLoading(isLoading) {
  if (loadingSkeleton) {
    loadingSkeleton.style.display = isLoading ? 'block' : 'none';
  }
  if (playlistEl) {
    playlistEl.style.display = isLoading ? 'none' : 'grid';
  }
}

function showError(msg) {
  if (errorBanner) {
    const errorText = document.getElementById('errorBannerText');
    if (errorText) errorText.textContent = msg;
    errorBanner.classList.remove('hidden');
  }
}

function hideError() {
  if (errorBanner) errorBanner.classList.add('hidden');
}

if (retryFetchBtn) {
  retryFetchBtn.addEventListener('click', () => fetchSurahs());
}

// ==========================================
// 2. AUDIO PLAYER LOGIC
// ==========================================

function loadSurah(surahNum, shouldPlay = true) {
  if (!surahs || surahs.length === 0) return;
  const surah = surahs.find(s => s.nomor === surahNum);
  if (!surah) return;

  currentSurahNum = surahNum;
  safeSetStorage('quran_last_surah', surahNum);

  // Update Track Information in Player
  if (songTitleEl) songTitleEl.textContent = `${surah.nomor}. ${surah.namaLatin}`;
  if (arabicTitleEl) arabicTitleEl.textContent = surah.nama || '';
  if (surahMetaEl) {
    const arti = surah.arti || '';
    const ayat = surah.jumlahAyat || '';
    const tempat = surah.tempatTurun || '';
    surahMetaEl.textContent = `${arti} • ${ayat} Ayat • Surah ${tempat}`;
  }
  if (qariNameEl) {
    qariNameEl.textContent = QARI_LIST[currentQari] || 'Qari Pilihan';
  }

  // Set Audio Source
  const audioUrls = surah.audioFull || {};
  const audioUrl = audioUrls[currentQari] || audioUrls['01'] || '';

  if (audioUrl) {
    const isSameSource = audioPlayer.src === audioUrl;
    if (!isSameSource) {
      audioPlayer.src = audioUrl;
      audioPlayer.playbackRate = currentPlaybackSpeed;
      audioPlayer.volume = isMuted ? 0 : currentVolume;
      updateProgressBar(0, 0);
    }

    if (shouldPlay) {
      showBuffering(true);
      audioPlayer.play().catch(err => {
        console.warn("Autoplay dicegah oleh browser:", err);
        setPlayButtonState(false);
        showBuffering(false);
      });
    } else {
      setPlayButtonState(false);
    }
  }

  // Update Active Highlight in Playlist
  highlightActiveSurah(surahNum);

  // Update Media Session (Lockscreen & Notifications) safely
  try {
    updateMediaSession(surah);
  } catch (msErr) {
    console.warn("MediaSession update skipped:", msErr);
  }
}

function setPlayButtonState(isPlaying) {
  if (playIcon) {
    playIcon.className = isPlaying ? "fas fa-pause text-xl" : "fas fa-play text-xl translate-x-0.5";
  }
  if (discContainer) {
    if (isPlaying) {
      discContainer.classList.add('disc-playing');
    } else {
      discContainer.classList.remove('disc-playing');
    }
  }
  if (soundWave) {
    if (isPlaying) {
      soundWave.classList.add('playing');
    } else {
      soundWave.classList.remove('playing');
    }
  }
  if (playlistEl) {
    const waves = playlistEl.querySelectorAll('.sound-wave');
    waves.forEach(w => {
      if (isPlaying) w.classList.add('playing');
      else w.classList.remove('playing');
    });
  }
}

function showBuffering(isBuffering) {
  if (audioLoadingSpinner && playIcon) {
    if (isBuffering) {
      audioLoadingSpinner.classList.remove('hidden');
      playIcon.classList.add('opacity-0');
    } else {
      audioLoadingSpinner.classList.add('hidden');
      playIcon.classList.remove('opacity-0');
    }
  }
}

function togglePlayPause() {
  if (!audioPlayer.src || currentSurahNum === null) {
    loadSurah(1, true);
    return;
  }

  if (audioPlayer.paused) {
    showBuffering(true);
    audioPlayer.play().catch(err => {
      console.warn("Gagal memutar audio:", err);
      showBuffering(false);
    });
  } else {
    audioPlayer.pause();
    setPlayButtonState(false);
  }
}

function playNextSurah() {
  if (!surahs || surahs.length === 0) return;

  if (currentSurahNum < surahs.length) {
    const nextNum = currentSurahNum + 1;
    syncPageWithSurah(nextNum);
    loadSurah(nextNum, true);
  } else if (repeatMode === 'all') {
    syncPageWithSurah(1);
    loadSurah(1, true);
  } else {
    audioPlayer.pause();
    setPlayButtonState(false);
  }
}

function playPrevSurah() {
  if (!surahs || surahs.length === 0) return;

  if (audioPlayer.currentTime > 3) {
    audioPlayer.currentTime = 0;
    audioPlayer.play();
    return;
  }

  if (currentSurahNum > 1) {
    const prevNum = currentSurahNum - 1;
    syncPageWithSurah(prevNum);
    loadSurah(prevNum, true);
  } else if (repeatMode === 'all') {
    const lastNum = surahs.length;
    syncPageWithSurah(lastNum);
    loadSurah(lastNum, true);
  }
}

// Audio Player Events
audioPlayer.addEventListener('waiting', () => showBuffering(true));
audioPlayer.addEventListener('canplay', () => showBuffering(false));
audioPlayer.addEventListener('playing', () => {
  showBuffering(false);
  setPlayButtonState(true);
});
audioPlayer.addEventListener('pause', () => {
  showBuffering(false);
  setPlayButtonState(false);
});

audioPlayer.addEventListener('timeupdate', () => {
  if (!isDraggingProgressBar && audioPlayer.duration) {
    const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    updateProgressBar(progressPercent, audioPlayer.currentTime);
  }
  updateDurationDisplay();
});

audioPlayer.addEventListener('ended', () => {
  setPlayButtonState(false);

  if (timerMode === 'surah_end') {
    stopSleepTimer();
    showToastNotification("Waktu tidur tercapai di akhir surah. Pemutaran dihentikan.");
    return;
  }

  if (repeatMode === 'one') {
    audioPlayer.currentTime = 0;
    audioPlayer.play();
  } else if (repeatMode === 'all') {
    playNextSurah();
  } else {
    if (currentSurahNum < surahs.length) {
      playNextSurah();
    } else {
      audioPlayer.pause();
      setPlayButtonState(false);
    }
  }
});

audioPlayer.addEventListener('error', (e) => {
  showBuffering(false);
  setPlayButtonState(false);
  console.error("Audio playback error:", e);
  showToastNotification("Gagal memuat rekaman audio. Silakan coba qari lain atau periksa koneksi internet.");
});

// ==========================================
// 3. PROGRESS BAR & SEEKING
// ==========================================

function updateProgressBar(percent, currentTimeSeconds) {
  if (progressBar) {
    progressBar.value = percent;
    progressBar.style.background = `linear-gradient(to right, var(--primary-gold) ${percent}%, #374151 ${percent}%)`;
  }
  if (currentTimeEl) {
    currentTimeEl.textContent = formatTime(currentTimeSeconds);
  }
}

function updateDurationDisplay() {
  if (totalDurationEl && audioPlayer.duration && !isNaN(audioPlayer.duration)) {
    totalDurationEl.textContent = formatTime(audioPlayer.duration);
  }
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${String(hrs).padStart(2, '0')}:${String(remMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Seamless ProgressBar Seek
if (progressBar) {
  progressBar.addEventListener('input', (e) => {
    isDraggingProgressBar = true;
    const seekPercent = parseFloat(e.target.value);
    if (audioPlayer.duration) {
      const previewTime = (seekPercent / 100) * audioPlayer.duration;
      updateProgressBar(seekPercent, previewTime);
    }
  });

  progressBar.addEventListener('change', (e) => {
    const seekPercent = parseFloat(e.target.value);
    if (audioPlayer.duration) {
      audioPlayer.currentTime = (seekPercent / 100) * audioPlayer.duration;
    }
    isDraggingProgressBar = false;
  });
}

// ==========================================
// 4. VOLUME & SPEED & REPEAT CONTROLS
// ==========================================

function setVolume(val) {
  currentVolume = Math.max(0, Math.min(1, val));
  safeSetStorage('quran_volume', currentVolume);
  
  if (currentVolume === 0) {
    isMuted = true;
    audioPlayer.volume = 0;
  } else {
    isMuted = false;
    audioPlayer.volume = currentVolume;
  }

  updateVolumeUI();
}

function toggleMute() {
  if (isMuted || audioPlayer.volume === 0) {
    isMuted = false;
    audioPlayer.volume = previousVolume > 0 ? previousVolume : 0.85;
    currentVolume = audioPlayer.volume;
  } else {
    previousVolume = currentVolume;
    isMuted = true;
    audioPlayer.volume = 0;
  }
  updateVolumeUI();
}

function updateVolumeUI() {
  const volPercent = isMuted ? 0 : Math.round(currentVolume * 100);
  if (volumeBar) {
    volumeBar.value = volPercent;
    volumeBar.style.background = `linear-gradient(to right, var(--primary-gold) ${volPercent}%, #374151 ${volPercent}%)`;
  }
  if (volumeIcon) {
    if (isMuted || currentVolume === 0) {
      volumeIcon.className = "fas fa-volume-xmark";
    } else if (currentVolume < 0.5) {
      volumeIcon.className = "fas fa-volume-low";
    } else {
      volumeIcon.className = "fas fa-volume-high";
    }
  }
}

if (volumeBar) {
  volumeBar.addEventListener('input', (e) => {
    setVolume(parseFloat(e.target.value) / 100);
  });
}

if (volumeBtn) {
  volumeBtn.addEventListener('click', toggleMute);
}

// Speed Control
if (speedSelect) {
  speedSelect.value = currentPlaybackSpeed.toString();
  speedSelect.addEventListener('change', (e) => {
    currentPlaybackSpeed = parseFloat(e.target.value);
    audioPlayer.playbackRate = currentPlaybackSpeed;
    safeSetStorage('quran_speed', currentPlaybackSpeed);
  });
}

// Repeat Mode Control
function updateRepeatUI() {
  if (!repeatBtn || !repeatBadge) return;
  if (repeatMode === 'one') {
    repeatBadge.textContent = '1';
    repeatBadge.classList.remove('hidden');
    repeatBtn.classList.add('text-amber-400');
    repeatBtn.title = 'Mode: Ulangi 1 Surah Ini';
  } else if (repeatMode === 'all') {
    repeatBadge.textContent = 'All';
    repeatBadge.classList.remove('hidden');
    repeatBtn.classList.add('text-amber-400');
    repeatBtn.title = 'Mode: Ulangi Semua Surah';
  } else {
    repeatBadge.classList.add('hidden');
    repeatBtn.classList.remove('text-amber-400');
    repeatBtn.title = 'Mode: Lanjut Berurutan (Tanpa Ulang)';
  }
}

function cycleRepeatMode() {
  if (repeatMode === 'off') {
    repeatMode = 'one';
  } else if (repeatMode === 'one') {
    repeatMode = 'all';
  } else {
    repeatMode = 'off';
  }
  safeSetStorage('quran_repeat', repeatMode);
  updateRepeatUI();
}

if (repeatBtn) {
  repeatBtn.addEventListener('click', cycleRepeatMode);
}

// Qari Change (Seamless transition without losing timestamp)
if (qariSelect) {
  qariSelect.value = currentQari;
  qariSelect.addEventListener('change', (e) => {
    const newQari = e.target.value;
    if (newQari === currentQari) return;

    currentQari = newQari;
    safeSetStorage('quran_qari', currentQari);
    
    const wasPlaying = !audioPlayer.paused;
    const savedTime = audioPlayer.currentTime;
    
    loadSurah(currentSurahNum, false);
    
    if (savedTime > 0) {
      audioPlayer.addEventListener('loadedmetadata', function onLoaded() {
        audioPlayer.currentTime = savedTime;
        if (wasPlaying) audioPlayer.play();
        audioPlayer.removeEventListener('loadedmetadata', onLoaded);
      });
    } else if (wasPlaying) {
      audioPlayer.play();
    }
  });
}

// ==========================================
// 5. SLEEP TIMER LOGIC
// ==========================================

function handleTimerSelect(e) {
  const value = e.target.value;
  stopSleepTimer(false);

  if (value === 'surah_end') {
    timerMode = 'surah_end';
    showTimerBanner(true, "Berhenti di akhir surah");
  } else {
    const minutes = parseInt(value);
    if (minutes > 0) {
      timerMode = 'minutes';
      timerRemainingSeconds = minutes * 60;
      updateTimerDisplay();
      showTimerBanner(true);

      timerCountdownInterval = setInterval(() => {
        if (!audioPlayer.paused) {
          if (timerRemainingSeconds > 0) {
            timerRemainingSeconds--;
            updateTimerDisplay();
          } else {
            stopSleepTimer();
            audioPlayer.pause();
            setPlayButtonState(false);
            showToastNotification("Waktu timer tidur habis. Pemutaran dihentikan secara otomatis.");
          }
        }
      }, 1000);
    } else {
      timerMode = 'off';
      showTimerBanner(false);
    }
  }
}

function updateTimerDisplay() {
  if (timerCountdownText) {
    const mins = Math.floor(timerRemainingSeconds / 60);
    const secs = timerRemainingSeconds % 60;
    timerCountdownText.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}

function showTimerBanner(show, customText = null) {
  if (timerBanner) {
    if (show) {
      timerBanner.classList.remove('hidden');
      if (customText) {
        timerCountdownText.textContent = customText;
      }
    } else {
      timerBanner.classList.add('hidden');
    }
  }
}

function stopSleepTimer(resetDropdown = true) {
  if (timerCountdownInterval) {
    clearInterval(timerCountdownInterval);
    timerCountdownInterval = null;
  }
  timerMode = 'off';
  timerRemainingSeconds = 0;
  showTimerBanner(false);
  if (resetDropdown && timerSelect) {
    timerSelect.value = "0";
  }
}

if (timerSelect) timerSelect.addEventListener('change', handleTimerSelect);
if (cancelTimerBtn) cancelTimerBtn.addEventListener('click', () => stopSleepTimer(true));

// ==========================================
// 6. PLAYLIST, SEARCH & PAGINATION
// ==========================================

function applyFilters() {
  if (!Array.isArray(surahs)) return;
  const query = (searchInput ? searchInput.value : "").trim().toLowerCase();

  filteredSurahs = surahs.filter(surah => {
    const tempat = (surah.tempatTurun || '').toLowerCase();

    // Revelation Filter (Mekah / Madinah)
    if (activeFilter === 'mekah' && tempat !== 'mekah') return false;
    if (activeFilter === 'madinah' && tempat !== 'madinah') return false;

    // Search Query (Match Latin, Arabic, Number, Meaning, or Place)
    if (!query) return true;
    const matchLatin = (surah.namaLatin || '').toLowerCase().includes(query);
    const matchNumber = (surah.nomor || '').toString().includes(query);
    const matchArti = (surah.arti || '').toLowerCase().includes(query);
    const matchArabic = (surah.nama || '').includes(query);
    const matchTempat = tempat.includes(query);

    return matchLatin || matchNumber || matchArti || matchArabic || matchTempat;
  });

  renderPlaylist();
  renderPagination();
}

function renderPlaylist() {
  if (!playlistEl) return;
  playlistEl.innerHTML = '';

  if (!filteredSurahs || filteredSurahs.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    if (paginationNav) paginationNav.classList.add('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  if (paginationNav) paginationNav.classList.remove('hidden');

  // Compute pagination slice
  const startIndex = (currentPage - 1) * surahPerPage;
  const endIndex = Math.min(startIndex + surahPerPage, filteredSurahs.length);
  const currentSurahs = filteredSurahs.slice(startIndex, endIndex);

  currentSurahs.forEach(surah => {
    const card = document.createElement('div');
    const isActive = surah.nomor === currentSurahNum;

    card.className = `playlist-item rounded-xl p-4 cursor-pointer flex items-center justify-between border ${
      isActive ? 'active' : 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-700/60'
    }`;
    card.dataset.nomor = surah.nomor;

    const tempatTurun = (surah.tempatTurun || '').toLowerCase();
    const isMekah = tempatTurun === 'mekah';

    card.innerHTML = `
      <div class="flex items-center space-x-3.5">
        <!-- Number Badge -->
        <div class="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
          isActive 
            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30' 
            : 'bg-slate-700 text-amber-400 group-hover:bg-slate-600'
        }">
          ${surah.nomor}
        </div>
        <!-- Surah Info -->
        <div>
          <div class="flex items-center space-x-2">
            <h4 class="font-bold text-base ${isActive ? 'text-amber-400' : 'text-white'}">
              ${surah.namaLatin}
            </h4>
            <span class="text-xs px-2 py-0.5 rounded-full ${
              isMekah 
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40' 
                : 'bg-blue-950 text-blue-300 border border-blue-800/40'
            }">
              ${surah.tempatTurun}
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5 line-clamp-1">
            ${surah.arti} • ${surah.jumlahAyat} Ayat
          </p>
        </div>
      </div>

      <!-- Arabic Calligraphy & Active Wave -->
      <div class="flex items-center space-x-4">
        ${isActive ? `
          <div class="sound-wave ${audioPlayer.paused ? '' : 'playing'}">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
          </div>
        ` : ''}
        <span class="font-arabic text-2xl text-slate-300 ${isActive ? 'text-amber-300 font-bold' : ''}">
          ${surah.nama}
        </span>
      </div>
    `;

    card.addEventListener('click', () => {
      if (surah.nomor === currentSurahNum) {
        togglePlayPause();
      } else {
        loadSurah(surah.nomor, true);
      }
    });

    playlistEl.appendChild(card);
  });
}

function highlightActiveSurah(surahNum) {
  // Always trigger clean re-render to completely transfer badge, text color, soundwave and active background
  renderPlaylist();
}

function syncPageWithSurah(surahNum) {
  if (!filteredSurahs || filteredSurahs.length === 0) return;
  const indexInFiltered = filteredSurahs.findIndex(s => s.nomor === surahNum);
  if (indexInFiltered !== -1) {
    const targetPage = Math.floor(indexInFiltered / surahPerPage) + 1;
    if (currentPage !== targetPage) {
      currentPage = targetPage;
      renderPlaylist();
      renderPagination();
    }
  }
}

// Pagination Controls
function renderPagination() {
  if (!paginationNav) return;
  const totalItems = filteredSurahs.length;
  const totalPages = Math.ceil(totalItems / surahPerPage) || 1;

  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * surahPerPage + 1;
  const endItem = Math.min(currentPage * surahPerPage, totalItems);
  if (paginationInfo) {
    paginationInfo.textContent = `Menampilkan ${startItem}-${endItem} dari ${totalItems} Surah`;
  }

  if (prevPageBtn) prevPageBtn.disabled = currentPage <= 1;
  if (nextPageBtn) nextPageBtn.disabled = currentPage >= totalPages;

  if (pageNumbersEl) {
    pageNumbersEl.innerHTML = '';
    // Mobile viewport detection (< 640px)
    const isMobile = window.innerWidth < 640;
    const maxVisibleButtons = isMobile ? 3 : 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    if (startPage > 1) {
      addPageButton(1);
      if (startPage > 2) addEllipsis();
    }

    for (let p = startPage; p <= endPage; p++) {
      addPageButton(p);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) addEllipsis();
      addPageButton(totalPages);
    }
  }
}

function addPageButton(page) {
  const btn = document.createElement('button');
  const isCurrent = page === currentPage;
  btn.className = `w-8 h-8 sm:w-9 sm:h-9 rounded-lg font-semibold text-xs sm:text-sm transition-all flex items-center justify-center flex-shrink-0 ${
    isCurrent
      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
  }`;
  btn.textContent = page;
  btn.setAttribute('aria-label', `Halaman ${page}`);
  btn.addEventListener('click', () => {
    currentPage = page;
    renderPlaylist();
    renderPagination();
    playlistEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  pageNumbersEl.appendChild(btn);
}

function addEllipsis() {
  const span = document.createElement('span');
  span.className = 'text-slate-500 px-0.5 sm:px-1 text-xs sm:text-sm select-none';
  span.textContent = '...';
  pageNumbersEl.appendChild(span);
}

if (prevPageBtn) {
  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderPlaylist();
      renderPagination();
    }
  });
}

if (nextPageBtn) {
  nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredSurahs.length / surahPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderPlaylist();
      renderPagination();
    }
  });
}

// Search Logic
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();

    if (clearSearchBtn) {
      clearSearchBtn.style.display = query ? 'block' : 'none';
    }

    if (query === "") {
      currentPage = savedPageBeforeSearch || 1;
    } else {
      if (!savedPageBeforeSearch || savedPageBeforeSearch === 1) {
        savedPageBeforeSearch = currentPage;
      }
      currentPage = 1;
    }

    applyFilters();
  });
}

if (clearSearchBtn) {
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    currentPage = savedPageBeforeSearch || 1;
    applyFilters();
    searchInput.focus();
  });
}

// Revelation Filter Tabs
revelationFilters.forEach(tab => {
  tab.addEventListener('click', () => {
    revelationFilters.forEach(t => {
      t.classList.remove('bg-amber-500', 'text-slate-950', 'font-bold');
      t.classList.add('bg-slate-800', 'text-slate-300');
    });
    tab.classList.add('bg-amber-500', 'text-slate-950', 'font-bold');
    tab.classList.remove('bg-slate-800', 'text-slate-300');

    activeFilter = tab.dataset.filter;
    currentPage = 1;
    applyFilters();
  });
});

// Items Per Page Select
if (perPageSelect) {
  perPageSelect.value = surahPerPage.toString();
  perPageSelect.addEventListener('change', (e) => {
    surahPerPage = parseInt(e.target.value);
    safeSetStorage('quran_per_page', surahPerPage);
    currentPage = 1;
    renderPlaylist();
    renderPagination();
  });
}

// ==========================================
// 7. MEDIA SESSION & SHORTCUTS
// ==========================================

function updateMediaSession(surah) {
  if (!('mediaSession' in navigator) || !surah) return;

  try {
    const qariName = QARI_LIST[currentQari] || 'Al-Qur\'an';
    // Resolve absolute URL for artwork
    let artworkUrl = 'images/quran.png';
    try {
      artworkUrl = new URL('images/quran.png', window.location.href).href;
    } catch (e) {}

    navigator.mediaSession.metadata = new MediaMetadata({
      title: `${surah.nomor}. ${surah.namaLatin} (${surah.nama})`,
      artist: `Qari: ${qariName}`,
      album: "Al-Qur'anul Karim 30 Juz",
      artwork: [
        { src: artworkUrl, sizes: '512x512', type: 'image/png' }
      ]
    });

    navigator.mediaSession.setActionHandler('play', () => audioPlayer.play());
    navigator.mediaSession.setActionHandler('pause', () => audioPlayer.pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => playPrevSurah());
    navigator.mediaSession.setActionHandler('nexttrack', () => playNextSurah());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime && audioPlayer.duration) {
        audioPlayer.currentTime = details.seekTime;
      }
    });
  } catch (err) {
    console.warn("MediaSession not supported or failed:", err);
  }
}

// Keyboard Navigation Shortcuts
window.addEventListener('keydown', (e) => {
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

  switch (e.code) {
    case 'Space':
      e.preventDefault();
      togglePlayPause();
      break;
    case 'ArrowRight':
      e.preventDefault();
      if (audioPlayer.duration) audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 5);
      break;
    case 'ArrowLeft':
      e.preventDefault();
      audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 5);
      break;
    case 'ArrowUp':
      e.preventDefault();
      setVolume(currentVolume + 0.05);
      break;
    case 'ArrowDown':
      e.preventDefault();
      setVolume(currentVolume - 0.05);
      break;
    case 'KeyM':
      e.preventDefault();
      toggleMute();
      break;
    case 'KeyN':
      e.preventDefault();
      playNextSurah();
      break;
    case 'KeyP':
      e.preventDefault();
      playPrevSurah();
      break;
  }
});

// Toast Notification
function showToastNotification(message) {
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: message,
      showConfirmButton: false,
      timer: 3500,
      timerProgressBar: true,
      background: '#1e293b',
      color: '#f8fafc'
    });
  } else {
    alert(message);
  }
}

// Control Buttons Hookup
if (playBtn) playBtn.addEventListener('click', togglePlayPause);
if (prevSurahBtn) prevSurahBtn.addEventListener('click', playPrevSurah);
if (nextSurahBtn) nextSurahBtn.addEventListener('click', playNextSurah);

// Window resize listener to adaptively re-render pagination on mobile/desktop switch
let resizeTimeout = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    renderPagination();
  }, 150);
});

// Initialize on DOM Ready or immediately if DOM is already ready
function initApp() {
  updateRepeatUI();
  setVolume(currentVolume);

  // 1. Instant Render from bundled offline data (zero latency, offline resilience)
  if (typeof window !== 'undefined' && Array.isArray(window.FALLBACK_SURAHS) && window.FALLBACK_SURAHS.length > 0) {
    surahs = window.FALLBACK_SURAHS;
    showLoading(false);
    applyFilters();
    try {
      const targetSurahNum = (currentSurahNum >= 1 && currentSurahNum <= 114) ? currentSurahNum : 1;
      currentSurahNum = targetSurahNum;
      loadSurah(targetSurahNum, false);
      syncPageWithSurah(targetSurahNum);
    } catch (previewErr) {
      console.warn("Preview surah error:", previewErr);
    }
  }

  // 2. Fetch fresh data from API in background
  fetchSurahs();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
