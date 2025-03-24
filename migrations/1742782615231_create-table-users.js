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
      role: {
        type: 'VARCHAR(20)',
        notNull: true,
        default: "'user'", // default role adalah 'user'
      },
    });
};
  
exports.down = (pgm) => {
    pgm.dropTable('users');
};
  