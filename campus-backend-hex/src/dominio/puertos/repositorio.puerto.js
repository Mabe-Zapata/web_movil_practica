/**
 * Puerto (interfaz) que debe cumplir cualquier adaptador de persistencia
 * para un recurso CRUD simple (usuarios, cursos, calificaciones, horario).
 *
 * El dominio programa contra ESTA clase, nunca contra `pg` directamente.
 * Cualquier adaptador (PostgreSQL, en memoria, otro motor de BD) que
 * implemente estos métodos sirve para los casos de uso genéricos.
 */
class RepositorioPuerto {
  /** @param {Object} filtros - pares clave/valor en camelCase para filtrar */
  async listar(filtros) {
    throw new Error("RepositorioPuerto.listar no implementado");
  }

  async obtenerPorId(id) {
    throw new Error("RepositorioPuerto.obtenerPorId no implementado");
  }

  async crear(datos) {
    throw new Error("RepositorioPuerto.crear no implementado");
  }

  async actualizar(id, datos) {
    throw new Error("RepositorioPuerto.actualizar no implementado");
  }

  async eliminar(id) {
    throw new Error("RepositorioPuerto.eliminar no implementado");
  }
}

module.exports = { RepositorioPuerto };
