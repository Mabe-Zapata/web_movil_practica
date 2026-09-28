const { query } = require("../config/db");

/**
 * GET /api/estudiantes/:id/calificaciones
 * Devuelve { estudianteId, promedio, calificaciones: [{ curso, profesor, nota }] }
 * — el "join" de calificaciones + cursos que espera AcademicoLecturaHttp.
 */
async function getCalificacionesEstudiante(req, res, next) {
  try {
    const estudianteId = Number(req.params.id);

    if (!Number.isInteger(estudianteId)) {
      return res.status(400).json({ error: "id de estudiante inválido" });
    }

    const result = await query(
      `SELECT c.nombre AS curso, c.profesor AS profesor, cal.nota AS nota
       FROM calificaciones cal
       JOIN cursos c ON c.id = cal.curso_id
       WHERE cal.estudiante_id = $1
       ORDER BY cal.id ASC`,
      [estudianteId]
    );

    const calificaciones = result.rows.map((r) => ({
      curso: r.curso,
      profesor: r.profesor,
      nota: Number(r.nota),
    }));

    const promedio =
      calificaciones.length === 0
        ? 0
        : Math.round(
            (calificaciones.reduce((acc, c) => acc + c.nota, 0) / calificaciones.length) * 100
          ) / 100;

    res.json({ estudianteId, promedio, calificaciones });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/estudiantes/:id/horario
 * Devuelve { estudianteId, horario: [{ dia, fecha, horaInicio, horaFin, curso, profesor, categoria }] }
 */
async function getHorarioEstudiante(req, res, next) {
  try {
    const estudianteId = Number(req.params.id);

    if (!Number.isInteger(estudianteId)) {
      return res.status(400).json({ error: "id de estudiante inválido" });
    }

    const result = await query(
      `SELECT h.dia AS dia,
              h.fecha AS fecha,
              h.hora_inicio AS "horaInicio",
              h.hora_fin AS "horaFin",
              c.nombre AS curso,
              c.profesor AS profesor,
              c.categoria AS categoria
       FROM horario h
       JOIN cursos c ON c.id = h.curso_id
       WHERE h.estudiante_id = $1
       ORDER BY h.fecha ASC, h.hora_inicio ASC`,
      [estudianteId]
    );

    res.json({ estudianteId, horario: result.rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCalificacionesEstudiante, getHorarioEstudiante };
