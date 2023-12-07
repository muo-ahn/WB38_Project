var express = require("express");
var router = express.Router();
var template = require("./template.js");
var db = require("./db.js");
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
    // id와 pw가 입력되었는지 확인
    db.query(
      "SELECT * FROM userTable WHERE username = ?",
      [username],
      function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
          //pw 복호화
          hasher(
            { password: pwd, salt: results[0].salt },
            function (err, pass, salt, hash) {
              if (hash == results[0].password) {
                req.session.is_logined = true; // 세션 정보 갱신
                req.session.nickname = username;
                req.session.save(function () {
                  res.redirect(`/`);
                });
              }
            }
          );
        } else {
          res.send(`<script type="text/javascript">alert("로그인 정보가 일치하지 않습니다."); 
            document.location.href="/auth/login";</script>`);
        }
      }
    );
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
    db.query(
      "SELECT * FROM userTable WHERE username = ?",
      [username],
      function (error, results, fields) {
        // DB에 같은 이름의 회원아이디가 있는지 확인
        if (error) throw error;
        if (results.length <= 0 && password == password2) {
          // DB에 같은 이름의 회원아이디가 없고, 비밀번호가 올바르게 입력된 경우
          hasher({ password: password }, function (err, pass, salt, hash) {
            db.query(
              "INSERT INTO userTable (username, password, salt, email) VALUES(?,?,?,?)",
              [username, hash, salt, email],
              function (error, data) {
                if (error) throw error;
                res.send(`<script type="text/javascript">alert("회원가입이 완료되었습니다!");
                        document.location.href="/";</script>`);
              }
            );
          });
        } else if (password != password2) {
          // 비밀번호가 올바르게 입력되지 않은 경우
          res.send(`<script type="text/javascript">alert("입력된 비밀번호가 서로 다릅니다."); 
                document.location.href="/auth/register";</script>`);
        } else {
          // DB에 같은 이름의 회원아이디가 있는 경우
          res.send(`<script type="text/javascript">alert("이미 존재하는 아이디 입니다."); 
                document.location.href="/auth/register";</script>`);
        }
      }
    );
  } else {
    // 입력되지 않은 정보가 있는 경우
    res.send(`<script type="text/javascript">alert("입력되지 않은 정보가 있습니다."); 
        document.location.href="/auth/register";</script>`);
  }
});

module.exports = router;
