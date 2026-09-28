const { ErrorValidacion, ErrorCredencialesInvalidas } = require("../../errores/errores-dominio");

/**
 * Caso de uso de login. Depende solo de PUERTOS (repositorio de usuarios,
 * generador de token) — nunca de Express, pg ni crypto directamente.
 * Esto es lo que permite testearlo con un repositorio en memoria, sin
 * levantar PostgreSQL (ver tests/iniciar-sesion.caso-uso.test.js).
 */
class IniciarSesionCasoUso {
  /**
   * @param {import('../../puertos/usuario-repositorio.puerto').UsuarioRepositorioPuerto} usuarioRepositorio
   * @param {import('../../puertos/token-generador.puerto').TokenGeneradorPuerto} tokenGenerador
   */
  constructor(usuarioRepositorio, tokenGenerador) {
    this.usuarioRepositorio = usuarioRepositorio;
    this.tokenGenerador = tokenGenerador;
  }

  async ejecutar({ correo, password }) {
    if (!correo || !password) {
      throw new ErrorValidacion("Debes enviar correo y password");
    }

    const usuario = await this.usuarioRepositorio.buscarPorCorreoYPassword(correo, password);
    if (!usuario) {
      throw new ErrorCredencialesInvalidas("Correo o contraseña incorrectos");
    }

    // Regla de negocio: la contraseña nunca sale del dominio hacia afuera.
    const { password: _passwordOculto, ...usuarioSinPassword } = usuario;

    const token = this.tokenGenerador.generar(usuario.id);

    return { token, usuario: usuarioSinPassword };
  }
}

module.exports = { IniciarSesionCasoUso };
