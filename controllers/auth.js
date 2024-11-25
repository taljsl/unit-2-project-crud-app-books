const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const bcrypt = require("bcrypt");

module.exports = router;

router.get("/sign-up", (req, res) => {
  res.render("auth/sign-up.ejs");
});

router.get("/sign-in", (req, res) => {
  res.render("auth/sign-in.ejs");
});

router.post("/sign-up", async (req, res) => {
  const userInDatabase = await User.findOne({ username: req.body.username });
  if (userInDatabase) {
    return res.send("Username already taken.");
  }
  if (req.body.password !== req.body.confirmPassword) {
    return res.send("Password and Confirm Password must match");
  }

  //   complexity test
  //   >=1 lower  >=1 capital >=1 num >=1 char        validchars      >=8 chars  ^...$ ensures entirety of string tested
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(req.body.password)) {
    return res.send("Please make sure you follow all of the password rules");
  }
  //   password encryption
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  req.body.password = hashedPassword;
  const user = await User.create(req.body);
  // the below is made with the help of chatgpt
  //the alert pops up a message thanking them for signing up, the time out places a 1 second delay after you hit 
  res.send(`
    <script>
          alert('Thanks for signing up ${user.username}');
          setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    </script>
  `);
  //   display the above message for two seconds and then redirect to homepage.
  // trying a timeout after sending the message yields an error that you can't set headers aftera completed request
  //   setTimeout(() => {
  //     res.redirect('/')
  //   }, 2000)
});

router.post("/sign-in", async (req, res) => {
  // find the user
  const userInDatabase = await User.findOne({ username: req.body.username });
  if (!userInDatabase) {
    return res.send("Login Failed. Please try again.");
  }
  // if there is a user, test their password
  const validPassword = bcrypt.compareSync(
    req.body.password,
    userInDatabase.password
  );
  if (!validPassword) {
    return res.send("Login Failed, Please try again.");
  }
  // if both are true create a session
  req.session.user = {
    username: userInDatabase.username,
    _id: userInDatabase._id,
  };

  res.redirect("/");
});

router.get("/sign-out", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});
