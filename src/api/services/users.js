const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');

class UsersService {

constructor() {
    this._pool = new Pool();
}

  // Create: Menambahkan user baru
async addUser({ name, email, password, role }) {
    const id = `user_${nanoid(16)}`;
    // Hash password dengan bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = {
      text: `INSERT INTO users (id, name, email, password, role)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
      values: [id, name, email, hashedPassword, role || 'user'],
    };

    const result = await this._pool.query(query);
    return result.rows[0].id;
}

  // Read: Mengambil semua user (tanpa password)
async getAllUsers() {
    const query = `SELECT id, name, email, role FROM users`;
    const result = await this._pool.query(query);
    return result.rows;
}

  // Read: Mengambil detail user berdasarkan ID (tanpa password)
async getUserById(id) {
    const query = {
      text: `SELECT id, name, email, role FROM users WHERE id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) return null;
    return result.rows[0];
}

  // Update: Memperbarui data user (jika ada perubahan pada nama, email, password, atau role)
async updateUser(id, { name, email, password, role }) {
    let hashedPassword = undefined;
    if (password) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    const query = {
      text: `
        UPDATE users SET
          name = COALESCE($1, name),
          email = COALESCE($2, email),
          password = COALESCE($3, password),
          role = COALESCE($4, role)
        WHERE id = $5
        RETURNING id
      `,
      values: [name, email, hashedPassword, role, id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) return null;
    return result.rows[0].id;
}

  // Delete: Menghapus user berdasarkan ID
async deleteUser(id) {
    const query = {
      text: `DELETE FROM users WHERE id = $1 RETURNING id`,
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) return null;
    return result.rows[0].id;
  }
}

module.exports = UsersService;
