const fs = require("fs");
const path = require("path");
const { pool } = require("../pool");

async function seed() {
  const dataPath = path.join(__dirname, "seed-data.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      "TRUNCATE TABLE horario, calificaciones, cursos, usuarios RESTART IDENTITY CASCADE"
    );

    for (const u of data.usuarios) {
      await client.query(
        `INSERT INTO usuarios (id, nombre, iniciales, correo, password, rol, periodo)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [u.id, u.nombre, u.iniciales, u.correo, u.password, u.rol, u.periodo]
      );
    }

    for (const c of data.cursos) {
      await client.query(
        `INSERT INTO cursos (id, nombre, profesor, categoria)
         VALUES ($1, $2, $3, $4)`,
        [c.id, c.nombre, c.profesor, c.categoria]
      );
    }

    for (const cal of data.calificaciones) {
      await client.query(
        `INSERT INTO calificaciones (id, estudiante_id, curso_id, nota)
         VALUES ($1, $2, $3, $4)`,
        [cal.id, cal.estudianteId, cal.cursoId, cal.nota]
      );
    }

    for (const h of data.horario) {
      await client.query(
        `INSERT INTO horario (id, estudiante_id, curso_id, dia, fecha, hora_inicio, hora_fin)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [h.id, h.estudianteId, h.cursoId, h.dia, h.fecha, h.horaInicio, h.horaFin]
      );
    }

    const tablas = ["usuarios", "cursos", "calificaciones", "horario"];
    for (const t of tablas) {
      await client.query(
        `SELECT setval(pg_get_serial_sequence('${t}', 'id'), COALESCE((SELECT MAX(id) FROM ${t}), 1))`
      );
    }

    await client.query("COMMIT");
    console.log("Datos de seed insertados correctamente.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error al insertar los datos de seed:", err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
