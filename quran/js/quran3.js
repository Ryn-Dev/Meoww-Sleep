const apiUrl = "https://equran.id/api/v2/surat";
const audioPlayer = new Audio();
const playButton = document.getElementById('playBtn');
const prevSurahButton = document.getElementById('prevSurahBtn');
const nextSurahButton = document.getElementById('nextSurahBtn');
const progressBar = document.getElementById('progressBar');
const playlist = document.getElementById('playlist');
const searchInput = document.getElementById('searchInput');
const pageNum = document.getElementById('pageNum');
const qariSelect = document.getElementById('qariSelect');
const noDataMessage = document.createElement('p');

let surahs = [];
let filteredSurahs = [];
let currentSongIndex = null;
let currentQari = '01';
let currentPage = 1;
const surahPerPage = 5;
let savedPage = 1;

let timerTimeout = null;
let timerDuration = 0;
let timerRemaining = 0; // Variabel untuk melacak waktu yang tersisa pada timer
let countdownInterval = null; // Interval untuk menghitung mundur

noDataMessage.classList.add('text-center', 'text-gray-500', 'mt-4', 'mb-5');
noDataMessage.textContent = "Data surah tidak ada.";
noDataMessage.style.display = 'none';
playlist.parentNode.appendChild(noDataMessage);

async function fetchSurahs() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.code === 200) {
      surahs = data.data;
      filteredSurahs = [...surahs];
      loadPlaylist(filteredSurahs);
    } else {
      console.error("Gagal mengambil data:", data.message);
    }
  } catch (error) {
    console.error("Terjadi kesalahan saat mengambil data:", error);
  }
}

const paginationSurah = document.getElementById('paginationSurah');

function loadPlaylist(surahs) {
  const start = (currentPage - 1) * surahPerPage;
  const end = currentPage * surahPerPage;
  const surahPage = surahs.slice(start, end);

  playlist.innerHTML = '';

  if (surahPage.length === 0) {
    noDataMessage.style.display = 'block';
    paginationSurah.style.display = 'none';
  } else {
    noDataMessage.style.display = 'none';
    paginationSurah.style.display = 'flex';
  }

  surahPage.forEach((surah, index) => {
    const li = document.createElement('li');
    li.classList.add('cursor-pointer', 'hover:bg-gray-700', 'p-4', 'rounded-lg', 'bg-gray-600');
    li.textContent = `${surah.nomor}. ${surah.namaLatin} - ${surah.arti}`;
    li.dataset.nomor = surah.nomor;

    li.addEventListener('click', function() {
      currentSongIndex = surah.nomor;
      loadSong(surah.nomor);
      audioPlayer.play();
      playButton.innerHTML = '<i class="fas fa-pause"></i>';
      setActiveSong(surah.nomor);
      savedPage = currentPage;
    });

    playlist.appendChild(li);
  });

  pageNum.textContent = currentPage;

  if (currentSongIndex !== null) {
    setActiveSong(currentSongIndex);
  }
}

document.getElementById('prevPage').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    loadPlaylist(filteredSurahs);
  }
});

document.getElementById('nextPage').addEventListener('click', () => {
  const totalPages = Math.ceil(filteredSurahs.length / surahPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    loadPlaylist(filteredSurahs);
  }
});

searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();

  filteredSurahs = surahs.filter(surah => {
    return surah.namaLatin.toLowerCase().includes(query) || surah.nomor.toString().includes(query);
  });

  if (query === "") {
    currentPage = savedPage;
  } else {
    savedPage = currentPage;
    currentPage = 1;
  }

  loadPlaylist(filteredSurahs);
});

qariSelect.addEventListener('change', (e) => {
  currentQari = e.target.value;
  if (currentSongIndex !== null) {
    loadSong(currentSongIndex);
  }
});

function loadSong(nomor) {
  const surah = surahs.find(s => s.nomor === nomor);
  const audioUrls = surah.audioFull;
  document.getElementById('songTitle').textContent = `${surah.namaLatin} (${surah.nama})`;
  document.getElementById('qariName').textContent = getQariName(currentQari);
  audioPlayer.src = audioUrls[currentQari];
  progressBar.value = 0;
  setActiveSong(nomor);
  playButton.innerHTML = '<i class="fas fa-play"></i>';
}

function setActiveSong(nomor) {
  const items = playlist.querySelectorAll('li');
  items.forEach(item => item.classList.remove('bg-[#D09B32]'));

  const activeItem = Array.from(items).find(item => parseInt(item.dataset.nomor) === nomor);
  if (activeItem) {
    activeItem.classList.add('bg-[#D09B32]');
  }
}

function getQariName(qariCode) {
  const qariNames = {
    '01': 'Abdullah Al-Juhany',
    '02': 'Abdul-Muhsin Al-Qasim',
    '03': 'Abdurrahman as-Sudais',
    '04': 'Ibrahim Al-Dossari',
    '05': 'Misyari Rasyid Al-Afasi',
  };
  return qariNames[qariCode] || 'Unknown Qari';
}

window.onload = () => {
  fetchSurahs();
  qariSelect.value = currentQari;
};

playButton.addEventListener('click', () => {
  if (audioPlayer.paused) {
    audioPlayer.play();
    playButton.innerHTML = '<i class="fas fa-pause"></i>';
  } else {
    audioPlayer.pause();
    playButton.innerHTML = '<i class="fas fa-play"></i>';
  }
});

audioPlayer.addEventListener('timeupdate', () => {
  const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  progressBar.value = progress;
  progressBar.style.background = `linear-gradient(to right, #D09B32 ${progress}%, #ddd ${progress}%)`;
  updateSurahDurationDisplay();
});

