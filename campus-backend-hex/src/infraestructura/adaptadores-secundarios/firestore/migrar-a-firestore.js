/**
 * Script de migración de PostgreSQL a Firestore.
 * Lee los datos del seed-data.json y los inserta en Firestore.
 * No necesita PostgreSQL corriendo.
 * 
 * Uso: node src/infraestructura/adaptadores-secundarios/firestore/migrar-a-firestore.js
 */
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { db } = require("../../firebase-admin");

async function migrate() {
  console.log("🚀 Iniciando migración (desde JSON) → Firestore...\n");

  try {
    // Leer datos del seed-data.json
    const dataPath = path.join(__dirname, "..", "postgres", "migraciones", "seed-data.json");
    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

    // 1. Migrar usuarios
    console.log("📦 Migrando usuarios...");
    for (const u of data.usuarios) {
      await db.collection("usuarios").doc(String(u.id)).set({
        id: u.id,
        nombre: u.nombre,
        iniciales: u.iniciales,
        correo: u.correo,
        password: u.password,
        rol: u.rol,
        periodo: u.periodo,
      });
    }
    console.log(`   ✅ ${data.usuarios.length} usuarios migrados`);

    // 2. Migrar cursos
    console.log("📦 Migrando cursos...");
    const cursosMap = {};
    for (const c of data.cursos) {
      await db.collection("cursos").doc(String(c.id)).set({
        id: c.id,
        nombre: c.nombre,
        profesor: c.profesor,
        categoria: c.categoria,
      });
      cursosMap[c.id] = { nombre: c.nombre, profesor: c.profesor, categoria: c.categoria };
    }
    console.log(`   ✅ ${data.cursos.length} cursos migrados`);

    // 3. Migrar calificaciones (con datos desnormalizados del curso)
    console.log("📦 Migrando calificaciones...");
    for (const cal of data.calificaciones) {
      const curso = cursosMap[cal.cursoId] || {};
      await db.collection("calificaciones").doc(String(cal.id)).set({
        id: cal.id,
        estudianteId: String(cal.estudianteId),
        cursoId: String(cal.cursoId),
        cursoNombre: curso.nombre || "",
        cursoProfesor: curso.profesor || "",
        nota: parseFloat(cal.nota),
      });
    }
    console.log(`   ✅ ${data.calificaciones.length} calificaciones migradas`);

    // 4. Migrar horario (con datos desnormalizados del curso)
    console.log("📦 Migrando horario...");
    for (const h of data.horario) {
      const curso = cursosMap[h.cursoId] || {};
      await db.collection("horario").doc(String(h.id)).set({
        id: h.id,
        estudianteId: String(h.estudianteId),
        cursoId: String(h.cursoId),
        dia: h.dia,
        fecha: h.fecha,
        horaInicio: h.horaInicio,
        horaFin: h.horaFin,
        cursoNombre: curso.nombre || "",
        cursoProfesor: curso.profesor || "",
        cursoCategoria: curso.categoria || "",
      });
    }
    console.log(`   ✅ ${data.horario.length} horarios migrados`);

    console.log("\n🎉 Migración completada exitosamente!");
  } catch (err) {
    console.error("\n❌ Error en la migración:", err.message);
    process.exitCode = 1;
  }
}

migrate();
