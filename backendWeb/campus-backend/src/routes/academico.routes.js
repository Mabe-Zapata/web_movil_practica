const { Router } = require("express");
const {
  getCalificacionesEstudiante,
  getHorarioEstudiante,
} = require("../controllers/academico.controller");

const router = Router();

// GET /api/estudiantes/:id/calificaciones
router.get("/:id/calificaciones", getCalificacionesEstudiante);

// GET /api/estudiantes/:id/horario
router.get("/:id/horario", getHorarioEstudiante);

module.exports = router;
