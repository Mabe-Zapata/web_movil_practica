const { db } = require("../../firebase-admin");
const { RepositorioFirestoreBase } = require("./repositorio-firestore.base");

/**
 * Calificaciones en Firestore:
 * - estudiante_id es el ID del estudiante (string)
 * - Los datos del curso (nombre, profesor) se guardan desnormalizados
 *   para evitar JOINs en consultas de lectura.
 */
class CalificacionRepositorioFirestore extends RepositorioFirestoreBase {
  constructor() {
    super("calificaciones");
  }

  async listarPorEstudianteConCurso(estudianteId) {
    const snapshot = await db
      .collection("calificaciones")
      .where("estudianteId", "==", String(estudianteId))
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        curso: data.cursoNombre,
        profesor: data.cursoProfesor,
        nota: Number(data.nota),
      };
    });
  }
}

module.exports = { CalificacionRepositorioFirestore };
