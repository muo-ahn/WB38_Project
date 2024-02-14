//auth.js

const express = require("express");
const router = express.Router();
const userModule = require("../models/userClass.js");
const passport = require("passport");

router.post("/login_process", (req, res, next) => {
  console.log(`로그인 요청 : ${req.body.username} ${req.body.password}`);

  passport.authenticate(
    "local",
    { failureRedirect: "/", failureFlash: true },
    (authError, user, info) => {
      if (authError) {
        console.log(authError);
        return next(authError);
      }
      if (!user) {
        return res.status(401).json({ error: info.message });
      }

      req.login(user, (loginError) => {
        if (loginError) {
          console.error(loginError);
          return next(loginError);
        }

        req.session.save(() => {
          return res.status(200).json({
            user: user.username,
            provider: user.provider,
            email: user.email,
          });
        });
      });
    }
  )(req, res, next);
});

router.post("/kakao", passport.authenticate("kakao"));
router.post(
  "/kakao/callback",
  passport.authenticate("kakao", {
    failureRedirect: "/auth/login",
  }),
  // when kakao strategy is success
  (req, res) => {
    res.status(200);
  }
);

router.post("/naver", passport.authenticate("naver"));
router.post(
  "/naver/callback",
  passport.authenticate("naver", {
    failureRedirect: "/auth/login",
  }),
  (req, res) => {
    res.status(200);
  }
);

router.post("/logout_process", function (req, res) {
  if (!req.body.user) res.status(401).json({ error: "잘못된 접근" });
  console.log("로그아웃 요청 : " + req.body.user);

  userModule.find(req.body.user, req.body.provider, (error, results) => {
    if (error) return res.status(401).json({ error: "잘못된 접근" });

    req.user = results;
    req.logout(function () {
      req.session.destroy(function (err) {
        if (err) {
          console.log("Error : " + err);
          return res.status(401).json({ error: "logout error" });
        }
        return res.status(200).json({ message: "로그아웃 성공" });
      });
    });
  });
});

router.post("/register_process", function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;
  var email = req.body.email;
  console.log("회원가입 요청");

  if (username && password && password2) {
    if (password === password2) {
      userModule.create(
        username,
        password,
        email,
        "local",
        function (error, result) {
          if (error || !result) {
            return res.status(401).json({ error: "회원가입 오류" });
          } else {
            return res.status(200).json({ message: result });
          }
        }
      );
    } else if (password !== password2) {
      // 잘못된 패스워드 입력
      return res.status(401).json({ error: "잘못된 pw" });
    } else {
      // 이미 존재하는 id
      return res.status(401).json({ error: "이미 존재하는 id" });
    }
  } else {
    return res.status(401).json({ error: "입력 확인" });
  }
});

router.post("/update_password_process", function (req, res) {
  console.log("비밀번호 변경 요청 : ", req.body.user);

  if (!req.body.user) res.status(401).json({ error: "잘못된 접근" });

  var username = req.body.user;
  var password = req.body.password;
  var password2 = req.body.passwordafter;

  if (username && password && password2) {
    userModule.updatePassword(
      username,
      password,
      password2,
      "local",
      function (error, result) {
        if (error) {
          console.error("Error:", error);
          res.status(401).json({ error: error });
        } else {
          console.log("비밀번호 변경 성공 : " + req.body.user);

          res.status(200).json({ message: result });
        }
      }
    );
  }
});

router.post("/update_email_process", function (req, res) {
  console.log("이메일 변경 요청 : " + req.body.user);

  if (!req.body.user) res.status(401).json({ error: "잘못된 접근" });

  var username = req.body.user;
  var password = req.body.password;
  var email = req.body.email;

  if (username && password && email) {
    userModule.updateEmail(
      username,
      password,
      email,
      "local",
      function (error, result) {
        if (error) {
          console.error("Error:", error);
          return res.status(401).json({ error: error });
        } else {
          console.log("이메일 변경 성공 : " + req.body.user);
          return res.status(200).json({ message: result });
        }
      }
    );
  }
});

router.post("/delete_account_process", function (req, res) {
  console.log("회원 탈퇴 요청 : " + req.body.user);

  if (!req.body.user) res.status(401).json({ error: "잘못된 접근" });

  var username = req.body.user;
  var password = req.body.password;
  var password2 = req.body.password2;

  if (password && password2) {
    if (password == password2) {
      userModule.deleteAccount(
        username,
        password,
        "local",
        function (error, result) {
          if (error) {
            console.error("Error:", error);
            return res.status(401).json({ error: error });
          } else {
            req.logout(() => {
              req.session.destroy();

              console.log("회원 탈퇴 성공 : " + req.body.user);
              return res.status(200).json({ message: result });
            });
          }
        }
      );
    } else {
      return res.status(401).json({ error: "비밀번호 확인" });
    }
  }
});

module.exports = router;
