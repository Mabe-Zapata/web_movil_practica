const { db } = require("../../firebase-admin");
const { RepositorioFirestoreBase } = require("./repositorio-firestore.base");

class UsuarioRepositorioFirestore extends RepositorioFirestoreBase {
  constructor() {
    super("usuarios");
  }

  async buscarPorCorreoYPassword(correo, password) {
    const snapshot = await db
      .collection("usuarios")
      .where("correo", "==", correo)
      .where("password", "==", password)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }
}

module.exports = { UsuarioRepositorioFirestore };
