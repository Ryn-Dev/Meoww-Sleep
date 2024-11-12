// app.js
import { fetchSurahs } from './fetchSurahs.js';
import { loadPlaylist } from './playlist.js';
import { playButton, audioPlayer } from './audioPlayer.js';
import { prevPageButton, nextPageButton } from './pagination.js';
import { timerSelect, updateTimerDisplay } from './timer.js';

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
