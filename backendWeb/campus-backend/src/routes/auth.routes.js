const { Router } = require("express");
const { login } = require("../controllers/auth.controller");

const router = Router();

// POST /login  -> { correo, password }
router.post("/", login);

module.exports = router;
