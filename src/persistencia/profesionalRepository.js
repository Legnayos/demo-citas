// Acceso a datos del catálogo de profesionales.
const pool = require('./db');

const CACHE_TTL_MS = 60000;
const cache = new Map();

function leerCache(clave) {
  const entrada = cache.get(clave);
  if (!entrada) return null;
  if (entrada.expiresAt <= Date.now()) {
    cache.delete(clave);
    return null;
  }
  return entrada.valor;
}

function guardarCache(clave, valor) {
  cache.set(clave, { valor, expiresAt: Date.now() + CACHE_TTL_MS });
}

async function listarTodos() {
  const cacheKey = 'profesionales:listarTodos';
  const cacheado = leerCache(cacheKey);
  if (cacheado) return cacheado;

  const resultado = await pool.query(
    'SELECT id, nombre, especialidad FROM profesionales ORDER BY nombre'
  );

  guardarCache(cacheKey, resultado.rows);
  return resultado.rows;
}

module.exports = { listarTodos };
