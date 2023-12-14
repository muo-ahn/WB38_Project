const passport = require("passport");
const local = require("./localStrategy");
const userModule = require("../modules/user.js");

module.exports = () => {
  passport.serializeUser(function (user, done) {
    console.log("serializeUser" + user.username);
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    console.log("deserializeUser" + user.username);
    userModule.find(user.username, function (error, user) {
      done(error, user);
    });
  });

  local();
};
