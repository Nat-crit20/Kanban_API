const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const boardController = require("../controllers/boardController");

router
  .route("/:userID/board")
  .get(userController.getUserBoard)
  .post(boardController.createBoard);

router.route("/:userID/board/:boardID").delete(boardController.deleteBoard);

module.exports = router;
