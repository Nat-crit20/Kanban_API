const express = require("express");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const { mongoDB } = require("./constants.js");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes.js");
const boardRoutes = require("./routes/boardRoutes.js");
const columnRoutes = require("./routes/columnRoutes.js");
const taskRoutes = require("./routes/taskRoutes.js");
const userController = require("./controllers/userController");

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

app.use("/user", passport.authenticate("jwt", { session: false }), userRoutes);
app.use(
  "/board",
  passport.authenticate("jwt", { session: false }),
  boardRoutes
);
app.use(
  "/column",
  passport.authenticate("jwt", { session: false }),
  columnRoutes
);
app.use("/task", passport.authenticate("jwt", { session: false }), taskRoutes);

app.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}`);
});
