const test = require("node:test");
const assert = require("node:assert/strict");

const { IniciarSesionCasoUso } = require("../src/dominio/casos-de-uso/auth/iniciar-sesion.caso-uso");
const { UsuarioRepositorioMemoria } = require("../src/infraestructura/adaptadores-secundarios/memoria/usuario-repositorio.memoria");
const { ErrorValidacion, ErrorCredencialesInvalidas } = require("../src/dominio/errores/errores-dominio");

/**
 * Esta es la demostración concreta de la arquitectura hexagonal: el caso
 * de uso de login se prueba de punta a punta SIN levantar PostgreSQL ni
 * Express — basta con un repositorio en memoria que cumple el mismo
 * puerto que usaría el adaptador real. Correr con: npm test
 */

// Token generador falso, también un adaptador — solo que vive aquí porque
// es exclusivo de los tests.
class TokenGeneradorFalso {
  generar(usuarioId) {
    return `token-de-prueba-${usuarioId}`;
  }
}

function crearCasoUso() {
  const usuarioRepositorio = new UsuarioRepositorioMemoria([
    { id: 1, nombre: "Sofía Martinez", correo: "estudiante@uta.edu.ec", password: "campus2026", rol: "estudiante" },
  ]);
  const tokenGenerador = new TokenGeneradorFalso();
  return new IniciarSesionCasoUso(usuarioRepositorio, tokenGenerador);
}

test("inicia sesión con credenciales correctas y no expone el password", async () => {
  const casoUso = crearCasoUso();
  const resultado = await casoUso.ejecutar({ correo: "estudiante@uta.edu.ec", password: "campus2026" });

  assert.equal(resultado.token, "token-de-prueba-1");
  assert.equal(resultado.usuario.correo, "estudiante@uta.edu.ec");
  assert.equal(resultado.usuario.password, undefined, "el password nunca debe salir del dominio");
});

test("rechaza credenciales incorrectas con ErrorCredencialesInvalidas", async () => {
  const casoUso = crearCasoUso();
  await assert.rejects(
    () => casoUso.ejecutar({ correo: "estudiante@uta.edu.ec", password: "incorrecta" }),
    ErrorCredencialesInvalidas
  );
});

test("rechaza una petición sin correo o password con ErrorValidacion", async () => {
  const casoUso = crearCasoUso();
  await assert.rejects(() => casoUso.ejecutar({ correo: "", password: "" }), ErrorValidacion);
});
