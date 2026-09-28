const crypto = require("crypto");

/**
 * Implementa TokenGeneradorPuerto con un valor opaco (NO es un JWT real
 * todavía — no hay verificación de firma en el servidor). Sirve para que
 * el frontend tenga algo que guardar y enviar como Authorization mientras
 * se implementa JWT firmado. Cuando eso pase, solo se reemplaza esta
 * clase por un TokenGeneradorJwt — el caso de uso de login no cambia.
 */
class TokenGeneradorCrypto {
  generar(usuarioId) {
    const random = crypto.randomBytes(24).toString("hex");
    return `${usuarioId}.${random}`;
  }
}

module.exports = { TokenGeneradorCrypto };
