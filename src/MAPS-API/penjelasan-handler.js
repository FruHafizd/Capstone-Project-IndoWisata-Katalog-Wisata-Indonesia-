// Memuat variabel lingkungan dari file .env
require('dotenv').config();

// Mengimpor modul axios untuk melakukan HTTP request ke API
const axios = require('axios');

// Mengimpor modul node-cache untuk melakukan caching data
const NodeCache = require('node-cache');

// Menginisialisasi cache dengan waktu hidup standar (TTL) 3600 detik (1 jam)
const cache = new NodeCache({ stdTTL: 3600 });

// Mengambil API Key Google Maps dari variabel lingkungan
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// URL endpoint untuk melakukan pencarian tempat dengan Google Places API
const PLACES_API_URL = "https://places.googleapis.com/v1/places:searchText";

// ---------------------------
// Helper untuk membuat headers yang diperlukan oleh API
// ---------------------------
const getHeaders = (fields) => ({
  'Content-Type': 'application/json',             // Tipe konten yang dikirimkan adalah JSON
  'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,            // API Key untuk autentikasi ke Google API
  'X-Goog-FieldMask': fields.join(',')              // Mask untuk menentukan field apa saja yang akan dikembalikan
});

// ---------------------------
// Fungsi untuk melakukan fetch data dari API dengan mekanisme pagination
// ---------------------------
const fetchAllPlaces = async (params) => {
  let allPlaces = [];       // Array untuk menampung semua data tempat yang didapatkan
  let nextPageToken = null; // Token untuk pagination, jika tersedia
  
  // Lakukan perulangan selama ada token untuk halaman selanjutnya
  do {
    // Melakukan POST request ke PLACES_API_URL dengan parameter tambahan:
    // - pageToken: token untuk halaman selanjutnya
    // - maxResultCount: batas maksimum jumlah hasil per request (100)
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

    // Menggabungkan data tempat yang didapat ke array allPlaces
    allPlaces = [...allPlaces, ...response.data.places];
    // Mendapatkan token untuk halaman selanjutnya
    nextPageToken = response.data.nextPageToken;

    // Jika terdapat halaman berikutnya, tunggu selama 2 detik untuk menghindari rate limit
    if(nextPageToken) await new Promise(resolve => setTimeout(resolve, 2000));
    
  } while(nextPageToken);

  return allPlaces; // Mengembalikan semua data tempat yang berhasil didapatkan
};

// ---------------------------
// Helper untuk menentukan kategori wisata berdasarkan jenis-jenis (types)
// ---------------------------
const determineCategory = (types) => {
  // Mapping kategori ke array jenis tempat yang sesuai
  const categoryMapping = {
    ALAM: ['natural_feature', 'park', 'beach', 'hiking_area', 'campground', 'forest', 'mountain', 'hill', 'geographical_feature'],
    SEJARAH: ['museum', 'art_gallery', 'historical_landmark', 'monument', 'archaeological_site', 'history_museum'],
    KELUARGA: ['amusement_park', 'zoo', 'aquarium', 'theme_park', 'water_park', 'family_entertainment_center'],
    KULINER: ['restaurant', 'cafe', 'food', 'bakery', 'meal_takeaway', 'meal_delivery', 'bar', 'bistro'],
    LAINNYA: ['tourist_attraction', 'point_of_interest', 'establishment', 'place_of_worship', 'other']
  };

  // Urutan pengecekan kategori, dimulai dari kategori KELUARGA hingga LAINNYA
  const categoryOrder = ['KELUARGA', 'ALAM', 'SEJARAH', 'KULINER', 'LAINNYA'];

  // Periksa setiap kategori berdasarkan urutan, jika salah satu type sesuai dengan mapping kategori maka kembalikan kategori tersebut
  for (const category of categoryOrder) {
    if (types.some(type => categoryMapping[category].includes(type))) {
      return category;
    }
  }
  // Jika tidak ada yang cocok, kembalikan 'LAINNYA'
  return 'LAINNYA';
};

