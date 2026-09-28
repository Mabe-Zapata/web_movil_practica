
const todoData = require("../data/todo.data")

class TodoService{

    async getTodosByUser(req,res){
        return await todoData.findByUserId(userId);
    }

    async createTodo(userId,title){
        if(!title|| title.trim===""){
            throw new Error("El titulo de la tarea es obligatorio");
        }
        return await todoData.create(userId,title);
    }

    async deleteTodo(id,userId){
        const deleted = await todoData.delete(id,userId);
        if(!deleted){
            throw new Error("Tarea no encontrada o no autorizada");
        }
        return deleted;
    }


}
module.exports = new TodoService();