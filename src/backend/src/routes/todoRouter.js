const router = require('express').Router();
const { regularUserPermission, adminUserPermission } = require('../middleware/authMiddleware/authorizationPermission');

const controller = require("../controllers/todoController")

router.get("/me", regularUserPermission , controller.getTodosForUser)

router.post("/me", regularUserPermission, controller.createTodoForCurrentUser)

router.put("/me", regularUserPermission, controller.updateTodoForCurrentUser)

router.delete("/me", regularUserPermission, controller.deleteTodoForCurrentUser)

module.exports = router