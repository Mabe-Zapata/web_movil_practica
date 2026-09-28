require("dotenv").config();
const { construirApp } = require("./infraestructura/contenedor");

const app = construirApp();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor backend (arquitectura hexagonal) corriendo en http://localhost:${PORT}`);
});
