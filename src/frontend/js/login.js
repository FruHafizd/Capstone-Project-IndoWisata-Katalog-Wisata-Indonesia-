const API_LOGIN_URL = 'http://localhost:3000/api/login';

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem("token");

  if (token && window.location.pathname.includes("login.html")) {
    window.location.replace("index.html");
    return;
  }

  const loginForm = document.getElementById('loginForm');
  if (!loginForm) {
    console.error('Form login tidak ditemukan.');
    return;
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Ambil input dan elemen error
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const loginError = document.getElementById('loginError');

    // Reset pesan error
    loginError.innerHTML = "";

    // Validasi input kosong
    let errors = [];
    if (!email) errors.push("Email wajib diisi.");
    if (!password) errors.push("Password wajib diisi.");

    if (errors.length > 0) {
      loginError.innerHTML = errors.join("<br>");
      return;
    }

    try {
      const response = await fetch(API_LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        // Simpan token dan redirect jika login sukses
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('userName', data.data.name);
        localStorage.setItem('id', data.data.id);
        window.location.href = 'index.html';
      } else {
        // Tampilkan error di satu tempat
        loginError.innerHTML = data.message || "Email atau password salah.";
      }
    } catch (error) {
      console.error('Error saat login:', error);
      loginError.innerHTML = "Terjadi kesalahan saat melakukan login.";
    }
  });
});
