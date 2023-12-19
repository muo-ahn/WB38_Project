const express = require("express");
const router = express.Router();
const template = require("../models/template.js");
const userModule = require("../models/userClass.js");
const loggedincheck = require("./middlewares.js");
const passport = require("passport");

router.get("/login", loggedincheck.isNotLoggedIn, function (req, res) {
  var title = "로그인";
  var html = template.HTML(
    title,
    `
    <h2>로그인<h2>
    <form action="/auth/login_process" method="post">
    <p><input class="login" type="text" name="username" placeholder="아이디"></p>
    <p><input class="login" type="password" name="password" placeholder="비밀번호"></p>
    <p><input class="btn" type="submit" value="로그인"></p>
    <p><a id="kakao" href="/auth/kakao" class="btn">카카오톡 로그인</a>
    <p><a id="naver" href="/auth/naver" class="btn">네이버 로그인</a>
    </form>            
    <p>계정이 없으신가요?  <a href="/auth/register">회원가입</a></p>
    `,
    ""
  );
  res.send(html);
});

router.post("/login_process", (req, res, next) => {
  passport.authenticate(
    "local",
    { failureRedirect: "/login", failureFlash: true },
    (authError, user, info) => {
      if (authError) {
        console.log(authError);
        return next(authError);
      }
      if (!user) {
        return res.redirect(`/?loginError=${info.message}`);
      }

      return req.login(user, (loginError) => {
        if (loginError) {
          console.error(loginError);
          return next(loginError);
        }

        return req.session.save(function () {
          res.redirect("/");
        });
      });
    }
  )(req, res, next);
});

router.get("/kakao", passport.authenticate("kakao"));

router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    failureRedirect: "/auth/login",
  }),
  // when kakao strategy is success
  (req, res) => {
    res.redirect("/");
  }
);

router.get("/naver", passport.authenticate("naver"));

router.get(
  "/naver/callback",
  passport.authenticate("naver", {
    failureRedirect: "/auth/login",
  }),
  (req, res) => {
    res.redirect("/");
  }
);

router.get("/logout", loggedincheck.isLoggedIn, function (req, res) {
  req.logout(function (err) {
    req.session.destroy(function (err) {
      res.redirect("/");
    });
  });
});

router.get("/register", loggedincheck.isNotLoggedIn, function (req, res) {
  var title = "회원가입";
  var html = template.HTML(
    title,
    `
    <h2>회원가입</h2>
    <form action="/auth/register_process" method="post">
    <p><input class="login" type="text" name="username" placeholder="아이디"></p>
    <p><input class="login" type="password" name="pwd" placeholder="비밀번호"></p>    
    <p><input class="login" type="password" name="pwd2" placeholder="비밀번호 재확인"></p>
    <p><input class="login" type="text" name="email" placeholder="이메일"></p>
    <p><input class="btn" type="submit" value="제출"></p>
    </form>            
    <p><a href="/auth/login">로그인화면으로 돌아가기</a></p>
    `,
    ""
  );
  res.send(html);
});

router.post("/register_process", function (req, res) {
  var username = req.body.username;
  var password = req.body.pwd;
  var password2 = req.body.pwd2;
  var email = req.body.email;

  if (username && password && password2) {
    if (password === password2) {
      userModule.create(
        username,
        password,
        email,
        "local",
        function (error, result, salt) {
          if (error) {
            console.error("Error:", error);
            res.send(
              '<script type="text/javascript">alert("에러 발생"); document.location.href="/auth/register";</script>'
            );
          } else {
            res.send(
              '<script type="text/javascript">alert("회원가입 성공!"); document.location.href="/";</script>'
            );
          }
        }
      );
    } else if (password !== password2) {
      // 잘못된 패스워드 입력
      res.send(
        '<script type="text/javascript">alert("패스워드 입력을 확인하세요."); document.location.href="/auth/register";</script>'
      );
    } else {
      // 이미 존재하는 id
      res.send(
        '<script type="text/javascript">alert("이미 존재하는 id"); document.location.href="/auth/register";</script>'
      );
    }
  }
});

module.exports = router;
