const api_profile = "http://localhost:3000/api/users";
const id = localStorage.getItem("id");

async function fetch_profile() {
    const container = document.getElementById('container');
    container.innerHTML = `<span class="loader"></span>`;
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
    container.innerHTML = `
      <div class="profile-card">
        <div class="title" style="text-align: center; margin-bottom: 20px;">
            <h1>My Profile</h1>
        </div>
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
                <button class="button" id="edit-profile" ><i class="fa-solid fa-user"></i><h2>Edit Profile</h2></button>
                <button class="button" id="edit-password"><i class="fa-solid fa-lock"></i><h2>Ganti Password</h2></button>
            </form>
        </div>
      </div>
    `;
    document.getElementById("edit-profile").addEventListener("click", () => render_edit_profile(data));
    document.getElementById("edit-password").addEventListener("click", () => render_edit_password());
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
                    <div class="form-control">${data.name}</div>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <div class="form-control">${data.email}</div>
                </div>
                <div class="form-group">
                    <label>Age</label>
                    <input type="number" class="form-control" value="${data.age}" id="age" min="15" max="70">
                </div>
                <div class="form-group">
                    <label>Pekerjaan</label>
                    <select class="form-control" id="occupation" data-live-search="true">
                        <option value="">Pilih Pekerjaan</option>
                        <option value="Fisioterapis" ${data.occupation === 'Fisioterapis' ? 'selected' : ''}>Fisioterapis</option>
                        <option value="Ahli Lingkungan" ${data.occupation === 'Ahli Lingkungan' ? 'selected' : ''}>Ahli Lingkungan</option>
                        <option value="Penyiar Radio" ${data.occupation === 'Penyiar Radio' ? 'selected' : ''}>Penyiar Radio</option>
                        <option value="Jaksa" ${data.occupation === 'Jaksa' ? 'selected' : ''}>Jaksa</option>
                        <option value="IT Support" ${data.occupation === 'IT Support' ? 'selected' : ''}>IT Support</option>
                        <option value="Arsitek Lanskap" ${data.occupation === 'Arsitek Lanskap' ? 'selected' : ''}>Arsitek Lanskap</option>
                        <option value="Blogger" ${data.occupation === 'Blogger' ? 'selected' : ''}>Blogger</option>
                        <option value="Hakim" ${data.occupation === 'Hakim' ? 'selected' : ''}>Hakim</option>
                        <option value="Pramugari" ${data.occupation === 'Pramugari' ? 'selected' : ''}>Pramugari</option>
                        <option value="Reporter" ${data.occupation === 'Reporter' ? 'selected' : ''}>Reporter</option>
                        <option value="Peneliti" ${data.occupation === 'Peneliti' ? 'selected' : ''}>Peneliti</option>
                        <option value="Desainer" ${data.occupation === 'Desainer' ? 'selected' : ''}>Desainer</option>
                        <option value="Pelatih Olahraga" ${data.occupation === 'Pelatih Olahraga' ? 'selected' : ''}>Pelatih Olahraga</option>
                        <option value="Dokter" ${data.occupation === 'Dokter' ? 'selected' : ''}>Dokter</option>
                        <option value="Jurnalis" ${data.occupation === 'Jurnalis' ? 'selected' : ''}>Jurnalis</option>
                        <option value="Ilmuwan" ${data.occupation === 'Ilmuwan' ? 'selected' : ''}>Ilmuwan</option>
                        <option value="Software Engineer" ${data.occupation === 'Software Engineer' ? 'selected' : ''}>Software Engineer</option>
                        <option value="Polisi" ${data.occupation === 'Polisi' ? 'selected' : ''}>Polisi</option>
                        <option value="Makeup Artist" ${data.occupation === 'Makeup Artist' ? 'selected' : ''}>Makeup Artist</option>
                        <option value="Ahli Gizi" ${data.occupation === 'Ahli Gizi' ? 'selected' : ''}>Ahli Gizi</option>
                        <option value="Penata Rambut" ${data.occupation === 'Penata Rambut' ? 'selected' : ''}>Penata Rambut</option>
                        <option value="Masinis" ${data.occupation === 'Masinis' ? 'selected' : ''}>Masinis</option>
                        <option value="Pelaut" ${data.occupation === 'Pelaut' ? 'selected' : ''}>Pelaut</option>
                        <option value="Mahasiswa" ${data.occupation === 'Mahasiswa' ? 'selected' : ''}>Mahasiswa</option>
                        <option value="HRD" ${data.occupation === 'HRD' ? 'selected' : ''}>HRD</option>
                        <option value="Fotografer" ${data.occupation === 'Fotografer' ? 'selected' : ''}>Fotografer</option>
                        <option value="Apoteker" ${data.occupation === 'Apoteker' ? 'selected' : ''}>Apoteker</option>
                        <option value="Ekonom" ${data.occupation === 'Ekonom' ? 'selected' : ''}>Ekonom</option>
                        <option value="Teknisi Mesin" ${data.occupation === 'Teknisi Mesin' ? 'selected' : ''}>Teknisi Mesin</option>
                        <option value="Penasihat Pajak" ${data.occupation === 'Penasihat Pajak' ? 'selected' : ''}>Penasihat Pajak</option>
                        <option value="Penyanyi" ${data.occupation === 'Penyanyi' ? 'selected' : ''}>Penyanyi</option>
                        <option value="Arkeolog" ${data.occupation === 'Arkeolog' ? 'selected' : ''}>Arkeolog</option>
                        <option value="Model" ${data.occupation === 'Model' ? 'selected' : ''}>Model</option>
                        <option value="Sejarawan" ${data.occupation === 'Sejarawan' ? 'selected' : ''}>Sejarawan</option>
                        <option value="Marketing" ${data.occupation === 'Marketing' ? 'selected' : ''}>Marketing</option>
                        <option value="Penasihat Hukum" ${data.occupation === 'Penasihat Hukum' ? 'selected' : ''}>Penasihat Hukum</option>
                        <option value="Voice Over" ${data.occupation === 'Voice Over' ? 'selected' : ''}>Voice Over</option>
                        <option value="Mekanik" ${data.occupation === 'Mekanik' ? 'selected' : ''}>Mekanik</option>
                        <option value="Game Developer" ${data.occupation === 'Game Developer' ? 'selected' : ''}>Game Developer</option>
                        <option value="Ahli Kimia" ${data.occupation === 'Ahli Kimia' ? 'selected' : ''}>Ahli Kimia</option>
                        <option value="Koki" ${data.occupation === 'Koki' ? 'selected' : ''}>Koki</option>
                        <option value="Tukang Kayu" ${data.occupation === 'Tukang Kayu' ? 'selected' : ''}>Tukang Kayu</option>
                        <option value="Teknisi Elektronik" ${data.occupation === 'Teknisi Elektronik' ? 'selected' : ''}>Teknisi Elektronik</option>
                        <option value="Rekruter" ${data.occupation === 'Rekruter' ? 'selected' : ''}>Rekruter</option>
                        <option value="Montir" ${data.occupation === 'Montir' ? 'selected' : ''}>Montir</option>
                        <option value="Videografer" ${data.occupation === 'Videografer' ? 'selected' : ''}>Videografer</option>
                        <option value="Akuntan" ${data.occupation === 'Akuntan' ? 'selected' : ''}>Akuntan</option>
                        <option value="Arsitek" ${data.occupation === 'Arsitek' ? 'selected' : ''}>Arsitek</option>
                        <option value="Pakar Keuangan" ${data.occupation === 'Pakar Keuangan' ? 'selected' : ''}>Pakar Keuangan</option>
                        <option value="Pilot" ${data.occupation === 'Pilot' ? 'selected' : ''}>Pilot</option>
                        <option value="Aktor" ${data.occupation === 'Aktor' ? 'selected' : ''}>Aktor</option>
                        <option value="Ahli Kecerdasan Buatan" ${data.occupation === 'Ahli Kecerdasan Buatan' ? 'selected' : ''}>Ahli Kecerdasan Buatan</option>
                        <option value="Operator Produksi" ${data.occupation === 'Operator Produksi' ? 'selected' : ''}>Operator Produksi</option>
                        <option value="Pengacara" ${data.occupation === 'Pengacara' ? 'selected' : ''}>Pengacara</option>
                        <option value="Animator" ${data.occupation === 'Animator' ? 'selected' : ''}>Animator</option>
                        <option value="Surveyor" ${data.occupation === 'Surveyor' ? 'selected' : ''}>Surveyor</option>
                        <option value="Ahli Robotika" ${data.occupation === 'Ahli Robotika' ? 'selected' : ''}>Ahli Robotika</option>
                        <option value="Petani" ${data.occupation === 'Petani' ? 'selected' : ''}>Petani</option>
                        <option value="Cyber Security" ${data.occupation === 'Cyber Security' ? 'selected' : ''}>Cyber Security</option>
                        <option value="Meteorolog" ${data.occupation === 'Meteorolog' ? 'selected' : ''}>Meteorolog</option>
                        <option value="Pustakawan" ${data.occupation === 'Pustakawan' ? 'selected' : ''}>Pustakawan</option>
                        <option value="Penjaga Hutan" ${data.occupation === 'Penjaga Hutan' ? 'selected' : ''}>Penjaga Hutan</option>
                        <option value="MC" ${data.occupation === 'MC' ? 'selected' : ''}>MC</option>
                        <option value="Perawat" ${data.occupation === 'Perawat' ? 'selected' : ''}>Perawat</option>
                        <option value="Pemandu Wisata" ${data.occupation === 'Pemandu Wisata' ? 'selected' : ''}>Pemandu Wisata</option>
                        <option value="Antropolog" ${data.occupation === 'Antropolog' ? 'selected' : ''}>Antropolog</option>
                        <option value="Wasit" ${data.occupation === 'Wasit' ? 'selected' : ''}>Wasit</option>
                        <option value="DevOps Engineer" ${data.occupation === 'DevOps Engineer' ? 'selected' : ''}>DevOps Engineer</option>
                        <option value="Analis Saham" ${data.occupation === 'Analis Saham' ? 'selected' : ''}>Analis Saham</option>
                        <option value="Analis Data" ${data.occupation === 'Analis Data' ? 'selected' : ''}>Analis Data</option>
                        <option value="Produser Film" ${data.occupation === 'Produser Film' ? 'selected' : ''}>Produser Film</option>
                        <option value="Editor" ${data.occupation === 'Editor' ? 'selected' : ''}>Editor</option>
                        <option value="Atlet" ${data.occupation === 'Atlet' ? 'selected' : ''}>Atlet</option>
                        <option value="Sopir" ${data.occupation === 'Sopir' ? 'selected' : ''}>Sopir</option>
                        <option value="Seniman" ${data.occupation === 'Seniman' ? 'selected' : ''}>Seniman</option>
                        <option value="Lainnya" ${data.occupation === 'Lainnya' ? 'selected' : ''}>Lainnya</option>
                        <option value="Teknisi Medis" ${data.occupation === 'Teknisi Medis' ? 'selected' : ''}>Teknisi Medis</option>
                        <option value="Dosen" ${data.occupation === 'Dosen' ? 'selected' : ''}>Dosen</option>
                        <option value="Nelayan" ${data.occupation === 'Nelayan' ? 'selected' : ''}>Nelayan</option>
                        <option value="Penulis" ${data.occupation === 'Penulis' ? 'selected' : ''}>Penulis</option>
                        <option value="Network Engineer" ${data.occupation === 'Network Engineer' ? 'selected' : ''}>Network Engineer</option>
                        <option value="Tentara" ${data.occupation === 'Tentara' ? 'selected' : ''}>Tentara</option>
                        <option value="Psikolog" ${data.occupation === 'Psikolog' ? 'selected' : ''}>Psikolog</option>
                        <option value="Wirausahawan" ${data.occupation === 'Wirausahawan' ? 'selected' : ''}>Wirausahawan</option>
                        <option value="Komedian" ${data.occupation === 'Komedian' ? 'selected' : ''}>Komedian</option>
                        <option value="Desainer Interior" ${data.occupation === 'Desainer Interior' ? 'selected' : ''}>Desainer Interior</option>
                        <option value="Ahli Biologi" ${data.occupation === 'Ahli Biologi' ? 'selected' : ''}>Ahli Biologi</option>
                        <option value="Bankir" ${data.occupation === 'Bankir' ? 'selected' : ''}>Bankir</option>
                        <option value="Astronom" ${data.occupation === 'Astronom' ? 'selected' : ''}>Astronom</option>
                        <option value="Investor" ${data.occupation === 'Investor' ? 'selected' : ''}>Investor</option>
                        <option value="Ahli Konservasi" ${data.occupation === 'Ahli Konservasi' ? 'selected' : ''}>Ahli Konservasi</option>
                        <option value="Musisi" ${data.occupation === 'Musisi' ? 'selected' : ''}>Musisi</option>
                        <option value="Content Creator" ${data.occupation === 'Content Creator' ? 'selected' : ''}>Content Creator</option>
                        <option value="Podcaster" ${data.occupation === 'Podcaster' ? 'selected' : ''}>Podcaster</option>
                        <option value="Administrator Database" ${data.occupation === 'Administrator Database' ? 'selected' : ''}>Administrator Database</option>
                        <option value="Ahli Statistik" ${data.occupation === 'Ahli Statistik' ? 'selected' : ''}>Ahli Statistik</option>
                        <option value="Event Organizer" ${data.occupation === 'Event Organizer' ? 'selected' : ''}>Event Organizer</option>
                        <option value="Tukang Las" ${data.occupation === 'Tukang Las' ? 'selected' : ''}>Tukang Las</option>
                        <option value="Sutradara" ${data.occupation === 'Sutradara' ? 'selected' : ''}>Sutradara</option>
                        <option value="Geolog" ${data.occupation === 'Geolog' ? 'selected' : ''}>Geolog</option>
                        <option value="Urban Planner" ${data.occupation === 'Urban Planner' ? 'selected' : ''}>Urban Planner</option>
                        <option value="Peternak" ${data.occupation === 'Peternak' ? 'selected' : ''}>Peternak</option>
                        <option value="Manajer Proyek" ${data.occupation === 'Manajer Proyek' ? 'selected' : ''}>Manajer Proyek</option>
                        <option value="Influencer" ${data.occupation === 'Influencer' ? 'selected' : ''}>Influencer</option>
                        <option value="Teknisi Laboratorium" ${data.occupation === 'Teknisi Laboratorium' ? 'selected' : ''}>Teknisi Laboratorium</option>
                        <option value="Guru" ${data.occupation === 'Guru' ? 'selected' : ''}>Guru</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Hobby</label>
                    <select class="form-control" id="hobby" data-live-search="true">
                        <option value="">Pilih Hobi</option>
                        <option value="berselancar" ${data.hobby === 'berselancar' ? 'selected' : ''}>berselancar</option>
                        <option value="paralayang" ${data.hobby === 'paralayang' ? 'selected' : ''}>paralayang</option>
                        <option value="bermain catur" ${data.hobby === 'bermain catur' ? 'selected' : ''}>bermain catur</option>
                        <option value="mencoba kuliner baru" ${data.hobby === 'mencoba kuliner baru' ? 'selected' : ''}>mencoba kuliner baru</option>
                        <option value="bermain skateboard" ${data.hobby === 'bermain skateboard' ? 'selected' : ''}>bermain skateboard</option>
                        <option value="menyelam" ${data.hobby === 'menyelam' ? 'selected' : ''}>menyelam</option>
                        <option value="mengikuti cosplay" ${data.hobby === 'mengikuti cosplay' ? 'selected' : ''}>mengikuti cosplay</option>
                        <option value="merakit model kit" ${data.hobby === 'merakit model kit' ? 'selected' : ''}>merakit model kit</option>
                        <option value="mengajar online" ${data.hobby === 'mengajar online' ? 'selected' : ''}>mengajar online</option>
                        <option value="menulis skenario" ${data.hobby === 'menulis skenario' ? 'selected' : ''}>menulis skenario</option>
                        <option value="merakit robot" ${data.hobby === 'merakit robot' ? 'selected' : ''}>merakit robot</option>
                        <option value="bermain catur kilat" ${data.hobby === 'bermain catur kilat' ? 'selected' : ''}>bermain catur kilat</option>
                        <option value="mengoleksi figur action" ${data.hobby === 'mengoleksi figur action' ? 'selected' : ''}>mengoleksi figur action</option>
                        <option value="merakit drone" ${data.hobby === 'merakit drone' ? 'selected' : ''}>merakit drone</option>
                        <option value="bermain musik" ${data.hobby === 'bermain musik' ? 'selected' : ''}>bermain musik</option>
                        <option value="menonton teater" ${data.hobby === 'menonton teater' ? 'selected' : ''}>menonton teater</option>
                        <option value="membuat komik" ${data.hobby === 'membuat komik' ? 'selected' : ''}>membuat komik</option>
                        <option value="menjadi relawan sosial" ${data.hobby === 'menjadi relawan sosial' ? 'selected' : ''}>menjadi relawan sosial</option>
                        <option value="membaca buku" ${data.hobby === 'membaca buku' ? 'selected' : ''}>membaca buku</option>
                        <option value="bermain bulu tangkis" ${data.hobby === 'bermain bulu tangkis' ? 'selected' : ''}>bermain bulu tangkis</option>
                        <option value="menulis puisi" ${data.hobby === 'menulis puisi' ? 'selected' : ''}>menulis puisi</option>
                        <option value="bermain biola" ${data.hobby === 'bermain biola' ? 'selected' : ''}>bermain biola</option>
                        <option value="fotografi" ${data.hobby === 'fotografi' ? 'selected' : ''}>fotografi</option>
                        <option value="mempelajari astronomi" ${data.hobby === 'mempelajari astronomi' ? 'selected' : ''}>mempelajari astronomi</option>
                        <option value="bermain puzzle" ${data.hobby === 'bermain puzzle' ? 'selected' : ''}>bermain puzzle</option>
                        <option value="coding" ${data.hobby === 'coding' ? 'selected' : ''}>coding</option>
                        <option value="bermain peran di drama" ${data.hobby === 'bermain peran di drama' ? 'selected' : ''}>bermain peran di drama</option>
                        <option value="menjelajahi gua" ${data.hobby === 'menjelajahi gua' ? 'selected' : ''}>menjelajahi gua</option>
                        <option value="menanam tanaman" ${data.hobby === 'menanam tanaman' ? 'selected' : ''}>menanam tanaman</option>
                        <option value="panjat tebing" ${data.hobby === 'panjat tebing' ? 'selected' : ''}>panjat tebing</option>
                        <option value="menyanyi" ${data.hobby === 'menyanyi' ? 'selected' : ''}>menyanyi</option>
                        <option value="belajar bahasa asing" ${data.hobby === 'belajar bahasa asing' ? 'selected' : ''}>belajar bahasa asing</option>
                        <option value="menulis cerita" ${data.hobby === 'menulis cerita' ? 'selected' : ''}>menulis cerita</option>
                        <option value="bermain origami" ${data.hobby === 'bermain origami' ? 'selected' : ''}>bermain origami</option>
                        <option value="menjahit" ${data.hobby === 'menjahit' ? 'selected' : ''}>menjahit</option>
                        <option value="berburu" ${data.hobby === 'berburu' ? 'selected' : ''}>berburu</option>
                        <option value="berenang" ${data.hobby === 'berenang' ? 'selected' : ''}>berenang</option>
                        <option value="membuat podcast" ${data.hobby === 'membuat podcast' ? 'selected' : ''}>membuat podcast</option>
                        <option value="membuat lagu" ${data.hobby === 'membuat lagu' ? 'selected' : ''}>membuat lagu</option>
                        <option value="menari" ${data.hobby === 'menari' ? 'selected' : ''}>menari</option>
                        <option value="mengikuti perlombaan menulis" ${data.hobby === 'mengikuti perlombaan menulis' ? 'selected' : ''}>mengikuti perlombaan menulis</option>
                        <option value="bermain trampolin" ${data.hobby === 'bermain trampolin' ? 'selected' : ''}>bermain trampolin</option>
                        <option value="berlatih yoga" ${data.hobby === 'berlatih yoga' ? 'selected' : ''}>berlatih yoga</option>
                        <option value="melukis" ${data.hobby === 'melukis' ? 'selected' : ''}>melukis</option>
                        <option value="mendaki gunung" ${data.hobby === 'mendaki gunung' ? 'selected' : ''}>mendaki gunung</option>
                        <option value="menggambar digital" ${data.hobby === 'menggambar digital' ? 'selected' : ''}>menggambar digital</option>
                        <option value="bermain biliar" ${data.hobby === 'bermain biliar' ? 'selected' : ''}>bermain biliar</option>
                        <option value="bermain drum" ${data.hobby === 'bermain drum' ? 'selected' : ''}>bermain drum</option>
                        <option value="bermain sepak bola" ${data.hobby === 'bermain sepak bola' ? 'selected' : ''}>bermain sepak bola</option>
                        <option value="mengembangkan aplikasi" ${data.hobby === 'mengembangkan aplikasi' ? 'selected' : ''}>mengembangkan aplikasi</option>
                        <option value="berlatih bela diri tradisional" ${data.hobby === 'berlatih bela diri tradisional' ? 'selected' : ''}>berlatih bela diri tradisional</option>
                        <option value="mendengarkan podcast" ${data.hobby === 'mendengarkan podcast' ? 'selected' : ''}>mendengarkan podcast</option>
                        <option value="berlatih beatbox" ${data.hobby === 'berlatih beatbox' ? 'selected' : ''}>berlatih beatbox</option>
                        <option value="mengikuti maraton" ${data.hobby === 'mengikuti maraton' ? 'selected' : ''}>mengikuti maraton</option>
                        <option value="bermain voli" ${data.hobby === 'bermain voli' ? 'selected' : ''}>bermain voli</option>
                        <option value="bermain role-playing game" ${data.hobby === 'bermain role-playing game' ? 'selected' : ''}>bermain role-playing game</option>
                        <option value="bermain kendama" ${data.hobby === 'bermain kendama' ? 'selected' : ''}>bermain kendama</option>
                        <option value="mengoleksi koin" ${data.hobby === 'mengoleksi koin' ? 'selected' : ''}>mengoleksi koin</option>
                        <option value="menonton anime" ${data.hobby === 'menonton anime' ? 'selected' : ''}>menonton anime</option>
                        <option value="menjadi kolektor barang antik" ${data.hobby === 'menjadi kolektor barang antik' ? 'selected' : ''}>menjadi kolektor barang antik</option>
                        <option value="merancang pakaian" ${data.hobby === 'merancang pakaian' ? 'selected' : ''}>merancang pakaian</option>
                        <option value="mengedit video" ${data.hobby === 'mengedit video' ? 'selected' : ''}>mengedit video</option>
                        <option value="bermain basket" ${data.hobby === 'bermain basket' ? 'selected' : ''}>bermain basket</option>
                        <option value="bermain piano" ${data.hobby === 'bermain piano' ? 'selected' : ''}>bermain piano</option>
                        <option value="berlatih bela diri" ${data.hobby === 'berlatih bela diri' ? 'selected' : ''}>berlatih bela diri</option>
                        <option value="bermain game" ${data.hobby === 'bermain game' ? 'selected' : ''}>bermain game</option>
                        <option value="menonton film" ${data.hobby === 'menonton film' ? 'selected' : ''}>menonton film</option>
                        <option value="bermain kartu" ${data.hobby === 'bermain kartu' ? 'selected' : ''}>bermain kartu</option>
                        <option value="bermain boomerang" ${data.hobby === 'bermain boomerang' ? 'selected' : ''}>bermain boomerang</option>
                        <option value="menulis jurnal harian" ${data.hobby === 'menulis jurnal harian' ? 'selected' : ''}>menulis jurnal harian</option>
                        <option value="berlatih sulap kartu" ${data.hobby === 'berlatih sulap kartu' ? 'selected' : ''}>berlatih sulap kartu</option>
                        <option value="menjadi reviewer teknologi" ${data.hobby === 'menjadi reviewer teknologi' ? 'selected' : ''}>menjadi reviewer teknologi</option>
                        <option value="mencoba seni kaligrafi" ${data.hobby === 'mencoba seni kaligrafi' ? 'selected' : ''}>mencoba seni kaligrafi</option>
                        <option value="bermain sulap" ${data.hobby === 'bermain sulap' ? 'selected' : ''}>bermain sulap</option>
                        <option value="bermain tenis" ${data.hobby === 'bermain tenis' ? 'selected' : ''}>bermain tenis</option>
                        <option value="merajut" ${data.hobby === 'merajut' ? 'selected' : ''}>merajut</option>
                        <option value="bermain paintball" ${data.hobby === 'bermain paintball' ? 'selected' : ''}>bermain paintball</option>
                        <option value="bermain e-sports" ${data.hobby === 'bermain e-sports' ? 'selected' : ''}>bermain e-sports</option>
                        <option value="bersepeda" ${data.hobby === 'bersepeda' ? 'selected' : ''}>bersepeda</option>
                        <option value="bermain airsoft gun" ${data.hobby === 'bermain airsoft gun' ? 'selected' : ''}>bermain airsoft gun</option>
                        <option value="mengedit foto" ${data.hobby === 'mengedit foto' ? 'selected' : ''}>mengedit foto</option>
                        <option value="menulis blog" ${data.hobby === 'menulis blog' ? 'selected' : ''}>menulis blog</option>
                        <option value="membuat film pendek" ${data.hobby === 'membuat film pendek' ? 'selected' : ''}>membuat film pendek</option>
                        <option value="menulis lirik lagu" ${data.hobby === 'menulis lirik lagu' ? 'selected' : ''}>menulis lirik lagu</option>
                        <option value="memancing" ${data.hobby === 'memancing' ? 'selected' : ''}>memancing</option>
                        <option value="menggambar" ${data.hobby === 'menggambar' ? 'selected' : ''}>menggambar</option>
                        <option value="merajut tas" ${data.hobby === 'merajut tas' ? 'selected' : ''}>merajut tas</option>
                        <option value="merakit elektronik" ${data.hobby === 'merakit elektronik' ? 'selected' : ''}>merakit elektronik</option>
                        <option value="memasak" ${data.hobby === 'memasak' ? 'selected' : ''}>memasak</option>
                        <option value="bermain roller skating" ${data.hobby === 'bermain roller skating' ? 'selected' : ''}>bermain roller skating</option>
                        <option value="merakit komputer" ${data.hobby === 'merakit komputer' ? 'selected' : ''}>merakit komputer</option>
                        <option value="bermain gitar" ${data.hobby === 'bermain gitar' ? 'selected' : ''}>bermain gitar</option>
                        <option value="bermain harmonika" ${data.hobby === 'bermain harmonika' ? 'selected' : ''}>bermain harmonika</option>
                        <option value="membaca novel misteri" ${data.hobby === 'membaca novel misteri' ? 'selected' : ''}>membaca novel misteri</option>
                        <option value="berkemah" ${data.hobby === 'berkemah' ? 'selected' : ''}>berkemah</option>
                        <option value="mengoleksi perangko" ${data.hobby === 'mengoleksi perangko' ? 'selected' : ''}>mengoleksi perangko</option>
                        <option value="bermain golf" ${data.hobby === 'bermain golf' ? 'selected' : ''}>bermain golf</option>
                        <option value="mengikuti lomba lari" ${data.hobby === 'mengikuti lomba lari' ? 'selected' : ''}>mengikuti lomba lari</option>
                        <option value="berlatih parkour" ${data.hobby === 'berlatih parkour' ? 'selected' : ''}>berlatih parkour</option>
                        <option value="bermain frisbee" ${data.hobby === 'bermain frisbee' ? 'selected' : ''}>bermain frisbee</option>
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
                <button type="button" class="button" id="save-profile" style="display: flex; justify-content: center; align-items: center; padding: 10px">Simpan</button>
                <button type="button" class="button" onclick="window.location.href='profile.html'" style="display: flex; justify-content: center; align-items: center; padding: 10px">Cancel</button>
            </form>
        </div>
    </div>`;

    $(document).ready(function() {
        $('.form-group select').selectpicker('refresh');
        document.getElementById("save-profile")?.addEventListener("click", () => save_profile(data.id));
    });
    console.log("Nilai pekerjaan:", data.occupation);
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
    console.log(`data : ${updatedData.marital_status}`)

    if (Number(updatedData.age) < 15 || Number(updatedData.age) > 70) {
        alert("umur tidak sesuai")
    } else {

    try {
        const response = await fetch(`${api_profile}/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedData)
        });
        console.log(response.status)

        if (!response.ok) {
            throw new Error(`Gagal menyimpan data: ${response.status} ${response.statusText}`);
        }

        alert("Profil berhasil diperbarui!");
        fetch_profile();
    } catch (error) {
        console.error("Error:", error);
        alert("Gagal menyimpan perubahan! ");
    }
}
}


