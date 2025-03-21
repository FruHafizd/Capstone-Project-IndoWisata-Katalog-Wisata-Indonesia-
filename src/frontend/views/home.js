import config from './config.js';

API_KEY = config;
function initMap() {
    var location = { lat: -6.1252747, lng: 106.8335569 };
    var map = new google.maps.Map(document.getElementById("map"), {
        zoom: 10,
        center: location
    });
}

