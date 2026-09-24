// Conexión a Postgres (Supabase). La cadena llega por variable de entorno
// para no versionar credenciales; ver .env.example.
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Supabase exige TLS
  max: 20,                        // máximo de conexiones simultáneas del pool
  idleTimeoutMillis: 30000,       // cierra conexiones ociosas tras 30s
  connectionTimeoutMillis: 5000,  // falla rápido si no hay conexión libre en 5s
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PG:', err);
});

module.exports = pool;