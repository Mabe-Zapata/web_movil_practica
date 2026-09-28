const { pool } = require("./pool");
const { RepositorioPostgresBase } = require("./repositorio-postgres.base");

/**
 * Implementa CalificacionRepositorioPuerto. El JOIN con `cursos` para la
 * vista académica del estudiante vive aquí — es un detalle de cómo se
 * consultan los datos, no una regla de negocio (el promedio, que sí es
 * regla de negocio, se calcula en el caso de uso, no en esta query).
 */
class CalificacionRepositorioPostgres extends RepositorioPostgresBase {
  constructor() {
    super("calificaciones");
  }

  async listarPorEstudianteConCurso(estudianteId) {
    const resultado = await pool.query(
      `SELECT c.nombre AS curso, c.profesor AS profesor, cal.nota AS nota
       FROM calificaciones cal
       JOIN cursos c ON c.id = cal.curso_id
       WHERE cal.estudiante_id = $1
       ORDER BY cal.id ASC`,
      [estudianteId]
    );
    return resultado.rows.map((r) => ({ curso: r.curso, profesor: r.profesor, nota: Number(r.nota) }));
  }
}

module.exports = { CalificacionRepositorioPostgres };
