const { RepositorioPuerto } = require("./repositorio.puerto");

/**
 * El repositorio de cursos no necesita nada más allá del CRUD genérico.
 * Existe como clase propia (en vez de usar RepositorioPuerto directo)
 * para que el contenedor de inyección de dependencias documente
 * explícitamente qué puerto implementa cada adaptador.
 */
class CursoRepositorioPuerto extends RepositorioPuerto {}

module.exports = { CursoRepositorioPuerto };
