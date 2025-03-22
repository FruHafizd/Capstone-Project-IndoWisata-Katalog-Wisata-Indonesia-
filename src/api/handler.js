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

// Helper untuk menentukan kategori berdasarkan types
const determineCategory = (types) => {
  const categoryMapping = {
    ALAM: ['natural_feature', 'park', 'beach', 'hiking_area', 'campground', 'forest', 'mountain', 'hill', 'geographical_feature'],
    SEJARAH: ['museum', 'art_gallery', 'historical_landmark', 'monument', 'archaeological_site', 'history_museum'],
    KELUARGA: ['amusement_park', 'zoo', 'aquarium', 'theme_park', 'water_park', 'family_entertainment_center'],
    KULINER: ['restaurant', 'cafe', 'food', 'bakery', 'meal_takeaway', 'meal_delivery', 'bar', 'bistro'],
    LAINNYA: ['tourist_attraction', 'point_of_interest', 'establishment', 'place_of_worship', 'other']
  };

  // Urutan pengecekan: KELUARGA → ALAM → SEJARAH → KULINER → LAINNYA
  const categoryOrder = ['KELUARGA', 'ALAM', 'SEJARAH', 'KULINER', 'LAINNYA'];

  for (const category of categoryOrder) {
    if (types.some(type => categoryMapping[category].includes(type))) {
      return category;
    }
  }
  return 'LAINNYA';
};

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
  const types = Array.isArray(wisata.types) ? wisata.types : [];
  
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
    category: determineCategory(types), // Gunakan fungsi pemetaan kategori
    address: wisata.formattedAddress || "Alamat tidak tersedia",
    rating: wisata.rating ? wisata.rating.toFixed(1) : "Belum ada rating",
    location: wisata.location ? {
      lat: wisata.location.latitude,
      lng: wisata.location.longitude
    } : null,
    imageUrl: imageUrl,
    region: wisata.region || null
  };
};

// Definisi region-region di Indonesia dengan nama provinsi untuk query
const indonesiaRegions = [
  { name: "Sumatera", provinces: ["Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", "Jambi", "Bengkulu", "Sumatera Selatan", "Lampung", "Bangka Belitung"] },
  { name: "Jawa", provinces: ["DKI Jakarta", "Jawa Barat", "Banten", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur"] },
  { name: "Kalimantan", provinces: ["Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara"] },
  { name: "Sulawesi", provinces: ["Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara"] },
  { name: "Bali dan Nusa Tenggara", provinces: ["Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur"] },
  { name: "Maluku dan Papua", provinces: ["Maluku", "Maluku Utara", "Papua", "Papua Barat", "Papua Selatan", "Papua Tengah", "Papua Pegunungan"] }
];

// Helper untuk mengacak array (Fisher-Yates shuffle)
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Fungsi untuk fetch data berdasarkan query per provinsi
const fetchPlacesByProvince = async (baseQuery, province, includedType = "tourist_attraction") => {
  const query = `${baseQuery} di ${province} Indonesia`;
  try {
    const response = await axios.post(
      PLACES_API_URL,
      {
        textQuery: query,
        includedType: includedType,
        languageCode: "id",
        maxResultCount: 10 // Batasi per provinsi
      },
      {
        headers: getHeaders([
          'places.id',
          'places.displayName',
          'places.types',
          'places.formattedAddress',
          'places.rating',
          'places.location',
          'places.photos'
        ])
      }
    );

    const places = response.data.places || [];
    return places.map(place => ({
      ...place,
      region: province // Tambah info provinsi
    }));
  } catch (error) {
    console.error(`Error fetchPlacesByProvince untuk ${province}:`, error.message);
    return [];
  }
};

// Fungsi untuk mengambil data dari semua region Indonesia
const fetchDataFromAllRegions = async (baseQuery, includedType = "tourist_attraction", maxPerRegion = 5) => {
  // Buat array promise untuk semua provinsi
  const promises = [];
  const allProvinces = [];
  
  // Kumpulkan semua provinsi
  indonesiaRegions.forEach(region => {
    region.provinces.forEach(province => {
      allProvinces.push({ province, region: region.name });
    });
  });
  
  // Acak urutan provinsi untuk menghindari bias urutan
  const shuffledProvinces = shuffleArray(allProvinces);
  
  // Ambil subset dari provinsi untuk mengurangi jumlah request
  const selectedProvinces = shuffledProvinces.slice(0, 10); // Batasi menjadi 10 provinsi saja
  
  // Buat promise untuk setiap provinsi yang dipilih
  selectedProvinces.forEach(({ province, region }) => {
    promises.push(
      fetchPlacesByProvince(baseQuery, province, includedType)
        .then(places => places.map(place => ({ ...place, region })))
    );
  });
  
  // Jalankan semua promise secara paralel
  const results = await Promise.allSettled(promises);
  
  // Kumpulkan hasil
  let allPlaces = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.length > 0) {
      allPlaces = [...allPlaces, ...result.value];
    }
  });
  
  // Deduplikasi hasil
  const uniquePlaces = removeDuplicates(allPlaces);
  
  return uniquePlaces;
};

