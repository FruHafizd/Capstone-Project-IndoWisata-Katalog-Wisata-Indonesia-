
import initCategory from './frontend/views/category.js';
import initHome from './frontend/views/home.js';
import initSearch from './frontend/views/search.js';
import initDetail from './frontend/views/detail.js';
import './frontend/js/userStatus.js';
import './frontend/js/login.js';
import './frontend/js/register.js';

document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("category.html")) {
        initCategory();
    } else if (window.location.pathname.includes("search.html")) {
        initSearch();
    } else if (window.location.pathname.includes("detail.html")) {
        initDetail();
    } else if (
      window.location.pathname.includes("index.html") ||
      window.location.pathname === "/"  // untuk kasus URL root
    ) {
        initHome();
    }
});
