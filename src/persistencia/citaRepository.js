// Acceso a datos de citas. Todo el SQL de la tabla citas vive en este módulo.
const pool = require('./db');

async function listarTodas() {
  const resultado = await pool.query(
    `SELECT c.id, c.paciente, c.fecha_hora, p.nombre AS profesional
       FROM citas c
       JOIN profesionales p ON p.id = c.profesional_id
      ORDER BY c.fecha_hora`
  );
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

  return resultado.rows[0].id;
}

module.exports = { listarTodas, guardar };
