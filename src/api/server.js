const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const PlacesService = require('./services/places');
const PlacesHandler = require('./handlers/places');
require('dotenv').config();

const init = async () => {
  const server = Hapi.server({
    host: 'localhost',
    port: 3000,
    routes: {
      cors: {
        origin: ['*']
      }
    }
  });

  // Inisialisasi service dan handler
  const placesService = new PlacesService();
  const placesHandler = new PlacesHandler(placesService);

  // Registrasi routes
  server.route(routes);

  await server.start();
  console.log(`Server berjalan di: ${server.info.uri}`);
};

init();