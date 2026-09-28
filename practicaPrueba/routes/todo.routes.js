const{Router} = require('express');
const todoController = require('../controlador/todo.controller');

const router = Router();

router.get("/",todoController.getTodos);
router.post('/',todoController.createTodo);
router.delete('/:id',todoController.deleteTodo);

module.exports = router;