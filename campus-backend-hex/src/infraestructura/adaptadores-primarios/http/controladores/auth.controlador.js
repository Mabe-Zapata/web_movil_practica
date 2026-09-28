/**
 * @param {import('../../../../dominio/casos-de-uso/auth/iniciar-sesion.caso-uso').IniciarSesionCasoUso} iniciarSesionCasoUso
 */
function crearControladorAuth(iniciarSesionCasoUso) {
  return {
    async login(req, res, next) {
      try {
        const body = req.body || {};
        // Alias de nombres de campo, por si el formulario del frontend
        // usa otro nombre — el dominio solo conoce { correo, password }.
        const correo = body.correo || body.usuario || body.email;
        const password = body.password || body.contrasena || body.clave;

        const resultado = await iniciarSesionCasoUso.ejecutar({ correo, password });

        res.status(200).json(resultado);
      } catch (err) {
        next(err);
      }
    },
  };
}

module.exports = { crearControladorAuth };
