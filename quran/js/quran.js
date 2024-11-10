const apiUrl = "https://equran.id/api/v2/surat";

// const audioPlayer = new Audio();
// const playButton = document.getElementById('playBtn');
// const prevButton = document.getElementById('prevBtn');
// const nextButton = document.getElementById('nextBtn');
// const progressBar = document.getElementById('progressBar');
// const playlist = document.getElementById('playlist');

let currentSongIndex = 0;
let surahs = [];
let currentQari = '01'; // Default qari

// Fetch surah data
async function fetchSurahs() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.code === 200) {
      surahs = data.data;
      loadPlaylist(surahs);
      loadSong(currentSongIndex);
    } else {
      console.error("Gagal mengambil data:", data.message);
    }
  } catch (error) {
    console.error("Terjadi kesalahan saat mengambil data:", error);
  }
}

// Load playlist
function loadPlaylist(surahs) {
  playlist.innerHTML = '';  // Clear the playlist first
  surahs.forEach((surah, index) => {
    const li = document.createElement('li');
    li.classList.add('cursor-pointer', 'hover:bg-gray-700', 'p-4', 'rounded-lg', 'bg-gray-600');
    li.textContent = `${surah.nomor}. ${surah.namaLatin} - ${surah.arti}`;
    li.dataset.index = index;

    // Event listener untuk klik item di playlist
    li.addEventListener('click', function() {
      currentSongIndex = index;
      loadSong(currentSongIndex);
      audioPlayer.play();
      playButton.innerHTML = '<i class="fas fa-pause"></i>'; // Ubah ke ikon pause

      // Update kelas 'active' pada item yang dipilih
      setActiveSong(index);
    });

    playlist.appendChild(li);
  });
}

// Load selected song
function loadSong(index) {
  const surah = surahs[index];
  const audioUrls = surah.audioFull;
  
  // Update song details
  document.getElementById('songTitle').textContent = `${surah.namaLatin} (${surah.nama})`;
  document.getElementById('qariName').textContent = getQariName(currentQari);
  audioPlayer.src = audioUrls[currentQari];
  progressBar.value = 0;
  setActiveSong(index);
  playButton.innerHTML = '<i class="fas fa-play"></i>';
}

// Fungsi untuk menandai surah yang sedang diputar
function setActiveSong(index) {
  const items = playlist.querySelectorAll('li'); // Ambil semua item dari playlist

  // Hapus kelas 'active' dari semua item playlist
  items.forEach(item => item.classList.remove('bg-[#D09B32]')); // Ganti dengan warna baru

  // Tambahkan kelas 'active' pada item yang sedang diputar
  items[index].classList.add('bg-[#D09B32]'); // Ganti dengan warna baru
}

// Toggle play/pause
function togglePlayPause() {
  if (audioPlayer.paused) {
    audioPlayer.play();
    playButton.innerHTML = '<i class="fas fa-pause"></i>'; // Ikon pause
  } else {
    audioPlayer.pause();
    playButton.innerHTML = '<i class="fas fa-play"></i>'; // Ikon play
  }
}

// Update progress bar
audioPlayer.addEventListener('timeupdate', () => {
  const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  progressBar.value = progress;
});

// Prev and Next buttons
prevButton.addEventListener('click', () => {
  currentSongIndex = (currentSongIndex - 1 + surahs.length) % surahs.length;
  loadSong(currentSongIndex);
  audioPlayer.play();
  playButton.innerHTML = '<i class="fas fa-pause"></i>';
});

nextButton.addEventListener('click', () => {
  currentSongIndex = (currentSongIndex + 1) % surahs.length;
  loadSong(currentSongIndex);
  audioPlayer.play();
  playButton.innerHTML = '<i class="fas fa-pause"></i>';
});

// Fetch data when the page is loaded
window.onload = () => {
  fetchSurahs();
};

// Handle play/pause button click
playButton.addEventListener('click', togglePlayPause);

// Update qari based on selection
document.getElementById('qariSelect').addEventListener('change', (e) => {
  currentQari = e.target.value;
  loadSong(currentSongIndex); // Reload the current song with the selected Qari
});

// Helper function to get qari name by value
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
