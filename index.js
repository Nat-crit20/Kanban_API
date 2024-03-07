const express = require("express");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const { mongoDB } = require("./constants.js");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes.js");
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
  await mongoose.connect(`${mongoDB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
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

// app.get(
//   "/user/:userID/board",
//   passport.authenticate("jwt", { session: false }),
//   userController.getUserBoard
// );
// app.post(
//   "/user/:userID/board",
//   passport.authenticate("jwt", { session: false }),
//   boardController.createBoard
// );
// app.delete(
//   "/user/:userID/board/:boardID",
//   passport.authenticate("jwt", { session: false }),
//   boardController.deleteBoard
// );
app.use("/user", passport.authenticate("jwt", { session: false }), userRoutes);

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
  taskController.deleteTask
);

app.delete(
  "/board/:boardID/column/:columnID",
  passport.authenticate("jwt", { session: false }),
  columnController.deleteColumn
);

app.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}`);
});
