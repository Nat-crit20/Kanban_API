const express = require("express");
const router = express.Router();
const boardController = require("../controllers/boardController");
const columnController = require("../controllers/columnController");

router
  .route("/:boardID")
  .get(boardController.getBoard)
  .put(boardController.updateBoard);

router.route("/:boardID/column").post(columnController.createColumn);

router
  .route("/:boardID/column/:columnID")
  .delete(columnController.deleteColumn);

module.exports = router;
