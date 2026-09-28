/**
 * Errores propios del dominio. No conocen HTTP ni códigos de estado —
 * eso es responsabilidad del adaptador HTTP (ver manejador-errores.middleware.js).
 * Así el dominio se mantiene puro y testeable sin Express.
 */

class ErrorDominio extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = this.constructor.name;
  }
}

class ErrorValidacion extends ErrorDominio {}

class ErrorNoEncontrado extends ErrorDominio {}

class ErrorCredencialesInvalidas extends ErrorDominio {}

class ErrorConflicto extends ErrorDominio {}

module.exports = { ErrorDominio, ErrorValidacion, ErrorNoEncontrado, ErrorCredencialesInvalidas, ErrorConflicto };
