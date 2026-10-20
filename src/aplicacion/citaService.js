// Casos de uso de citas: coordinan las reglas del dominio y los repositorios.
// Recibe los repositorios por inyección: este módulo ya no importa
// persistencia ni db.js. Solo depende del dominio y del contrato.
const reglas = require('../dominio/reglasDeAgenda');
const {
  validarCitaRepository,
  validarProfesionalRepository,
} = require('./contratos/repositorios');

function normalizarDatos({ paciente, profesional_id, fecha_hora }) {
  return {
    paciente: typeof paciente === 'string' ? paciente.trim() : paciente,
    profesional_id: Number(profesional_id),
    fecha_hora,
  };
}

function crearCitaService({ citaRepository, profesionalRepository, reloj = () => new Date() }) {
  validarCitaRepository(citaRepository);
  validarProfesionalRepository(profesionalRepository);

  async function consultarCitas() {
    return citaRepository.listarTodas();
  }

  async function consultarProfesionales() {
    return profesionalRepository.listarTodos();
  }

    async function reservarCita(datos) {
    const entrada = normalizarDatos(datos);
    reglas.validarDatosCompletos(entrada);
    reglas.validarFechaFutura(entrada.fecha_hora, reloj());

    const ocupado = await citaRepository.existeEnHorario(
      entrada.profesional_id, entrada.fecha_hora
    );
    reglas.validarAgendaLibre(ocupado);

    const id = await citaRepository.guardar(entrada);
    // Respaldo ante carrera: otro insert ganó entre la consulta y el guardado.
    reglas.validarAgendaLibre(id === null);
    return { mensaje: 'Cita creada', id };
  }

  return { consultarCitas, consultarProfesionales, reservarCita };
}

module.exports = { crearCitaService };