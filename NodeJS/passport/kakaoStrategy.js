require("dotenv").config({ path: "C:/Project/WB38_Project/NodeJS/.env" });

// new KakaoStrategy({
//   clientID: process.env.KAKAO_ID,
//   callbackURL: "/auth/login/kakao/callback",
// });

console.log(process.env.SESSION_SECRET);
console.log(process.env.DB_HOST);
console.log(process.env.DB_PORT);
console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);
console.log(process.env.DB_DATABASE);
