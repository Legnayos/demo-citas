// Casos de uso de citas: coordinan las reglas del dominio y los repositorios.
const reglas = require('../dominio/reglasDeAgenda');
const citaRepository = require('../persistencia/citaRepository');
const profesionalRepository = require('../persistencia/profesionalRepository');

function normalizarDatos({ paciente, profesional_id, fecha_hora }) {
  return {
    paciente: typeof paciente === 'string' ? paciente.trim() : paciente,
    profesional_id: Number(profesional_id),
    fecha_hora,
  };
}

async function consultarCitas() {
  return citaRepository.listarTodas();
}

async function consultarProfesionales() {
  return profesionalRepository.listarTodos();
}

async function reservarCita(datos) {
  const entrada = normalizarDatos(datos);
  reglas.validarDatosCompletos(entrada);
  reglas.validarFechaFutura(entrada.fecha_hora);

  const id = await citaRepository.guardar(entrada);
  return { mensaje: 'Cita creada', id };
}

module.exports = { consultarCitas, consultarProfesionales, reservarCita };
