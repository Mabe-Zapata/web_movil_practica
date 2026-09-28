const crypto = require("crypto");
const { query } = require("../config/db");
const { rowToCamel } = require("../utils/caseMapper");

// Genera un token opaco (NO es un JWT real todavía). Sirve para que el
// frontend tenga algo que guardar y enviar como Authorization, mientras
// se implementa verificación real (JWT firmado) en una siguiente etapa.
function generarTokenTemporal(usuarioId) {
  const random = crypto.randomBytes(24).toString("hex");
  return `${usuarioId}.${random}`;
}

// POST /login
// Body esperado: { "correo": "...", "password": "..." }
// (también acepta "usuario" o "email" como alias de "correo", por si el
//  formulario del frontend usa otro nombre de campo)
//
// Respuesta: { token: string, usuario: Usuario }  <-- forma que espera
// GestionarSesionCasoUso.iniciarSesion() en el frontend (LoginResponse)
async function login(req, res, next) {
  try {
    const body = req.body || {};
    const correo = body.correo || body.usuario || body.email;
    const password = body.password || body.contrasena || body.clave;

    if (!correo || !password) {
      return res.status(400).json({ error: "Debes enviar correo y password" });
    }

    const result = await query(
      "SELECT * FROM usuarios WHERE correo = $1 AND password = $2",
      [correo, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos" });
    }

    const usuario = rowToCamel(result.rows[0]);
    delete usuario.password; // nunca devolver la contraseña al frontend

    const token = generarTokenTemporal(usuario.id);

    res.status(200).json({ token, usuario });
  } catch (err) {
    next(err);
  }
}

module.exports = { login };
