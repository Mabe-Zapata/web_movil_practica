const express = require('express');
const app = express()
const PORT = 3000;
const authRoutes = require('./routes/auth.routes');
const todoRoutes = require('./routes/todo.routes');
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.use('/api/auth',authRoutes);
app.use('/api/todos',todoRoutes);


app.listen(PORT,()=>{
    console.log("Servidor corriendo en http://localhost:${port}")
});
