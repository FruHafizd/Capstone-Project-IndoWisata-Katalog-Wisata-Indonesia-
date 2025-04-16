const Hapi = require('@hapi/hapi');
const routes = require('./routes');
require('dotenv').config();

const init = async () => {
  const server = Hapi.server({
    host: '0.0.0.0',
    port: 3000,
    routes: {
      cors: {
        origin: ['*']
      }
    }
  });

  // Registrasi routes
  server.route(routes);

  await server.start();
  console.log(`Server berjalan di: ${server.info.uri}`);
};

init();