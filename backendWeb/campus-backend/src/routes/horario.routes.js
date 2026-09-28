const createCrudRouter = require("./crudRouter");

// GET    /horario                -> lista (soporta ?estudianteId=&cursoId=&dia=)
// GET    /horario/:id            -> uno
// POST   /horario                -> crear
// PUT/PATCH /horario/:id         -> actualizar
// DELETE /horario/:id            -> eliminar
module.exports = createCrudRouter("horario");
