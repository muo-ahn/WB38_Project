const passport = require("passport");
const local = require("./localStrategy");
const userModule = require("../models/userClass.js");

module.exports = () => {
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    userModule.find(user.username, function (error, user) {
      done(error, user);
    });
  });

  local();
};