// Helper untuk menghapus duplikat berdasarkan ID
function removeDuplicates(places) {
  const uniqueMap = new Map();
  places.forEach(place => {
    if (!uniqueMap.has(place.id)) {
      uniqueMap.set(place.id, place);
    }
  });
  return Array.from(uniqueMap.values());
}

// Ambil Semua Wisata di Indonesia 
const getAllWisata = async (request, h) => {
  try {
    const { page = 1, pageSize = 10 } = request.query;
    const cacheKey = 'all_wisata';
    let wisataList = cache.get(cacheKey);

    if (!wisataList) {
      console.log('Fetching data wisata dari berbagai provinsi di Indonesia...');
      
      const allPlaces = await fetchDataFromAllRegions("tempat wisata di indonesia");
      
      if (!allPlaces.length) {
        return h.response({ message: "Tidak ada data wisata" }).code(404);
      }

      // Proses semua tempat dengan Promise.all
      wisataList = await Promise.all(
        allPlaces.map(async (place) => await formatWisata(place))
      );
      
      // Acak urutan untuk menghindari bias
      wisataList = shuffleArray(wisataList);
      
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

const getTopWisata = async (request, h) => {
  try {
    const cacheKey = 'top_wisata';
    let topWisataList = cache.get(cacheKey);

    // Jika cache kosong, fetch data baru
    if (!topWisataList) {
      console.log('Fetching data untuk top wisata dari provinsi-provinsi...');
      
      // Ambil data wisata populer dari berbagai provinsi
      const allPlaces = await fetchDataFromAllRegions("tempat wisata populer di indonesia", "tourist_attraction", 3);
      
      if (!allPlaces.length) {
        return h.response({ message: "Tidak ada data top wisata" }).code(404);
      }
      
      // Format semua tempat
      const allFormatted = await Promise.all(
        allPlaces.map(async (place) => await formatWisata(place))
      );

      // Filter hanya yang memiliki rating numerik
      const validRatings = allFormatted.filter(w => {
        const num = parseFloat(w.rating);
        return !isNaN(num) && num > 0;
      });

      // Sort berdasarkan rating
      validRatings.sort((a, b) => {
        return parseFloat(b.rating) - parseFloat(a.rating);
      });
      
      // Ambil maksimal 10 teratas
      topWisataList = validRatings.slice(0, 3);
      
      cache.set(cacheKey, topWisataList);
    }

    return h.response({
      status: 'success',
      data: topWisataList
    }).code(200);

  } catch (error) {
    console.error("Error getTopWisata:", error);
    return h.response({ 
      status: 'error',
      message: "Gagal mengambil top wisata",
      detail: error.message
    }).code(500);
  }
};

module.exports = { getAllWisata, getWisataById, searchWisata, getTopWisata };