const createCrudRouter = require("./crudRouter");

// GET    /calificaciones                 -> lista (soporta ?estudianteId=&cursoId=)
// GET    /calificaciones/:id             -> una
// POST   /calificaciones                 -> crear
// PUT/PATCH /calificaciones/:id          -> actualizar
// DELETE /calificaciones/:id             -> eliminar
module.exports = createCrudRouter("calificaciones");