// ---------------------------
// Helper untuk mendapatkan URL foto dari Google Places API
// ---------------------------
const getPhotoUrl = async (photoName) => {
  try {
    // Melakukan GET request untuk mengambil URL foto berdasarkan nama foto yang diberikan
    const response = await axios.get(
      `https://places.googleapis.com/v1/${photoName}/media`,
      {
        params: {
          maxWidthPx: 800,               // Batas lebar maksimum foto
          key: GOOGLE_MAPS_API_KEY       // Sertakan API Key
        },
        maxRedirects: 0                  // Atur untuk tidak mengikuti redirect, karena kita ingin menangani redirect secara manual
      }
    );
  } catch (error) {
    // Jika terjadi error dengan status 302 (redirect), kembalikan lokasi URL dari header response
    if (error.response?.status === 302) {
      return error.response.headers.location;
    }
    // Log error lainnya dan kembalikan null
    console.error('Error mengambil foto:', error.message);
    return null;
  }
};

// ---------------------------
// Fungsi untuk memformat data wisata menjadi objek yang lebih mudah dipakai
// ---------------------------
const formatWisata = async (wisata) => {
  let imageUrl = null;
  // Pastikan properti types adalah array, jika tidak, gunakan array kosong
  const types = Array.isArray(wisata.types) ? wisata.types : [];
  
  // Jika terdapat foto pada data wisata
  if (wisata.photos && wisata.photos.length > 0) {
    try {
      // Ambil URL foto dari foto pertama yang tersedia
      imageUrl = await getPhotoUrl(wisata.photos[0].name);
    } catch (error) {
      console.error('Gagal mengambil gambar:', error);
    }
  }
  
  // Kembalikan objek wisata yang sudah diformat
  return {
    id: wisata.id,
    name: wisata.displayName?.text || "Nama tidak tersedia",
    category: determineCategory(types),      // Menentukan kategori berdasarkan types
    address: wisata.formattedAddress || "Alamat tidak tersedia",
    rating: wisata.rating ? wisata.rating.toFixed(1) : "Belum ada rating",
    location: wisata.location ? {               // Format lokasi menjadi objek dengan properti lat dan lng
      lat: wisata.location.latitude,
      lng: wisata.location.longitude
    } : null,
    imageUrl: imageUrl,                         // URL foto yang didapatkan, jika ada
    region: wisata.region || null               // Menambahkan info region (provinsi) jika tersedia
  };
};

// ---------------------------
// Definisi region-region di Indonesia dengan nama provinsi untuk query
// ---------------------------
const indonesiaRegions = [
  { name: "Sumatera", provinces: ["Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", "Jambi", "Bengkulu", "Sumatera Selatan", "Lampung", "Bangka Belitung"] },
  { name: "Jawa", provinces: ["DKI Jakarta", "Jawa Barat", "Banten", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur"] },
  { name: "Kalimantan", provinces: ["Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara"] },
  { name: "Sulawesi", provinces: ["Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara"] },
  { name: "Bali dan Nusa Tenggara", provinces: ["Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur"] },
  { name: "Maluku dan Papua", provinces: ["Maluku", "Maluku Utara", "Papua", "Papua Barat", "Papua Selatan", "Papua Tengah", "Papua Pegunungan"] }
];

// ---------------------------
// Helper untuk mengacak urutan array menggunakan algoritma Fisher-Yates
// ---------------------------
function shuffleArray(array) {
  const newArray = [...array];  // Salin array asli agar tidak mengubah array aslinya
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));  // Pilih indeks acak antara 0 dan i
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];  // Tukar elemen pada indeks i dan j
  }
  return newArray;
}

