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

module.exports.updateBoard = async (req, res) => {
  const { Name } = req.body;
  const { boardID } = req.params;

  await Board.findOneAndUpdate(
    { _id: boardID },
    { $set: { Name: Name } },
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

module.exports.deleteBoard = async (req, res) => {
  const { userID, boardID } = req.params;
  try {
    //Find the board
    const board = await Board.findById(boardID);

    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }
    //Get column ID to delete
    const columnsToDelete = board.Columns;

    //Delete related tasks
    await Task.deleteMany({ "Status.columnID": { $in: columnsToDelete } });

    //Delete related columns
    await Column.deleteMany({ _id: { $in: columnsToDelete } });

    //Delete board
    await Board.findByIdAndDelete(boardID);

    //Remove board reference from user
    await User.findByIdAndUpdate(
      userID,
      { $pull: { Board: boardID } },
      { new: true }
    );
    res.status(200).json({ message: "Board deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
