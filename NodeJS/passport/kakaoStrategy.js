require("dotenv").config({ path: "C:/Project/WB38_Project/NodeJS/.env" });

const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;

module.exports = () => {
  passport.use(
    new KakaoStrategy({
      clientID: process.env.KAKAO_ID,
      callbackURL: "/auth/kakao/callback",
    }),
    /*
     * clientID에 카카오 앱 아이디 추가
     * callbackURL: 카카오 로그인 후 카카오가 결과를 전송해줄 URL
     * accessToken, refreshToken: 로그인 성공 후 카카오가 보내준 토큰
     * profile: 카카오가 보내준 유저 정보. profile의 정보를 바탕으로 회원가입
     */
    async (accessToken, refreshToken, profile, done) => {
      console.log("Kakao Profile : ", profile);
    }
  );
};
