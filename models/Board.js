const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = Schema({
  Title: String,
  Description: String,
  Status: String,
  SubTasks: [
    {
      title: String,
      isCompleted: { type: Boolean, default: false },
    },
  ],
});

const boardSchema = Schema({
  Name: String,
  Columns: [
    {
      Name: String,
      Tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    },
  ],
});

let Task = mongoose.model("Task", taskSchema);
let Board = mongoose.model("Board", boardSchema);

module.exports.Task = Task;
module.exports.Board = Board;
