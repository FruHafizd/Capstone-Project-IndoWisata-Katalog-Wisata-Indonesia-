exports.up = (pgm) => {
  pgm.createTable("user_visits", {
    id: {
      type: "SERIAL",
      primaryKey: true,
    },
    user_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: '"users"',
      onDelete: "CASCADE",
    },
    place_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: '"places"',
      onDelete: "CASCADE",
    },
    access_count: {
      type: "INTEGER",
      notNull: true,
      default: 0,
    },
  });

  // Tambahkan constraint unik pada kombinasi user_id dan place_id
  pgm.addConstraint("user_visits", "unique_user_place", {
    unique: ["user_id", "place_id"],
  });

  pgm.createIndex("user_visits", "user_id");
  pgm.createIndex("user_visits", "place_id");
};

exports.down = (pgm) => {
  pgm.dropTable("user_visits");
};
