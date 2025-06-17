function filterKategori(kat) {
  const cards = document.querySelectorAll('.card');
  cards.forEach(c => {
    if (kat === 'semua' || c.classList.contains(kat)) {
      c.style.display = 'block';
    } else {
      c.style.display = 'none';
    }
  });
}