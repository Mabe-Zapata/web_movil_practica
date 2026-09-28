const { ErrorValidacion, ErrorNoEncontrado } = require("../errores/errores-dominio");

/**
 * Caso de uso CRUD genérico. Los cuatro recursos del MVP (usuarios, cursos,
 * calificaciones, horario) no tienen reglas de negocio propias más allá de
 * "existir, listarse, crearse, actualizarse y borrarse" — por eso comparten
 * este único caso de uso, parametrizado por el puerto correspondiente, en
 * vez de duplicar la misma orquestación cuatro veces.
 *
 * Si mañana un recurso necesita una regla propia (p. ej. "una nota no
 * puede ser mayor a 10"), ese es el momento de darle su propio caso de
 * uso — este archivo no le impide a ningún recurso crecer por su cuenta.
 */
class GestionarRecursoCasoUso {
  /**
   * @param {import('../puertos/repositorio.puerto').RepositorioPuerto} repositorio
   * @param {string} nombreRecurso - usado solo para mensajes de error legibles
   */
  constructor(repositorio, nombreRecurso) {
    this.repositorio = repositorio;
    this.nombreRecurso = nombreRecurso;
  }

  async listar(filtros = {}) {
    return this.repositorio.listar(filtros);
  }

  async obtenerPorId(id) {
    const recurso = await this.repositorio.obtenerPorId(id);
    if (!recurso) {
      throw new ErrorNoEncontrado(`No se encontró ${this.nombreRecurso} con id ${id}`);
    }
    return recurso;
  }

  async crear(datos) {
    const { id, ...datosSinId } = datos || {};
    if (Object.keys(datosSinId).length === 0) {
      throw new ErrorValidacion("El cuerpo de la petición está vacío");
    }
    return this.repositorio.crear(datosSinId);
  }

  async actualizar(id, datos) {
    const { id: _ignorar, ...datosSinId } = datos || {};
    if (Object.keys(datosSinId).length === 0) {
      throw new ErrorValidacion("El cuerpo de la petición está vacío");
    }
    const actualizado = await this.repositorio.actualizar(id, datosSinId);
    if (!actualizado) {
      throw new ErrorNoEncontrado(`No se encontró ${this.nombreRecurso} con id ${id}`);
    }
    return actualizado;
  }

  async eliminar(id) {
    const eliminado = await this.repositorio.eliminar(id);
    if (!eliminado) {
      throw new ErrorNoEncontrado(`No se encontró ${this.nombreRecurso} con id ${id}`);
    }
    return eliminado;
  }
}

module.exports = { GestionarRecursoCasoUso };
