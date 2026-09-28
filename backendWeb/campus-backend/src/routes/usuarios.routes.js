const createCrudRouter = require("./crudRouter");

// GET    /usuarios              -> lista (soporta filtros: ?correo=&rol=&password=)
// GET    /usuarios/:id          -> uno
// POST   /usuarios              -> crear
// PUT/PATCH /usuarios/:id       -> actualizar
// DELETE /usuarios/:id          -> eliminar
//
// Ejemplo de login estilo json-server (equivalente a lo que ya usaba el front):
//   GET /usuarios?correo=estudiante@uta.edu.ec&password=campus2026
module.exports = createCrudRouter("usuarios");
