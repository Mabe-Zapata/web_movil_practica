/**
 * Controlador HTTP delgado: solo traduce Express (req/res) al caso de uso
 * y de vuelta. No contiene reglas de negocio ni SQL — si el día de mañana
 * este mismo caso de uso se expusiera por una CLI o un worker de colas,
 * este archivo no se reutiliza, pero el caso de uso sí.
 *
 * @param {import('../../../../dominio/casos-de-uso/gestionar-recurso.caso-uso').GestionarRecursoCasoUso} casoUso
 */
function crearControladorRecurso(casoUso) {
  return {
    async listar(req, res, next) {
      try {
        const recursos = await casoUso.listar(req.query);
        res.json(recursos);
      } catch (err) {
        next(err);
      }
    },

    async obtenerPorId(req, res, next) {
      try {
        const recurso = await casoUso.obtenerPorId(req.params.id);
        res.json(recurso);
      } catch (err) {
        next(err);
      }
    },

    async crear(req, res, next) {
      try {
        const creado = await casoUso.crear(req.body);
        res.status(201).json(creado);
      } catch (err) {
        next(err);
      }
    },

    async actualizar(req, res, next) {
      try {
        const actualizado = await casoUso.actualizar(req.params.id, req.body);
        res.json(actualizado);
      } catch (err) {
        next(err);
      }
    },

    async eliminar(req, res, next) {
      try {
        await casoUso.eliminar(req.params.id);
        res.status(200).json({});
      } catch (err) {
        next(err);
      }
    },
  };
}

module.exports = { crearControladorRecurso };
