require('dotenv').config();
const Hapi = require('@hapi/hapi');
const wisataRoutes = require('./routes');

const server = Hapi.server({
    port: 3000,
    host: 'localhost'
});

server.ext('onPreResponse', (request, h) => {
  const response = request.response;
  if (response.isBoom) {
    response.output.headers['Access-Control-Allow-Origin'] = '*';
  }
  else {
    response.headers['Access-Control-Allow-Origin'] = '*';
  }
  return h.continue;
});

server.route(wisataRoutes);

const start = async () => {
    try {
        await server.start();
        console.log(`✅ Server berjalan di ${server.info.uri}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();