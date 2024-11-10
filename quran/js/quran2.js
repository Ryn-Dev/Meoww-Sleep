const apiUrl = "https://equran.id/api/v2/surat";
const audioPlayer = new Audio();
const playButton = document.getElementById('playBtn');
const prevSurahButton = document.getElementById('prevSurahBtn');
const nextSurahButton = document.getElementById('nextSurahBtn');
const progressBar = document.getElementById('progressBar');
const playlist = document.getElementById('playlist');
const searchInput = document.getElementById('searchInput');
const pageNum = document.getElementById('pageNum');
const qariSelect = document.getElementById('qariSelect'); // Dropdown Qari
const noDataMessage = document.createElement('p'); // Menambahkan elemen untuk pesan tidak ada data

let surahs = [];
let filteredSurahs = []; // Daftar surah yang sudah difilter berdasarkan pencarian
let currentSongIndex = null; // Menyimpan nomor surah yang sedang diputar (bukan index)
let currentQari = '01'; // Default qari
let currentPage = 1;
const surahPerPage = 5;
let savedPage = 1; // Menyimpan halaman yang aktif saat pencarian dilakukan

let timerTimeout = null; // Untuk menyimpan timeout timer
let timerDuration = 0;  // Durasi timer yang dipilih

// Menambahkan elemen pesan jika tidak ada data
noDataMessage.classList.add('text-center', 'text-gray-500', 'mt-4', 'mb-5');
noDataMessage.textContent = "Data surah tidak ada.";
noDataMessage.style.display = 'none'; // Sembunyikan pesan ini pertama kali
playlist.parentNode.appendChild(noDataMessage); // Menambahkannya di bawah playlist

// Fetch surah data
async function fetchSurahs() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.code === 200) {
      surahs = data.data;
      filteredSurahs = [...surahs]; // Set filtered surahs to all surahs initially
      loadPlaylist(filteredSurahs); // Setelah data surah diambil, muat playlist
    } else {
      console.error("Gagal mengambil data:", data.message);
    }
  } catch (error) {
    console.error("Terjadi kesalahan saat mengambil data:", error);
  }
}

const paginationSurah = document.getElementById('paginationSurah'); // Menambahkan reference untuk paginationSurah

// Load playlist with pagination
function loadPlaylist(surahs) {
  const start = (currentPage - 1) * surahPerPage;
  const end = currentPage * surahPerPage;
  const surahPage = surahs.slice(start, end);

  playlist.innerHTML = ''; // Clear playlist

  if (surahPage.length === 0) {
    // Jika tidak ada data, tampilkan pesan dan sembunyikan pagination
    noDataMessage.style.display = 'block';
    paginationSurah.style.display = 'none'; // Sembunyikan pagination jika tidak ada data
  } else {
    noDataMessage.style.display = 'none'; // Sembunyikan pesan jika ada data
    paginationSurah.style.display = 'flex'; // Tampilkan pagination jika ada data
  }

  surahPage.forEach((surah, index) => {
    const li = document.createElement('li');
    li.classList.add('cursor-pointer', 'hover:bg-gray-700', 'p-4', 'rounded-lg', 'bg-gray-600');
    li.textContent = `${surah.nomor}. ${surah.namaLatin} - ${surah.arti}`;
    li.dataset.nomor = surah.nomor; // Simpan nomor surah sebagai data

    li.addEventListener('click', function() {
      currentSongIndex = surah.nomor; // Menyimpan nomor surah yang dipilih
      loadSong(surah.nomor); // Muat lagu berdasarkan nomor surah
      audioPlayer.play();
      playButton.innerHTML = '<i class="fas fa-pause"></i>';
      setActiveSong(surah.nomor); // Set surah yang aktif berdasarkan nomor
      savedPage = currentPage; // Update savedPage saat surah dipilih
    });

    playlist.appendChild(li);
  });

  pageNum.textContent = currentPage;

  // Set active song in the playlist after re-rendering (jika nomor surah sama)
  if (currentSongIndex !== null) {
    setActiveSong(currentSongIndex);
  }
}


// Handle prev and next page buttons (pagination)
document.getElementById('prevPage').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    loadPlaylist(filteredSurahs); // Muat playlist yang sudah difilter berdasarkan pencarian
  }
});

document.getElementById('nextPage').addEventListener('click', () => {
  const totalPages = Math.ceil(filteredSurahs.length / surahPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    loadPlaylist(filteredSurahs); // Muat playlist yang sudah difilter berdasarkan pencarian
  }
});

// Handle search input
searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();

  // Filter surahs based on the search input
  filteredSurahs = surahs.filter(surah => {
    return surah.namaLatin.toLowerCase().includes(query) || surah.nomor.toString().includes(query);
  });

  // If search input is empty, restore the page and do not reset to page 1
  if (query === "") {
    currentPage = savedPage; // Restore to the page that was active before search
  } else {
    savedPage = currentPage; // Save the current page when search starts
    currentPage = 1; // Reset to page 1 when searching
  }

  loadPlaylist(filteredSurahs); // Muat playlist berdasarkan hasil pencarian
});

// Handle Qari selection
qariSelect.addEventListener('change', (e) => {
  currentQari = e.target.value; // Update currentQari when the user selects a new Qari
  if (currentSongIndex !== null) {
    loadSong(currentSongIndex); // Reload song if already playing
  }
});

