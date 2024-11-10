// Daftar lagu (dengan URL yang kamu berikan)
const songs = {
    "01": {
      title: "Abdullah Al-Juhany - 001",
      artist: "Abdullah Al-Juhany",
      url: "https://equran.nos.wjv-1.neo.id/audio-full/Abdullah-Al-Juhany/001.mp3"
    },
    "02": {
      title: "Abdul-Muhsin Al-Qasim - 001",
      artist: "Abdul-Muhsin Al-Qasim",
      url: "https://equran.nos.wjv-1.neo.id/audio-full/Abdul-Muhsin-Al-Qasim/001.mp3"
    },
    "03": {
      title: "Abdurrahman as-Sudais - 001",
      artist: "Abdurrahman as-Sudais",
      url: "https://equran.nos.wjv-1.neo.id/audio-full/Abdurrahman-as-Sudais/001.mp3"
    }
  };
  
  const audioPlayer = new Audio();
  const playButton = document.querySelector('.play-btn');
  const prevButton = document.querySelector('.prev-btn');
  const nextButton = document.querySelector('.next-btn');
  const progressBar = document.querySelector('#progress');
  const playlist = document.getElementById('playlist');
  
  let currentSongIndex = 0;
  
  // Memuat lagu ke pemutar
  function loadSong(index) {
    const song = songs[index];
    audioPlayer.src = song.url;
    document.querySelector('.song-title').textContent = song.title;
    document.querySelector('.artist-name').textContent = song.artist;
    document.querySelector('.album-cover').src = "https://via.placeholder.com/200"; // Ganti dengan gambar album jika ada
    progressBar.value = 0;
    setActiveSong(index);
  }
  
  // Menandai lagu yang sedang diputar
  function setActiveSong(index) {
    const items = playlist.querySelectorAll('li');
    items.forEach(item => item.classList.remove('active'));
    items[index].classList.add('active');
  }
  
  // Fungsi play/pause
  function togglePlayPause() {
    if (audioPlayer.paused) {
      audioPlayer.play();
      playButton.textContent = 'Pause';
    } else {
      audioPlayer.pause();
      playButton.textContent = 'Play';
    }
  }
  
  // Update progress bar
  audioPlayer.addEventListener('timeupdate', () => {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.value = progress;
  });
  
  // Memuat daftar lagu
  function loadPlaylist() {
    for (const index in songs) {
      const song = songs[index];
      const li = document.createElement('li');
      li.textContent = song.title;
      li.classList.add('playlist-item');
      li.dataset.index = index;
      li.addEventListener('click', function() {
        currentSongIndex = index;
        loadSong(currentSongIndex);
        audioPlayer.play();
        playButton.textContent = 'Pause';
      });
      playlist.appendChild(li);
    }
  }
  
  // Fungsi tombol next dan prev
  prevButton.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex - 1 + Object.keys(songs).length) % Object.keys(songs).length;
    loadSong(currentSongIndex);
    audioPlayer.play();
    playButton.textContent = 'Pause';
  });
  
  nextButton.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex + 1) % Object.keys(songs).length;
    loadSong(currentSongIndex);
    audioPlayer.play();
    playButton.textContent = 'Pause';
  });
  
  // Menyiapkan aplikasi
  window.onload = () => {
    loadPlaylist();
    loadSong(currentSongIndex);
  };
  
  // Tombol play/pause
  playButton.addEventListener('click', togglePlayPause);
  