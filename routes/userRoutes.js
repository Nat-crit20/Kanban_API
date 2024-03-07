const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get(
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

module.exports = router;
