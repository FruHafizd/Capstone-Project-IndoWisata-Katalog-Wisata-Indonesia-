import initCategory from './frontend/views/category.js';
import initHome from './frontend/views/home.js';
import initSearch from './frontend/views/search.js';
import initDetail from './frontend/views/detail.js';
import initprofile from './frontend/views/profile.js';
import './frontend/js/userStatus.js';
import './frontend/js/login.js';
import './frontend/js/register.js';

document.addEventListener("DOMContentLoaded", () => {
  // Cek apakah user sudah login
  const token = localStorage.getItem("token");
  
  // Jika token ada dan user sedang mengakses halaman login atau register,
  // redirect ke halaman utama
  if (
    token &&
    (window.location.pathname.includes("login.html") || window.location.pathname.includes("register.html"))
  ) {
    window.location.href = "/src/index.html"; // Ubah sesuai kebutuhan
    return; // Hentikan eksekusi kode berikutnya
  }

  if (window.location.pathname.includes("category.html")) {
        initCategory();
  } else if (window.location.pathname.includes("search.html")) {
        initSearch();
  } else if (window.location.pathname.includes("detail.html")) {
        initDetail();
  } else if (window.location.pathname.includes("profile.html")){
        initprofile();
  }
  else if (
      window.location.pathname.includes("index.html") ||
      window.location.pathname === "/"  // untuk kasus URL root
  ){
      initHome();
  }
});
