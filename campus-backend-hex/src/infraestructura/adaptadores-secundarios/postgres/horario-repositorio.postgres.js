const { pool } = require("./pool");
const { RepositorioPostgresBase } = require("./repositorio-postgres.base");

/** Implementa HorarioRepositorioPuerto, con el mismo patrón que calificaciones. */
class HorarioRepositorioPostgres extends RepositorioPostgresBase {
  constructor() {
    super("horario");
  }

  async listarPorEstudianteConCurso(estudianteId) {
    const resultado = await pool.query(
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
    return resultado.rows;
  }
}

module.exports = { HorarioRepositorioPostgres };
