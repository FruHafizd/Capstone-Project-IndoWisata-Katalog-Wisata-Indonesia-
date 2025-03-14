// handler.js
require('dotenv').config();
const axios = require('axios');

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const PLACES_API_URL = "https://places.googleapis.com/v1/places:searchText";

// 🔹 Helper untuk headers API
const getHeaders = (fields) => ({
  'Content-Type': 'application/json',
  'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
  'X-Goog-FieldMask': fields.join(',')
});

// 🔹 Ambil Semua Wisata di Indonesia (Diperbaiki)
const getAllWisata = async (request, h) => {
  try {
    const response = await axios.post(
      PLACES_API_URL,
      {
        textQuery: "tempat wisata di Indonesia",
        includedType: "tourist_attraction", // ✅ Gunakan singular
        languageCode: "id",
        maxResultCount: 20
      },
      {
        headers: getHeaders([
          'places.id',
          'places.displayName',
          'places.types',
          'places.formattedAddress',
          'places.rating',
          'places.location'
        ])
      }
    );

    if (!response.data?.places?.length) {
      return h.response({ message: "Tidak ada data wisata" }).code(404);
    }

    const wisataList = response.data.places.map(wisata => ({
      id: wisata.id,
      name: wisata.displayName?.text || "Nama tidak tersedia",
      category: wisata.types?.[0]?.replace(/_/g, ' ') || "Wisata Umum",
      address: wisata.formattedAddress || "Alamat tidak tersedia",
      rating: wisata.rating ? wisata.rating.toFixed(1) : "Belum ada rating",
      location: wisata.location ? {
        lat: wisata.location.latitude,
        lng: wisata.location.longitude
      } : null
    }));

    return h.response(wisataList).code(200);
    
  } catch (error) {
    console.error("Error getAllWisata:", error.response?.data || error.message);
    return h.response({ 
      message: "Gagal mengambil data wisata",
      error: error.response?.data?.error || error.message 
    }).code(500);
  }
};

// 🔹 Cari Wisata (Diperbaiki)
const searchWisata = async (request, h) => {
  try {
    const query = request.query.query || "wisata";
    const response = await axios.post(
      PLACES_API_URL,
      {
        textQuery: `${query} di Indonesia`,
        includedType: "tourist_attraction", // ✅ Gunakan singular
        languageCode: "id",
        maxResultCount: 20
      },
      {
        headers: getHeaders([
          'places.id',
          'places.displayName',
          'places.types',
          'places.formattedAddress',
          'places.rating',
          'places.location'
        ])
      }
    );

    if (!response.data?.places?.length) {
      return h.response({ message: "Hasil pencarian tidak ditemukan" }).code(404);
    }

    const wisataList = response.data.places.map(wisata => ({
      id: wisata.id,
      name: wisata.displayName?.text || "Nama tidak tersedia",
      category: wisata.types?.[0]?.replace(/_/g, ' ') || "Wisata Umum",
      address: wisata.formattedAddress || "Alamat tidak tersedia",
      rating: wisata.rating ? wisata.rating.toFixed(1) : "Belum ada rating",
      location: wisata.location ? {
        lat: wisata.location.latitude,
        lng: wisata.location.longitude
      } : null
    }));

    return h.response(wisataList).code(200);

  } catch (error) {
    console.error("Error searchWisata:", error.response?.data || error.message);
    return h.response({ 
      message: "Gagal melakukan pencarian",
      error: error.response?.data?.error || error.message 
    }).code(500);
  }
};

// 🔹 Ambil Detail Wisata (Diperbaiki)
const getWisataById = async (request, h) => {
  try {
    const wisataId = request.params.id;
    const response = await axios.get(
      `https://places.googleapis.com/v1/places/${wisataId}`,
      {
        headers: getHeaders([
          'id',
          'displayName',
          'types',
          'formattedAddress',
          'rating',
          'location',
          'reviews'
        ])
      }
    );

    const wisata = response.data;
    return h.response({
      id: wisata.id,
      name: wisata.displayName?.text || "Nama tidak tersedia",
      category: wisata.types?.[0]?.replace(/_/g, ' ') || "Wisata Umum",
      address: wisata.formattedAddress || "Alamat tidak tersedia",
      rating: wisata.rating ? wisata.rating.toFixed(1) : "Belum ada rating",
      location: wisata.location ? {
        lat: wisata.location.latitude,
        lng: wisata.location.longitude
      } : null,
      reviews: wisata.reviews?.map(review => ({
        text: review.text?.text || "Tidak ada ulasan",
        rating: review.rating,
        author: review.authorAttribution?.displayName || "Anonim"
      })) || []
    }).code(200);

  } catch (error) {
    console.error("Error getWisataById:", error.response?.data || error.message);
    return h.response({ 
      message: "Gagal mengambil detail wisata",
      error: error.response?.data?.error || error.message 
    }).code(500);
  }
};

module.exports = { getAllWisata, getWisataById, searchWisata };