function updateSurahDurationDisplay() {
  const currentTime = audioPlayer.currentTime;
  const totalDuration = audioPlayer.duration;

  // Pastikan audioPlayer.duration tidak NaN
  if (isNaN(totalDuration) || totalDuration === Infinity) {
    document.getElementById('surahDuration').textContent = "Loading..."; // Default display
    return;
  }

  const currentMinutes = Math.floor(currentTime / 60);
  const currentSeconds = Math.floor(currentTime % 60);

  const totalMinutes = Math.floor(totalDuration / 60);
  const totalSeconds = Math.floor(totalDuration % 60);

  let formattedCurrentTime, formattedTotalTime;

  // Format waktu saat ini (current time)
  if (currentMinutes >= 60) {
    const currentHours = Math.floor(currentMinutes / 60);
    const formattedCurrentMinutes = currentMinutes % 60;
    formattedCurrentTime = `${String(currentHours).padStart(2, '0')}:${String(formattedCurrentMinutes).padStart(2, '0')}:${String(currentSeconds).padStart(2, '0')}`;
  } else {
    formattedCurrentTime = `${String(currentMinutes).padStart(2, '0')}:${String(currentSeconds).padStart(2, '0')}`;
  }

  // Format total duration time
  if (totalMinutes >= 60) {
    const totalHours = Math.floor(totalMinutes / 60);
    const formattedTotalMinutes = totalMinutes % 60;
    formattedTotalTime = `${String(totalHours).padStart(2, '0')}:${String(formattedTotalMinutes).padStart(2, '0')}:${String(totalSeconds).padStart(2, '0')}`;
  } else {
    formattedTotalTime = `${String(totalMinutes).padStart(2, '0')}:${String(totalSeconds).padStart(2, '0')}`;
  }

  // Update the displayed duration (current time - total time)
  document.getElementById('surahDuration').textContent = `${formattedCurrentTime} / ${formattedTotalTime}`;
}


prevSurahButton.addEventListener('click', () => {
  if (currentSongIndex !== null && currentSongIndex > 1) {
    currentSongIndex--;
    loadSong(currentSongIndex);
    audioPlayer.play();
    playButton.innerHTML = '<i class="fas fa-pause"></i>';
    setActiveSong(currentSongIndex);
  }
});

nextSurahButton.addEventListener('click', () => {
  if (currentSongIndex !== null && currentSongIndex < surahs.length) {
    currentSongIndex++;
    loadSong(currentSongIndex);
    audioPlayer.play();
    playButton.innerHTML = '<i class="fas fa-pause"></i>';
    setActiveSong(currentSongIndex);
  }
});

audioPlayer.addEventListener('ended', () => {
  if (currentSongIndex !== null && currentSongIndex < surahs.length) {
    currentSongIndex++;
    if (currentSongIndex <= surahs.length) {
      loadSong(currentSongIndex);
      audioPlayer.play();
      playButton.innerHTML = '<i class="fas fa-pause"></i>';
      setActiveSong(currentSongIndex);
    }
  } else {
    playButton.innerHTML = '<i class="fas fa-play"></i>';
  }
});

const timerDiv = document.createElement('div');
timerDiv.classList.add('flex', 'items-center');

const timerLabel = document.createElement('label');
timerLabel.classList.add('text-xl', 'mr-2');
timerLabel.textContent = "Timer : ";

const timerSelect = document.createElement('select');
timerSelect.classList.add('bg-gray-800', 'text-white', 'p-2', 'rounded-lg');
timerSelect.innerHTML = `
  <option value="0">Off</option>
  <option value="1">1 minutes</option>
  <option value="5">5 minutes</option>
  <option value="10">10 minutes</option>
  <option value="15">15 minutes</option>
  <option value="30">30 minutes</option>
  <option value="60">60 minutes</option>
`;

timerDiv.appendChild(timerLabel);
timerDiv.appendChild(timerSelect);

document.querySelector('.mb-4').appendChild(timerDiv);

const timerText = document.getElementById('timerText');

timerSelect.addEventListener('change', () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);  
  }

  const selectedTime = parseInt(timerSelect.value); 
  timerDuration = selectedTime;

  if (timerDuration > 0) {
    timerRemaining = timerDuration * 60; 
    updateTimerDisplay(); 

    timerText.classList.remove("hidden");  
    timerText.classList.add("block"); 

    countdownInterval = setInterval(() => {
      if (timerRemaining > 0) {
        timerRemaining--;  
        updateTimerDisplay(); 
      } else {
        clearInterval(countdownInterval); 
        audioPlayer.pause(); 
        playButton.innerHTML = '<i class="fas fa-play"></i>'; 
        timerSelect.value = "0"; 
        timerText.classList.remove("block"); 
        timerText.classList.add("hidden");  
        // alert("Waktu timer habis, pemutaran dihentikan.");
        Swal.fire({
          title: 'Waktu Timer Habis',
          text: 'Pemutaran dihentikan.',
          icon: 'info',
          confirmButtonText: 'OK'
        });
      }
    }, 1000);
  } else {
    timerText.classList.remove("block"); 
    timerText.classList.add("hidden");  
    timerText.textContent = "00:00";  
  }
});

function updateTimerDisplay() {
  const minutes = Math.floor(timerRemaining / 60);
  const seconds = timerRemaining % 60;
  const minutesText = `${String(minutes).padStart(2, '0')}`;
  const secondsText = `${String(seconds).padStart(2, '0')}`;
  timerText.innerHTML = `Di pause dalam <span style="color: #D09B32;">${minutesText}:${secondsText}</span>`;
}

