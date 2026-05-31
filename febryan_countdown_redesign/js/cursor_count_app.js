// =============================================
//  FEBRYAN AIR — CUSTOM CURSOR
// =============================================

const cursor = document.getElementById('custom-cursor');

// Smooth cursor follow using lerp
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let curX   = mouseX;
let curY   = mouseY;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Animate cursor with lerp for smooth trailing
const animateCursor = () => {
  curX += (mouseX - curX) * 0.12;
  curY += (mouseY - curY) * 0.12;
  cursor.style.left = curX + 'px';
  cursor.style.top  = curY + 'px';
  requestAnimationFrame(animateCursor);
};

animateCursor();

// ── Generate barcode bars ──
const barcodeEl = document.getElementById('barcode');
if (barcodeEl) {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 52; i++) {
    const bar = document.createElement('div');
    const wide = Math.random() > 0.65;
    bar.style.width   = (wide ? 3 : 1.5) + 'px';
    bar.style.opacity = (0.4 + Math.random() * 0.6).toFixed(2);
    fragment.appendChild(bar);
  }
  barcodeEl.appendChild(fragment);
}
