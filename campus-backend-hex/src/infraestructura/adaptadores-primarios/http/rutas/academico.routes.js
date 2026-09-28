const { Router } = require("express");

/** @param {ReturnType<typeof import('../controladores/academico.controlador').crearControladorAcademico>} controlador */
function crearRutasAcademico(controlador) {
  const router = Router();
  router.get("/:id/calificaciones", controlador.calificaciones);
  router.get("/:id/horario", controlador.horario);
  return router;
}

module.exports = { crearRutasAcademico };
