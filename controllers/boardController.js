const Board = require("../models/Board");

module.exports.getBoard = async (req, res) => {
  const { boardID } = req.params;
  await Board.findById(boardID)
    .populate({
      path: "Columns",
      populate: { path: "Tasks" },
    })
    .then((board) => {
      res.send(board);
    })
    .catch((err) => res.send(err));
};
