const { pool } = require("./pool");
const { rowToCamel } = require("./case-mapper.util");
const { RepositorioPostgresBase } = require("./repositorio-postgres.base");

/**
 * Implementa UsuarioRepositorioPuerto con PostgreSQL (por duck typing:
 * JS no tiene "implements", así que cumplir el contrato es exponer los
 * mismos métodos). Hereda el CRUD genérico de RepositorioPostgresBase y
 * solo agrega la búsqueda por credenciales que necesita el login.
 */
class UsuarioRepositorioPostgres extends RepositorioPostgresBase {
  constructor() {
    super("usuarios");
  }

  async buscarPorCorreoYPassword(correo, password) {
    const resultado = await pool.query(
      "SELECT * FROM usuarios WHERE correo = $1 AND password = $2",
      [correo, password]
    );
    return resultado.rows.length ? rowToCamel(resultado.rows[0]) : null;
  }
}

module.exports = { UsuarioRepositorioPostgres };
