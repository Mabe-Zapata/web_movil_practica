const { Router } = require("express");
const createController = require("../controllers/genericController");

function createCrudRouter(tableName) {
  const router = Router();
  const controller = createController(tableName);

  router.get("/", controller.getAll);
  router.get("/:id", controller.getById);
  router.post("/", controller.create);
  router.put("/:id", controller.update);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.remove);

  return router;
}

module.exports = createCrudRouter;
