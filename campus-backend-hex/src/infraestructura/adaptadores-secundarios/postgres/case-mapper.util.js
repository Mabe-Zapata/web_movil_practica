/**
 * PostgreSQL usa snake_case, el dominio y el frontend usan camelCase.
 * Esta conversión es puramente un detalle de CÓMO se guardan los datos —
 * por eso vive en infraestructura/adaptadores-secundarios, no en el dominio.
 */

function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function toCamelCase(str) {
  return str.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
}

function rowToCamel(row) {
  if (!row) return row;
  const out = {};
  for (const key of Object.keys(row)) {
    out[toCamelCase(key)] = row[key];
  }
  return out;
}

function rowsToCamel(rows) {
  return rows.map(rowToCamel);
}

function objectToSnake(obj) {
  const out = {};
  for (const key of Object.keys(obj)) {
    out[toSnakeCase(key)] = obj[key];
  }
  return out;
}

module.exports = { toSnakeCase, toCamelCase, rowToCamel, rowsToCamel, objectToSnake };
