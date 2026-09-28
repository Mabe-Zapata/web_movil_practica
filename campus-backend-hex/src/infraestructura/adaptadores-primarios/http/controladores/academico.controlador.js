/**
 * @param {import('../../../../dominio/casos-de-uso/academico/consultar-calificaciones-estudiante.caso-uso').ConsultarCalificacionesEstudianteCasoUso} consultarCalificacionesCasoUso
 * @param {import('../../../../dominio/casos-de-uso/academico/consultar-horario-estudiante.caso-uso').ConsultarHorarioEstudianteCasoUso} consultarHorarioCasoUso
 */
function crearControladorAcademico(consultarCalificacionesCasoUso, consultarHorarioCasoUso) {
  return {
    async calificaciones(req, res, next) {
      try {
        const estudianteId = Number(req.params.id);
        const resultado = await consultarCalificacionesCasoUso.ejecutar(estudianteId);
        res.json(resultado);
      } catch (err) {
        next(err);
      }
    },

    async horario(req, res, next) {
      try {
        const estudianteId = Number(req.params.id);
        const resultado = await consultarHorarioCasoUso.ejecutar(estudianteId);
        res.json(resultado);
      } catch (err) {
        next(err);
      }
    },
  };
}

module.exports = { crearControladorAcademico };
