exports.up = (pgm) => {
  pgm.createTable('users', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
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
    age: {
      type: 'INTEGER',
      notNull: false,
    },
    occupation: {
      type: 'VARCHAR(100)',
      notNull: false,
    },
    marital_status: {
      type: 'VARCHAR(20)',
      notNull: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('users');
};
