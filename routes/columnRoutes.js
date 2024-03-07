const express = require("express");
const router = express.Router();
const columnController = require("../controllers/columnController");
const taskController = require("../controllers/taskController");

router
  .route("/:columnID")
  .get(columnController.getColumn)
  .put(columnController.updateColumn);

router.route("/:columnID/task").post(taskController.createTask);

router
  .route("/:columnID/task/:taskID")
  .put(taskController.updateTask)
  .delete(taskController.deleteTask);
module.exports = router;
