const wisataHandler = require('./handler');

const wisataRoutes = [
    {
        method: 'GET',
        path: '/api/wisata',
        handler: wisataHandler.getAllWisata
    },
    {
        method: 'GET',
        path: '/api/wisata/{id}',
        handler: wisataHandler.getWisataById
    },
    {
        method: 'GET',
        path: '/api/wisata/search',
        handler: wisataHandler.searchWisata
    }
];

module.exports = wisataRoutes;
