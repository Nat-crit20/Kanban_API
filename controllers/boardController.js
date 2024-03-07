const User = require("../models/User");
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

module.exports.createBoard = async (req, res) => {
  const { Name } = req.body;
  const { userID } = req.params;
  const board = await Board.create({
    Name: Name,
  });
  await User.findOneAndUpdate(
    { _id: userID },
    { $addToSet: { Board: board._id } },
    { new: true }
  )
    .then((user) => {
      res.status(200).json(user);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};
