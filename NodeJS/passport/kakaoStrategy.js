require("dotenv").config({ path: "C:/Project/WB38_Project/NodeJS/.env" });

const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;

module.exports = () => {
  passport.use(
    new KakaoStrategy({
      clientID: process.env.KAKAO_ID,
      callbackURL: "/auth/login/kakao/callback",
    }),
    async (accessToken, refreshToken, profile, done) => {
      console.log("Kakao Profile : ", profile);
    }
  );
};
