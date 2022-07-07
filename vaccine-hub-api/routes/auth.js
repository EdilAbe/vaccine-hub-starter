const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.post("/login", async (req, res, next) => {
  try {
    //take the inputs (user and email) and attempt to authenticate them
    const user = await User.login(req.body);
    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    // takes the users information
    // create a new user in our database
    const user = await User.register(req.body);
    console.log(req.body);
    return res.status(201).json({ user });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

module.exports = router;
