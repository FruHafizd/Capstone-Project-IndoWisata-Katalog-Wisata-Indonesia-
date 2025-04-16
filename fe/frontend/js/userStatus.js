function updateUserStatus() {
  const userStatus = document.getElementById("userStatus");
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName"); // Ambil dari localStorage

  if (token && userName) {
    userStatus.innerHTML = `
      <div class="dropdown">
        <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
          ${userName} <!-- Tampilkan nama dari localStorage -->
        </button>
        <ul class="dropdown-menu">
          <li><a class="dropdown-item" href="profile.html">Profile</a></li>
          <li><a class="dropdown-item" href="#" id="logoutLink">Logout</a></li>
        </ul>
      </div>
    `;

    // Logout handler
    document.getElementById("logoutLink").addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      localStorage.removeItem("id");
      window.location.href = "../fe/index.html";
    });
  } else {
    userStatus.innerHTML = `<a href="login.html">Login</a>`;
  }
}

document.addEventListener("DOMContentLoaded", updateUserStatus);
