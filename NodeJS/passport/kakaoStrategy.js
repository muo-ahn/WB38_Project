// require("dotenv").config({ path: "C:/Project/WB38_Project/NodeJS/.env" });

// const passport = require("passport");
// const KakaoStrategy = require("passport-kakao").Strategy;
// const userModule = require("../models/userClass.js");

// module.exports = () => {
//   passport.use(
//     new KakaoStrategy({
//       clientID: process.env.KAKAO_ID,
//       callbackURL: "/auth/kakao/callback",
//     }),
//     /*
//      * clientID에 카카오 앱 아이디 추가
//      * callbackURL: 카카오 로그인 후 카카오가 결과를 전송해줄 URL
//      * accessToken, refreshToken: 로그인 성공 후 카카오가 보내준 토큰
//      * profile: 카카오가 보내준 유저 정보. profile의 정보를 바탕으로 회원가입
//      */
//     async (accessToken, refreshToken, profile, done) => {
//       console.log("Kakao Profile : ", profile);
//       try {
//         const exUser = userModule.find(profile, "kakao");

//         if (exUser) {
//           done(null, exUser);
//         } else {
//           const newUser = userModule.create({
//             username: profile.displayName,
//             email: profile._json && profile._json.kakao_account_email,
//             provider: "kakao",
//           });
//           done(null, newUser);
//         }
//       } catch (error) {
//         console.error(error);
//         done(error);
//       }
//     }
//   );
// };
