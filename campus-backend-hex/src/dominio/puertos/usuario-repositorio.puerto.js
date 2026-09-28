const { RepositorioPuerto } = require("./repositorio.puerto");

/**
 * Además del CRUD genérico, el repositorio de usuarios necesita poder
 * buscar por credenciales — eso es lo único "especial" que el dominio
 * de autenticación requiere del adaptador de persistencia.
 */
class UsuarioRepositorioPuerto extends RepositorioPuerto {
  async buscarPorCorreoYPassword(correo, password) {
    throw new Error("UsuarioRepositorioPuerto.buscarPorCorreoYPassword no implementado");
  }
}

module.exports = { UsuarioRepositorioPuerto };
