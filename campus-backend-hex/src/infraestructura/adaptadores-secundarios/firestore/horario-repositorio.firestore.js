const { db } = require("../../firebase-admin");
const { RepositorioFirestoreBase } = require("./repositorio-firestore.base");

/**
 * Horario en Firestore:
 * - estudiante_id es el ID del estudiante (string)
 * - Los datos del curso (nombre, profesor, categoria) se guardan desnormalizados
 *   para evitar JOINs en consultas de lectura.
 */
class HorarioRepositorioFirestore extends RepositorioFirestoreBase {
  constructor() {
    super("horario");
  }

  async listarPorEstudianteConCurso(estudianteId) {
    const snapshot = await db
      .collection("horario")
      .where("estudianteId", "==", String(estudianteId))
      .orderBy("fecha")
      .orderBy("horaInicio")
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        dia: data.dia,
        fecha: data.fecha,
        horaInicio: data.horaInicio,
        horaFin: data.horaFin,
        curso: data.cursoNombre,
        profesor: data.cursoProfesor,
        categoria: data.cursoCategoria,
      };
    });
  }
}

module.exports = { HorarioRepositorioFirestore };