// ---------------------------
// Fungsi untuk melakukan fetch data berdasarkan query per provinsi
// ---------------------------
const fetchPlacesByProvince = async (baseQuery, province, includedType = "tourist_attraction") => {
  // Gabungkan query dasar dengan nama provinsi dan Indonesia
  const query = `${baseQuery} di ${province} Indonesia`;
  try {
    // Melakukan POST request ke PLACES_API_URL dengan parameter:
    // textQuery: query yang telah disusun, includedType, languageCode, dan maxResultCount dibatasi 10 per provinsi
    const response = await axios.post(
      PLACES_API_URL,
      {
        textQuery: query,
        includedType: includedType,
        languageCode: "id",
        maxResultCount: 10
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

    // Ambil data tempat dari response, jika tidak ada, gunakan array kosong
    const places = response.data.places || [];
    // Kembalikan array tempat dengan menambahkan properti region (nama provinsi)
    return places.map(place => ({
      ...place,
      region: province
    }));
  } catch (error) {
    // Log error yang terjadi saat mengambil data untuk provinsi tertentu
    console.error(`Error fetchPlacesByProvince untuk ${province}:`, error.message);
    return [];
  }
};

// ---------------------------
// Fungsi untuk mengambil data dari semua region di Indonesia
// ---------------------------
const fetchDataFromAllRegions = async (baseQuery, includedType = "tourist_attraction", maxPerRegion = 5) => {
  // Array promise untuk menjalankan request secara paralel
  const promises = [];
  const allProvinces = [];
  
  // Kumpulkan semua provinsi dari tiap region
  indonesiaRegions.forEach(region => {
    region.provinces.forEach(province => {
      allProvinces.push({ province, region: region.name });
    });
  });
  
  // Acak urutan provinsi untuk menghindari bias urutan
  const shuffledProvinces = shuffleArray(allProvinces);
  
  // Pilih subset provinsi untuk mengurangi jumlah request (misalnya, 10 provinsi)
  const selectedProvinces = shuffledProvinces.slice(0, 10);
  
  // Untuk setiap provinsi yang dipilih, buat promise request ke API
  selectedProvinces.forEach(({ province, region }) => {
    promises.push(
      fetchPlacesByProvince(baseQuery, province, includedType)
        .then(places => places.map(place => ({ ...place, region })))
    );
  });
  
  // Eksekusi semua promise secara paralel dan tunggu hingga selesai
  const results = await Promise.allSettled(promises);
  
  // Kumpulkan semua hasil yang berhasil (fulfilled)
  let allPlaces = [];
  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value.length > 0) {
      allPlaces = [...allPlaces, ...result.value];
    }
  });
  
  // Hapus data duplikat berdasarkan ID
  const uniquePlaces = removeDuplicates(allPlaces);
  
  return uniquePlaces;
};

// ---------------------------
// Helper untuk menghapus duplikat data tempat berdasarkan ID
// ---------------------------
function removeDuplicates(places) {
  const uniqueMap = new Map();
  places.forEach(place => {
    if (!uniqueMap.has(place.id)) {
      uniqueMap.set(place.id, place);
    }
  });
  return Array.from(uniqueMap.values());
}

// ---------------------------
// Fungsi untuk mengambil semua data wisata di Indonesia dengan pagination
// ---------------------------
const getAllWisata = async (request, h) => {
  try {
    // Ambil parameter query untuk pagination, default halaman 1 dan pageSize 10
    const { page = 1, pageSize = 10 } = request.query;
    // Gunakan cache key 'all_wisata'
    const cacheKey = 'all_wisata';
    // Coba ambil data wisata dari cache
    let wisataList = cache.get(cacheKey);

    // Jika data tidak ada di cache, ambil data dari API
    if (!wisataList) {
      console.log('Fetching data wisata dari berbagai provinsi di Indonesia...');
      
      // Memanggil fungsi untuk fetch data dari semua region berdasarkan query dasar
      const allPlaces = await fetchDataFromAllRegions("tempat wisata di indonesia");
      
      // Jika tidak ada data yang didapatkan, kembalikan response 404
      if (!allPlaces.length) {
        return h.response({ message: "Tidak ada data wisata" }).code(404);
      }

      // Format setiap data tempat menggunakan fungsi formatWisata secara paralel dengan Promise.all
      wisataList = await Promise.all(
        allPlaces.map(async (place) => await formatWisata(place))
      );
      
      // Acak urutan data untuk menghindari bias urutan
      wisataList = shuffleArray(wisataList);
      
      // Simpan data yang telah diformat ke cache
      cache.set(cacheKey, wisataList);
    }

    // Lakukan pagination: tentukan indeks awal dan akhir data yang ingin dikembalikan
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    const paginatedData = wisataList.slice(startIndex, endIndex);

    // Kembalikan response dengan status success, data yang dipaginasi, dan meta informasi pagination
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
    // Log error jika terjadi kesalahan saat mengambil data wisata
    console.error("Error getAllWisata:", error.message);
    
    // Jika error karena timeout (AbortError), kembalikan response 408
    if (error.name === 'AbortError') {
      return h.response({ 
        status: 'error',
        message: "Fetch data timeout (max 30 detik)"
      }).code(408);
    }
    
    // Kembalikan response error dengan detail error message
    return h.response({ 
      status: 'error',
      message: "Gagal mengambil data wisata",
      detail: error.response?.data?.error?.message || "Internal Server Error"
    }).code(500);
  }
};

