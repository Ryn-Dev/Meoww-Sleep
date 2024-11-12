// fetchSurahs.js
const apiUrl = "https://equran.id/api/v2/surat";

let surahs = [];
let filteredSurahs = [];

async function fetchSurahs() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.code === 200) {
      surahs = data.data;
      filteredSurahs = [...surahs];
      loadPlaylist(filteredSurahs);
    } else {
      console.error("Gagal mengambil data:", data.message);
    }
  } catch (error) {
    console.error("Terjadi kesalahan saat mengambil data:", error);
  }
}

export { fetchSurahs, surahs, filteredSurahs };
