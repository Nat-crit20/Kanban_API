const Board = require("../models/Board");
const Column = require("../models/Column");

module.exports.getColumn = async (req, res) => {
  const { columnID } = req.params;
  await Column.findById({ _id: columnID })
    .populate("Tasks")
    .then((column) => {
      res.send(column);
    })
    .catch((err) => res.send(err));
};

module.exports.createColumn = async (req, res) => {
  const { Name } = req.body;
  const { boardID } = req.params;

  const column = await Column.create({
    Name: Name,
  });

  await Board.findOneAndUpdate(
    { _id: boardID },
    { $push: { Columns: column._id } },
    { new: true }
  )
    .populate({
      path: "Columns",
      populate: { path: "Tasks" },
    })
    .then((board) => {
      res.status(200).json(board);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};
