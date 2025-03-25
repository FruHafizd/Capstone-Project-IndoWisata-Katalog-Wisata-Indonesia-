const urlParams = new URLSearchParams(window.location.search);
const category = urlParams.get('id'); // Ambil ID kategori dari URL

// Base URL untuk endpoint kategori dan wisata berdasarkan kategori
const api_categories = "http://localhost:3000/api/categories";
const api_wisata_by_category = "http://localhost:3000/api/wisata/categories";

const categoryImages = {
    "alam": "frontend/image/lava.webp",
    "keluarga": "frontend/image/tmii.jpg",
    "kuliner": "frontend/image/resto.jpg",
    "lainnya": "frontend/image/tourist.jpg",
    "sejarah": "frontend/image/candi.jpg"
};

const categoryMapping = {
    "cat_LgHRkZdANPDP6ttv": "ALAM",
    "cat_DLQ8lcmAe9GedORf": "KULINER",
    "cat_NWLIqpq6cnjunZ5X": "SEJARAH",
    "cat_oAsRjVBqyzmI-tBA": "KELUARGA",
    "cat_QCJZ9eD5PbAbDIv4": "LAINNYA",
};

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

async function fetch_all_category() {
    try {
        const response = await fetch(api_categories);
        if (!response.ok) {
            throw new Error(`Gagal mengambil data: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        if (!result.data || result.data.categories.length === 0) {
            document.getElementById("grid-container-category").innerHTML = "<p style='text-align: center;'>Kategori tidak ditemukan.</p>";
        } else {
            render_all(result.data.categories);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function fetch_one_category(id) {
    try {
        const response = await fetch(`${api_wisata_by_category}/${id}`);
        if (!response.ok) {
            throw new Error(`Gagal mengambil data: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        if (!result.data || result.data.places.length === 0) {
            document.getElementById("grid-container-category").innerHTML = "<p style='text-align: center;'>Wisata dalam kategori ini tidak ditemukan.</p>";
        } else {
            render_detail(result.data.places);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

function render_detail(data) {
    const grid = document.getElementById("grid-container-category");
    if (data.length === 0) {
      grid.innerHTML = "<p>Tidak ada data wisata yang tersedia.</p>";
      return;
    }
  
    grid.innerHTML = data.map(item => {
      const image = item.image_url || item.imageUrl || 'frontend/image/lava.webp';
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
  
    document.querySelectorAll('.grid-item').forEach(item => {
      item.addEventListener('click', () => {
        const wisataId = item.getAttribute('data-id');
        window.location.href = `detail.html?id=${wisataId}`;
      });
    });
}

function render_all(data) {
    const grid = document.getElementById("grid-container-category");
    grid.innerHTML = data.map(item => {
        const categoryName = item.name.toLowerCase(); 
        const categoryImage = categoryImages[categoryName] || "frontend/image/default.jpg"; 
        return `
            <div class="grid-item" data-id="${item.id}">
                <img src="${categoryImage}" alt="${item.name || 'Kategori'}">
                <h3>${item.name || 'N/A'}</h3>
            </div>
        `;
    }).join('');
  
    document.querySelectorAll('.grid-item').forEach(item => {
        item.addEventListener('click', () => {
            const selectedId = item.getAttribute('data-id');
            window.location.href = `category.html?id=${selectedId}`;
        });
    });
}

function initCategory() {
    if (category) {
        fetch_one_category(category);
    } else {
        fetch_all_category();
    }
}

export default initCategory;
