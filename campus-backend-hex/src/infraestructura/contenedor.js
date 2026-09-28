/**
 * COMPOSITION ROOT. Este es, a propósito, el único archivo de todo el
 * proyecto que conoce tanto el dominio (casos de uso) como los adaptadores
 * concretos (PostgreSQL, crypto, Express). Todo lo demás solo conoce
 * puertos e interfaces.
 *
 * Cambiar de PostgreSQL a otro motor, o de token opaco a JWT real, es
 * cuestión de reemplazar una línea aquí — nada en dominio/ ni en
 * infraestructura/adaptadores-primarios/ necesita tocarse.
 */

// Dominio — casos de uso
const { GestionarRecursoCasoUso } = require("../dominio/casos-de-uso/gestionar-recurso.caso-uso");
const { IniciarSesionCasoUso } = require("../dominio/casos-de-uso/auth/iniciar-sesion.caso-uso");
const {
  ConsultarCalificacionesEstudianteCasoUso,
} = require("../dominio/casos-de-uso/academico/consultar-calificaciones-estudiante.caso-uso");
const {
  ConsultarHorarioEstudianteCasoUso,
} = require("../dominio/casos-de-uso/academico/consultar-horario-estudiante.caso-uso");

// Firebase Admin (debe importarse antes de los repositorios)
require("./firebase-admin");

// Adaptadores secundarios (persistencia + token) — Firestore en producción
const { UsuarioRepositorioFirestore } = require("./adaptadores-secundarios/firestore/usuario-repositorio.firestore");
const { CursoRepositorioFirestore } = require("./adaptadores-secundarios/firestore/curso-repositorio.firestore");
const {
  CalificacionRepositorioFirestore,
} = require("./adaptadores-secundarios/firestore/calificacion-repositorio.firestore");
const { HorarioRepositorioFirestore } = require("./adaptadores-secundarios/firestore/horario-repositorio.firestore");
const { TokenGeneradorCrypto } = require("./adaptadores-secundarios/token/token-generador.crypto");

// Adaptadores primarios (HTTP)
const { crearControladorRecurso } = require("./adaptadores-primarios/http/controladores/recurso.controlador");
const { crearControladorAuth } = require("./adaptadores-primarios/http/controladores/auth.controlador");
const { crearControladorAcademico } = require("./adaptadores-primarios/http/controladores/academico.controlador");
const { crearRutasCrud } = require("./adaptadores-primarios/http/rutas/crud.routes");
const { crearRutasAuth } = require("./adaptadores-primarios/http/rutas/auth.routes");
const { crearRutasAcademico } = require("./adaptadores-primarios/http/rutas/academico.routes");
const { crearServidor } = require("./adaptadores-primarios/http/servidor");

function construirApp() {
  // 1) Adaptadores secundarios concretos — Firestore
  const usuarioRepositorio = new UsuarioRepositorioFirestore();
  const cursoRepositorio = new CursoRepositorioFirestore();
  const calificacionRepositorio = new CalificacionRepositorioFirestore();
  const horarioRepositorio = new HorarioRepositorioFirestore();
  const tokenGenerador = new TokenGeneradorCrypto();

  // 2) Casos de uso, recibiendo los puertos ya resueltos
  const gestionarUsuarios = new GestionarRecursoCasoUso(usuarioRepositorio, "usuario");
  const gestionarCursos = new GestionarRecursoCasoUso(cursoRepositorio, "curso");
  const gestionarCalificaciones = new GestionarRecursoCasoUso(calificacionRepositorio, "calificación");
  const gestionarHorario = new GestionarRecursoCasoUso(horarioRepositorio, "horario");
  const iniciarSesion = new IniciarSesionCasoUso(usuarioRepositorio, tokenGenerador);
  const consultarCalificacionesEstudiante = new ConsultarCalificacionesEstudianteCasoUso(calificacionRepositorio);
  const consultarHorarioEstudiante = new ConsultarHorarioEstudianteCasoUso(horarioRepositorio);

  // 3) Controladores HTTP, recibiendo los casos de uso
  const controladorUsuarios = crearControladorRecurso(gestionarUsuarios);
  const controladorCursos = crearControladorRecurso(gestionarCursos);
  const controladorCalificaciones = crearControladorRecurso(gestionarCalificaciones);
  const controladorHorario = crearControladorRecurso(gestionarHorario);
  const controladorAuth = crearControladorAuth(iniciarSesion);
  const controladorAcademico = crearControladorAcademico(consultarCalificacionesEstudiante, consultarHorarioEstudiante);

  // 4) Routers Express, recibiendo los controladores
  const rutasUsuarios = crearRutasCrud(controladorUsuarios);
  const rutasCursos = crearRutasCrud(controladorCursos);
  const rutasCalificaciones = crearRutasCrud(controladorCalificaciones);
  const rutasHorario = crearRutasCrud(controladorHorario);
  const rutasAuth = crearRutasAuth(controladorAuth);
  const rutasAcademico = crearRutasAcademico(controladorAcademico);

  // 5) La app de Express, ensamblada a partir de los routers
  return crearServidor({
    rutasUsuarios,
    rutasCursos,
    rutasCalificaciones,
    rutasHorario,
    rutasAuth,
    rutasAcademico,
  });
}

module.exports = { construirApp };
