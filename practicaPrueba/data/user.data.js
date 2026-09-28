const db = require('./database');

class UserData{
    async findByUsername(username){
        const result = await db.query("SELECT * FROM users WHERE username = $1",[username]);
        return result.rows[0];
    }
}

module.exports = new UserData();