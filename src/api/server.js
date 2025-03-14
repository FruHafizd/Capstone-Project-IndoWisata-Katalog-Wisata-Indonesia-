require('dotenv').config();
const Hapi = require('@hapi/hapi');
const wisataRoutes = require('./routes');

const server = Hapi.server({
    port: 3000,
    host: 'localhost'
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

console.log('Daftar route yang tersedia:');
server.table().forEach(route => console.log(`${route.method.toUpperCase()} ${route.path}`));

start();
