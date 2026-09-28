const { ErrorValidacion } = require("../../errores/errores-dominio");

class ConsultarHorarioEstudianteCasoUso {
  /** @param {import('../../puertos/horario-repositorio.puerto').HorarioRepositorioPuerto} horarioRepositorio */
  constructor(horarioRepositorio) {
    this.horarioRepositorio = horarioRepositorio;
  }

  async ejecutar(estudianteId) {
    if (!Number.isInteger(estudianteId)) {
      throw new ErrorValidacion("id de estudiante inválido");
    }

    const horario = await this.horarioRepositorio.listarPorEstudianteConCurso(estudianteId);
    return { estudianteId, horario };
  }
}

module.exports = { ConsultarHorarioEstudianteCasoUso };
