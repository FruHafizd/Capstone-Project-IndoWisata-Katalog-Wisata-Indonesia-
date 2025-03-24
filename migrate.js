// migrate.js
require('dotenv').config();
const { default: migrate } = require('node-pg-migrate');

const runMigrations = async () => {
  await migrate({
    databaseUrl: {
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      ssl: { rejectUnauthorized: false }
    },
    migrationsTable: 'pgmigrations',
    dir: 'migrations',
    direction: 'up',
    count: Infinity,
    verbose: true
  });
};

runMigrations().then(() => {
  console.log('✅ Migrasi selesai');
}).catch((err) => {
  console.error('❌ Gagal migrasi:', err);
});