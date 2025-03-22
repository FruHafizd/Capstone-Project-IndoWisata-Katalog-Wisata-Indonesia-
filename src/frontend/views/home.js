// import config from './config.js'; // Import konfigurasi API_KEY

const api_top = "http://localhost:3000/api/wisata/top";

async function fetch_top() {
    const container = document.querySelector('#grid-container');
    container.innerHTML = "<p>Memuat data wisata...</p>";

    try {
        const response = await fetch(api_top);
        if (!response.ok) {
            throw new Error(`Gagal mengambil data: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        if (result.status !== "success" || !result.data) {
            throw new Error("Format data tidak valid");
        }

        render_all(result.data);
    } catch (error) {
        console.error(error);
        container.innerHTML = `<p>Gagal memuat data wisata. Error: ${error.message}</p>`;
    }
}

function convertRatingToStars(rating) {
    const numericRating = parseFloat(rating) || 0; // Konversi ke angka
    const fullStars = Math.floor(numericRating); 
    const halfStar = numericRating % 1 >= 0.5 ? 1 : 0; 
    const emptyStars = 5 - fullStars - halfStar; 

    // Ikon bintang penuh
    const fullStarIcon = '<span class="fa fa-star checked"></span>';
    // Ikon setengah bintang
    const halfStarIcon = '<span class="fa fa-star-half-alt checked"></span>';
    // Ikon bintang kosong
    const emptyStarIcon = '<span class="fa fa-star"></span>';

    // Gabungkan ikon bintang
    const stars = fullStarIcon.repeat(fullStars) + 
                 (halfStar ? halfStarIcon : '') + 
                 emptyStarIcon.repeat(emptyStars);

    return stars;
}

function render_all(data = []) {
    const container = document.querySelector('.grid-container');
    if (data.length === 0) {
        container.innerHTML = "<p>Tidak ada data wisata yang tersedia.</p>";
        return;
    }

    container.innerHTML = data.map(item => 
        `
        <div class="grid-item" data-id="${item.id}">
            <img src="${item.imageUrl}" alt="${item.name || 'Wisata'}">
            <h3>${item.name || 'N/A'}</h3>
            <div class="rating"><b>${item.rating || 'N/A'}</b> ${convertRatingToStars(item.rating)}</div>
        </div>
        `
    ).join('');

    const items = document.querySelectorAll('.grid-item');
    items.forEach(item => {
        item.addEventListener('click', () => {
            const wisataId = item.getAttribute('data-id');
            window.location.href = `detail.html?id=${wisataId}`; // Arahkan ke halaman detail
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

