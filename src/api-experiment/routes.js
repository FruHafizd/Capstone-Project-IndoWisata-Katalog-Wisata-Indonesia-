const PlacesHandler = require('./handlers/places');
const PlacesService = require('./services/places');
const CategoriesHandler = require('./handlers/categories');
const CategoriesService = require('./services/categories');
const UsersHandler = require('./handlers/users');
const UsersService = require('./services/users');



// Inisialisasi service dan handler
const placesService = new PlacesService();
const placesHandler = new PlacesHandler(placesService);
const categoriesService = new CategoriesService();
const categoriesHandler = new CategoriesHandler(categoriesService);
const usersService = new UsersService();
const usersHandler = new UsersHandler(usersService);

const wisataRoutes = [
  // Routes for Wisata
  {
    method: 'POST',
    path: '/api/wisata',
    handler: placesHandler.addPlaceHandler,
  },
  {
    method: 'GET',
    path: '/api/wisata',
    handler: placesHandler.getAllPlacesHandler,
  },
  {
    method: 'GET',
    path: '/api/wisata/{id}',
    handler: placesHandler.getOnePlaceHandler,
  },
  {
    method: 'PUT',
    path: '/api/wisata/{id}',
    handler: placesHandler.updatePlaceHandler,
  },
  {
    method: 'DELETE',
    path: '/api/wisata/{id}',
    handler: placesHandler.deletePlaceHandler,
  },

  // Routes for Category
  {
    method: 'POST',
    path: '/api/categories',
    handler: categoriesHandler.addCategoryHandler,
  },
  {
    method: 'GET',
    path: '/api/categories',
    handler: categoriesHandler.getAllCategoriesHandler,
  },
  {
    method: 'GET',
    path: '/api/categories/{id}',
    handler: categoriesHandler.getOneCategoryHandler,
  },
  {
    method: 'PUT',
    path: '/api/categories/{id}',
    handler: categoriesHandler.updateCategoryHandler,
  },
  {
    method: 'DELETE',
    path: '/api/categories/{id}',
    handler: categoriesHandler.deleteCategoryHandler,
  },

  // Route For Users
  {
    method: 'POST',
    path: '/api/users',
    handler: usersHandler.addUserHandler,
  },
  {
    method: 'GET',
    path: '/api/users',
    handler: usersHandler.getAllUsersHandler,
  },
  {
    method: 'GET',
    path: '/api/users/{id}',
    handler: usersHandler.getUserByIdHandler,
  },
  {
    method: 'PUT',
    path: '/api/users/{id}',
    handler: usersHandler.updateUserHandler,
  },
  {
    method: 'DELETE',
    path: '/api/users/{id}',
    handler: usersHandler.deleteUserHandler,
  },
  
];

module.exports = wisataRoutes;
