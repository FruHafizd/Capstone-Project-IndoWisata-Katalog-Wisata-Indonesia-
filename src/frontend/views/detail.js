const urlParams = new URLSearchParams(window.location.search);
const wisata = urlParams.get('id');

// Jika ID wisata ada, ambil dan tampilkan detail wisata
window.onload = () => (fetch_wisata_detail(wisata));

// Endpoint API untuk detail wisata
const api_detail = "http://localhost:3000/api/wisata";

// Fungsi untuk mengambil detail wisata berdasarkan ID
async function fetch_wisata_detail(id) {
    const container = document.getElementById('detail-container');
    container.innerHTML = "<p>Memuat detail wisata...</p>";
    try {
        const response = await fetch(`${api_detail}/${id}`);
        if (!response.ok) {
            throw new Error(`Gagal mengambil data: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        console.log("Respons API:", result); // <-- Debugging
        render_detail(result);
        initMap(result);
    } catch (error) {
        console.error(error);
        container.innerHTML = `<p>Gagal memuat detail wisata. Error: ${error.message}</p>`;
    }
}

// Fungsi untuk menampilkan detail wisata
function render_detail(data) {
    const detailContainer = document.getElementById('detail-container');

    const html = `
        <div class="title1">
            <h1>${data.name || 'N/A'}</h1>
        </div>
        <div class="content">
            <img src="${data.imageUrl || 'frontend/image/lava.webp'}" alt="${data.name || 'Wisata'}">
        </div>
        <div class="content">
            <p><b>Address : </b>${data.address || 'N/A'}</p>
        </div>
        <div class="content">
            <p><b>Rating : </b>${data.rating || 'N/A'} ${convertRatingToStars(data.rating)}</p>
        </div>
        <div class="content">
            <p><b>Opening Hours</b></p>
            <ul>
                ${data.openingHours.map(hour => `<li>${hour}</li>`).join('')}
            </ul>
        </div>
        <div class="title2">
            <h1>Map</h1>
        </div>
        <div id="map"class="map"></div>
    `;

    // Isi detail-container dengan template HTML
    detailContainer.innerHTML = html;
}

// Fungsi untuk mengonversi rating ke bintang
function convertRatingToStars(rating) {
    const numericRating = parseFloat(rating) || 0; 
    const fullStars = Math.floor(numericRating); 
    const halfStar = numericRating % 1 >= 0.5 ? 1 : 0; 
    const emptyStars = 5 - fullStars - halfStar; 

    
    const fullStarIcon = '<span class="fa fa-star checked"></span>';
    
    const halfStarIcon = '<span class="fa fa-star-half-alt checked"></span>';
    
    const emptyStarIcon = '<span class="fa fa-star"></span>';

   
    const stars = fullStarIcon.repeat(fullStars) + 
                 (halfStar ? halfStarIcon : '') + 
                 emptyStarIcon.repeat(emptyStars);

    return stars;
}

function initMap(data) {
    var location = { lat: data.location.lat, lng: data.location.lng };
    var map = new google.maps.Map(document.getElementById("map"), {
        zoom: 10,
        center: location
    });

    // Tambahkan marker agar lebih jelas
    var marker = new google.maps.Marker({ position: location, map: map });
}

window.onload = () => {
    fetch_wisata_detail(wisata);
}