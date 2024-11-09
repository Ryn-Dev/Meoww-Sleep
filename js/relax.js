const randomNumber = (min, max) => Math.floor(Math.random() * max) + min;
let interval1, interval2, interval3;
let isMobile = false;
let isSessionCompleted = false;

const createStars = async(type, quantity) => {
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
            // remove element when animation end
            star.remove();
        });
    }
}

const startAnimation = () => {
    let startDescText = document.getElementById('start-desc-text');
    var hasCompleted = localStorage.getItem('hasCompleted');

    if (hasCompleted == 'true') {
        startDescText.innerHTML = 'Hai, senang bertemu denganmu lagi! <br>Mau beristirahat sejenak?';
    }
    if (isSessionCompleted) {
        startDescText.innerHTML = 'Aku harap Kamu sudah mendingan!'
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
    let startContent = document.getElementById('start-container');
    startContent.classList.remove('visible');
    startContent.classList.add('hidden');
    startTextAnimation();
}

const timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const changeText = async(text, ms = 6000) => {
    let mainContent = document.getElementById('main-text');
    // write text
    await timeout(1000);
    mainContent.innerHTML = text;
    mainContent.classList.add('visible');
    // hide text
    await timeout(ms);
    mainContent.classList.remove('visible');
    mainContent.classList.add('hidden');
}

const startTextAnimation = async() => {
    await changeText('Halo, Kamu!', 4000);
    await changeText('Apa kabar?', 4000);
    await changeText('Aku harap kamu baik-baik saja disana.', 4000);
    await changeText('Hari ini terasa berat, ya?', 4000);
    await changeText('Pastiin kamu udah minum air putih yang cukup!');
    await changeText('Jangan lupa makan, jaga kesehatan itu penting.');
    await changeText('Aku harap kamu tidak terlalu lama menatap gadget.');
    await changeText('Rehat sejenak tidak akan menurunkan produktivitasmu, kok.');
    await changeText('Bagaimana kalau kamu melakukan sesuatu yang menenangkan?');
    await changeText('Seperti menonton film, mendengarkan lagu, atau <i>catch-up</i> dengan teman lama?', 7000);
    await changeText('Santai sejenak, tenangkan pikiranmu, tidak perlu gelisah.');
    await changeText('Sudah merasa mendingan?');
    await changeText('Aku harap sudah, ya. Karena aku tidak di-program jika kamu belum mendingan, hehe.', 7000);
    await changeText('Ayo senyum!', 3000);
    await changeText('Kamu manis, jika senyum !', 3000);
    await changeText('Senyum itu termasuk <i>serotonin boost</i>, loh!', 5000);
    await changeText('Aku hanya ingin mengingkatkan bahwa hari yang buruk itu biasa saja.');
    await changeText('Tidak ada orang yang tidak pernah mengalami hari buruk.');
    await changeText('Jadi, <i>don\'t be too hard on yourself</i>.');
    await changeText('<i>Because eventually, everything will be okay</i>.', 7000);
    showStartContent();
}

const showStartContent = () => {
    // save to local storage if user has completed the action
    localStorage.setItem('hasCompleted', true);
    isSessionCompleted = true;
    let startContent = document.getElementById('start-container');
    let startDescText = document.getElementById('start-desc-text');
    let button = document.getElementById('btn-start');
    startContent.classList.remove('hidden');
    startDescText.innerText = 'Aku harap Kamu sudah merasa mendingan!';
    button.innerText = 'Mulai Lagi?'
    startContent.classList.add('visible');
}

const reportWindowSize = () => {
    stopAnimation();
    startAnimation();
}

const musicPlay = () => {
    document.getElementById('audio').play();
    document.removeEventListener('click', musicPlay);
}

const back = () => {
    let url = window.location.href.replace('relax.html', 'index.html');
    window.location.href = url;
}

document.addEventListener('click', musicPlay);
window.addEventListener('load', startAnimation);
window.addEventListener('focus', startAnimation);
window.addEventListener('blur', stopAnimation);
window.addEventListener('resize', reportWindowSize);