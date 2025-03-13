require('dotenv').config();
const axios = require('axios');
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// 🔹 Ambil Semua Wisata di Indonesia
const getAllWisata = async (request, h) => {
    try {
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=wisata+di+Indonesia&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await axios.get(url);

        const wisataList = response.data.results.map(wisata => ({
            id: wisata.place_id,
            name: wisata.name,
            category: wisata.types?.[0] || "Unknown",
            description: wisata.formatted_address,
            rating: wisata.rating || "No Rating",
            latitude: wisata.geometry.location.lat,
            longitude: wisata.geometry.location.lng
        }));

        return h.response(wisataList);
    } catch (error) {
        return h.response({ message: "Gagal mengambil data wisata", error: error.message }).code(500);
    }
};

// 🔹 Ambil Detail Wisata Berdasarkan ID
const getWisataById = async (request, h) => {
    try {
        const wisataId = request.params.id;
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${wisataId}&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await axios.get(url);

        if (!response.data.result) {
            return h.response({ message: "Wisata tidak ditemukan" }).code(404);
        }

        const wisata = response.data.result;

        return h.response({
            id: wisata.place_id,
            name: wisata.name,
            category: wisata.types?.[0] || "Unknown",
            description: wisata.formatted_address,
            rating: wisata.rating || "No Rating",
            latitude: wisata.geometry.location.lat,
            longitude: wisata.geometry.location.lng,
            reviews: wisata.reviews || []
        });
    } catch (error) {
        return h.response({ message: "Gagal mengambil detail wisata", error: error.message }).code(500);
    }
};

// 🔹 Cari Wisata Berdasarkan Nama
const searchWisata = async (request, h) => {
    try {
        const query = request.query.query;
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}+di+Indonesia&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await axios.get(url);

        const wisataList = response.data.results.map(wisata => ({
            id: wisata.place_id,
            name: wisata.name,
            category: wisata.types?.[0] || "Unknown",
            description: wisata.formatted_address,
            rating: wisata.rating || "No Rating",
            latitude: wisata.geometry.location.lat,
            longitude: wisata.geometry.location.lng
        }));

        return h.response(wisataList);
    } catch (error) {
        return h.response({ message: "Gagal mencari wisata", error: error.message }).code(500);
    }
};

module.exports = { getAllWisata, getWisataById, searchWisata };
