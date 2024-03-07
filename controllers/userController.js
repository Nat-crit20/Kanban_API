const User = require("../models/User");

module.exports.home = (req, res) => {
  res.send("Home");
};

module.exports.register = async (req, res) => {
  const { Username, Password, Email } = req.body;
  const hashedPassword = User.hashPassword(Password);
  await User.findOne({ Email: Email })
    .then((user) => {
      if (user) {
        res.status(400).send("User already exists");
      } else {
        User.create({
          Username: Username,
          Password: hashedPassword,
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
};

module.exports.getUsers = async (req, res) => {
  const users = await User.find({});
  res.json(users);
};

module.exports.getUserBoard = async (req, res) => {
  const { userID } = req.params;
  await User.findOne({ _id: userID }, { Board: 1 })
    .populate("Board")
    .then((user) => res.send(user))
    .catch((err) => res.send(err));
};
