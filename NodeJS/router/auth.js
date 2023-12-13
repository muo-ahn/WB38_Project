var express = require("express");
var router = express.Router();
var template = require("../template.js");
var userModule = require("../user.js");
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();

router.get("/login", function (req, res) {
  var title = "로그인";
  var html = template.HTML(
    title,
    `
    <h2>로그인<h2>
    <form action="/auth/login_process" method="post">
    <p><input class="login" type="text" name="username" placeholder="아이디"></p>
    <p><input class="login" type="password" name="pwd" placeholder="비밀번호"></p>
    <p><input class="btn" type="submit" value="로그인"></p>
    </form>            
    <p>계정이 없으신가요?  <a href="/auth/register">회원가입</a></p>
    `,
    ""
  );
  res.send(html);
});

router.post("/login_process", function (req, res) {
  var username = req.body.username;
  var pwd = req.body.pwd;

  if (username && pwd) {
    // username pwd 검사
    userModule.find(username, function (error, user) {
      if (error) {
        console.error("Error:", error);
        res.send(
          '<script type="text/javascript">alert("An error occurred."); document.location.href="/auth/login";</script>'
        );
      } else {
        if (user) {
          // 복호화 후 비밀번호 hash 검사
          hasher(
            { password: pwd, salt: user.salt },
            function (err, pass, salt, hash) {
              if (hash === user.password) {
                req.session.is_logined = true; // 세션 정보 업데이트
                req.session.nickname = username;
                req.session.save(function () {
                  res.redirect(`/`);
                });
              } else {
                res.send(
                  '<script type="text/javascript">alert("비밀번호 오류."); document.location.href="/auth/login";</script>'
                );
              }
            }
          );
        } else {
          // db에서 유저를 찾지 못한 경우
          res.send(
            '<script type="text/javascript">alert("존재하지 않는 id"); document.location.href="/auth/login";</script>'
          );
        }
      }
    });
  } else {
    res.send(`<script type="text/javascript">alert("아이디와 비밀번호를 입력하세요!"); 
    document.location.href="/auth/login";</script>`);
  }
});

router.get("/logout", function (req, res) {
  req.session.destroy(function (err) {
    res.redirect("/");
  });
});

router.get("/register", function (req, res) {
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
    // 입력 확인
    userModule.find(username, function (error, user) {
      if (error) {
        console.error("Error:", error);
        res.send(
          '<script type="text/javascript">alert("에러 발생"); document.location.href="/auth/register";</script>'
        );
      } else {
        if (!user && password === password2) {
          // 존재하지 않는 id이므로 복호화 후, 회원가입 시도
          hasher({ password: password }, function (err, pass, salt, hash) {
            userModule.create(username, hash, email, function (error, result) {
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
            });
          });
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
  } else {
    // 입력을 확인해주세요
    res.send(
      '<script type="text/javascript">alert("입력을 확인해주세요"); document.location.href="/auth/register";</script>'
    );
  }
});

module.exports = router;
