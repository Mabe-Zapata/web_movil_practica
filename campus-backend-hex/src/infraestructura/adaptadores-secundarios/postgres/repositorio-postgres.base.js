const { pool } = require("./pool");
const { rowToCamel, rowsToCamel, objectToSnake, toSnakeCase } = require("./case-mapper.util");
const { RepositorioPuerto } = require("../../../dominio/puertos/repositorio.puerto");

/**
 * Implementación PostgreSQL del RepositorioPuerto genérico. Traduce entre
 * el mundo camelCase del dominio y el snake_case de las tablas, y expone
 * el mismo filtrado "por igualdad de campo" que ya usaba el mock de
 * json-server (?estudianteId=1&cursoId=2, etc.).
 *
 * Cada repositorio concreto (UsuarioRepositorioPostgres, etc.) extiende
 * esta clase y solo agrega lo que le es propio.
 */
class RepositorioPostgresBase extends RepositorioPuerto {
  constructor(tableName) {
    super();
    this.tableName = tableName;
  }

  async listar(filtros = {}) {
    const keys = Object.keys(filtros);
    let text = `SELECT * FROM ${this.tableName}`;
    const values = [];

    if (keys.length > 0) {
      const condiciones = keys.map((key, i) => {
        values.push(filtros[key]);
        return `${toSnakeCase(key)} = $${i + 1}`;
      });
      text += ` WHERE ${condiciones.join(" AND ")}`;
    }
    text += " ORDER BY id ASC";

    const resultado = await pool.query(text, values);
    return rowsToCamel(resultado.rows);
  }

  async obtenerPorId(id) {
    const resultado = await pool.query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
    return resultado.rows.length ? rowToCamel(resultado.rows[0]) : null;
  }

  async crear(datos) {
    const datosSnake = objectToSnake(datos);
    const columnas = Object.keys(datosSnake);
    const valores = Object.values(datosSnake);
    const placeholders = columnas.map((_, i) => `$${i + 1}`);

    const text = `INSERT INTO ${this.tableName} (${columnas.join(", ")})
                  VALUES (${placeholders.join(", ")}) RETURNING *`;
    const resultado = await pool.query(text, valores);
    return rowToCamel(resultado.rows[0]);
  }

  async actualizar(id, datos) {
    const datosSnake = objectToSnake(datos);
    const columnas = Object.keys(datosSnake);
    const valores = Object.values(datosSnake);
    const setClause = columnas.map((col, i) => `${col} = $${i + 1}`).join(", ");

    const text = `UPDATE ${this.tableName} SET ${setClause} WHERE id = $${columnas.length + 1} RETURNING *`;
    const resultado = await pool.query(text, [...valores, id]);
    return resultado.rows.length ? rowToCamel(resultado.rows[0]) : null;
  }

  async eliminar(id) {
    const resultado = await pool.query(`DELETE FROM ${this.tableName} WHERE id = $1 RETURNING *`, [id]);
    return resultado.rows.length > 0;
  }
}

module.exports = { RepositorioPostgresBase };
