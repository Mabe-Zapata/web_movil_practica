const { Router } = require("express");

/** @param {ReturnType<typeof import('../controladores/auth.controlador').crearControladorAuth>} controlador */
function crearRutasAuth(controlador) {
  const router = Router();
  router.post("/", controlador.login);
  return router;
}

module.exports = { crearRutasAuth };
