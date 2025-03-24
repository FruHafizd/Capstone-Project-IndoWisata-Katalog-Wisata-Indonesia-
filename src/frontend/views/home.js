// import config from './config.js'; // Import konfigurasi API_KEY

const api_top = "http://localhost:3000/api/wisata/top";

// Fungsi untuk mengambil data top wisata
async function fetch_top() {
    const container = document.querySelector('#grid-container');
    container.innerHTML = "<p>Memuat data wisata...</p>";
  
    try {
      const response = await fetch(api_top);
      if (!response.ok) {
        throw new Error(`Gagal mengambil data: ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      // Pastikan respons API memiliki struktur yang benar, misalnya:
      // { "status": "success", "data": { "places": [...], "meta": { ... } } }
      if (result.status !== "success" || !result.data || !result.data.places) {
        throw new Error("Format data tidak valid");
      }
      render_all(result.data.places);
    } catch (error) {
      console.error(error);
      container.innerHTML = `<p>Gagal memuat data wisata. Error: ${error.message}</p>`;
    }
}

function convertRatingToStars(rating) {
    const numericRating = parseFloat(rating) || 0;
    const fullStars = Math.floor(numericRating);
    const halfStar = numericRating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    const fullStarIcon = '<span class="fa fa-star checked"></span>';
    const halfStarIcon = '<span class="fa fa-star-half-alt checked"></span>';
    const emptyStarIcon = '<span class="fa fa-star"></span>';
    
    return fullStarIcon.repeat(fullStars) +
           (halfStar ? halfStarIcon : '') +
           emptyStarIcon.repeat(emptyStars);
}
  
function render_all(data = []) {
    const container = document.querySelector('.grid-container');
    if (data.length === 0) {
      container.innerHTML = "<p>Tidak ada data wisata yang tersedia.</p>";
      return;
    }
  
    container.innerHTML = data.map(item => `
      <div class="grid-item" data-id="${item.id}">
        <img src="${item.image_url || 'frontend/image/lava.webp'}" alt="${item.name || 'Wisata'}">
        <h3>${item.name || 'N/A'}</h3>
        <div class="rating">
          <b>${item.rating || 'N/A'}</b> ${convertRatingToStars(item.rating)}
        </div>
      </div>
    `).join('');
  
    // Menambahkan event listener pada setiap grid-item agar ketika diklik, diarahkan ke halaman detail
    const items = document.querySelectorAll('.grid-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        const wisataId = item.getAttribute('data-id');
        window.location.href = `detail.html?id=${wisataId}`;
      });
    });
}

function initMap() {
    var location = { lat: -6.1252747, lng: 106.8335569 };
    var map = new google.maps.Map(document.getElementById("map"), {
        zoom: 10,
        center: location
    });
  
    // Tambahkan marker agar lebih jelas
    var marker = new google.maps.Marker({ position: location, map: map });
}
  
window.onload = () => {
    initMap();
    fetch_top();
};
