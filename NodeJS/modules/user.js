var mysql = require("mysql");
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();

var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "0000",
  database: "test",
});
db.connect();

module.exports = {
  db: db,
  find: function (username, callback) {
    db.query(
      "SELECT * FROM userTable WHERE username = ?",
      [username],
      function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
          callback(null, results[0]);
        } else {
          callback(null, null); // User not found
        }
      }
    );
  },
  create: function (username, pwd, email, callback) {
    this.find(username, function (error, user) {
      if (error) {
        //오류 발생 경우
        callback("Error : ", error);
      } else {
        if (user) {
          //해당 username이 이미 있는 경우.
          callback("ID exist : ", null);
        } else {
          //해당 username으로 이루어진 객체가 없음
          hasher({ password: pwd }, function (err, pass, salt, hash) {
            db.query(
              "INSERT INTO userTable (username, password, salt, email) VALUES(?,?,?,?)",
              [username, hash, salt, email],
              function (error, data) {
                if (error) {
                  callback("Error : ", error);
                } else {
                  callback(null, "회원가입 성공");
                }
              }
            );
          });
        }
      }
    });
  },
  verifyPassword: function (password, user, callback) {
    hasher(
      { password: password, salt: user.salt },
      function (err, pass, salt, hash) {
        if (err) {
          return callback(err);
        }
        callback(null, hash == user.password);
      }
    );
  },
};
