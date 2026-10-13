// Contrato de los repositorios: define qué métodos espera la capa de
// aplicación de sus adaptadores de persistencia. No contiene SQL ni
// importa nada de infraestructura.

/**
 * @typedef {Object} CitaRepository
 * @property {() => Promise<object[]>} listarTodas
 * @property {(cita: {paciente: string, profesional_id: number, fecha_hora: string}) => Promise<number|null>} guardar
 *   Devuelve el id creado, o null si el horario ya estaba ocupado.
 */

/**
 * @typedef {Object} ProfesionalRepository
 * @property {() => Promise<object[]>} listarTodos
 */

function exigirMetodos(nombre, objeto, metodos) {
    for (const metodo of metodos) {
      if (!objeto || typeof objeto[metodo] !== 'function') {
        throw new Error(`${nombre} debe implementar el método ${metodo}()`);
      }
    }
  }
  
  function validarCitaRepository(repositorio) {
    exigirMetodos('citaRepository', repositorio, ['listarTodas', 'guardar']);
  }
  
  function validarProfesionalRepository(repositorio) {
    exigirMetodos('profesionalRepository', repositorio, ['listarTodos']);
  }
  
  module.exports = { validarCitaRepository, validarProfesionalRepository };