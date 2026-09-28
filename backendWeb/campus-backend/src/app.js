const express = require("express");
const cors = require("cors");
require("dotenv").config();

const usuariosRoutes = require("./routes/usuarios.routes");
const cursosRoutes = require("./routes/cursos.routes");
const calificacionesRoutes = require("./routes/calificaciones.routes");
const horarioRoutes = require("./routes/horario.routes");
const authRoutes = require("./routes/auth.routes");
const academicoRoutes = require("./routes/academico.routes");

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || "*";
app.use(
  cors({
    origin: corsOrigin === "*" ? "*" : corsOrigin.split(","),
  })
);
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", servicio: "campus-backend" });
});

// Autenticación
app.use("/login", authRoutes);

// Vista agregada del estudiante (join calificaciones/horario + cursos)
app.use("/api/estudiantes", academicoRoutes);

// Mismos endpoints que tenía json-server
app.use("/usuarios", usuariosRoutes);
app.use("/cursos", cursosRoutes);
app.use("/calificaciones", calificacionesRoutes);
app.use("/horario", horarioRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Manejo centralizado de errores
app.use((err, req, res, next) => {
  console.error(err);

  if (err.code === "23505") {
    return res.status(409).json({ error: "Ya existe un registro con ese valor único (correo, etc.)" });
  }
  if (err.code === "23503") {
    return res.status(409).json({ error: "Referencia inválida (id de estudiante o curso inexistente)" });
  }

  res.status(500).json({ error: "Error interno del servidor" });
});

module.exports = app;
