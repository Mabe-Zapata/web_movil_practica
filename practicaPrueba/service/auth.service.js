const userData= require('../data/user.data');

class AuthService{
    async login(username,password){
        const user = await userData.findByUsername(username);

        if(!user||user.password != password){
            throw new Error("Credenciales no validas");
        }

        return{
            message: "Login exitoso",
            user : {id: user.id, username: user.username},
            token : 'fake-jwt-token-postgres'
        }
    }
}
module.exports = new AuthService();