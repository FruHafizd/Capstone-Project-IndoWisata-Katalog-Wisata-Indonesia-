// Base URL untuk endpoint register user
const API_USERS_URL = 'http://212.85.26.93:3000/api/users';

// Fungsi untuk menampilkan pesan error atau sukses
function displayMessage(message, type = 'danger') {
  // type 'danger' untuk error, 'success' untuk pesan sukses
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}

// Fungsi validasi form untuk memastikan field yang wajib diisi tidak kosong
function validateForm() {
  const errors = [];

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const hobby = document.getElementById('hobby').value;
  const age = Number(document.getElementById('usia').value);
  const occupation = document.getElementById('pekerjaan').value.trim();
  const maritalStatus = document.querySelector('input[name="status_nikah"]:checked')?.value;

  if (!name || name.length < 3) {
    errors.push("Nama harus diisi minimal 3 karakter.");
  }
  if (!email) {
    errors.push("Email harus diisi dengan format yang benar.");
  }
  if (!password || password.length < 8) {
    errors.push("Password harus diisi minimal 8 karakter.");
  }
  if (!hobby) {
    errors.push("Pilih salah satu hobi yang tersedia.");
  }
  if (!age || age < 13 || age > 70) {
    errors.push("Usia harus diisi dengan angka antara 12 hingga 100.");
  }
  if (!occupation) {
    errors.push("Pilih salah satu pekerjaan yang tersedia.");
  }
  if (!maritalStatus) {
    errors.push("Status pernikahan harus diisi, pilih antara Menikah atau Belum Menikah.");
  }

  return errors;
}

document.addEventListener('DOMContentLoaded', () => {
  $(document).ready(function(){
    $('#hobby').selectpicker();
  });
  $(document).ready(function(){
    $('#pekerjaan').selectpicker();
  });
  const token = localStorage.getItem("token");
  if (token && window.location.pathname.includes("register.html")) {
    window.location.replace("index.html");
    return;
  }
  const registerForm = document.getElementById('registerForm');
  
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Kosongkan pesan error sebelumnya
    displayMessage('');

    // Validasi seluruh field wajib terlebih dahulu
    const errors = validateForm();
    if (errors.length > 0) {
      displayMessage(`<ul>${errors.map(err => `<li>${err}</li>`).join('')}</ul>`);
      return;
    }

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validasi password dan konfirmasi password
    if (password !== confirmPassword) {
      displayMessage('Password dan konfirmasi password tidak sama!');
      return;
    }
    
    // Mapping field form ke field API (sesuai dengan schema backend)
    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      password: password,
      hobby: document.getElementById('hobby').value,
      age: Number(document.getElementById('usia').value),
      occupation: document.getElementById('pekerjaan').value,
      marital_status: document.querySelector('input[name="status_nikah"]:checked')?.value || ''
    };

    

    fetch(API_USERS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    .then(response => response.json().then(data => ({ status: response.status, data })))
    .then(({ status, data }) => {
      // Jika status API tidak sukses (misal email sudah terdaftar, validasi backend gagal, dll.)
      if (status !== 201 && data.status !== 'success') {
        displayMessage(data.message || 'Terjadi kesalahan pada pendaftaran.');
      } else {
        displayMessage('Pendaftaran berhasil, silakan login!', 'success');
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 1500);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      displayMessage('Terjadi kesalahan saat menghubungkan ke server.');
    });
  });
});
