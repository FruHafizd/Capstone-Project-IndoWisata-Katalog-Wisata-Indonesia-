// Endpoint API
import '../../frontend/css/search.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import '../js/userStatus.js';
const api_all = "http://localhost:3000/api/wisata";
const api_search = "http://localhost:3000/api/wisata/search";

// Mapping kategori: ubah sesuai dengan data kategori Anda
const categoryMapping = {
    "cat_LgHRkZdANPDP6ttv": "ALAM",
    "cat_DLQ8lcmAe9GedORf": "KULINER",
    "cat_NWLIqpq6cnjunZ5X": "SEJARAH",
    "cat_oAsRjVBqyzmI-tBA": "KELUARGA",
    "cat_QCJZ9eD5PbAbDIv4": "LAINNYA"
};

// Gunakan container yang sesuai dengan halaman search
const container = document.querySelector('#grid-container-search');

// Fungsi untuk mengambil data hasil pencarian
async function fetch_search(query) {
    container.innerHTML = "<p>Mencari data wisata...</p>";
  
    try {
        const response = await fetch(`${api_search}?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error(`Gagal mengambil data: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        // Pastikan respons API memiliki struktur yang benar
        if (result.status !== "success" || !result.data || !result.data.places) {
            throw new Error("Format data tidak valid");
        }
        render_all(result.data.places);
    } catch (error) {
        console.error(error);
        container.innerHTML = `<p>Gagal memuat hasil pencarian. Error: ${error.message}</p>`;
    }
}
  
// Fungsi untuk mengambil semua data wisata (saat halaman pertama kali dimuat)
async function fetch_all() {
    container.innerHTML = "<p>Memuat data wisata...</p>";
  
    try {
        const response = await fetch(api_all);
        if (!response.ok) {
            throw new Error(`Gagal mengambil data: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        if (result.status !== "success" || !result.data || !result.data.places) {
            throw new Error("Format data tidak valid");
        }
        render_all(result.data.places);
    } catch (error) {
        console.error(error);
        container.innerHTML = `<p>Gagal memuat data wisata. Error: ${error.message}</p>`;
    }
}
  
// Fungsi untuk mengonversi rating ke ikon bintang
function convertRatingToStars(rating) {
    const numericRating = parseFloat(rating) || 0;
    const fullStars = Math.floor(numericRating);
    const halfStar = numericRating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
  
    const fullStarIcon = '<span class="fa fa-star checked"></span>';
    const halfStarIcon = '<span class="fa fa-star-half-alt checked"></span>';
    const emptyStarIcon = '<span class="fa fa-star"></span>';
  
    return fullStarIcon.repeat(fullStars) +
           (halfStar ? halfStarIcon : '') +
           emptyStarIcon.repeat(emptyStars);
}
  
// Fungsi untuk merender data wisata ke dalam grid
function render_all(data = []) {
    if (data.length === 0) {
      container.innerHTML = "<p>Tidak ada data wisata yang tersedia.</p>";
      return;
    }
  
    container.innerHTML = data.map(item => {
      // Cek properti gambar: image_url (search) atau imageUrl (top)
      const image = item.image_url || item.imageUrl || 'frontend/image/lava.webp';
      // Cek kategori: gunakan mapping untuk mengonversi id ke nama
      const catId = item.category || item.category_id || '';
      const catName = categoryMapping[catId] || catId;
      
      return `
        <div class="grid-item" data-id="${item.id}">
            <img src="${image}" alt="${item.name || 'Wisata'}">
            <h3>${item.name || 'N/A'}</h3>
            <div class="rating">
              <b>${item.rating || 'N/A'}</b> ${convertRatingToStars(item.rating)}
            </div>
            ${ catName ? `<p class="category">${catName}</p>` : '' }
        </div>
      `;
    }).join('');
  
    // Tambahkan event listener untuk setiap grid-item agar ketika diklik, diarahkan ke halaman detail
    const items = document.querySelectorAll('.grid-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        const wisataId = item.getAttribute('data-id');
        window.location.href = `detail.html?id=${wisataId}`;
      });
    });
}
  
// Fungsi inisialisasi search
function initSearch() {
    // Tangani pencarian melalui form
    const form = document.querySelector('.search-container form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // Mencegah submit default form
            const searchQuery = document.querySelector('.search-box').value.trim();
            if (searchQuery) {
                await fetch_search(searchQuery);
            }
        });
    }
    // Panggil fetch_all() saat inisialisasi agar data awal langsung tampil
    fetch_all();
  
    // Jika terdapat hamburger menu, pasang event listener (jika elemen tersebut ada di halaman search)
    const hamburger = document.querySelector(".hamburger");
    if (hamburger) {
        hamburger.addEventListener("click", function() {
            const navbar = document.querySelector(".navbar");
            if (navbar) {
                navbar.classList.toggle("active");
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initSearch();
});

export default initSearch;

