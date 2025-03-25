// Base URL untuk endpoint login user
const API_LOGIN_URL = 'http://localhost:3000/api/login';

document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const response = await fetch(API_LOGIN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();

        if (response.ok && data.status === 'success') {
          alert('Login berhasil!');
          localStorage.setItem('token', data.data.token);
          window.location.href = '/src/index.html.html';
        } else {
          alert(data.message || 'Login gagal, periksa kembali email dan password Anda.');
        }
      } catch (error) {
        console.error('Error saat login:', error);
        alert('Terjadi kesalahan saat melakukan login.');
      }
    });
  }
});
