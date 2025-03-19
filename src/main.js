function initMap() {
    var location = { lat: -6.125274699999999, lng: 106.83355689999999 };
    var map = new google.maps.Map(document.getElementById("map"), {
      zoom: 10,
      center: location
    });
    // var marker = new google.maps.Marker({ position: location, map: map });
}