var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

router.use(passport.initialize());
router.use(passport.session());

passport.serializeUser(function (user, done) {
  console.log("serializeUser ", user);
  done(null, id);
});

passport.deserializeUser(function (id, done) {
  console.log("deserializeUser ", id);
  user_id.findById(id, function (err, user) {
    done(err, user);
  });
});

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "username", //req.body.username
        passwordField: "password", //req.body.password
      },
      async function (username, password, done) {
        //로그인시 로직작성할것 아래코드는 예시코드 mysql작성하는거
        var sql =
          "select password,username from userTable where username like?;";
        var params = [username];
        db.query(sql, params, function (err, rows) {
          console.log(rows[0]);

          if (err) return done(err);
          if (rows.length === 0) {
            console.log("결과 없음");
            return done(null, false, { message: "Incorrect" });
          } //에러처리 존나중요해
          if (rows[0].password !== password) {
            console.log("비버니틀려용");
            return done(null, false, { message: "pw not found" });
          }
          if (rows[0].password === password) {
            console.log("비번이마자용");
            var user = rows[0];
            return done(null, user); //여기까지 오는거면 위로 디비의 유저아이디 비번이 저장되서 올라감
          }
        });
      }
    )
  );
};
