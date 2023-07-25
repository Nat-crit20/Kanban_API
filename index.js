const express = require("express");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const app = express();
const PORT = 3000;
const mongoDB = `mongodb+srv://Nat-crit20:Valoria246890@myflixdb.m9xnkss.mongodb.net/KanbanDB?`;

main()
  .then(() => console.log("Connected to database"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (res, req) => {
  req.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}`);
});
