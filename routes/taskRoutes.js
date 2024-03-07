const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

router.route("/:taskID").get(taskController.getTask);

module.exports = router;
