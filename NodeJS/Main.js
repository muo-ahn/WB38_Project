const express = require("express");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const sessionStore = new MySQLStore({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "0000",
  database: "test",
});

const bodyParser = require("body-parser");
const passport = require("passport");
const passportConfig = require("./passport/index.js");
const LocalStrategy = require("./passport/localStrategy.js");
const { isLoggedIn, isNotLoggedIn } = require("./router/middlewares.js");

const authRouter = require("./router/auth.js");
const fileRouter = require("./router/file.js");
const aiRouter = require("./router/ai.js");

const authCheck = require("./modules/authCheck.js");
const template = require("./modules/template.js");

const app = express();
const port = 3005;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "as321v3221sadv65q!@#ASVasd321",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
  })
);
app.use(passport.initialize());
app.use(passport.session());
LocalStrategy();
passportConfig();

app.use("/auth", authRouter); // 인증 라우터
app.use("/file", fileRouter); // 파일 라우터
app.use("/ai", aiRouter); // ai 라우터

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
app.get("/main", isLoggedIn, (req, res) => {
  var html = template.HTML(
    "Welcome",
    `<hr>
    <h2>메인 페이지에 오신 것을 환영합니다</h2>
    <p>로그인에 성공하셨습니다.</p>
    <a href="/file">FileUpload</a>
    <a href="/ai">AI Module</a>
    `,
    authCheck.statusUI(req, res)
  );
  res.send(html);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
