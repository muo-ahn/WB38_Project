require("dotenv").config({ path: "C:/Project/WB38_Project/NodeJS/.env" });
const mysql = require("mysql");
const fs = require("fs");
const { use } = require("passport");

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
      (error, results) => {
        if (error) return callback(error);

        const encodedImages = results.map((result) => {
          return result.image.toString("base64");
        });
        callback(null, encodedImages);
      }
    );
  }

  createUserHistory(username, images, petname, petbreed, callback) {
    images.forEach((image) => {
      const imageData = fs.readFileSync(image.path);

      this.db.query(
        "INSERT INTO userHistory (username, image, petname, petbreed) VALUES(?,?,?,?)",
        [username, imageData, petname, petbreed],
        (error, data) => {
          if (error) throw callback(error);
        }
      );
    });
    return callback(null);
  }
}

module.exports = new File();
