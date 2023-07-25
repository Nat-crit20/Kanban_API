const express = require("express");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const { mongoDB } = require("./constants");

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (res, req) => {
  req.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}`);
});
