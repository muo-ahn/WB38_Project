//Main.js

require("dotenv").config({ path: "C:/Project/WB38_Project/NodeJS/.env" });

const express = require("express");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const sessionStore = new MySQLStore({
  host: "localhost",
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const bodyParser = require("body-parser");
const passport = require("passport");
const passportConfig = require("./passport/index.js");
const LocalStrategy = require("./passport/localStrategy.js");
const KakaoStrategy = require("./passport/kakaoStrategy.js");
const NaverStrategy = require("./passport/naverStrategy.js");
const loggedincheck = require("./router/middlewares.js");

const authRouter = require("./router/auth.js");
const aiRouter = require("./router/ai.js");

const authCheck = require("./models/authCheck.js");
const template = require("./models/template.js");

const app = express();
const port = 3005;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
  })
);
app.use(passport.initialize());
app.use(passport.session());

LocalStrategy();
KakaoStrategy();
NaverStrategy();
passportConfig();

app.use("/auth", authRouter); // 인증 라우터
app.use("/ai", aiRouter); // 파일 라우터

app.get("/", (req, res) => {
  if (!authCheck.isOwner(req, res)) {
    // 로그인 안되어있으면 로그인 페이지로 이동시킴
    res.redirect("/auth/login");
    return false;
  } else {
    // 로그인 되어있으면 메인 페이지로 이동시킴
    res.redirect("/main");
    return false;
  }
});

// 메인 페이지
app.get("/main", loggedincheck.isLoggedIn, (req, res) => {
  var html = template.HTML(
    "Welcome",
    `<hr>
    <h2>메인 페이지에 오신 것을 환영합니다</h2>
    <p>로그인에 성공하셨습니다.</p>
    <a href="/ai">진찰 의뢰 게시판</a>
    <a href="/ai">AI Module</a>
    `,
    authCheck.statusUI(req, res)
  );
  res.send(html);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
