const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function initMap() {
    var location = { lat: -6.1252747, lng: 106.8335569 };
    var map = new google.maps.Map(document.getElementById("map"), {
        zoom: 10,
        center: location
    });

    // Tambahkan marker agar lebih jelas
    var marker = new google.maps.Marker({ position: location, map: map });
}

// Tambahkan script Google Maps secara dinamis
const script = document.createElement("script");
script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
script.async = true;
script.defer = true;
document.head.appendChild(script);

// Pastikan initMap tersedia di window
window.initMap = initMap;