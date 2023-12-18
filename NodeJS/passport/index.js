const passport = require("passport");
const local = require("./localStrategy");
const kakao = require("./kakaoStrategy.js");
const userModule = require("../models/userClass.js");

module.exports = () => {
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    userModule.find(user.username, "local", function (error, user) {
      done(error, user);
    });
  });

  local();
};
