exports.up = (pgm) => {
  pgm.createTable('users', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    nama: {
      type: 'VARCHAR(100)',
      notNull: true,
    },
    email: {
      type: 'VARCHAR(100)',
      notNull: true,
      unique: true,
    },
    password: {
      type: 'VARCHAR(255)',
      notNull: true,
    },
    hobby: {
      type: 'TEXT',
      notNull: false,
    },
    usia: {
      type: 'INTEGER',
      notNull: false,
    },
    pekerjaan: {
      type: 'VARCHAR(100)',
      notNull: false,
    },
    status_nikah: {
      type: 'VARCHAR(20)',
      notNull: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('users');
};
