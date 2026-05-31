// =============================================
//  FEBRYAN AIR — COUNTDOWN LOGIC
// =============================================

let targetDate;
let intervalId;

const splashScreen = document.getElementById('splash-screen');

// Airport code map — tambahkan destinasi sesuai kebutuhan
const destMap = {
  'Bali'       : { code: 'DPS', sub: 'Ngurah Rai' },
  'Surabaya'   : { code: 'SUB', sub: 'Juanda' },
  'Yogyakarta' : { code: 'YIA', sub: 'Kulon Progo' },
  'Lombok'     : { code: 'LOP', sub: 'Int\'l Airport' },
  'Medan'      : { code: 'KNO', sub: 'Kualanamu' },
  'Makassar'   : { code: 'UPG', sub: 'Hasanuddin' },
  'Bandung'    : { code: 'BDO', sub: 'Husein Sastranegara' },
  'Semarang'   : { code: 'SRG', sub: 'Ahmad Yani' },
  'Balikpapan' : { code: 'BPN', sub: 'Sultan Aji' },
  'Manado'     : { code: 'MDC', sub: 'Sam Ratulangi' },
  'Padang'     : { code: 'PDG', sub: 'Minangkabau' },
  'Palembang'  : { code: 'PLM', sub: 'Sultan Mahmud' },
  'Pekanbaru'  : { code: 'PKU', sub: 'Sultan Syarif' },
  'Pontianak'  : { code: 'PNK', sub: 'Supadio' },
  'Singapura'  : { code: 'SIN', sub: 'Changi' },
  'Singapore'  : { code: 'SIN', sub: 'Changi' },
  'Kuala Lumpur': { code: 'KUL', sub: 'KLIA' },
  'Bangkok'    : { code: 'BKK', sub: 'Suvarnabhumi' },
  'Tokyo'      : { code: 'NRT', sub: 'Narita' },
};

// ── Fetch data from API ──
const fetchData = () => {
  fetch('https://countdown.febryann.my.id/api/v1/get.php')
    .then(response => response.json())
    .then(data => {
      console.log('[Febryan Air]', data);

      // Update title
      const title = data.title || 'Flight Countdown';
      document.getElementById('head-title').textContent = title + ' — Febryan Air';
      document.getElementById('countdown-title').textContent = title;
      document.getElementById('target-date-label').textContent = data.title_date_limit || '—';

      // Set target date
      targetDate = new Date(data.date_limit);

      // Detect destination from title
      let matched = false;
      for (const [city, info] of Object.entries(destMap)) {
        if (title.includes(city)) {
          document.getElementById('dest-code').textContent = info.code;
          document.getElementById('dest-city').textContent = city;
          document.getElementById('dest-sub').textContent  = info.sub;
          matched = true;
          break;
        }
      }
      if (!matched) {
        document.getElementById('dest-code').textContent = 'DST';
        document.getElementById('dest-city').textContent = 'Destination';
        document.getElementById('dest-sub').textContent  = '—';
      }

      // Start countdown
      clearInterval(intervalId);
      updateCountdown();
      intervalId = setInterval(updateCountdown, 1000);
    })
    .catch(error => {
      console.error('[Febryan Air] Fetch error:', error);
      document.getElementById('countdown-title').textContent = 'Flight Countdown';
    })
    .finally(() => {
      // Hide splash
      setTimeout(() => {
        splashScreen.classList.add('hidden');
      }, 1200);
    });
};

// ── Countdown updater ──
const updateCountdown = () => {
  if (!targetDate) return;

  const now  = Date.now();
  const diff = targetDate - now;

  const daysEl    = document.getElementById('days');
  const hoursEl   = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  if (diff <= 0) {
    // All zeros
    [daysEl, hoursEl, minutesEl, secondsEl].forEach(el => {
      el.textContent = '00';
      el.classList.add('warning');
    });
    clearInterval(intervalId);
    showArrivalAlert();
    return;
  }

  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  const pad = n => String(n).padStart(2, '0');
  daysEl.textContent    = pad(days);
  hoursEl.textContent   = pad(hours);
  minutesEl.textContent = pad(minutes);
  secondsEl.textContent = pad(seconds);

  // Warning state (< 5 minutes)
  const isWarning = diff <= 300000;
  [daysEl, hoursEl, minutesEl, secondsEl].forEach(el =>
    el.classList.toggle('warning', isWarning)
  );
};

// ── Arrival alert ──
const showArrivalAlert = () => {
  if (typeof Swal === 'undefined') return;
  Swal.fire({
    title: 'Have Fun!',
    html: `
      Semoga Penerbanganmu Menyenangkan
      <br><br>
      <img src="https://cdn.icon-icons.com/icons2/931/PNG/512/plane_airplane_icon-icons.com_72440.png"
           alt="Airplane" width="70px" style="opacity:0.8">
    `,
    imageUrl: 'images/cat-pilot.jpg',
    imageHeight: '100%',
    imageAlt: 'Cat Pilot',
    showConfirmButton: false,
    background: '#111113',
    color: '#F0ECE4',
  });
};

// ── Disable dev tools (basic) ──
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
  if (e.key === 'F12' || e.keyCode === 123) e.preventDefault();
  if (e.ctrlKey && e.key === 'u') e.preventDefault();
});

// ── Init ──
fetchData();
