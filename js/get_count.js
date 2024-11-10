let targetDate;

const splashScreen = document.getElementById('splash-screen');
const fetchData = () => {

    splashScreen.style.display = 'none';

    fetch('https://countdown.febryann.my.id/api/v1/get.php')
    // fetch('https://count.feb.my.id/api/v1/set.php')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        document.getElementById('head-title').textContent = data.title;
        document.getElementById('countdown-title').textContent = data.title;
        document.getElementById('target-date-label').textContent = data.title_date_limit;
        targetDate = new Date(data.date_limit); // Ambil tanggal target dari data JSON
        updateCountdown(targetDate); // Update countdown dengan tanggal target
    })
    .catch(error => console.error('Error:', error))
    .finally(() => {
        setTimeout(() => {
            splashScreen.style.display = 'none';
        }, 3000);
    });
};

fetchData();

const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

// const targetDate = new Date("2024-03-28T17:45:00");

const updateCountdown = () => {
    const now = new Date();
    const diff = targetDate - now;

    const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    const hours = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
    const minutes = Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
    const seconds = Math.max(0, Math.floor((diff % (1000 * 60)) / 1000));

    daysEl.textContent = String(days).padStart(2, "0");
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");

    daysEl.classList.add("pulsate");
    hoursEl.classList.add("pulsate");
    minutesEl.classList.add("pulsate");
    secondsEl.classList.add("pulsate");

    if (diff <= 300000) {
    daysEl.classList.add("warning");
    hoursEl.classList.add("warning");
    minutesEl.classList.add("warning");
    secondsEl.classList.add("warning");
    }

    if (diff <= 0) {
    clearInterval(intervalId);
    // alert("Semoga Penerbanganmu Menyenangkan!");
    Swal.fire({
        title: "Have Fun",
        html: "Semoga Penerbanganmu Menyenangkan <br></br> <img src='https://cdn.icon-icons.com/icons2/931/PNG/512/plane_airplane_icon-icons.com_72440.png' alt='Airplane' width='80px'>",
        imageUrl: "images/cat-pilot.jpg",
        paddingBottom: "40px",
        showConfirmButton: false,
        // imageWidth: 400,
        imageHeight: "100%",
        imageAlt: "Cat Pilot",
        onOpen: () => {
        const image = document.querySelector('.swal2-image');
        if (image) {
            image.style.borderRadius = '20px';
        }
        }
    });
    }
};

const intervalId = setInterval(updateCountdown, 1000);

updateCountdown();

document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
});

document.addEventListener('keydown', function (e) {
    if (e.key === 'F12' || e.keyCode === 123) {
    e.preventDefault();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'u' && e.ctrlKey) {
    e.preventDefault();
    }
});