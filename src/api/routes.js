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
    },
    {
        method: 'GET',
        path: '/api/wisata/top',
        handler: wisataHandler.getTopWisata,
        options: {
          description: 'Get top 3 wisata berdasarkan rating'
        }
    },
    {
        method: 'GET',
        path: '/wisata/category/{category}',
        handler: wisataHandler.getWisataByCategory
    }
];

module.exports = wisataRoutes;