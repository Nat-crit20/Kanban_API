const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const columnSchema = Schema({
  Name: String,
  Tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
});

module.exports = mongoose.model("Column", columnSchema);
