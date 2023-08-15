const express = require("express");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const { mongoDB } = require("./constants");

const User = require("./models/User");
const Board = require("./models/Board");
const Task = require("./models/Task");
const Column = require("./models/Column");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

main()
  .then(() => console.log("Connected to database"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const auth = require("./auth")(app);
const passport = require("passport");
require("./passport");

app.get("/", (req, res) => {
  res.send("Home");
});
app.use("/", express.static("docs"));

app.post("/register", async (req, res) => {
  const { Username, Password, Email } = req.body;
  await User.findOne({ Email: Email })
    .then((user) => {
      if (user) {
        res.status(400).send("User already exists");
      } else {
        User.create({
          Username: Username,
          Password: Password,
          Email: Email,
        })
          .then((user) => {
            res.status(201).json(user);
          })
          .catch((err) => {
            res.json(`Error ${err}`);
          });
      }
    })
    .catch((err) => {
      res.json(`Error ${err}`);
    });
});

app.get("/users", async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

app.get(
  "/user/:userID/board",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { userID } = req.params;
    await User.findOne({ _id: userID }, { Board: 1 })
      .populate("Board")
      .then((user) => res.send(user))
      .catch((err) => res.send(err));
  }
);

app.get(
  "/board/:boardID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { boardID } = req.params;
    await Board.findById({ _id: boardID })
      .populate("Columns")
      .then((board) => {
        res.send(board);
      })
      .catch((err) => res.send(err));
  }
);
app.get(
  "/column/:columnID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { columnID } = req.params;
    await Column.findById({ _id: columnID })
      .populate("Tasks")
      .then((column) => {
        res.send(column);
      })
      .catch((err) => res.send(err));
  }
);
app.post(
  "/user/:userID/board",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
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
  }
);

app.post(
  "/board/:boardID/column",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { Name } = req.body;
    const { boardID } = req.params;

    const column = await Column.create({
      Name: Name,
    });

    await Board.findOneAndUpdate(
      { _id: boardID },
      { $push: { Columns: column._id } },
      { new: true }
    )
      .then((board) => {
        res.status(200).json(board);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
);

app.put(
  "/column/:columnID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { Name } = req.body;
    const { columnID } = req.params;

    await Column.findOneAndUpdate(
      { _id: columnID },
      { $set: { Name: Name } },
      { new: true }
    )
      .then((column) => {
        res.status(200).json(column);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
);
app.put(
  "/board/:boardID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { Name } = req.body;
    const { boardID } = req.params;

    await Board.findOneAndUpdate(
      { _id: boardID },
      { $set: { Name: Name } },
      { new: true }
    )
      .then((board) => {
        res.status(200).json(board);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
);
app.post(
  "/column/:columnID/task",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { Title, Description, Status, SubTasks, name } = req.body;
    const { columnID } = req.params;

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
      .then((column) => {
        res.status(200).json(column);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
);

app.get(
  "/task/:taskID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { taskID } = req.params;
    await Task.findById({ _id: taskID })
      .then((task) => {
        res.send(task);
      })
      .catch((err) => res.send(err));
  }
);

app.put(
  "/column/:columnID/task/:taskID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { columnID, taskID } = req.params;
    const { Title, Description, SubTasks, name } = req.body;
    await Task.findById(taskID).then(async (task) => {
      const columnToRemove = task.Status.columnID;
      await Column.findOneAndUpdate(
        { _id: columnToRemove },
        { $pull: { Tasks: taskID } },
        { new: true }
      );
    });
    await Task.findOneAndUpdate(
      { _id: taskID },
      {
        $set: {
          Title,
          Description,
          Status: {
            name,
            columnID,
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
  }
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
      const board = await Board.findById(boardID);
      const columnsToDelete = board.Columns;
      await Task.deleteMany({ "Status.columnID": { $in: columnsToDelete } });
      await Column.deleteMany({ _id: { $in: columnsToDelete } });
      await Board.findByIdAndDelete(boardID);
      await User.findByIdAndUpdate(
        userID,
        { $pull: { Board: boardID } },
        { new: true }
      );
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}`);
});
