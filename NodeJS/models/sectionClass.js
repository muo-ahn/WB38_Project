// chatClass.js

require("dotenv").config({ path: "C:/Project/WB38_Project/NodeJS/.env" });
const mysql = require("mysql");
const util = require("util");

class chatClass {
  constructor() {
    this.db = mysql.createConnection({
      host: "localhost",
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });
    this.db.connect();
    this.queryAsync = util.promisify(this.db.query).bind(this.db);
  }

  async getDBdata(type, question, callback) {
    const queryResult = question
      ? this.db.query(
          "SELECT RESULT FROM CHATBOT WHERE question = ?",
          [question],
          (error, results) => {
            if (error) return callback(error);

            return callback(null, results);
          }
        )
      : this.db.query(
          "SELECT QUESTION FROM CHATBOT WHERE class = ?",
          [type],
          (error, results) => {
            if (error) return callback(error);

            return callback(null, results);
          }
        );
  }
}

module.exports = new chatClass();
