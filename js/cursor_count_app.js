const countdownContainer = document.querySelector('.countdown-container');
const cursor = document.getElementById('custom-cursor');

const containerRect = countdownContainer.getBoundingClientRect();
const initialCursorX = containerRect.left;
const initialCursorY = containerRect.top;

cursor.style.right = `${initialCursorX}px`;
cursor.style.bottom = `${initialCursorY}px`;

const updateCursorPosition = (e) => {
const offset = 10; // Sesuaikan offset sesuai dengan keinginan
const x = e.clientX - offset;
const y = e.clientY - offset;

cursor.style.left = `${x}px`; // Atur posisi horizontal elemen cursor
cursor.style.top = `${y}px`; // Atur posisi vertikal elemen cursor
};

// Inisialisasi posisi awal elemen custom-cursor
cursor.style.right = `${initialCursorX}px`;
cursor.style.bottom = `${initialCursorY}px`;

document.addEventListener("mousemove", updateCursorPosition);
