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
      "INSERT INTO userHistory (username, image, petname, petbreed) VALUES(?,?,?,?)",
      [
        username,
        image.fieldname,
        image.originalname,
        image.encoding,
        image.mimetype,
        image.destination,
        image.filename,
        image.path,
        image.size,
        petname,
        petbreed,
      ],
      (error, data) => {
        if (error) throw error;
        const historyid = data.insertId;
        callback(null, historyid);
      }
    );
  }
}

module.exports = new File();
