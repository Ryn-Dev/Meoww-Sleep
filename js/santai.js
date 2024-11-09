const randomNumber = (min, max) => Math.floor(Math.random() * max) + min;
let interval1, interval2, interval3;
let isMobile = false;
let isSessionCompleted = false;

const createStars = async (type, quantity) => {
    for (let i = 0; i < quantity; i++) {
        let star = document.createElement('div');
        star.classList.add('star', `type-${type}`);
        star.style.left = `${randomNumber(1, 99)}%`;
        star.style.bottom = '0px';
        if (type == 1) star.style.animationDuration = `35s`;
        else if (type == 2) star.style.animationDuration = `25s`;
        else star.style.animationDuration = `10s`;
        document.body.appendChild(star);
        star.addEventListener('animationend', () => {
            // remove element when animation ends
            star.remove();
        });
    }
}

const startAnimation = () => {
    let startDescText = document.getElementById('start-desc-text');
    var hasCompleted = localStorage.getItem('hasCompleted');

    if (hasCompleted == 'true') {
        startDescText.innerHTML = 'Selamat datang kembali, mari istirahat sejenak.';
    }
    if (isSessionCompleted) {
        startDescText.innerHTML = 'Aku harap kamu merasa lebih baik sekarang.'
    }

    // define interval timeout
    var timeout1 = 350;
    var timeout2 = 450;
    var timeout3 = 700;
    var quantity1 = 2;
    var quantity2 = 3;
    // check screen size
    isMobile = window.innerWidth <= 768;
    if (isMobile) {
        timeout1 = 600;
        timeout2 = 800;
        timeout3 = 1000;
        quantity1 = 1;
        quantity2 = 2;
    }

    interval1 = window.setInterval(() => {
        createStars(1, quantity1);
    }, timeout1);
    interval2 = window.setInterval(() => {
        createStars(2, quantity2);
    }, timeout2);
    interval3 = window.setInterval(() => {
        createStars(3, quantity2);
    }, timeout2);
}

const stopAnimation = () => {
    window.clearInterval(interval1);
    window.clearInterval(interval2);
    window.clearInterval(interval3);
}

const start = () => {
    // Hide start screen
    let startContent = document.getElementById('start-container');
    startContent.classList.remove('visible');
    startContent.classList.add('hidden');
    startTextAnimation();
    musicPlay(); // Start the music after interaction
}

const musicPlay = () => {
    const audio = document.getElementById('audio');
    audio.play();
    audio.loop = true;
    document.removeEventListener('click', musicPlay);
}

// const startTextAnimation = async () => {
//     const mainText = document.getElementById('main-text');
//     await changeText('Selamat datang di ruang relaksasi ini.', 4000);
//     await changeText('Izinkan dirimu untuk berhenti sejenak dan bernapas dengan tenang.', 5000);
//     await changeText('Kamu sudah berusaha keras, sekarang saatnya memberi dirimu ruang untuk mereset.', 6000);
//     await changeText('Saatnya melepaskan sejenak dari semua beban yang ada.', 5000);
//     await changeText('Rasakan udara yang masuk, dan biarkan tubuhmu sedikit lebih rileks.', 6000);
//     await changeText('Tidak ada yang lebih penting sekarang selain dirimu dan kedamaian ini.', 5000);
//     await changeText('Cobalah lepaskan ketegangan pada tubuh, setiap napas membawa ketenangan.', 6000);
//     await changeText('Setiap detik yang berlalu memberi kesempatan untuk merasa lebih baik.', 5000);
//     await changeText('Tidak perlu terburu-buru, kamu berada di tempat yang aman dan nyaman.', 6000);
//     await changeText('Ketahuilah bahwa hari yang berat pun akan berlalu, dan kamu akan melewatinya.', 7000);
//     await changeText('Jangan terlalu keras pada dirimu sendiri, berikan ruang untuk tumbuh dan beristirahat.', 7000);
//     await changeText('Jangan lupa, segala hal akan menjadi lebih baik pada waktunya.', 6000);
//     showStartContent();
// }

