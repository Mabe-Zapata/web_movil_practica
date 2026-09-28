const {
  ErrorValidacion,
  ErrorNoEncontrado,
  ErrorCredencialesInvalidas,
  ErrorConflicto,
} = require("../../../../dominio/errores/errores-dominio");

/**
 * Único lugar del sistema que sabe traducir "qué pasó en el dominio" a
 * "qué código HTTP corresponde". El dominio lanza errores con nombres de
 * negocio (ErrorNoEncontrado, ErrorValidacion...); este middleware —y
 * solo él— decide que ErrorNoEncontrado es un 404. Si mañana este mismo
 * dominio se expone por gRPC en vez de HTTP, este es el único archivo
 * que no se reutiliza.
 */
function manejadorErrores(err, req, res, next) {
  if (err instanceof ErrorValidacion) {
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof ErrorCredencialesInvalidas) {
    return res.status(401).json({ error: err.message });
  }
  if (err instanceof ErrorNoEncontrado) {
    return res.status(404).json({ error: err.message });
  }
  if (err instanceof ErrorConflicto) {
    return res.status(409).json({ error: err.message });
  }

  // Errores propios de PostgreSQL que se escapan de los adaptadores
  if (err.code === "23505") {
    return res.status(409).json({ error: "Ya existe un registro con ese valor único (correo, etc.)" });
  }
  if (err.code === "23503") {
    return res.status(409).json({ error: "Referencia inválida (id de estudiante o curso inexistente)" });
  }

  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
}

module.exports = { manejadorErrores };
