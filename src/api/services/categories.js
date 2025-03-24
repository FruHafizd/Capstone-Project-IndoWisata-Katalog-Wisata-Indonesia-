const { Pool } = require('pg');
const { nanoid } = require('nanoid');

class CategoriesService {
constructor() {
    this._pool = new Pool();
}

  // Create: Menambahkan kategori baru
async addCategory({ name }) {
    const id = `cat_${nanoid(16)}`;
    const query = {
      text: `INSERT INTO categories (id, name) VALUES ($1, $2) RETURNING id`,
      values: [id, name],
    };

    const result = await this._pool.query(query);
    return result.rows[0].id;
}

  // Read: Mengambil semua data kategori
async getAllCategories() {
    const query = `
      SELECT id, name
      FROM categories
      ORDER BY name ASC
    `;
    const result = await this._pool.query(query);
    return result.rows;
}

  // Read: Mengambil data satu kategori berdasarkan ID
async getOneCategory(id) {
    const query = {
      text: `SELECT id, name FROM categories WHERE id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) return null;
    return result.rows[0];
}

  // Update: Memperbarui data kategori
async updateCategory(id, { name }) {
    const query = {
      text: `
        UPDATE categories SET
          name = $1
        WHERE id = $2
        RETURNING id
      `,
      values: [name, id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) return null;
    return result.rows[0].id;
}

  // Delete: Menghapus data kategori
async deleteCategory(id) {
    const query = {
      text: 'DELETE FROM categories WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) return null;
    return result.rows[0].id;
}

}

module.exports = CategoriesService;
