const createCrudRouter = require("./crudRouter");

// GET    /cursos          -> lista (soporta filtros: ?categoria=&profesor=)
// GET    /cursos/:id      -> uno
// POST   /cursos          -> crear
// PUT/PATCH /cursos/:id   -> actualizar
// DELETE /cursos/:id      -> eliminar
module.exports = createCrudRouter("cursos");
