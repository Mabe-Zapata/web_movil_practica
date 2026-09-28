const { RepositorioFirestoreBase } = require("./repositorio-firestore.base");

class CursoRepositorioFirestore extends RepositorioFirestoreBase {
  constructor() {
    super("cursos");
  }
}

module.exports = { CursoRepositorioFirestore };
