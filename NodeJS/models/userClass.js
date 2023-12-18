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
        if (error) throw error;
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
          callback("ID exist : ", user);
        } else {
          hasher({ password: pwd }, (err, pass, salt, hash) => {
            this.db.query(
              "INSERT INTO userTable (username, password, salt, email, provider) VALUES(?,?,?,?,?)",
              [username, hash, salt, email, provider],
              (error, data) => {
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
  }

  verifyPassword(password, user, callback) {
    hasher({ password: password, salt: user.salt }, (err, pass, salt, hash) => {
      if (err) {
        return callback(err);
      }
      callback(null, hash == user.password);
    });
  }
}

module.exports = new User();
