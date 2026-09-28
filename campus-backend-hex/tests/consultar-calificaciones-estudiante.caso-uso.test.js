const test = require("node:test");
const assert = require("node:assert/strict");

const {
  ConsultarCalificacionesEstudianteCasoUso,
} = require("../src/dominio/casos-de-uso/academico/consultar-calificaciones-estudiante.caso-uso");
const { ErrorValidacion } = require("../src/dominio/errores/errores-dominio");

class CalificacionRepositorioFalso {
  constructor(calificaciones) {
    this.calificaciones = calificaciones;
  }
  async listarPorEstudianteConCurso(estudianteId) {
    return this.calificaciones;
  }
}

test("calcula el promedio correctamente a partir de varias calificaciones", async () => {
  const repo = new CalificacionRepositorioFalso([
    { curso: "Base de Datos", profesor: "Ing. Morales", nota: 8.5 },
    { curso: "Computación Visual", profesor: "Ing. Nuñez", nota: 7.2 },
    { curso: "IHC", profesor: "Ing. Bastidas", nota: 9 },
  ]);
  const casoUso = new ConsultarCalificacionesEstudianteCasoUso(repo);

  const resultado = await casoUso.ejecutar(1);

  assert.equal(resultado.estudianteId, 1);
  assert.equal(resultado.calificaciones.length, 3);
  // (8.5 + 7.2 + 9) / 3 = 8.233...  redondeado a 2 decimales
  assert.equal(resultado.promedio, 8.23);
});

test("devuelve promedio 0 cuando el estudiante no tiene calificaciones", async () => {
  const repo = new CalificacionRepositorioFalso([]);
  const casoUso = new ConsultarCalificacionesEstudianteCasoUso(repo);

  const resultado = await casoUso.ejecutar(99);

  assert.equal(resultado.promedio, 0);
  assert.deepEqual(resultado.calificaciones, []);
});

test("rechaza un id de estudiante inválido con ErrorValidacion", async () => {
  const repo = new CalificacionRepositorioFalso([]);
  const casoUso = new ConsultarCalificacionesEstudianteCasoUso(repo);

  await assert.rejects(() => casoUso.ejecutar(NaN), ErrorValidacion);
});
