const create_token = "http://212.85.26.93:3000/api/users/request-reset"
const reset_password = "http://212.85.26.93:3000/api/users/reset-password"


function render_create_token (){
    const reset_container = document.getElementById("reset-container")
    reset_container.innerHTML = 
    `
            <!-- Login Card -->
        <div class="card shadow-lg">
          <div class="card-body p-5">
            <h2 class="card-title text-center mb-4">Reset Your Password</h2>
            <!-- Login Form dengan ID "loginForm" -->
            <form id="resetform">
              <!-- Email Input -->
              <div class="mb-4">
                <label for="email" class="form-label">Email address</label>
                <input type="email" class="form-control" id="email" placeholder="enter your email address" required />
              </div>
              <!-- Submit Button -->
              <button type="submit" class="btn btn-dark btn-lg w-100 mb-3">
                Sent Token
              </button>
            </form>
          </div>
        </div>
    `;
    const form = document.getElementById("resetform");
    form.addEventListener("submit", async (event) =>{
        event.preventDefault();
        const email = document.getElementById("email").value.trim();
        if (!email){
            alert("email must be filled in");
            return;
        } 
        try {
            const response = await fetch(create_token, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            console.log(data);
            // Cek apakah respons sukses
            if (response.ok) {
                console.log("Token sudah terkirim, cek email Anda");
                alert("Token successfully sent! Please check your email.");
                render_input_token();
                
            } else {
                console.error("Gagal mengirim token:", data.message);
                alert(`Failed to send token: ${data.message || "There is an error."}`);
            }
        } catch (error) {
            console.error(`Ada error: ${error.message}`);
            alert("An error occurred while sending the token. Please try again later.");
        }
        
    })
}

function render_input_token() {
    const reset_container = document.getElementById("reset-container")
    reset_container.innerHTML = 
    `
            <!-- Login Card -->
        <div class="card shadow-lg">
          <div class="card-body p-5">
            <h2 class="card-title text-center mb-4">Reset Your Password</h2>
            <!-- Login Form dengan ID "loginForm" -->
            <form id="resetform">
              <!-- Email Input -->
              <div class="mb-4">
                <label for="email" class="form-label">Email address</label>
                <input type="email" class="form-control" id="email" placeholder="enter your email address" required />
              </div>
              <div class="mb-4">
                <label for="password" class="form-label">New Password</label>
                <input type="password" class="form-control" id="newpassword" placeholder="enter your new password" required />
              </div>
              <div class="mb-4">
                <label for="token" class="form-label">Token</label>
                <input type="text" class="form-control" id="token" placeholder="enter your token" required />
              </div>
              <!-- Submit Button -->
              <button type="submit" class="btn btn-dark btn-lg w-100 mb-3">
                Sent Token
              </button>
            </form>
          </div>
        </div>
    `;
    const form = document.getElementById("resetform");
    form.addEventListener("submit", async (event) =>{
        event.preventDefault();
        const email = document.getElementById("email").value.trim();
        const newPassword = document.getElementById("newpassword").value.trim();
        const token = document.getElementById("token").value.trim();
        if (!email || !newPassword || !token){
            alert("data must be filled in");
            return;
        } 
        try {
            const response = await fetch(reset_password, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, newPassword }),
            });
            const data = await response.json();
            // Cek apakah respons sukses
            if (response.ok) {
                console.log("Token sudah tervalidasi, password reset");
                alert("Token has been validated");
                window.location.href = "login.html"; // Redirect ke halaman login
            } else {
                console.error("Gagal mereset password:", data.message);
                alert(`Failed to reset password: ${data.message || "Terjadi kesalahan."}`);
            }
        } catch (error) {
            console.error(`Ada error: ${error.message}`);
            alert("An error occurred while resetting the password. Please try again later.");
        }
        
    })
}


function init_reset() {
    render_create_token();
}

export default init_reset;