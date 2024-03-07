const Column = require("../models/Column");
const Task = require("../models/Task");

module.exports.createTask = async (req, res) => {
  const { Title, Description, SubTasks } = req.body;
  const { columnID } = req.params;
  const name = req.body.Status.name;
  const task = await Task.create({
    Title,
    Description,
    Status: {
      name,
      columnID,
    },
    SubTasks,
  });

  await Column.findOneAndUpdate(
    { _id: columnID },
    { $push: { Tasks: task._id } },
    { new: true }
  )
    .populate("Tasks")
    .then((column) => {
      res.status(200).json(column);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

module.exports.getTask = async (req, res) => {
  const { taskID } = req.params;
  await Task.findById({ _id: taskID })
    .then((task) => {
      res.send(task);
    })
    .catch((err) => res.send(err));
};

module.exports.updateTask = async (req, res) => {
  const { columnID, taskID } = req.params;
  const { Title, Description, SubTasks } = req.body;
  const name = req.body.Status.name;
  const newColumnID = req.body.Status.columnID;
  try {
    //Find the task to be updated
    const task = await Task.findById(taskID);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    //Remove the task from the old column's Task array
    await Column.findOneAndUpdate(
      { _id: columnID },
      { $pull: { Tasks: taskID } }
    );

    await Column.findOneAndUpdate(
      { _id: newColumnID },
      { $push: { Tasks: taskID } }
    );

    //Update the task's information
    await Task.findOneAndUpdate(
      { _id: taskID },
      {
        $set: {
          Title,
          Description,
          Status: {
            name,
            columnID: newColumnID,
          },
          SubTasks,
        },
      },
      { new: true }
    )
      .then((task) => {
        if (task) {
          res.status(200).send(task);
        }
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
