require("dotenv").config({ path: "C:/Project/WB38_Project/NodeJS/.env" });
const mysql = require("mysql");
const fs = require("fs");
const util = require("util");
const { error } = require("console");

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

  getUserHistory(username, callback) {
    this.db.query(
      "SELECT * FROM userHistory where username = ?",
      [username],
      (error, results) => {
        if (error) return callback(error);

        const encodedImages = results.map((result) => {
          return result.image.toString("base64");
        });
        callback(null, encodedImages, results);
      }
    );
  }

  createUserHistory(username, images, petname, petbreed, usertext, callback) {
    // async
    const insertImages = async () => {
      for (const image of images) {
        const imageData = fs.readFileSync(image.path);
        const queryAsync = util.promisify(this.db.query).bind(this.db);

        try {
          const data = await queryAsync(
            "INSERT INTO userHistory (username, image, petname, petbreed, usertext) VALUES(?,?,?,?,?)",
            [username, imageData, petname, petbreed, usertext]
          );

          console.log(data);
        } catch (error) {
          console.error(error);
          return callback(error);
        }
      }

      return callback(null);
    };

    insertImages();
  }
}

module.exports = new File();
