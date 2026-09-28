const { RepositorioPuerto } = require("./repositorio.puerto");

/**
 * Igual que en calificaciones: la vista académica del estudiante necesita
 * el horario ya enriquecido con nombre de curso, profesor y categoría.
 */
class HorarioRepositorioPuerto extends RepositorioPuerto {
  /**
   * @param {number} estudianteId
   * @returns {Promise<Array<{dia, fecha, horaInicio, horaFin, curso, profesor, categoria}>>}
   */
  async listarPorEstudianteConCurso(estudianteId) {
    throw new Error("HorarioRepositorioPuerto.listarPorEstudianteConCurso no implementado");
  }
}

module.exports = { HorarioRepositorioPuerto };
