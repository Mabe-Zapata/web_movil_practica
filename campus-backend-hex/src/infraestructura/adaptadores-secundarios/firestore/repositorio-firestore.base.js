/**
 * Base genérica para repositorios Firestore.
 * Provee CRUD estándar sobre una colección.
 */
const { db } = require("../../firebase-admin");

class RepositorioFirestoreBase {
  constructor(coleccion) {
    this.coleccion = coleccion;
  }

  async listar(filtros = {}) {
    let query = db.collection(this.coleccion);
    
    // Aplicar filtros si existen
    for (const [key, value] of Object.entries(filtros)) {
      if (value !== undefined && value !== null) {
        query = query.where(key, "==", value);
      }
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async obtenerTodos() {
    const snapshot = await db.collection(this.coleccion).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async obtenerPorId(id) {
    const doc = await db.collection(this.coleccion).doc(String(id)).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async crear(datos) {
    // Mantiene el ID numérico como string si viene en datos
    const id = datos.id ? String(datos.id) : null;
    const docRef = id
      ? db.collection(this.coleccion).doc(id)
      : db.collection(this.coleccion).doc();
    await docRef.set(datos);
    return { id: docRef.id, ...datos };
  }

  async actualizar(id, datos) {
    const docRef = db.collection(this.coleccion).doc(String(id));
    await docRef.update(datos);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
  }

  async eliminar(id) {
    await db.collection(this.coleccion).doc(String(id)).delete();
    return true;
  }
}

module.exports = { RepositorioFirestoreBase };
