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
    role: {
      type: 'VARCHAR(20)',
      notNull: true,
      default: "'user'",
    },
    // Tambahan kolom untuk security
    created_at: {
      type: 'TIMESTAMPTZ',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    password_changed_at: {
      type: 'TIMESTAMPTZ',
      notNull: false,
    },
    failed_login_attempts: {
      type: 'INTEGER',
      notNull: true,
      default: 0,
    },
    locked_until: {
      type: 'TIMESTAMPTZ',
      notNull: false,
    },
    refresh_token: {
      type: 'TEXT',
      notNull: false,
    },
    last_login: {
      type: 'TIMESTAMPTZ',
      notNull: false,
    }
  });

  // Tambahan index untuk optimasi query
  pgm.createIndex('users', 'created_at');
  pgm.createIndex('users', 'locked_until');
};

exports.down = (pgm) => {
  pgm.dropTable('users');
};