const urlParams = new URLSearchParams(window.location.search);
const wisata = urlParams.get('id');

// Endpoint API untuk detail wisata
const api_detail = "http://localhost:3000/api/wisata";

// Fungsi untuk mengambil detail wisata berdasarkan ID
async function fetch_wisata_detail(id) {
    const container = document.getElementById('detail-container');
    if (!container) return;
    container.innerHTML = "<p>Memuat detail wisata...</p>";
    try {
        const response = await fetch(`${api_detail}/${id}`);
        if (!response.ok) {
            throw new Error(`Gagal mengambil data: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        // console.log("Respons API:", result); // Debugging
        render_detail(result);
        // Pastikan data.detail (result.data.place) ada untuk peta dan street view
        if (result.data && result.data.place) {
            initMap(result.data.place);
            initialize(result.data.place);
        }
    } catch (error) {
        console.error(error);
        container.innerHTML = `<p>Gagal memuat detail wisata. Error: ${error.message}</p>`;
    }
}

// Fungsi untuk menampilkan detail wisata
function render_detail(response) {
    // Ambil objek detail dari response.data.place
    const data = response.data.place;
    // Jika openingHours tidak tersedia, gunakan array kosong sebagai default
    const openingHours = Array.isArray(data.openingHours) ? data.openingHours : [];

    const html = `
        <div class="title1">
            <h1>${data.name || 'N/A'}</h1>
        </div>
        <div class="content">
            <img src="${data.imageUrl || 'frontend/image/lava.webp'}" alt="${data.name || 'Wisata'}">
        </div>
        <div class="content">
            <p><b>Address: </b>${data.address || 'N/A'}</p>
        </div>
        <div class="content">
            <p><b>Rating: </b>${data.rating || 'N/A'} ${convertRatingToStars(data.rating)}</p>
        </div>
        <div class="content">
            <p><b>Opening Hours:</b></p>
            <ul>
                ${openingHours.map(hour => `<li>${hour}</li>`).join('')}
            </ul>
        </div>
        <div class="title2">
            <h1>Map</h1>
        </div>
        <div id="map" class="map"></div>
        <div class="title2">
            <h1>Street View</h1>
        </div>
        <div id="pano" class="pano"></div>
    `;
    document.getElementById('detail-container').innerHTML = html;
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

    return fullStarIcon.repeat(fullStars) +
           (halfStar ? halfStarIcon : '') +
           emptyStarIcon.repeat(emptyStars);
}

// Fungsi inisialisasi peta dengan marker (Google Maps)
function initMap(data) {
    if (!data.location) {
        console.warn("Location tidak tersedia, peta tidak ditampilkan.");
        return;
    }
    const location = { lat: data.location.lat, lng: data.location.lng };
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 10,
        center: location
    });
    new google.maps.Marker({ position: location, map: map });
}
  
// Fungsi inisialisasi Street View (Google Maps)
function initialize(data) {
    if (!data.location) {
        console.warn("Location tidak tersedia, Street View tidak ditampilkan.");
        return;
    }
    const location = { lat: data.location.lat, lng: data.location.lng };
    const map = new google.maps.Map(document.getElementById("map"), {
        center: location,
        zoom: 14,
    });
    const panorama = new google.maps.StreetViewPanorama(
        document.getElementById("pano"),
        {
            position: location,
            pov: {
                heading: 34,
                pitch: 10,
            },
        }
    );
    map.setStreetView(panorama);
}
  
// Fungsi inisialisasi detail yang diekspor
function initDetail() {
    if (wisata) {
        fetch_wisata_detail(wisata);
    }
}

// Panggil initDetail() saat DOM siap
document.addEventListener("DOMContentLoaded", initDetail);

export default initDetail;
