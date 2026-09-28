const fs = require("fs");
const path = require("path");
const { pool } = require("../config/db");

async function init() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");

  try {
    console.log("Creando esquema de base de datos...");
    await pool.query(schema);
    console.log("Esquema creado correctamente.");
  } catch (err) {
    console.error("Error al crear el esquema:", err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

init();