// ---------------------------
// Fungsi untuk melakukan pencarian wisata berdasarkan query yang diberikan
// ---------------------------
const searchWisata = async (request, h) => {
  try {
    // Ambil query dari parameter, default "wisata", dan batasi maksimal 100 karakter
    const query = (request.query.query || "wisata").substring(0, 100);
    const cacheKey = `search_${query}`;
    // Coba ambil data dari cache berdasarkan query
    const cachedData = cache.get(cacheKey);
    
    if(cachedData) return h.response(cachedData).code(200);

    // Jika tidak ada di cache, fetch data menggunakan query dari API
    const allPlaces = await fetchAllPlaces({
      textQuery: `${query} di Indonesia`,
      includedType: "tourist_attraction",
      languageCode: "id"
    });

    // Jika tidak ada hasil, kembalikan response 404
    if(!allPlaces.length) {
      return h.response({ message: "Hasil pencarian tidak ditemukan" }).code(404);
    }

    // Format semua data tempat yang didapat
    const wisataList = await Promise.all(
      allPlaces.map(async (place) => await formatWisata(place))
    );
    
    // Simpan hasil pencarian ke cache
    cache.set(cacheKey, wisataList);
    
    // Kembalikan response dengan data hasil pencarian
    return h.response(wisataList).code(200);

  } catch (error) {
    // Log error dan kembalikan response error dengan detail yang sesuai
    console.error("Error searchWisata:", error.response?.data || error.message);
    return h.response({ 
      message: "Gagal melakukan pencarian",
      detail: error.response?.data?.error?.message || "Internal Server Error"
    }).code(500);
  }
};

// ---------------------------
// Fungsi untuk mengambil detail wisata berdasarkan ID
// ---------------------------
const getWisataById = async (request, h) => {
  try {
    // Ambil wisataId dari parameter URL
    const wisataId = request.params.id;
    const cacheKey = `detail_${wisataId}`;
    // Coba ambil data detail dari cache
    const cachedData = cache.get(cacheKey);
    
    if(cachedData) return h.response(cachedData).code(200);

    // Lakukan GET request ke API untuk mendapatkan detail wisata berdasarkan ID
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
    // Format data detail wisata dan tambahkan info jam buka dan ulasan
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

    // Simpan data detail ke cache
    cache.set(cacheKey, formattedData);
    return h.response(formattedData).code(200);

  } catch (error) {
    // Log error dan kembalikan response error dengan detail yang sesuai
    console.error("Error getWisataById:", error.response?.data || error.message);
    return h.response({ 
      message: "Gagal mengambil detail wisata",
      detail: error.response?.data?.error?.message || "Internal Server Error"
    }).code(500);
  }
};

// ---------------------------
// Fungsi untuk mengambil daftar top wisata
// ---------------------------
const getTopWisata = async (request, h) => {
  try {
    const cacheKey = 'top_wisata';
    // Coba ambil data top wisata dari cache
    let topWisataList = cache.get(cacheKey);

    // Jika tidak ada data di cache, fetch data baru
    if (!topWisataList) {
      console.log('Fetching data untuk top wisata dari provinsi-provinsi...');
      
      // Ambil data wisata populer dari berbagai provinsi,
      // dengan query dasar "tempat wisata populer di indonesia", tipe "tourist_attraction"
      // dan maksimal 3 per request (parameter maxPerRegion)
      const allPlaces = await fetchDataFromAllRegions("tempat wisata populer di indonesia", "tourist_attraction", 3);
      
      // Jika tidak ada data, kembalikan response 404
      if (!allPlaces.length) {
        return h.response({ message: "Tidak ada data top wisata" }).code(404);
      }
      
      // Format semua data tempat yang didapat
      const allFormatted = await Promise.all(
        allPlaces.map(async (place) => await formatWisata(place))
      );

      // Filter data yang memiliki rating numerik valid
      const validRatings = allFormatted.filter(w => {
        const num = parseFloat(w.rating);
        return !isNaN(num) && num > 0;
      });

      // Urutkan data berdasarkan rating secara menurun
      validRatings.sort((a, b) => {
        return parseFloat(b.rating) - parseFloat(a.rating);
      });
      
      // Ambil 3 data teratas
      topWisataList = validRatings.slice(0, 3);
      
      // Simpan hasil top wisata ke cache
      cache.set(cacheKey, topWisataList);
    }

    // Kembalikan response dengan status success dan data top wisata
    return h.response({
      status: 'success',
      data: topWisataList
    }).code(200);

  } catch (error) {
    // Log error dan kembalikan response error dengan detail yang sesuai
    console.error("Error getTopWisata:", error);
    return h.response({ 
      status: 'error',
      message: "Gagal mengambil top wisata",
      detail: error.message
    }).code(500);
  }
};

