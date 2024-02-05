//Main.js

require("dotenv").config({ path: "C:/Project/WB38_Project/NodeJS/.env" });

const http = require("http");
const io = require("socket.io");
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
  method: ["GET", "POST"],
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
const chatRouter = require("./router/chat.js");

const aiModule = require("./models/aiClass.js");
const { error } = require("console");

const app = express();
const restapi_port = 3005;
const socket_port = 3006;

const server = http.createServer(app);
const socketServer = io(server);

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

// app.use((req, res, next) => {
//   const clientIP = req.ip;
//   console.log(`Client IP Address: ${clientIP}`);
//   if (clientIP == "::ffff:10.101.70.130") {
//     next();
//   } else {
//     res.status(403).send("Forbidden Access");
//   }
// });

LocalStrategy();
KakaoStrategy();
NaverStrategy();
passportConfig();

app.use("/auth", authRouter); // 인증 라우터
app.use("/ai", aiRouter); // 파일 라우터
app.use("/chat", chatRouter); //채팅 상담 라우터

app.listen(restapi_port, () => {
  console.log(`RestAPI Server Listening on ${restapi_port}`);
});

//socket 서버
socketServer.on("connection", (socket) => {
  console.log("Socket Client Connected");

  socket.on("image", async (data) => {
    try {
      aiModule.createUserHistoryLive(
        data.user,
        data.image,
        data.petname,
        data.petbreed.type,
        data.api.type,
        data.usertext,
        (error, results, historyids) => {
          if (error)
            return socket.emit("text", { error: error, status: "error" });

          return socket.emit("text", {
            result: results,
            historyid: historyids,
            status: "ok",
          });
        }
      );
    } catch (error) {
      console.log(error);
      return socket.emit("text", { error: error, status: "error" });
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket Client Disconnected");
  });
});

server.listen(socket_port, () => {
  console.log(`Socket Server Listening on ${socket_port}`);
});
