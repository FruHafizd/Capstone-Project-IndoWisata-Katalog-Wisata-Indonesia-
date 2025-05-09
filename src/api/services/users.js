const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const ClientError = require("../../errors/client-error");
const nodemailer = require("nodemailer");


class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  async getAllUsers() {
    const query = {
      text: `SELECT id, name, email, role, age, occupation, marital_status, hobby FROM users`,
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async verifyNewEmail(email) {
    const query = {
      text: "SELECT email FROM users WHERE email = $1",
      values: [email],
    };

    const result = await this._pool.query(query);
    if (result.rowCount > 0) {
      throw new Error("Email sudah terdaftar");
    }
  }

  async addUser({ name, email, password, role, age, occupation, marital_status, hobby }) {
    await this.verifyNewEmail(email);

    const id = `user_${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 12);

    const query = {
      text: `INSERT INTO users 
        (id, name, email, password, role, age, occupation, marital_status, hobby)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING id`,
      values: [
        id,
        name,
        email,
        hashedPassword,
        role || "user",
        age,
        occupation,
        marital_status,
        hobby,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new Error("Failed to add user");
    }

    return result.rows[0].id;
  }

  async getUserByEmail(email) {
    const query = {
      text: 'SELECT * FROM users WHERE email = $1',
      values: [email],
    };
    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async getUserById(id) {
    const query = {
      text: `SELECT id, name, email, role, age, occupation, marital_status, hobby 
             FROM users WHERE id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new Error("User tidak ditemukan");
    }
    return result.rows[0];
  }

  async updateUser(id, updatedFields) {
    const fieldNames = [];
    const fieldValues = [];
    let counter = 1;

    for (const [key, value] of Object.entries(updatedFields)) {
      if (key === "password" && value) {
        const hashedPassword = await bcrypt.hash(value, 12);
        fieldNames.push(`${key} = $${counter}`);
        fieldValues.push(hashedPassword);
      } else {
        fieldNames.push(`${key} = $${counter}`);
        fieldValues.push(value);
      }
      counter++;
    }

    const query = {
      text: `UPDATE users SET ${fieldNames.join(", ")} WHERE id = $${counter} RETURNING id`,
      values: [...fieldValues, id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new Error("Gagal memperbarui user");
    }
    return result.rows[0].id;
  }

  async deleteUser(id) {
    const query = {
      text: "DELETE FROM users WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new Error("User tidak ditemukan");
    }
    return result.rows[0].id;
  }

  async updatePassword(id, currentPassword, newPassword) {
    // Ambil data user berdasarkan id
    const queryUser = {
      text: 'SELECT password FROM users WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(queryUser);
    if (!result.rowCount) {
      throw new Error("User tidak ditemukan");
    }
    const user = result.rows[0];
    
    // Verifikasi password lama
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      // Lempar error dengan pesan yang sesuai
      throw new Error("Password lama tidak valid");
    }
    
    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password di database
    const queryUpdate = {
      text: 'UPDATE users SET password = $1 WHERE id = $2 RETURNING id',
      values: [hashedPassword, id],
    };
    const updateResult = await this._pool.query(queryUpdate);
    if (!updateResult.rowCount) {
      throw new Error("Gagal memperbarui password");
    }
    return updateResult.rows[0].id;
  }

  // reset password

  async resetPassword(email, token, newPassword) {
    const user = await this.getUserByEmail(email);
    if (!user) {
        throw new Error("Email tidak ditemukan");
    }
    
    console.log("User ditemukan:", user);
    console.log("Stored Token di DB:", user.reset_token);
    console.log("Input Token:", token);

    // Cek apakah token cocok
    if (!user.reset_token || user.reset_token !== token.toString()) {
        throw new Error("Token tidak valid atau telah kedaluwarsa");
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password di database
    const query = {
        text: "UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE email = $2 RETURNING id",
        values: [hashedPassword, email],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
        throw new Error("Gagal mereset password");
    }

    return result.rows[0].id;
}



  async _sendResetEmail(email, token) {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Reset Password Anda",
        text: `Token reset password anda adalah ${token}`,
    };

    console.log("📧 Mengirim email ke:", email);
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email berhasil dikirim:", info.response);
    } catch (error) {
        console.error("❌ Gagal mengirim email:", error);
    }
}
  async storeResetToken(email, token) {
    console.log("Menyimpan token untuk:", email); // Debugging

    const query = {
        text: "UPDATE users SET reset_token = $1, reset_token_expiry = NOW() + INTERVAL '1 hour' WHERE email = $2 RETURNING id",
        values: [token, email],
    };

    const result = await this._pool.query(query);

    console.log("Hasil Query:", result.rows); // Debugging

    if (!result.rowCount) {
        throw new Error("Email tidak ditemukan");
    }

    return result.rows[0].id;
}
async verifyToken(email, token) {
  const query = {
    text: "SELECT reset_token, reset_token_expiry FROM users WHERE email = $1",
    values: [email],
  };

  const result = await this._pool.query(query);

  if (result.rowCount === 0) {
    throw new Error("Email tidak ditemukan");
  }

  const { reset_token, reset_token_expiry } = result.rows[0];

  console.log("Stored Token di DB:", reset_token);
  console.log("Input Token:", token);

  // Cek apakah token cocok
  if (!reset_token || reset_token !== token.toString()) {
    throw new Error("Token tidak valid atau telah kedaluwarsa");
  }

  // Cek apakah token sudah kedaluwarsa
  if (new Date(reset_token_expiry) < new Date()) {
    throw new Error("Token sudah kedaluwarsa");
  }

  return { status: "success", message: "Token valid" };
}


  

}

module.exports = UsersService;
