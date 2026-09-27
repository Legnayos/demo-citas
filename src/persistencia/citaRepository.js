// Acceso a datos de citas. Todo el SQL de la tabla citas vive en este módulo.
const pool = require('./db');

const CACHE_TTL_MS = 5000;
const listaCache = new Map();

function leerCache(clave) {
  const entrada = listaCache.get(clave);
  if (!entrada) return null;
  if (entrada.expiresAt <= Date.now()) {
    listaCache.delete(clave);
    return null;
  }
  return entrada.valor;
}

function guardarCache(clave, valor) {
  listaCache.set(clave, { valor, expiresAt: Date.now() + CACHE_TTL_MS });
}

async function listarTodas() {
  const cacheKey = 'citas:listarTodas';
  const cacheado = leerCache(cacheKey);
  if (cacheado) return cacheado;

  const resultado = await pool.query(
    `SELECT c.id, c.paciente, c.fecha_hora, p.nombre AS profesional
       FROM citas c
       JOIN profesionales p ON p.id = c.profesional_id
      ORDER BY c.fecha_hora`
  );

  guardarCache(cacheKey, resultado.rows);
  return resultado.rows;
}

async function guardar({ paciente, profesional_id, fecha_hora }) {
  const resultado = await pool.query(
    `INSERT INTO citas (paciente, profesional_id, fecha_hora)
     VALUES ($1, $2, $3)
     ON CONFLICT (profesional_id, fecha_hora) DO NOTHING
     RETURNING id`,
    [paciente, profesional_id, fecha_hora]
  );

  if (!resultado.rows[0]) {
    const { ErrorDeNegocio } = require('../dominio/reglasDeAgenda');
    throw new ErrorDeNegocio('AGENDA_OCUPADA', 'Ese profesional ya tiene una cita a esa hora');
  }

  listaCache.delete('citas:listarTodas');
  return resultado.rows[0].id;
}

module.exports = { listarTodas, guardar };
