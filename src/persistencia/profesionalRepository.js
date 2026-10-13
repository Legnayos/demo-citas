// Adaptador PostgreSQL del catálogo de profesionales.
// Recibe el pool por inyección: este módulo ya no importa db.js.

function crearProfesionalRepository({ pool }) {
  const CACHE_TTL_MS = 60000;
  const CACHE_KEY = 'profesionales:listarTodos';
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
    const cacheado = leerCache(CACHE_KEY);
    if (cacheado) return cacheado;

    const resultado = await pool.query(
      'SELECT id, nombre, especialidad FROM profesionales ORDER BY nombre'
    );

    guardarCache(CACHE_KEY, resultado.rows);
    return resultado.rows;
  }

  return { listarTodos };
}

module.exports = { crearProfesionalRepository };