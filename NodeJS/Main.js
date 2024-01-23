//Main.js

require("dotenv").config({ path: "C:/Project/WB38_Project/NodeJS/.env" });

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const sessionStore = new MySQLStore({
  host: "localhost",
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const corsOption = {
  origin: true,
  credentials: true,
};

const bodyParser = require("body-parser");
const passport = require("passport");
const passportConfig = require("./passport/index.js");
const LocalStrategy = require("./passport/localStrategy.js");
const KakaoStrategy = require("./passport/kakaoStrategy.js");
const NaverStrategy = require("./passport/naverStrategy.js");

const authRouter = require("./router/auth.js");
const aiRouter = require("./router/ai.js");

const app = express();
const port = 3005;

app.use(cors(corsOption));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60, //1h
    },
    store: sessionStore,
    name: "session",
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  const clientIP = req.ip;
  console.log(`Client IP Address: ${clientIP}`);
  if (clientIP == "::ffff:10.101.70.130") {
    next();
  } else {
    res.status(403).send("Forbidden Access");
  }
});

LocalStrategy();
KakaoStrategy();
NaverStrategy();
passportConfig();

app.use("/auth", authRouter); // 인증 라우터
app.use("/ai", aiRouter); // 파일 라우터

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
