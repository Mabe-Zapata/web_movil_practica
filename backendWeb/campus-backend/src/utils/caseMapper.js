function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function toCamelCase(str) {
  return str.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
}

// Convierte las llaves de una fila de la BD (snake_case) a camelCase para el frontend
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

// Convierte el body recibido del frontend (camelCase) a snake_case para la BD
function bodyToSnake(body) {
  const out = {};
  for (const key of Object.keys(body)) {
    out[toSnakeCase(key)] = body[key];
  }
  return out;
}

module.exports = { toSnakeCase, toCamelCase, rowToCamel, rowsToCamel, bodyToSnake };
