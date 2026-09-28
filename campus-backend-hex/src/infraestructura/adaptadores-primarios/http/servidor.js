const express = require("express");
const cors = require("cors");
const { manejadorErrores } = require("./middlewares/manejador-errores.middleware");

/**
 * Construye la app de Express. Recibe los routers YA ARMADOS (con sus
 * controladores y casos de uso ya inyectados) — este archivo no sabe
 * nada de PostgreSQL, casos de uso, ni siquiera de qué recursos existen
 * más allá de dónde montarlos. Es puro cableado HTTP.
 */
function crearServidor({ rutasUsuarios, rutasCursos, rutasCalificaciones, rutasHorario, rutasAuth, rutasAcademico }) {
  const app = express();

  const corsOrigin = process.env.CORS_ORIGIN || "*";
  app.use(cors({ origin: corsOrigin === "*" ? "*" : corsOrigin.split(",") }));
  app.use(express.json());

  app.get("/", (req, res) => {
    res.json({ status: "ok", servicio: "campus-backend", arquitectura: "hexagonal" });
  });

  app.use("/login", rutasAuth);
  app.use("/api/estudiantes", rutasAcademico);
  app.use("/usuarios", rutasUsuarios);
  app.use("/cursos", rutasCursos);
  app.use("/calificaciones", rutasCalificaciones);
  app.use("/horario", rutasHorario);

  app.use((req, res) => {
    res.status(404).json({ error: "Ruta no encontrada" });
  });

  app.use(manejadorErrores);

  return app;
}

module.exports = { crearServidor };
