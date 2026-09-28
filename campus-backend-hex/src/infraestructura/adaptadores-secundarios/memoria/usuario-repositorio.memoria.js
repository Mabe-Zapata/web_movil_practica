const { RepositorioPuerto } = require("../../../dominio/puertos/repositorio.puerto");

/**
 * Implementación en memoria de UsuarioRepositorioPuerto. No toca disco ni
 * red — existe para demostrar la ventaja real de hexagonal: el caso de
 * uso de login (IniciarSesionCasoUso) se puede probar con este adaptador
 * en vez de con PostgreSQL, sin cambiar una sola línea del dominio.
 *
 * Ver tests/iniciar-sesion.caso-uso.test.js para el ejemplo completo.
 */
class UsuarioRepositorioMemoria extends RepositorioPuerto {
  constructor(usuariosIniciales = []) {
    super();
    this.usuarios = [...usuariosIniciales];
    this.siguienteId = this.usuarios.length + 1;
  }

  async listar(filtros = {}) {
    const claves = Object.keys(filtros);
    return this.usuarios.filter((u) => claves.every((k) => u[k] === filtros[k]));
  }

  async obtenerPorId(id) {
    return this.usuarios.find((u) => u.id === Number(id)) || null;
  }

  async crear(datos) {
    const nuevo = { id: this.siguienteId++, ...datos };
    this.usuarios.push(nuevo);
    return nuevo;
  }

  async actualizar(id, datos) {
    const idx = this.usuarios.findIndex((u) => u.id === Number(id));
    if (idx === -1) return null;
    this.usuarios[idx] = { ...this.usuarios[idx], ...datos };
    return this.usuarios[idx];
  }

  async eliminar(id) {
    const idx = this.usuarios.findIndex((u) => u.id === Number(id));
    if (idx === -1) return false;
    this.usuarios.splice(idx, 1);
    return true;
  }

  async buscarPorCorreoYPassword(correo, password) {
    return this.usuarios.find((u) => u.correo === correo && u.password === password) || null;
  }
}

module.exports = { UsuarioRepositorioMemoria };
