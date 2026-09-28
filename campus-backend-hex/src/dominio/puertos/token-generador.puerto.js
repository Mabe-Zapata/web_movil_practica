/**
 * El caso de uso de login necesita "algo" que genere un token de sesión,
 * pero no le importa cómo. Hoy el adaptador genera un valor opaco con
 * crypto.randomBytes; el día que se implemente JWT firmado, solo se
 * reemplaza el adaptador — este puerto y el caso de uso no cambian.
 */
class TokenGeneradorPuerto {
  /** @param {number} usuarioId @returns {string} */
  generar(usuarioId) {
    throw new Error("TokenGeneradorPuerto.generar no implementado");
  }
}

module.exports = { TokenGeneradorPuerto };
