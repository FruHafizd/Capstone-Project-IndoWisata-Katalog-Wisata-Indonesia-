exports.up = (pgm) => {
    pgm.createTable('places', {
      id: {
        type: 'VARCHAR(50)',
        primaryKey: true,
      },
      name: {
        type: 'VARCHAR(100)',
        notNull: true,
      },
      category_id: {
        type: 'VARCHAR(50)',
        notNull: true,
        references: 'categories', // mengacu ke tabel categories
        onDelete: 'cascade',
      },
      address: {
        type: 'TEXT',
        notNull: true,
      },
      rating: {
        type: 'NUMERIC',
      },
      location: {
        type: 'JSONB',
        notNull: true,
      },
      imageUrl: {
        type: 'TEXT',
      },
    });
};
  
exports.down = (pgm) => {
    pgm.dropTable('places');
};
  