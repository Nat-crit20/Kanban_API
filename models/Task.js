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
module.exports = mongoose.model("Task", taskSchema);