const startTextAnimation = async () => {
    const mainText = document.getElementById('main-text');
    await changeText('Selamat datang di ruang relaksasi ini.', 4000);
    await changeText('Izinkan dirimu untuk berhenti sejenak dan bernapas dengan tenang.', 5000);
    await changeText('Kamu sudah berusaha keras, sekarang saatnya memberi dirimu ruang untuk mereset.', 6000);
    await changeText('Saatnya melepaskan sejenak dari semua beban yang ada.', 5000);
    await changeText('Rasakan udara yang masuk, dan biarkan tubuhmu sedikit lebih rileks.', 6000);
    await changeText('Tidak ada yang lebih penting sekarang selain dirimu dan kedamaian ini.', 5000);
    await changeText('Cobalah lepaskan ketegangan pada tubuh, setiap napas membawa ketenangan.', 6000);
    await changeText('Setiap detik yang berlalu memberi kesempatan untuk merasa lebih baik.', 5000);
    await changeText('Tidak perlu terburu-buru, kamu berada di tempat yang aman dan nyaman.', 6000);
    await changeText('Ketahuilah bahwa hari yang berat pun akan berlalu, dan kamu akan melewatinya.', 7000);
    await changeText('Jangan terlalu keras pada dirimu sendiri, berikan ruang untuk tumbuh dan beristirahat.', 7000);
    await changeText('Jangan lupa, segala hal akan menjadi lebih baik pada waktunya.', 6000);
    
    // Menambah kata-kata relaksasi dan penguatan mental
    await changeText('Ini adalah waktumu untuk kembali mengisi energi, sejenak melupakan semua kepenatan.', 6000);
    await changeText('Setiap napas yang kamu ambil, semakin dalam ketenangan masuk ke dalam dirimu.', 6000);
    await changeText('Jangan khawatir, kamu sedang melakukan hal yang benar. Memberi waktu untuk diri sendiri adalah langkah penting.', 7000);
    await changeText('Beri dirimu izin untuk merasa lega. Tidak ada yang lebih penting sekarang selain kebahagiaanmu.', 6000);
    await changeText('Ingatlah, kamu cukup kuat untuk menghadapi segala hal. Tapi untuk sekarang, istirahat adalah hal yang paling kamu butuhkan.', 7000);
    await changeText('Cobalah untuk melepaskan segala kecemasan, dan nikmati momen ketenangan ini.', 6000);
    await changeText('Kamu tidak sendirian. Semua orang membutuhkan waktu untuk diri mereka sendiri, dan ini adalah waktumu.', 7000);
    await changeText('Kamu berhak merasa tenang, merasa damai, dan merasa nyaman. Ini adalah ruang yang aman untukmu.', 7000);
    await changeText('Terkadang, kita hanya perlu berhenti sejenak, memberi kesempatan untuk diri kita merasakan kedamaian.', 7000);
    await changeText('Kamu tidak harus menjadi sempurna. Cukup lakukan yang terbaik dan berikan ruang untuk dirimu merasa baik.', 6000);
    
    showStartContent();
}


const changeText = async (text, ms = 5000) => {
    let mainContent = document.getElementById('main-text');
    await timeout(1000);
    mainContent.innerHTML = text;
    mainContent.classList.add('visible');
    await timeout(ms);
    mainContent.classList.remove('visible');
    mainContent.classList.add('hidden');
}

const timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const showStartContent = () => {
    // save to local storage if user has completed the action
    localStorage.setItem('hasCompleted', true);
    isSessionCompleted = true;
    let startText = document.getElementById('start-text');
    let startContent = document.getElementById('start-container');
    let startDescText = document.getElementById('start-desc-text');
    let button = document.getElementById('btn-start');
    startContent.classList.remove('hidden');
    startText.innerText = 'Bagaimana Sekarang?';
    startDescText.innerText = 'Aku harap kamu merasa lebih baik sekarang.';
    button.innerText = 'Mulai Lagi?'
    startContent.classList.add('visible');
}

const reportWindowSize = () => {
    stopAnimation();
    startAnimation();
}

document.addEventListener('click', musicPlay);
window.addEventListener('load', startAnimation);
window.addEventListener('focus', startAnimation);
window.addEventListener('blur', stopAnimation);
window.addEventListener('resize', reportWindowSize);
