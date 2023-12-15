require("dotenv").config({ path: "C:/Project/WB38_Project/NodeJS/.env" });
const mysql = require("mysql");

class File {
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

  gethistoryid(username, callback) {
    this.db.query(
      "SELECT * FROM userHistory where username = ?",
      [username],
      (error, results, fields) => {
        if (error) throw error;
        const images = results.map((results) => results.image);
        const historyids = results.map((results) => results.historyid);
        callback(null, images, historyids);
      }
    );
  }

  createUserHistory(username, image, petname, petbreed, callback) {
    this.db.query(
      // 이런 형식으로 보내주어야 함...
      // INSERT INTO userHistory (username, image, petname, petbreed)
      // VALUES (
      //   NULL,
      //   'uploadfile',
      //   'starry-sky-8199764_1280.jpg',
      //   '7bit',
      //   'image/jpeg',
      //   './NodeJS/uploadFiles/',
      //   'ahn_1702622408767_starry-sky-8199764_1280.jpg',
      //   'NodeJS\\\\uploadFiles\\\\ahn_1702622408767_starry-sky-8199764_1280.jpg',
      //   290197,
      //   NULL,
      //   NULL
      // )

      "INSERT INTO userHistory (username, image, petname, petbreed) VALUES(?,?,?,?)",
      [username, image, petname, petbreed],
      (error, data) => {
        if (error) throw error;
        const historyid = data.insertId;
        callback(null, historyid);
      }
    );
  }
}

module.exports = new File();
