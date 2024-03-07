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
