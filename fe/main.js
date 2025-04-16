import initCategory from '/fe/frontend/views/category.js';
import initHome from '/fe/frontend/views/home.js';
import initSearch from '/fe/frontend/views/search.js';
import initDetail from '/fe/frontend/views/detail.js';
import initprofile from '/fe/frontend/views/profile.js';
import '/fe/frontend/js/userStatus.js';
import '/fe/frontend/js/login.js';
import '/fe/frontend/js/register.js';
import init_reset from '/fe/frontend/views/reset.js';

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
  } else if (window.location.pathname.includes("reset.html")){
      init_reset();
  }
  else if (
      window.location.pathname.includes("index.html") ||
      window.location.pathname === "/"  // untuk kasus URL root
  ){
      initHome();
  }
});
