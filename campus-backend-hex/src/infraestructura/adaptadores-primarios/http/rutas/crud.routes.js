const { Router } = require("express");

/** @param {ReturnType<typeof import('../controladores/recurso.controlador').crearControladorRecurso>} controlador */
function crearRutasCrud(controlador) {
  const router = Router();
  router.get("/", controlador.listar);
  router.get("/:id", controlador.obtenerPorId);
  router.post("/", controlador.crear);
  router.put("/:id", controlador.actualizar);
  router.patch("/:id", controlador.actualizar);
  router.delete("/:id", controlador.eliminar);
  return router;
}

module.exports = { crearRutasCrud };
