const { RepositorioPostgresBase } = require("./repositorio-postgres.base");

/** Implementa CursoRepositorioPuerto — es CRUD puro, nada especial que agregar. */
class CursoRepositorioPostgres extends RepositorioPostgresBase {
  constructor() {
    super("cursos");
  }
}

module.exports = { CursoRepositorioPostgres };
