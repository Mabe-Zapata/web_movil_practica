const todoService = require('../service/todo.service');

class TodoController{
    async getTodos(req,res){
        try{
            const userId= req.headers['user-id'] || 1;
            const todos = await todoService.getTodosByUser(userId);
            return res.status(200).json(todos);
        }catch(error){
            return res.status(500).json({error:error.message});

        }}
    async createTodo(req,res){
        try{const userId= req.header['user-id']||1;
            const {title} = req.body;
            const newTodo = await todoService.createTodo(userId,title);
            return res.status(201).json(newTodo);
        }
        catch(error){
            return res.status(400).json({error:error.message});

        }
    }
    
    async deleteTodo(req,res){
        try{const userId = req.headers['user.id']||1;
            const {id} = req.params;
            const deleted = await todoService.deleteTodo(id,userId);
            return res.status(200).json({message:"Tarea eliminada",deleted});
        }
        catch(erro){
            return res.status(500).json({error:error.message});
        }
    }
}
module.exports = new TodoController();