import { surahs, filteredSurahs } from './fetchSurahs.js';
import { loadSong, setActiveSong } from './audioPlayer.js';

const playlist = document.getElementById('playlist');
const noDataMessage = document.createElement('p');
const paginationSurah = document.getElementById('paginationSurah');
const pageNum = document.getElementById('pageNum');
let currentPage = 1;
const surahPerPage = 5;
let savedPage = 1;

noDataMessage.classList.add('text-center', 'text-gray-500', 'mt-4', 'mb-5');
noDataMessage.textContent = "Data surah tidak ada.";
noDataMessage.style.display = 'none';
playlist.parentNode.appendChild(noDataMessage);

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

  surahPage.forEach((surah) => {
    const li = document.createElement('li');
    li.classList.add('cursor-pointer', 'hover:bg-gray-700', 'p-4', 'rounded-lg', 'bg-gray-600');
    li.textContent = `${surah.nomor}. ${surah.namaLatin} - ${surah.arti}`;
    li.dataset.nomor = surah.nomor;

    li.addEventListener('click', function() {
      loadSong(surah.nomor); // Menggunakan loadSong
      setActiveSong(surah.nomor); // Menggunakan setActiveSong
      savedPage = currentPage;
    });

    playlist.appendChild(li);
  });

  pageNum.textContent = currentPage;
}

// Pastikan menggunakan data yang sudah difilter jika ada pencarian
loadPlaylist(filteredSurahs.length > 0 ? filteredSurahs : surahs); 

export { loadPlaylist };
