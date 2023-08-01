const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const boardSchema = Schema({
  Name: String,
  Columns: [{ type: Schema.Types.ObjectId, ref: "Column" }],
});

module.exports = mongoose.model("Board", boardSchema);
