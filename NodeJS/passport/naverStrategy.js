//naverStrategy.js

require("dotenv").config({ path: "C:/Project/WB38_Project/NodeJS/.env" });

const passport = require("passport");
const {
  Strategy: NaverStrategy,
  Profile: NaverProfile,
} = require("passport-naver-v2");
const userModule = require("../models/userClass.js");

module.exports = () => {
  passport.use(
    new NaverStrategy(
      {
        clientID: process.env.Naver_ID,
        clientSecret: process.env.Never_Secret,
        callbackURL: "/auth/naver/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          userModule.find(profile.name, "naver", (error, result) => {
            if (result) {
              done(null, result);
            } else {
              const newUser = userModule.create(
                profile.name,
                null,
                profile.email,
                "naver"
              );
              done(null, newUser);
            }
          });
        } catch (error) {
          console.log(error);
          done(error);
        }
      }
    )
  );
};
