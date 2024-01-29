//aiClass.js

require("dotenv").config({ path: "C:/Project/WB38_Project/NodeJS/.env" });
const mysql = require("mysql");
const fs = require("fs").promises;
const util = require("util");

const tritonModule = require("./tritonClass.js");
const rasaModule = require("./rasaClass.js");

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
          var historyIDs = [];

          tritonModule.TritonRequest(
            imageData,
            petbreed,
            api,
            async function (error, responses) {
              if (error) return callback(error);

              await tritonModule.postprocessResponses(
                responses,
                async function (error, parseResult) {
                  if (error) return callback(error);

                  // rasa 호출
                  const rasaTotalResults = [];
                  const rasaResult = await rasaModule.rasaRequest(parseResult);
                  rasaTotalResults.push(rasaResult);

                  // db insert
                  for (const result of parseResult) {
                    const historyid = await insertuserHistory(
                      username,
                      imageData,
                      petname,
                      petbreed,
                      usertext,
                      result,
                      queryAsync
                    );

                    historyIDs.push(historyid);
                  }
                  if (!historyIDs) return callback("db insert error");

                  return callback(null, rasaTotalResults, historyIDs);
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

async function insertuserHistory(
  username,
  imageData,
  petname,
  petbreed,
  usertext,
  diseaseid,
  queryAsync
) {
  const queryResult = diseaseid
    ? await queryAsync(
        "INSERT INTO userHistory (username, image, petname, petbreed, usertext, diseaseid) VALUES(?,?,?,?,?,?)",
        [username, imageData, petname, petbreed, usertext, diseaseid]
      )
    : await queryAsync(
        "INSERT INTO userHistory (username, image, petname, petbreed, usertext) VALUES(?,?,?,?,?)",
        [username, imageData, petname, petbreed, usertext]
      );

  if (queryResult.affectedRows > 0) {
    const lastInsertId = queryResult.insertId;
    return { success: true, historyid: lastInsertId };
  } else {
    return { success: false, error: "History Insert Error" };
  }
}

module.exports = new AI();
