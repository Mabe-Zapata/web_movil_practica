const db = require('./database');

class TodoData{
    async findByUserId(userId){
        const result = await db.query(
            "SELECT * FROM todos WHERE user_id = $1 ORDER BY id"
        ,[userId])
        return result.rows;
    }

    async create(userId,title){
        const result = await db.query(
            "Insert INTO todos (user_id,title,completed) VALUES ($1,$2, false) RETURNING *",
            [userId,title]
        );
        return result.rows[0];
    }

    async delete(id,userId){
        const result = await db.query(
            "DELETE FROM todos WHERE id= $1 AND user_id = $2 RETURNING *"
        ,[id,userId]);
        return result.rows[0];
    }

}
module.exports = new TodoData();