const API_LOGIN_URL = 'http://localhost:3000/api/login';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) {
    console.error('Form login tidak ditemukan.');
    return;
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
      alert('Email dan password harus diisi!');
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
        alert('Login berhasil!');
        // Simpan token dan nama user ke localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('userName', data.data.name); // Ambil langsung dari response login
        window.location.href = 'index.html'; // Ubah URL redirect jika diperlukan
      } else {
        alert(data.message || 'Login gagal, periksa kembali email dan password Anda.');
      }      
    } catch (error) {
      console.error('Error saat login:', error);
      alert('Terjadi kesalahan saat melakukan login.');
    }
  });
});
