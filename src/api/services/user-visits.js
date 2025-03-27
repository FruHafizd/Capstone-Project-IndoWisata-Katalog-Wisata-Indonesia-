const { Pool } = require("pg");

class UserVisitsService {
  constructor() {
    this._pool = new Pool();
  }

  async updateUserVisit({ userId, placeId }) {
    const query = {
      text: `
        INSERT INTO user_visits (user_id, place_id, access_count)
        VALUES ($1, $2, 1)
        ON CONFLICT (user_id, place_id)
        DO UPDATE SET access_count = user_visits.access_count + 1
        RETURNING id, access_count;
      `,
      values: [userId, placeId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new Error("Gagal memperbarui data user visit");
    }

    return result.rows[0];
  }

  // Method baru untuk mengambil data teragregasi
  async getAggregatedUserVisits() {
    const query = {
      text: `
        SELECT
          u.id,
          u.name,
          json_object_agg(p.name, uv.access_count) AS visits
        FROM users u
        JOIN user_visits uv ON u.id = uv.user_id
        JOIN places p ON uv.place_id = p.id
        GROUP BY u.id, u.name;
      `,
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = UserVisitsService;
