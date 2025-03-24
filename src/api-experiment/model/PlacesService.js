const { Pool } = require('pg');
const { nanoid } = require('nanoid');

class PlacesService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlace({ 
    name, 
    category, 
    address, 
    rating, 
    location, 
    imageUrl // Region dihapus
  }) {
    const id = `place_${nanoid(16)}`;
    const query = {
      text: `INSERT INTO places VALUES(
        $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
      ) RETURNING id`,
      values: [
        id,
        name,
        category,
        address,
        rating,
        JSON.stringify(location),
        imageUrl
      ],
    };

    const result = await this._pool.query(query);
    return result.rows[0].id;
  }

  async getAllPlaces() {
    const result = await this._pool.query(`
      SELECT 
        id, name, category, address, 
        rating::text, location, imageUrl,
        created_at, updated_at
      FROM places
    `);

    return result.rows.map(row => ({
      ...row,
      rating: row.rating ? parseFloat(row.rating) : null,
      location: JSON.parse(row.location)
    }));
  }

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

    return {
      ...result.rows[0],
      rating: result.rows[0].rating ? parseFloat(result.rows[0].rating) : null,
      location: JSON.parse(result.rows[0].location)
    };
  }

  async updatePlace(id, { 
    name, 
    category, 
    address, 
    rating, 
    location, 
    imageUrl // Region dihapus
  }) {
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
        id
      ],
    };

    const result = await this._pool.query(query);
    return result.rows[0].id;
  }

  async deletePlace(id) {
    const query = {
      text: 'DELETE FROM places WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    return result.rows[0].id;
  }
}

module.exports = PlacesService;