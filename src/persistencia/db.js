// Conexión a Postgres. Soporta Supabase y desarrollo local sin depender
// de que exista una .env en el primer arranque del proyecto.
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';
const isLocalDevelopment = !connectionString.includes('supabase') && !connectionString.includes('sslmode=require');

const pool = new Pool({
  connectionString,
  ssl: isLocalDevelopment ? false : { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 15000,
  connectionTimeoutMillis: 2000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 1000,
});

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL no está definido; usando configuración local por defecto: postgres@localhost:5432/postgres');
}

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PG:', err);
});

module.exports = pool;