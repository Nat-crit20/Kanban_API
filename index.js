const express = require("express");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB = require("./constants");
const User = require("./models/User");
const Board = require("./models/Board");
const Task = require("./models/Task");
const Column = require("./models/Column");
const bodyParser = require("body-parser");
const userController = require("./controllers/userController");
const boardController = require("./controllers/boardController");
const columnController = require("./controllers/columnController");
const taskController = require("./controllers/taskController");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 8080;

main()
  .then(() => console.log("Connected to database"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(
    `mongodb+srv://Nat-crit20:Valoria246890@myflixdb.m9xnkss.mongodb.net/KanbanDB?`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
let allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:1234",
  "http://localhost:4200",
  "http://localhost:3000",
  "https://nat-crit20.github.io",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          "The CORS policy for this application doesn’t allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);
const auth = require("./auth")(app);
const passport = require("passport");
require("./passport");

app.get("/", userController.home);
app.use("/", express.static("docs"));

app.post("/register", userController.register);

app.get("/users", userController.getUsers);

app.get(
  "/user/:userID/board",
  passport.authenticate("jwt", { session: false }),
  userController.getUserBoard
);

app.get(
  "/board/:boardID",
  passport.authenticate("jwt", { session: false }),
  boardController.getBoard
);
app.get(
  "/column/:columnID",
  passport.authenticate("jwt", { session: false }),
  columnController.getColumn
);

app.post(
  "/user/:userID/board",
  passport.authenticate("jwt", { session: false }),
  boardController.createBoard
);

app.post(
  "/board/:boardID/column",
  passport.authenticate("jwt", { session: false }),
  columnController.createColumn
);

app.put(
  "/column/:columnID",
  passport.authenticate("jwt", { session: false }),
  columnController.updateColumn
);

app.put(
  "/board/:boardID",
  passport.authenticate("jwt", { session: false }),
  boardController.updateBoard
);

app.post(
  "/column/:columnID/task",
  passport.authenticate("jwt", { session: false }),
  taskController.createTask
);

app.get(
  "/task/:taskID",
  passport.authenticate("jwt", { session: false }),
  taskController.getTask
);

app.put(
  "/column/:columnID/task/:taskID",
  passport.authenticate("jwt", { session: false }),
  taskController.updateTask
);

app.delete(
  "/column/:columnID/task/:taskID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { columnID, taskID } = req.params;
    await Column.findOneAndUpdate(
      { _id: columnID },
      { $pull: { Tasks: taskID } },
      { new: true }
    )
      .populate("Tasks")
      .then(async (column) => {
        await Task.findByIdAndDelete(taskID);
        res.status(200).json(column);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
);

app.delete(
  "/board/:boardID/column/:columnID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { columnID, boardID } = req.params;
    try {
      const column = await Column.findById(columnID);
      if (!column) {
        return res.status(404).json({ error: "Column not found" });
      }
      const tasksToDelete = column.Tasks;
      await Task.deleteMany({ _id: { $in: tasksToDelete } });

      await Board.findByIdAndUpdate(
        boardID,
        { $pull: { Columns: columnID } },
        { new: true }
      )
        .populate({
          path: "Columns",
          populate: { path: "Tasks" },
        })
        .then(async (board) => {
          await Column.findByIdAndDelete(columnID);
          res.status(200).json(board);
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

app.delete(
  "/user/:userID/board/:boardID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
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
  }
);

app.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}`);
});
