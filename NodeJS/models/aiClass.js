//aiClass.js

require("dotenv").config({ path: "C:/Project/WB38_Project/NodeJS/.env" });
const mysql = require("mysql");
const fs = require("fs").promises;
const util = require("util");

const tritonModule = require("./tritonClass.js");
const rasaModule = require("./rasaClass.js");
const { parse } = require("path");
const { error } = require("console");

class AI {
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

  getUserHistory(username, callback) {
    this.db.query(
      "SELECT * FROM userHistory where username = ?",
      [username],
      (error, results) => {
        if (error) return callback(error);

        const encodedImages = results.map((result) => {
          return result.image.toString("base64");
        });
        return callback(null, encodedImages, results);
      }
    );
  }

  createUserHistory(
    username,
    images,
    petname,
    petbreed,
    api,
    usertext,
    callback
  ) {
    const queryAsync = this.queryAsync;

    // async
    const insertImages = async () => {
      for (const image of images) {
        try {
          const imageData = await fs.readFile(image);
          var queryResult = [];

          await tritonModule.TritonRequest(
            imageData,
            petbreed,
            api,
            async function (error, responses) {
              if (error) return callback(error);

              await tritonModule.postprocessResponses(
                responses,
                async function (error, parseResult) {
                  if (error) return callback(error);

                  const rasaTotalResults = [];

                  for (const result of parseResult) {
                    const queryTemp = insertuserHistory(
                      username,
                      imageData,
                      petname,
                      petbreed,
                      usertext,
                      result.disease,
                      result.possResult,
                      queryAsync
                    );

                    queryResult.push(queryTemp);

                    const rasaResult = await rasaModule.rasaRequest(
                      [result.disease],
                      result.possResult
                    );
                    rasaTotalResults.push(rasaResult);
                  }
                  if (!queryResult) return callback("db insert error");

                  return callback(null, rasaTotalResults);
                }
              );
            }.bind(this)
          );
        } catch (error) {
          return callback(error);
        }
      }
    };

    insertImages();
  }

  deleteUserHistory(username, historyid, callback) {
    this.db.query(
      "DELETE FROM userHistory where username = ? AND historyid = ?",
      [username, historyid],
      (error, results) => {
        if (error) return callback(error);

        return callback(null, results);
      }
    );
  }
}

// userHistory insert function
async function insertuserHistory(
  username,
  imageData,
  petname,
  petbreed,
  usertext,
  diseaseid,
  diseasepossibility,
  queryAsync
) {
  const queryResult = diseaseid
    ? await queryAsync(
        "INSERT INTO userHistory (username, image, petname, petbreed, usertext, diseaseid, diseasepossibility) VALUES(?,?,?,?,?,?,?)",
        [
          username,
          imageData,
          petname,
          petbreed,
          usertext,
          diseaseid,
          diseasepossibility,
        ]
      )
    : await queryAsync(
        "INSERT INTO userHistory (username, image, petname, petbreed, usertext) VALUES(?,?,?,?,?)",
        [username, imageData, petname, petbreed, usertext]
      );

  return queryResult;
}

module.exports = new AI();
