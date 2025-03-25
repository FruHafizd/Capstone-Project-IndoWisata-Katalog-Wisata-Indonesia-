const urlParams = new URLSearchParams(window.location.search);
const category = urlParams.get('id'); // Ambil ID kategori dari URL
const api_category = "http://localhost:3000/api/categories";
const wisata = "http://localhost:3000/api/wisata/category";

async function fetch_all_category() {
    try {
        const response = await fetch(api_category);
        if (!response.ok) {
            throw new Error(`Gagal mengambil data: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        if (!result.data || result.data.categories.length === 0) {
            document.getElementById("grid-container").innerHTML = "<p style='text-align: center;'>Kategori tidak ditemukan.</p>";
        } else {
            render_all(result.data.categories);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function fetch_one_category(id) {
    try {
        const response = await fetch(`${wisata}/${id}`);
        if (!response.ok) {
            throw new Error(`Gagal mengambil data: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        if (!result.data || result.data.length === 0) {
            document.getElementById("grid-container").innerHTML = "<p style='text-align: center;'>Wisata dalam kategori ini tidak ditemukan.</p>";
        } else {
            render_detail(result.data.places);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

function render_detail(data) {
    const grid = document.querySelector('.grid-container');
    if (data.length === 0) {
      grid.innerHTML = "<p>Tidak ada data wisata yang tersedia.</p>";
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

function render_all(data) {
    const grid = document.getElementById("grid-container");
    grid.innerHTML = data.map(item => `
        <div class="grid-item" data-id="${item.name.toLowerCase()}">
            <img src="${item.image || 'frontend/image/lava.webp'}" alt="${item.name || 'Wisata'}">
            <h3>${item.name || 'N/A'}</h3>
        </div>
    `).join('');

    // Event listener untuk setiap kategori
    document.querySelectorAll('.grid-item').forEach(item => {
        item.addEventListener('click', () => {
            const wisataId = item.getAttribute('data-id');
            window.location.href = `category.html?id=${wisataId}`;
        });
    });
}

window.onload = () => {
    if (category) {
        fetch_one_category(category);
    } else {
        fetch_all_category();
    }
};
