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
             (id, name, category, address, rating, location, imageUrl, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
             RETURNING id`,
      values: [
        id,
        name,
        category,
        address,
        rating,
        JSON.stringify(location),
        imageUrl,
      ],
    };

    const result = await this._pool.query(query);
    return result.rows[0].id;
  }

  async getAllPlaces() {
    const query = `
      SELECT 
        id, name, category, address, 
        rating::text, location, imageUrl,
        created_at, updated_at
      FROM places
    `;
    const result = await this._pool.query(query);
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      category: row.category,
      address: row.address,
      rating: row.rating ? parseFloat(row.rating) : null,
      location: row.location,  // langsung gunakan objek yang sudah dikonversi
      imageUrl: row.imageurl,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  }
  
  // Read: Mengambil data satu tempat wisata berdasarkan ID
  async getOnePlace(id) {
    const query = {
      text: `
        SELECT 
          id, name, category, address, 
          rating::text, location, imageUrl,
          created_at, updated_at 
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
      category: row.category,
      address: row.address,
      rating: row.rating ? parseFloat(row.rating) : null,
      location: row.location,  // langsung gunakan objek location
      imageUrl: row.imageurl,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  // Update: Memperbarui data tempat wisata
  async updatePlace(id, { name, category, address, rating, location, imageUrl }) {
    const query = {
      text: `
        UPDATE places SET
          name = $1,
          category = $2,
          address = $3,
          rating = $4,
          location = $5,
          imageUrl = $6,
          updated_at = NOW()
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
}

module.exports = PlacesService;
