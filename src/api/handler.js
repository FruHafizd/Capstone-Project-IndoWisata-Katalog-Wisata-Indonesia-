require('dotenv').config();
const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 3600 }); // Cache 1 jam
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const PLACES_API_URL = "https://places.googleapis.com/v1/places:searchText";

// Helper untuk headers API
const getHeaders = (fields) => ({
  'Content-Type': 'application/json',
  'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
  'X-Goog-FieldMask': fields.join(',')
});

// Helper untuk mendapatkan URL foto
const getPhotoUrl = async (photoName) => {
  try {
    const response = await axios.get(
      `https://places.googleapis.com/v1/${photoName}/media`,
      {
        params: {
          maxWidthPx: 800,
          key: GOOGLE_MAPS_API_KEY
        },
        maxRedirects: 0 // Penting untuk handle redirect
      }
    );
  } catch (error) {
    if (error.response?.status === 302) {
      return error.response.headers.location;
    }
    console.error('Error mengambil foto:', error.message);
    return null;
  }
};

// Fungsi format wisata dengan gambar
const formatWisata = async (wisata) => {
  let imageUrl = null;
  
  if (wisata.photos && wisata.photos.length > 0) {
    try {
      imageUrl = await getPhotoUrl(wisata.photos[0].name);
    } catch (error) {
      console.error('Gagal mengambil gambar:', error);
    }
  }
  
  return {
    id: wisata.id,
    name: wisata.displayName?.text || "Nama tidak tersedia",
    category: wisata.types?.[0]?.replace(/_/g, ' ') || "Wisata Umum",
    address: wisata.formattedAddress || "Alamat tidak tersedia",
    rating: wisata.rating ? wisata.rating.toFixed(1) : "Belum ada rating",
    location: wisata.location ? {
      lat: wisata.location.latitude,
      lng: wisata.location.longitude
    } : null,
    imageUrl: imageUrl
  };
};

// Fungsi umum untuk fetch data dengan pagination
const fetchAllPlaces = async (params) => {
  let allPlaces = [];
  let nextPageToken = null;
  
  do {
    const response = await axios.post(
      PLACES_API_URL,
      {
        ...params,
        pageToken: nextPageToken,
        maxResultCount: 100
      },
      {
        headers: getHeaders([
          'places.id',
          'places.displayName',
          'places.types',
          'places.formattedAddress',
          'places.rating',
          'places.location',
          'places.photos',
          'nextPageToken'
        ])
      }
    );

    allPlaces = [...allPlaces, ...response.data.places];
    nextPageToken = response.data.nextPageToken;

    if(nextPageToken) await new Promise(resolve => setTimeout(resolve, 2000));
    
  } while(nextPageToken);

  return allPlaces;
};

// Ambil Semua Wisata di Indonesia 
const getAllWisata = async (request, h) => {
  try {
    const { page = 1, pageSize = 10 } = request.query;
    const cacheKey = 'all_wisata';
    let wisataList = cache.get(cacheKey);

    if (!wisataList) {
      console.log('Fetching data dari Google API...');
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const allPlaces = await fetchAllPlaces({
        textQuery: "tempat wisata di Indonesia",
        includedType: "tourist_attraction",
        languageCode: "id"
      });

      clearTimeout(timeout);
      
      if (!allPlaces.length) {
        return h.response({ message: "Tidak ada data wisata" }).code(404);
      }

      // Proses semua tempat dengan Promise.all
      wisataList = await Promise.all(
        allPlaces.map(async (place) => await formatWisata(place))
      );
      
      cache.set(cacheKey, wisataList);
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    const paginatedData = wisataList.slice(startIndex, endIndex);

    return h.response({
      status: 'success',
      data: paginatedData,
      meta: {
        currentPage: Number(page),
        pageSize: Number(pageSize),
        totalItems: wisataList.length,
        totalPages: Math.ceil(wisataList.length / pageSize)
      }
    }).code(200);

  } catch (error) {
    console.error("Error getAllWisata:", error.message);
    
    if (error.name === 'AbortError') {
      return h.response({ 
        status: 'error',
        message: "Fetch data timeout (max 30 detik)"
      }).code(408);
    }
    
    return h.response({ 
      status: 'error',
      message: "Gagal mengambil data wisata",
      detail: error.response?.data?.error?.message || "Internal Server Error"
    }).code(500);
  }
};

// Cari Wisata 
const searchWisata = async (request, h) => {
  try {
    const query = (request.query.query || "wisata").substring(0, 100);
    const cacheKey = `search_${query}`;
    const cachedData = cache.get(cacheKey);
    
    if(cachedData) return h.response(cachedData).code(200);

    const allPlaces = await fetchAllPlaces({
      textQuery: `${query} di Indonesia`,
      includedType: "tourist_attraction",
      languageCode: "id"
    });

    if(!allPlaces.length) {
      return h.response({ message: "Hasil pencarian tidak ditemukan" }).code(404);
    }

    const wisataList = await Promise.all(
      allPlaces.map(async (place) => await formatWisata(place))
    );
    
    cache.set(cacheKey, wisataList);
    
    return h.response(wisataList).code(200);

  } catch (error) {
    console.error("Error searchWisata:", error.response?.data || error.message);
    return h.response({ 
      message: "Gagal melakukan pencarian",
      detail: error.response?.data?.error?.message || "Internal Server Error"
    }).code(500);
  }
};

// Ambil Detail Wisata 
const getWisataById = async (request, h) => {
  try {
    const wisataId = request.params.id;
    const cacheKey = `detail_${wisataId}`;
    const cachedData = cache.get(cacheKey);
    
    if(cachedData) return h.response(cachedData).code(200);

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
          'reviews',
          'regularOpeningHours',
          'photos'
        ])
      }
    );

    const wisata = response.data;
    const formattedData = {
      ...(await formatWisata(wisata)),
      openingHours: wisata.regularOpeningHours?.weekdayDescriptions || [],
      reviews: wisata.reviews?.map(review => ({
        text: review.text?.text || "Tidak ada ulasan",
        rating: review.rating,
        author: review.authorAttribution?.displayName || "Anonim",
        timestamp: review.publishTime
      })) || []
    };

    cache.set(cacheKey, formattedData);
    return h.response(formattedData).code(200);

  } catch (error) {
    console.error("Error getWisataById:", error.response?.data || error.message);
    return h.response({ 
      message: "Gagal mengambil detail wisata",
      detail: error.response?.data?.error?.message || "Internal Server Error"
    }).code(500);
  }
};

module.exports = { getAllWisata, getWisataById, searchWisata };