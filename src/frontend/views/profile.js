const api_profile = "http://localhost:3000/api/users";
const id = localStorage.getItem("id");

async function fetch_profile() {
    const container = document.getElementById('container');
    container.innerHTML = "<p>Memuat data profile...</p>";
    try {
        const response = await fetch(`${api_profile}/${id}`);
        if (!response.ok) {
            throw new Error(`Gagal mengambil data: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        render_profile(result.data.user);
    } catch (error) {
        console.error(error);
        container.innerHTML = `<p>Gagal memuat data profile. Error: ${error.message}</p>`;
    }

}

function render_profile(data) {
    const container = document.getElementById('container');
    container.innerHTML = 
    `
    <div class="profile-card">
                <div class="profile-container">
                    <img src="/src/frontend/image/user.jpg" alt="Profile Picture" class="profile-image">
                    <form>
                        <div class="form-group">
                            <label>Name</label>
                            <div class="form-control">${data.name}</div>
                        </div>
                        <div class="form-group">
                            <label>Email</label>
                            <div class="form-control">${data.email}</div>
                        </div>
                        <div class="form-group">
                            <label>Age</label>
                            <div class="form-control">${data.age}</div>
                        </div>
                        <div class="form-group">
                            <label>Pekerjaan</label>
                            <div class="form-control">${data.occupation}</div>
                        </div>
                        <div class="form-group">
                            <label>Hobby</label>
                            <div class="form-control">${data.hobby}</div>
                        </div>
                        <div class="form-group">
                            <label>Status Nikah</label>
                            <div class="form-control">${data.marital_status}</div>
                        </div>
                        <button class="button" id="edit-profile">Edit Profile</button>
                    </form>
                </div>
        </div>
    `;
    document.getElementById("edit-profile").addEventListener("click", () => render_edit_profile(data));
}

function render_edit_profile(data) {
    const container = document.getElementById('container');
    container.innerHTML = `
    <div class="profile-card">
        <div class="profile-container">
            <img src="/src/frontend/image/user.jpg" alt="Profile Picture" class="profile-image">
            <form id="edit-profile-form">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" class="form-control" value="${data.name}" id="name">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" class="form-control" value="${data.email}" id="email">
                </div>
                <div class="form-group">
                    <label>Age</label>
                    <input type="number" class="form-control" value="${data.age}" id="age" min="12" max="100">
                </div>
                <div class="form-group">
                    <label>Pekerjaan</label>
                    <input type="text" class="form-control" value="${data.occupation}" id="occupation">
                </div>
                <div class="form-group">
                    <label>Hobby</label>
                    <select class="form-control" id="hobby">
                        <option value="">Pilih Hobi</option>
                        <option value="hiking" ${data.hobby === 'hiking' ? 'selected' : ''}>Hiking & Alam Terbuka</option>
                        <option value="kuliner" ${data.hobby === 'kuliner' ? 'selected' : ''}>Kuliner</option>
                        <option value="fotografi" ${data.hobby === 'fotografi' ? 'selected' : ''}>Fotografi</option>
                        <option value="sejarah" ${data.hobby === 'sejarah' ? 'selected' : ''}>Sejarah & Budaya</option>
                        <option value="belanja" ${data.hobby === 'belanja' ? 'selected' : ''}>Belanja</option>
                        <option value="bahari" ${data.hobby === 'bahari' ? 'selected' : ''}>Aktivitas Bahari</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Status Nikah</label>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="status_nikah" id="menikah" value="Menikah" ${data.marital_status === 'Menikah' ? 'checked' : ''}>
                        <label class="form-check-label" for="menikah">Menikah</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="status_nikah" id="belum_menikah" value="Belum Menikah" ${data.marital_status === 'Belum Menikah' ? 'checked' : ''}>
                        <label class="form-check-label" for="belum_menikah">Belum Menikah</label>
                    </div>
                </div>
                <button type="button" class="button" id="save-profile">Simpan</button>
            </form>
        </div>
    </div>`;

    document.getElementById("save-profile").addEventListener("click", () => save_profile(data.id));
}

async function save_profile(userId) {
    const updatedData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        age: document.getElementById("age").value,
        occupation: document.getElementById("occupation").value,
        hobby: document.getElementById("hobby").value,
        marital_status: document.querySelector('input[name="status_nikah"]:checked')?.value || "Belum Menikah",
    };

    try {
        const response = await fetch(`${api_profile}/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
            throw new Error(`Gagal menyimpan data: ${response.status} ${response.statusText}`);
        }

        alert("Profil berhasil diperbarui!");
        fetch_profile();
    } catch (error) {
        console.error("Error:", error);
        alert("Gagal menyimpan perubahan!");
    }
}




function initprofile (){
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.replace("login.html");
        return;
    } else {
        fetch_profile();
    }
}

export default initprofile;