function updateJam() {
  const jamEl = document.getElementById("jam");
  if (!jamEl) return;

  const waktu = new Date().toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta"
  });

  jamEl.textContent = waktu;
}

setInterval(updateJam, 1000);
updateJam();
