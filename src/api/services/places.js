const { Pool } = require('pg');
const { nanoid } = require('nanoid');

class PlacesService {
constructor() {
    this._pool = new Pool();
}

  // Create: Menambahkan tempat wisata baru
async addPlace({ name, category, address, rating, location, imageUrl }) {
    const id = `place_${nanoid(16)}`;
    const query = {
      text: `INSERT INTO places 
             (id, name, category_id, address, rating, location, image_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
      values: [
        id,
        name,
        category, // pastikan ini adalah ID kategori
        address,
        rating,
        JSON.stringify(location),
        imageUrl,
      ],
    };

    const result = await this._pool.query(query);
    return result.rows[0].id;
}

  // Read: Mengambil semua data tempat wisata
async getAllPlaces({ page = 1, limit = 20 } = {}) {
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 20;
    const offset = (pageNumber - 1) * limitNumber;
    
    // Query untuk mengambil data places
    const queryItems = {
      text: `
        SELECT 
          id, name, category_id, address, 
          rating::text, location, image_url
        FROM places
        ORDER BY name ASC
        LIMIT $1 OFFSET $2
      `,
      values: [limitNumber, offset],
    };
    
    const itemsResult = await this._pool.query(queryItems);
    
    // Query untuk menghitung total data places
    const queryCount = `SELECT COUNT(*) FROM places`;
    const countResult = await this._pool.query(queryCount);
    const totalItems = Number(countResult.rows[0].count);
    
    const totalPages = Math.ceil(totalItems / limitNumber);
    
    return {
      data: itemsResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        category: row.category_id,
        address: row.address,
        rating: row.rating ? parseFloat(row.rating) : null,
        location: row.location,
        imageUrl: row.image_url,
      })),
      meta: {
        page: pageNumber,
        limit: limitNumber,
        total: totalItems,
        totalPages,
      },
    };
}

  // Read: Mengambil data satu tempat wisata berdasarkan ID
async getOnePlace(id) {
    const query = {
      text: `
        SELECT 
          id, name, category_id, address, 
          rating::text, location, image_url
        FROM places 
        WHERE id = $1
      `,
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      category: row.category_id,
      address: row.address,
      rating: row.rating ? parseFloat(row.rating) : null,
      location: row.location,
      imageUrl: row.image_url,
    };
}

  // Update: Memperbarui data tempat wisata
async updatePlace(id, { name, category, address, rating, location, imageUrl }) {
    const query = {
      text: `
        UPDATE places SET
          name = $1,
          category_id = $2,
          address = $3,
          rating = $4,
          location = $5,
          image_url = $6
        WHERE id = $7
        RETURNING id
      `,
      values: [
        name,
        category,
        address,
        rating,
        JSON.stringify(location),
        imageUrl,
        id,
      ],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) return null;
    return result.rows[0].id;
}

  // Delete: Menghapus data tempat wisata
async deletePlace(id) {
    const query = {
      text: 'DELETE FROM places WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) return null;
    return result.rows[0].id;
}

async searchWisata(queryStr, { page = 1, limit = 20 } = {}) {
  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 20;
  const offset = (pageNumber - 1) * limitNumber;

  const queryItems = {
    text: `
      SELECT 
        id, name, category_id, address, 
        rating::text, location, image_url
      FROM places
      WHERE name ILIKE $1
      ORDER BY name ASC
      LIMIT $2 OFFSET $3
    `,
    values: [`%${queryStr}%`, limitNumber, offset],
  };

  const itemsResult = await this._pool.query(queryItems);

  // Menghitung total data hasil pencarian
  const queryCount = {
    text: `SELECT COUNT(*) FROM places WHERE name ILIKE $1`,
    values: [`%${queryStr}%`],
  };
  const countResult = await this._pool.query(queryCount);
  const totalItems = Number(countResult.rows[0].count);
  const totalPages = Math.ceil(totalItems / limitNumber);

  return {
    data: itemsResult.rows,
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total: totalItems,
      totalPages,
    },
  };
}

async getTopWisata() {
  const query = {
    text: `SELECT * FROM places ORDER BY rating DESC LIMIT 3`,
  };
  const result = await this._pool.query(query);
  return result.rows;
}

async getWisataByCategory(category) {
  const query = {
    text: `SELECT * FROM places WHERE category_id = $1`,
    values: [category],
  };
  const result = await this._pool.query(query);
  return result.rows;
}

}

module.exports = PlacesService;
