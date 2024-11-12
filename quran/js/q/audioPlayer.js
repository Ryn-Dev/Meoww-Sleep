// audioPlayer.js
const audioPlayer = new Audio();
const playButton = document.getElementById('playBtn');
const progressBar = document.getElementById('progressBar');
const qariSelect = document.getElementById('qariSelect');
let currentSongIndex = null;
let currentQari = '01';

function loadSong(nomor) {
  const surah = surahs.find(s => s.nomor === nomor);
  const audioUrls = surah.audioFull;
  document.getElementById('songTitle').textContent = `${surah.namaLatin} (${surah.nama})`;
  document.getElementById('qariName').textContent = getQariName(currentQari);
  audioPlayer.src = audioUrls[currentQari];
  progressBar.value = 0;
  setActiveSong(nomor);
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

export { loadSong, setActiveSong, audioPlayer, playButton };
