// pagination.js
import { loadPlaylist } from './playlist.js';

const prevPageButton = document.getElementById('prevPage');
const nextPageButton = document.getElementById('nextPage');
let currentPage = 1;
let savedPage = 1;

prevPageButton.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    loadPlaylist(filteredSurahs);
  }
});

nextPageButton.addEventListener('click', () => {
  const totalPages = Math.ceil(filteredSurahs.length / surahPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    loadPlaylist(filteredSurahs);
  }
});

export { prevPageButton, nextPageButton };
