const passport = require("passport");
const local = require("./localStrategy");
const userModule = require("../modules/user.js");

module.exports = () => {
  passport.serializeUser(function (user, done) {
    console.log("serializeUser" + user);
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    console.log("deserializeUser" + user);
    userModule.find(user.username, function (error, user) {
      done(error, user);
    });
  });

  local();
};
