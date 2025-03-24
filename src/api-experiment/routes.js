const PlacesHandler = require('./handlers/places');
const PlacesService = require('./services/places');

// Inisialisasi service dan handler
const placesService = new PlacesService();
const placesHandler = new PlacesHandler(placesService);

const wisataRoutes = [
  // Routes for Wisata
  // Create
  {
    method: 'POST',
    path: '/api/wisata',
    handler: placesHandler.addPlaceHandler,
  },
  // Get All
  {
    method: 'GET',
    path: '/api/wisata',
    handler: placesHandler.getAllPlacesHandler,
  },
  // Get By ID
  {
    method: 'GET',
    path: '/api/wisata/{id}',
    handler: placesHandler.getOnePlaceHandler,
  },
  // Update
  {
    method: 'PUT',
    path: '/api/wisata/{id}',
    handler: placesHandler.updatePlaceHandler,
  },
  // Delete
  {
    method: 'DELETE',
    path: '/api/wisata/{id}',
    handler: placesHandler.deletePlaceHandler,
  },

  // Routes for Category

];

module.exports = wisataRoutes;