// Load selected song by nomor surah
function loadSong(nomor) {
  const surah = surahs.find(s => s.nomor === nomor); // Cari surah berdasarkan nomor
  const audioUrls = surah.audioFull;
  document.getElementById('songTitle').textContent = `${surah.namaLatin} (${surah.nama})`;
  document.getElementById('qariName').textContent = getQariName(currentQari);
  audioPlayer.src = audioUrls[currentQari]; // Memuat URL audio berdasarkan Qari yang dipilih
  progressBar.value = 0;
  setActiveSong(nomor); // Set surah yang aktif berdasarkan nomor surah
  playButton.innerHTML = '<i class="fas fa-play"></i>';
}

// Set active song in playlist based on surah nomor
function setActiveSong(nomor) {
  const items = playlist.querySelectorAll('li');
  items.forEach(item => item.classList.remove('bg-[#D09B32]')); // Hapus semua highlight

  const activeItem = Array.from(items).find(item => parseInt(item.dataset.nomor) === nomor); // Cari item berdasarkan nomor
  if (activeItem) {
    activeItem.classList.add('bg-[#D09B32]'); // Tambahkan highlight pada item yang aktif
  }
}

// Get Qari name
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

// Initialize player
window.onload = () => {
  fetchSurahs();
  qariSelect.value = currentQari; // Set default Qari to '01' when page is loaded
};

// Play/Pause button action
playButton.addEventListener('click', () => {
  if (audioPlayer.paused) {
    audioPlayer.play();
    playButton.innerHTML = '<i class="fas fa-pause"></i>';
  } else {
    audioPlayer.pause();
    playButton.innerHTML = '<i class="fas fa-play"></i>';
  }
});

// Progress bar update
audioPlayer.addEventListener('timeupdate', () => {
  const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  progressBar.value = progress;
});

// Prev Surah button functionality
prevSurahButton.addEventListener('click', () => {
  if (currentSongIndex !== null && currentSongIndex > 1) {
    currentSongIndex--; // Pindah ke surah sebelumnya
    loadSong(currentSongIndex);
    audioPlayer.play();
    playButton.innerHTML = '<i class="fas fa-pause"></i>';
    setActiveSong(currentSongIndex);
  }
});

// Next Surah button functionality
nextSurahButton.addEventListener('click', () => {
  if (currentSongIndex !== null && currentSongIndex < surahs.length) {
    currentSongIndex++; // Pindah ke surah selanjutnya
    loadSong(currentSongIndex);
    audioPlayer.play();
    playButton.innerHTML = '<i class="fas fa-pause"></i>';
    setActiveSong(currentSongIndex);
  }
});

// Event listener untuk otomatis melanjutkan ke surah berikutnya ketika surah selesai
audioPlayer.addEventListener('ended', () => {
  if (currentSongIndex !== null && currentSongIndex < surahs.length) {
    currentSongIndex++; // Pindah ke surah selanjutnya
    if (currentSongIndex <= surahs.length) {
      loadSong(currentSongIndex);  // Muat lagu berdasarkan nomor surah berikutnya
      audioPlayer.play();          // Mulai pemutaran
      playButton.innerHTML = '<i class="fas fa-pause"></i>';  // Ubah tombol menjadi pause
      setActiveSong(currentSongIndex);  // Set surah yang aktif
    }
  } else {
    // Jika sudah di surah terakhir dan pemutaran selesai, set tombol ke "Pause"
    playButton.innerHTML = '<i class="fas fa-play"></i>';
  }
});

// Handle Timer Sleep logic
const timerDiv = document.createElement('div');
timerDiv.classList.add('flex', 'items-center');

const timerLabel = document.createElement('label');
timerLabel.classList.add('text-xl', 'mr-2'); // Menambahkan kelas untuk label dan memberi margin kanan
timerLabel.textContent = "Timer : ";

const timerSelect = document.createElement('select');
timerSelect.classList.add('bg-gray-800', 'text-white', 'p-2', 'rounded-lg');
timerSelect.innerHTML = `
  <option value="0">Off</option>
  <option value="5">5 minutes</option>
  <option value="10">10 minutes</option>
  <option value="15">15 minutes</option>
  <option value="30">30 minutes</option>
  <option value="60">60 minutes</option>
`;

// Menambahkan label dan select ke dalam div
timerDiv.appendChild(timerLabel);
timerDiv.appendChild(timerSelect);

// Menambahkan div timer ke dalam elemen dengan class '.mb-4'
document.querySelector('.mb-4').appendChild(timerDiv);

timerSelect.addEventListener('change', () => {
  if (timerTimeout) {
    clearTimeout(timerTimeout); // Clear the previous timer if there's any
  }

  const selectedTime = parseInt(timerSelect.value);
  timerDuration = selectedTime;

  if (timerDuration > 0) {
    // Set the timer to stop the audio after the selected time
    timerTimeout = setTimeout(() => {
      audioPlayer.pause();
      playButton.innerHTML = '<i class="fas fa-play"></i>';
      alert("Waktu timer habis, pemutaran dihentikan.");
    }, timerDuration * 60000); // Convert minutes to milliseconds
  }
});

