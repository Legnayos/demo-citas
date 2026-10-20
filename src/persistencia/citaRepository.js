// Adaptador PostgreSQL de citas. Todo el SQL de la tabla citas vive aquí.
// Recibe el pool por inyección: este módulo ya no importa db.js.

function crearCitaRepository({ pool }) {
  const CACHE_TTL_MS = 5000;
  const CACHE_KEY = 'citas:listarTodas';
  const cache = new Map();

  async function existeEnHorario(profesional_id, fecha_hora) {
    const resultado = await pool.query(
      'SELECT 1 FROM citas WHERE profesional_id = $1 AND fecha_hora = $2 LIMIT 1',
      [profesional_id, fecha_hora]
    );
    return resultado.rowCount > 0;
  }

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

  async function listarTodas() {
    const cacheado = leerCache(CACHE_KEY);
    if (cacheado) return cacheado;

    const resultado = await pool.query(
      `SELECT c.id, c.paciente, c.fecha_hora, p.nombre AS profesional
         FROM citas c
         JOIN profesionales p ON p.id = c.profesional_id
        ORDER BY c.fecha_hora`
    );

    guardarCache(CACHE_KEY, resultado.rows);
    return resultado.rows;
  }

  // Devuelve el id creado, o null si el horario ya estaba ocupado.
  // La decisión de negocio (lanzar el error) la toma el servicio.
  async function guardar({ paciente, profesional_id, fecha_hora }) {
    const resultado = await pool.query(
      `INSERT INTO citas (paciente, profesional_id, fecha_hora)
       VALUES ($1, $2, $3)
       ON CONFLICT (profesional_id, fecha_hora) DO NOTHING
       RETURNING id`,
      [paciente, profesional_id, fecha_hora]
    );

    if (!resultado.rows[0]) return null;

    cache.delete(CACHE_KEY);
    return resultado.rows[0].id;
  }

  return { listarTodas, existeEnHorario, guardar };
}

module.exports = { crearCitaRepository };