// chatClass.js

require("dotenv").config({ path: "C:/Project/WB38_Project/NodeJS/.env" });
const { error } = require("console");
const mysql = require("mysql");
const fs = require("fs").promises;
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

  getDBdata(type1, type2, question, callback) {
    const queryResult = type2
      ? this.db.query(
          "SELECT * FROM CHATBOT WHERE type = ? AND class = ? AND question = ?",
          [type1, type2, question],
          (error, results) => {
            if (error) return callback(error);

            return callback(null, results);
          }
        )
      : this.db.query(
          "SELECT * FROM CHATBOT WHERE type = ? AND question = ?",
          [type1, question],
          (error, results) => {
            if (error) return callback(error);

            return callback(null, results);
          }
        );
  }
}

module.exports = new chatClass();
