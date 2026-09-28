const { RepositorioPuerto } = require("./repositorio.puerto");

/**
 * Además del CRUD genérico, la vista académica del estudiante necesita
 * las calificaciones ya "enriquecidas" con el nombre del curso y el
 * profesor — ese JOIN es detalle de persistencia, así que vive aquí
 * como parte del contrato del puerto, no en el caso de uso.
 */
class CalificacionRepositorioPuerto extends RepositorioPuerto {
  /**
   * @param {number} estudianteId
   * @returns {Promise<Array<{curso: string, profesor: string, nota: number}>>}
   */
  async listarPorEstudianteConCurso(estudianteId) {
    throw new Error("CalificacionRepositorioPuerto.listarPorEstudianteConCurso no implementado");
  }
}

module.exports = { CalificacionRepositorioPuerto };
