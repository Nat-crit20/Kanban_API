const express = require("express");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const { mongoDB } = require("./constants");

const User = require("./models/User");
const Board = require("./models/Board");
const Task = require("./models/Task");
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

app.get("/", (req, res) => {
  res.send("Home");
});
app.use("/", express.static("docs"));

app.get("/hello", (req, res) => {
  res.send("hello world");
});
app.post("/register", async (req, res) => {
  const { Username, Password, Email } = req.body;
  console.log(req.body);
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

//Fix bug
app.get("/user/:userID/board/:boardID", async (req, res) => {
  const { userID, boardID } = req.params;
  const userBoard = await User.findOne({ _id: userID, Board: boardID }).then(
    async (user) => {
      if (!user) {
        res.status(404).send("User not found");
      } else if (user.Board) {
        const board = user.Board.findIndex(boardID);
        if (!board) {
          res.status(404).send("Board not found");
        }
        return board;
      }
    }
  );
  const currentBoard = await Board.findById(userBoard);
  res.status(201).send(currentBoard);
});

app.post("/user/:userID/board", async (req, res) => {
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
});

app.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}`);
});
