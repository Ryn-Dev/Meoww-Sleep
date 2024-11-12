// timer.js
// import Swal from 'sweetalert2';

let timerRemaining = 0;
let timerDuration = 0;
let countdownInterval = null;

const timerSelect = document.getElementById('timerSelect');
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
        // Swal.fire({
        //   title: 'Waktu Timer Habis',
        //   text: 'Pemutaran dihentikan.',
        //   icon: 'info',
        //   confirmButtonText: 'OK'
        // });
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

export { timerRemaining, countdownInterval, timerSelect, updateTimerDisplay };
