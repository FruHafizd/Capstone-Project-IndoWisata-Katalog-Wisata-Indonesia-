const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");

class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  async getAllUsers() {
    const query = {
      text: `SELECT 
               id, 
               name, 
               email, 
               role, 
               age, 
               occupation, 
               marital_status, 
               hobby 
             FROM users`,
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

  async addUser({
    name,
    email,
    password,
    role,
    age,
    occupation,
    marital_status,
    hobby,
  }) {
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
      text: `SELECT 
        id, 
        name, 
        email, 
        role, 
        age, 
        occupation, 
        marital_status, 
        hobby 
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

    // Build dynamic query
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
      text: `UPDATE users 
        SET ${fieldNames.join(", ")} 
        WHERE id = $${counter} 
        RETURNING id`,
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
}

module.exports = UsersService;
