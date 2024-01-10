//kakaoStrategy.js

require("dotenv").config({ path: "C:/Project/WB38_Project/NodeJS/.env" });

const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;
const userModule = require("../models/userClass.js");

//verify callback 인식을 못해서 따로 빼서 선언
const verifyCallback = async (accessToken, refreshToken, profile, done) => {
  try {
    userModule.find(profile.displayName, "kakao", (error, result) => {
      if (result) {
        done(null, result);
      } else {
        const newUser = userModule.create(
          profile.displayName,
          null,
          null,
          "kakao"
        );
        done(null, newUser);
      }
    });
  } catch (error) {
    console.error(error);
    done(error);
  }
};

module.exports = () => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_ID,
        callbackURL: "/auth/kakao/callback",
      },
      verifyCallback
    )
  );
};
