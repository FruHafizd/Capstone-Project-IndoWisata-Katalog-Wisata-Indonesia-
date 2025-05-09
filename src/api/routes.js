const Joi = require('joi');
const bcrypt = require("bcrypt");
const { UserPayloadSchema } = require('../utils/validators/users');
const PlacesHandler = require('./handlers/places');
const PlacesService = require('./services/places');
const CategoriesHandler = require('./handlers/categories');
const CategoriesService = require('./services/categories');
const UsersHandler = require('./handlers/users');
const UsersService = require('./services/users');
const LoginHandler = require('./handlers/loginHandler');
const UserVisitsHandler = require("./handlers/user-visits");
const UserVisitsService = require("./services/user-visits");

// Inisialisasi service dan handler
const placesService = new PlacesService();
const placesHandler = new PlacesHandler(placesService);
const categoriesService = new CategoriesService();
const categoriesHandler = new CategoriesHandler(categoriesService);
const usersService = new UsersService();
const usersHandler = new UsersHandler(usersService);
const loginHandler = new LoginHandler(usersService);
const userVisitsService = new UserVisitsService();
const userVisitsHandler = new UserVisitsHandler(userVisitsService);

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
  {
    method: 'GET',
    path: '/api/wisata/search',
    handler: placesHandler.searchWisata,
  },
  {
    method: 'GET',
    path: '/api/wisata/top',
    handler: placesHandler.getTopWisata,
    options: {
      description: 'Get top 3 wisata berdasarkan rating',
    },
  },
  {
    method: 'GET',
    path: '/api/wisata/categories/{category}',
    handler: placesHandler.getWisataByCategory,
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
    options: {
      validate: {
        payload: UserPayloadSchema
      }
    }
  },
  {
    method: 'GET',
    path: '/api/users',
    handler: usersHandler.getAllUsersHandler
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
  {
    method: 'POST',
    path: '/api/login',
    handler: loginHandler.loginHandler,
  },
  

  // Route for User Visits
  {
    method: "POST",
    path: "/api/updateUserVisit",
    handler: userVisitsHandler.updateUserVisitHandler,
  },
  {
    method: "GET",
    path: "/api/userVisits",
    handler: userVisitsHandler.getAggregatedUserVisitsHandler,
  },
  {
    method: 'PUT',
    path: '/api/users/{id}/password',
    handler: usersHandler.updatePasswordHandler,
  },
  // reset password
  { 
    method: 'POST', 
    path: '/api/users/request-reset', 
    handler: usersHandler.requestResetHandler,
  },
  { 
    method: 'POST', 
    path: '/api/users/verify-token', 
    handler: usersHandler.verifyTokenHandler,
  },
  { 
    method: 'POST', 
    path: '/api/users/reset-password', 
    handler: usersHandler.resetPasswordHandler,
  }
];

module.exports = wisataRoutes;
