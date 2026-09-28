const { ErrorValidacion } = require("../../errores/errores-dominio");

/**
 * Caso de uso de la vista académica del estudiante. El JOIN con `cursos`
 * es detalle de persistencia (vive en el puerto/adaptador), pero calcular
 * el promedio SÍ es una regla de negocio — por eso vive aquí, en el
 * dominio, y no en una query SQL ni en el controlador HTTP. Si mañana el
 * promedio deja de ser un simple promedio aritmético (p. ej. se pondera
 * por créditos del curso), este es el único lugar que cambia.
 */
class ConsultarCalificacionesEstudianteCasoUso {
  /** @param {import('../../puertos/calificacion-repositorio.puerto').CalificacionRepositorioPuerto} calificacionRepositorio */
  constructor(calificacionRepositorio) {
    this.calificacionRepositorio = calificacionRepositorio;
  }

  async ejecutar(estudianteId) {
    if (!Number.isInteger(estudianteId)) {
      throw new ErrorValidacion("id de estudiante inválido");
    }

    const calificaciones = await this.calificacionRepositorio.listarPorEstudianteConCurso(estudianteId);

    const promedio =
      calificaciones.length === 0
        ? 0
        : Math.round((calificaciones.reduce((acc, c) => acc + c.nota, 0) / calificaciones.length) * 100) / 100;

    return { estudianteId, promedio, calificaciones };
  }
}

module.exports = { ConsultarCalificacionesEstudianteCasoUso };
