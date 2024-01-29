//userClass.js

require("dotenv").config({ path: "C:/Project/WB38_Project/NodeJS/.env" });
const mysql = require("mysql");

const bkfd2Password = require("pbkdf2-password");
const hasher = bkfd2Password();

class User {
  constructor() {
    this.db = mysql.createConnection({
      host: "localhost",
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });
    this.db.connect();
  }

  find(username, provider, callback) {
    this.db.query(
      "SELECT * FROM userTable WHERE username = ? AND provider = ?",
      [username, provider],
      (error, results, fields) => {
        if (error) return callback(error);
        if (results.length > 0) {
          callback(null, results[0]);
        } else {
          callback(null, null); // User not found
        }
      }
    );
  }

  create(username, pwd, email, provider, callback) {
    this.find(username, provider, (error, user) => {
      if (error) {
        callback("Error : ", error);
      } else {
        if (user) {
          callback("ID exist", user);
        } else {
          if (provider == "local" && pwd) {
            hasher({ password: pwd }, (err, pass, salt, hash) => {
              this.db.query(
                "INSERT INTO userTable (username, password, salt, email, provider) VALUES(?,?,?,?,?)",
                [username, hash, salt, email, provider],
                (err, data) => {
                  if (err) {
                    callback("Error : ", err);
                  } else {
                    callback(null, "회원가입 성공");
                  }
                }
              );
            });
          } else {
            this.db.query(
              "INSERT INTO userTable (username, email, provider) VALUES (?,?,?)",
              [username, email, provider],
              (error, data) => {
                if (error) {
                  callback("Error: ", error);
                } else {
                  callback(null, "회원가입 성공");
                }
              }
            );
          }
        }
      }
    });
  }

  verifyPassword(password, user, callback) {
    hasher({ password: password, salt: user.salt }, (err, pass, salt, hash) => {
      if (err) {
        return callback(err);
      }
      callback(null, hash == user.password, salt);
    });
  }

  updatePassword(username, password, password2, provider, callback) {
    this.find(username, provider, (error, result) => {
      if (error) return callback("존재하지 않는 id");

      const user = {
        password: result.password,
        salt: result.salt,
      };
      this.verifyPassword(password, user, (error) => {
        if (error) return callback("비밀번호 확인 오류");

        hasher({ password: password2 }, (err, pass, salt, hash) => {
          if (err) return callback("비밀번호 업데이트 실패");

          this.db.query(
            "UPDATE userTable SET password = ?, salt = ? WHERE username = ? AND provider = ?",
            [hash, salt, username, provider],
            (err, data) => {
              if (err) return callback(null, "비밀번호 업데이트 실패");
              else return callback(null, "비밀번호 업데이트 성공");
            }
          );
        });
      });
    });
  }

  updateEmail(username, password, email, provider, callback) {
    this.find(username, provider, (error, result) => {
      if (error) return callback("존재하지 않는 id");

      const user = {
        password: result.password,
        salt: result.salt,
      };
      this.verifyPassword(password, user, (error) => {
        if (error) return callback("비밀번호 확인 오류");

        this.db.query(
          "UPDATE userTable SET email = ? WHERE username = ? AND provider = ?",
          [email, username, provider],
          (err, data) => {
            if (err) return callback(null, "이메일 업데이트 실패");
            else return callback(null, "이메일 업데이트 성공");
          }
        );
      });
    });
  }

  deleteAccount(username, password, provider, callback) {
    this.find(username, provider, (error, result) => {
      if (error) return callback("존재하지 않는 id");

      const user = {
        password: result.password,
        salt: result.salt,
      };
      this.verifyPassword(password, user, (error) => {
        if (error) return callback("비밀번호 확인 오류");

        this.db.query(
          "DELETE FROM userHistory WHERE username = ?",
          [username],
          (error, data) => {
            if (error) return callback(null, "계정 삭제 실패");

            this.db.query(
              "DELETE FROM usertable WHERE username = ? AND provider = ?",
              [username, provider],
              (err, data) => {
                if (err) return callback(null, "계정 삭제 실패");
                else return callback(null, "계정 삭제 성공");
              }
            );
          }
        );
      });
    });
  }
}

module.exports = new User();
