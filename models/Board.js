const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const boardSchema = Schema({
  Name: String,
  Columns: [
    {
      Name: String,
      Tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    },
  ],
});

module.exports = mongoose.model("Board", boardSchema);
