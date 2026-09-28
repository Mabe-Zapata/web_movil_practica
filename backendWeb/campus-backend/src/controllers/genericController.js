const { query } = require("../config/db");
const { rowToCamel, rowsToCamel, bodyToSnake, toSnakeCase } = require("../utils/caseMapper");

/**
 * Crea un controlador CRUD genérico para una tabla dada.
 * Replica el comportamiento de json-server: filtrado por query params,
 * GET /recurso, GET /recurso/:id, POST, PUT, PATCH, DELETE.
 *
 * @param {string} tableName - nombre de la tabla en PostgreSQL
 */
function createController(tableName) {
  return {
    // GET /recurso?campo=valor&otroCampo=valor
    async getAll(req, res, next) {
      try {
        const filters = req.query;
        const keys = Object.keys(filters);

        let text = `SELECT * FROM ${tableName}`;
        const values = [];

        if (keys.length > 0) {
          const conditions = keys.map((key, i) => {
            values.push(filters[key]);
            return `${toSnakeCase(key)} = $${i + 1}`;
          });
          text += ` WHERE ${conditions.join(" AND ")}`;
        }

        text += " ORDER BY id ASC";

        const result = await query(text, values);
        res.json(rowsToCamel(result.rows));
      } catch (err) {
        next(err);
      }
    },

    // GET /recurso/:id
    async getById(req, res, next) {
      try {
        const { id } = req.params;
        const result = await query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);

        if (result.rows.length === 0) {
          return res.status(404).json({ error: `Recurso no encontrado en ${tableName}` });
        }

        res.json(rowToCamel(result.rows[0]));
      } catch (err) {
        next(err);
      }
    },

    // POST /recurso
    async create(req, res, next) {
      try {
        const body = bodyToSnake(req.body);
        delete body.id; // el id lo genera la base de datos

        const columns = Object.keys(body);
        if (columns.length === 0) {
          return res.status(400).json({ error: "El cuerpo de la petición está vacío" });
        }

        const values = Object.values(body);
        const placeholders = columns.map((_, i) => `$${i + 1}`);

        const text = `INSERT INTO ${tableName} (${columns.join(", ")})
                      VALUES (${placeholders.join(", ")}) RETURNING *`;

        const result = await query(text, values);
        res.status(201).json(rowToCamel(result.rows[0]));
      } catch (err) {
        next(err);
      }
    },

    // PUT /recurso/:id  (reemplazo completo)
    // PATCH /recurso/:id (actualización parcial)
    async update(req, res, next) {
      try {
        const { id } = req.params;
        const body = bodyToSnake(req.body);
        delete body.id;

        const columns = Object.keys(body);
        if (columns.length === 0) {
          return res.status(400).json({ error: "El cuerpo de la petición está vacío" });
        }

        const values = Object.values(body);
        const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(", ");

        const text = `UPDATE ${tableName} SET ${setClause}
                      WHERE id = $${columns.length + 1} RETURNING *`;

        const result = await query(text, [...values, id]);

        if (result.rows.length === 0) {
          return res.status(404).json({ error: `Recurso no encontrado en ${tableName}` });
        }

        res.json(rowToCamel(result.rows[0]));
      } catch (err) {
        next(err);
      }
    },

    // DELETE /recurso/:id
    async remove(req, res, next) {
      try {
        const { id } = req.params;
        const result = await query(`DELETE FROM ${tableName} WHERE id = $1 RETURNING *`, [id]);

        if (result.rows.length === 0) {
          return res.status(404).json({ error: `Recurso no encontrado en ${tableName}` });
        }

        res.status(200).json({});
      } catch (err) {
        next(err);
      }
    },
  };
}

module.exports = createController;