const getWisataByCategory = async (request, h) => {
  try {
    const { category } = request.params;
    const { page = 1, pageSize = 10 } = request.query;
    
    // Validasi kategori (case insensitive)
    const categoryMapping = {
      ALAM: ['natural_feature', 'park', 'beach', 'hiking_area', 'campground', 'forest', 'mountain', 'hill', 'geographical_feature'],
      SEJARAH: ['museum', 'art_gallery', 'historical_landmark', 'monument', 'archaeological_site', 'history_museum'],
      KELUARGA: ['amusement_park', 'zoo', 'aquarium', 'theme_park', 'water_park', 'family_entertainment_center'],
      KULINER: ['restaurant', 'cafe', 'food', 'bakery', 'meal_takeaway', 'meal_delivery', 'bar', 'bistro'],
      LAINNYA: ['tourist_attraction', 'point_of_interest', 'establishment', 'place_of_worship', 'other']
    };
    
    const validCategories = Object.keys(categoryMapping);
    const normalizedCategory = category.toUpperCase();
    
    if (!validCategories.includes(normalizedCategory)) {
      return h.response({ 
        status: 'error',
        message: `Kategori tidak valid. Gunakan salah satu dari: ${validCategories.join(', ')}`
      }).code(400);
    }
    
    // Key untuk cache berdasarkan kategori
    const cacheKey = `category_${normalizedCategory}`;
    let filteredWisata = cache.get(cacheKey);
    
    if (!filteredWisata) {
      console.log(`Fetching data wisata untuk kategori: ${normalizedCategory}`);
      
      // Gabungkan results dari berbagai sumber
      let combinedResults = [];
      
      // 1. Coba ambil dari cache all_wisata terlebih dahulu
      let allWisata = cache.get('all_wisata');
      if (allWisata && allWisata.length > 0) {
        const fromCache = allWisata.filter(wisata => wisata.category === normalizedCategory);
        combinedResults.push(...fromCache);
        console.log(`Mendapatkan ${fromCache.length} data dari cache all_wisata`);
      }
      
      // 2. Selalu cari data langsung berdasarkan kategori
      // Gunakan semua jenis/tipe dari kategori, tidak hanya 3 pertama
      const categoryTypes = categoryMapping[normalizedCategory];
      
      // Buat query sesuai dengan kategori
      let categoryQuery;
      switch (normalizedCategory) {
        case 'ALAM':
          categoryQuery = "wisata alam pemandangan";
          break;
        case 'SEJARAH':
          categoryQuery = "wisata sejarah museum";
          break;
        case 'KELUARGA':
          categoryQuery = "wisata keluarga taman hiburan";
          break;
        case 'KULINER':
          categoryQuery = "wisata kuliner makanan";
          break;
        default:
          categoryQuery = "tempat wisata populer";
      }
      
      // Fetch data dengan query kategori spesifik
      console.log(`Mencari dengan query: ${categoryQuery}`);
      const categoryPlaces = await fetchDataFromAllRegions(categoryQuery, "tourist_attraction", 10);
      
      if (categoryPlaces.length > 0) {
        const formattedCategoryPlaces = await Promise.all(
          categoryPlaces.map(async (place) => await formatWisata(place))
        );
        
        // Tambahkan hasil yang sesuai kategori yang diminta
        const matchingCategoryPlaces = formattedCategoryPlaces.filter(
          wisata => wisata.category === normalizedCategory
        );
        
        combinedResults.push(...matchingCategoryPlaces);
        console.log(`Mendapatkan ${matchingCategoryPlaces.length} data dari query kategori`);
      }
      
      // 3. Cari dengan tipe-tipe spesifik jika masih kurang data (kurang dari 15)
      if (combinedResults.length < 15) {
        // Gunakan 5 tipe pertama atau semua jika kurang dari 5
        const typesToQuery = categoryTypes.slice(0, Math.min(5, categoryTypes.length));
        
        console.log(`Mencari dengan ${typesToQuery.length} tipe spesifik untuk kategori ${normalizedCategory}`);
        
        // Buat promise untuk setiap tipe
        const typePromises = typesToQuery.map(async (type) => {
          try {
            const places = await fetchDataFromAllRegions(`wisata ${type} di indonesia`, type);
            return places;
          } catch (error) {
            console.error(`Error fetching ${type}:`, error.message);
            return [];
          }
        });
        
        // Jalankan semua promise secara paralel
        const typeResults = await Promise.allSettled(typePromises);
        
        // Kumpulkan dan proses semua hasil
        for (const result of typeResults) {
          if (result.status === 'fulfilled' && result.value.length > 0) {
            const formattedPlaces = await Promise.all(
              result.value.map(async (place) => await formatWisata(place))
            );
            
            // Tambahkan semua hasil, terlepas dari kategori yang terdeteksi
            // Ini untuk memastikan kita mendapatkan data yang cukup
            combinedResults.push(...formattedPlaces);
          }
        }
        
        console.log(`Mendapatkan total ${combinedResults.length} data setelah query tipe spesifik`);
      }
      
      // Deduplikasi hasil berdasarkan ID
      filteredWisata = [];
      const seenIds = new Set();
      
      for (const wisata of combinedResults) {
        if (!seenIds.has(wisata.id)) {
          seenIds.add(wisata.id);
          filteredWisata.push(wisata);
        }
      }
      
      // 4. Sebagai fallback terakhir, jika masih sangat sedikit data, coba search wisata umum
      if (filteredWisata.length < 5) {
        console.log("Data masih sangat sedikit, mencoba pencarian umum...");
        
        const fallbackQuery = `tempat wisata ${normalizedCategory.toLowerCase()} populer indonesia`;
        const fallbackPlaces = await fetchAllPlaces({
          textQuery: fallbackQuery,
          includedType: "tourist_attraction",
          languageCode: "id"
        });
        
        if (fallbackPlaces.length > 0) {
          const formattedFallbackPlaces = await Promise.all(
            fallbackPlaces.map(async (place) => await formatWisata(place))
          );
          
          // Tambahkan semua hasil fallback untuk memastikan ada data
          for (const wisata of formattedFallbackPlaces) {
            if (!seenIds.has(wisata.id)) {
              seenIds.add(wisata.id);
              filteredWisata.push(wisata);
            }
          }
          console.log(`Mendapatkan ${formattedFallbackPlaces.length} data dari pencarian fallback`);
        }
      }
      
      // Acak urutan untuk menghindari bias
      filteredWisata = shuffleArray(filteredWisata);
      
      // Simpan ke cache dengan waktu yang lebih lama (6 jam)
      cache.set(cacheKey, filteredWisata, 21600);
      
      console.log(`Total ${filteredWisata.length} data wisata kategori ${normalizedCategory} siap ditampilkan`);
    }
    
    // Jika tidak ada data untuk kategori ini
    if (!filteredWisata || filteredWisata.length === 0) {
      return h.response({ 
        status: 'error',
        message: `Tidak ada data wisata untuk kategori ${normalizedCategory}`
      }).code(404);
    }
    
    // Pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    const paginatedData = filteredWisata.slice(startIndex, endIndex);
    
    return h.response({
      status: 'success',
      data: paginatedData,
      meta: {
        category: normalizedCategory,
        currentPage: Number(page),
        pageSize: Number(pageSize),
        totalItems: filteredWisata.length,
        totalPages: Math.ceil(filteredWisata.length / pageSize)
      }
    }).code(200);
    
  } catch (error) {
    console.error("Error getWisataByCategory:", error.message);
    
    if (error.name === 'AbortError') {
      return h.response({ 
        status: 'error',
        message: "Fetch data timeout (max 30 detik)"
      }).code(408);
    }
    
    return h.response({ 
      status: 'error',
      message: "Gagal mengambil data wisata berdasarkan kategori",
      detail: error.response?.data?.error?.message || "Internal Server Error"
    }).code(500);
  }
};

// Ekspor fungsi-fungsi utama agar dapat digunakan di modul lain
module.exports = { 
  getAllWisata, 
  getWisataById, 
  searchWisata, 
  getTopWisata,
  getWisataByCategory 
};
