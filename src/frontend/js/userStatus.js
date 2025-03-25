// frontend/js/userStatus.js

// Fungsi untuk mengambil data profile dari API
async function fetchUserProfile(token) {
  try {
    const response = await fetch("http://localhost:3000/api/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return await response.json();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

// Fungsi untuk mengupdate tampilan user status
async function updateUserStatus() {
  const userStatus = document.getElementById("userStatus");
  const token = localStorage.getItem("token");

  if (token) {
    // Jika token ada, ambil data profile
    const userData = await fetchUserProfile(token);
    if (userData && userData.name) {
      userStatus.innerHTML = `
          <a href="/profile.html">${userData.name}</a> | 
          <a href="#" id="logoutLink">Logout</a>
        `;

      document.getElementById("logoutLink").addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        window.location.reload();
      });
    } else {
      // Jika token tidak valid atau terjadi error, tampilkan link login
      userStatus.innerHTML = `<a href="src/login.html">Login</a>`;
    }
  } else {
    // Jika token tidak ada, tampilkan link login
    userStatus.innerHTML = `<a href="/src/login.html">Login</a>`;
  }
}

// Panggil fungsi ketika DOM sudah siap
document.addEventListener("DOMContentLoaded", updateUserStatus);

// Jika menggunakan modul, ekspor fungsi (opsional)
export { updateUserStatus };
