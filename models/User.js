const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const userSchema = Schema({
  Username: {
    type: String,
    required: true,
  },
  Password: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
  },
  Board: [{ type: Schema.Types.ObjectId, ref: "Board" }],
});

module.exports = mongoose.model("User", userSchema);