function render_edit_password() {
    const container = document.getElementById('container');
    container.innerHTML = `
      <div class="profile-card">
        <div class="profile-container">
          <!-- Kolom Form -->
          <div class="form-column" style="flex: 1;">
            <div class="title" style="text-align: center; margin-bottom: 20px; color: #333;">
                <h1>Ganti Password</h1>
            </div>
            <form id="edit-password-form">
              <div class="form-group">
                <label>Password Lama</label>
                <input type="password" class="form-control" id="currentPassword" placeholder="Masukkan password lama">
              </div>
              <div class="form-group">
                <label>Password Baru</label>
                <input type="password" class="form-control" id="newPassword" placeholder="Masukkan password baru">
              </div>
              <button type="button" class="button" id="save-password" style="display: flex; justify-content: center; align-items: center; padding: 10px">Simpan Password</button>
              <button type="button" class="button" onclick="window.location.href='profile.html'" style="display: flex; justify-content: center; align-items: center; padding: 10px">Cancel</button>
            </form>
          </div>
          <!-- Kolom Pesan Error -->
          <div class="message-column" style="flex: 0.5; display: flex; align-items: center; justify-content: center;">
            <div id="error-message" class="error-message" style="color: red; font-weight: bold;"></div>
          </div>
        </div>
      </div>
      
    `;
    
    document.getElementById("save-password").addEventListener("click", () => save_password());
}

async function save_password() {
    const id = localStorage.getItem("id");
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    
    const payload = {
      currentPassword,
      newPassword,
    };
  
    // Ambil elemen error-message (sudah ada di layout render_edit_password)
    const errorContainer = document.getElementById("error-message");
    errorContainer.innerText = ""; // Reset pesan error sebelumnya
  
    try {
      const response = await fetch(`${api_profile}/${id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // Tampilkan pesan error ke dalam errorContainer
        errorContainer.innerText = result.message || "Terjadi kesalahan saat mengubah password.";
        return;
      }
      
      // Jika berhasil, tampilkan pesan sukses dengan gaya yang berbeda (misalnya, hijau)
      errorContainer.style.color = "green";
      errorContainer.innerText = result.message || "Password berhasil diperbarui!";
      
      // Opsional: refresh profile atau kembali ke tampilan profile setelah beberapa detik
      setTimeout(() => {
        errorContainer.innerText = "";
        errorContainer.style.color = "red"; // Reset ke warna error untuk penggunaan selanjutnya
        fetch_profile();
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      errorContainer.innerText = "Gagal menyimpan perubahan password. Silakan coba lagi.";
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