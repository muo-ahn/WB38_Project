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

    const insertImages = async () => {
      const parseResults = [];

      const promises = images.map(async (image) => {
        const imageData = await fs.readFile(image);

        return new Promise((resolve, reject) => {
          tritonModule.TritonRequest(
            imageData,
            petbreed,
            api,
            async (error, responses) => {
              if (error) reject(error);

              tritonModule.postprocessResponses(
                responses,
                async (error, parseResult) => {
                  if (error) reject(error);

                  for (const result of parseResult) {
                    const historyid = await insertuserHistory(
                      username,
                      imageData,
                      petname,
                      petbreed,
                      usertext,
                      result.disease,
                      result.possResult,
                      queryAsync
                    );

                    const improvement = await checkImprovement(
                      queryAsync,
                      username,
                      petname,
                      result.disease
                    );

                    parseResults.push({
                      diseaseid: result.disease,
                      possibility: result.possResult,
                      historyid: historyid,
                      improvement: improvement,
                    });
                  }

                  resolve(); // Resolve the promise after processing this image
                }
              );
            }
          );
        });
      });

      try {
        await Promise.all(promises);
        callback(null, parseResults);
      } catch (error) {
        callback(error);
      }
    };

    insertImages();
  }

  //실시간 스트리밍
  createUserHistoryLive(
    username,
    images,
    petname,
    petbreed,
    api,
    usertext,
    callback
  ) {
    const queryAsync = this.queryAsync;
    const parseResults = [];

    // async
    const insertImages = async () => {
      try {
        const imageData = images;

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

                for (const result of parseResult) {
                  const historyid = await insertuserHistory(
                    username,
                    imageData,
                    petname,
                    petbreed,
                    usertext,
                    result.disease,
                    result.possResult,
                    queryAsync
                  );
                  console.log(historyid);

                  //호전성 검사
                  const improvement = await checkImprovement(
                    queryAsync,
                    username,
                    petname,
                    result.disease
                  );

                  parseResults.push({
                    diseaseid: result.disease,
                    possibility: result.possResult,
                    historyid: historyid,
                    improvement: improvement,
                  });
                }

                return callback(null, parseResults);
              }
            );
          }.bind(this)
        );
      } catch (error) {
        return callback(error);
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

  getImprovement(username, petname, diseaseid, callback) {
    const queryAsync = this.queryAsync;

    const improvement = checkImprovement(
      queryAsync,
      username,
      petname,
      diseaseid
    );

    if (!improvement) return callback("improvement error");

    return callback(null, improvement);
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

  const insertedRow = await queryAsync("SELECT LAST_INSERT_ID() as historyid");
  return insertedRow[0].historyid;
}

// index : 1~5
// index, 3 : 증상 지속, default
// index, 1 ~ 2 : 증상 악화
// index, 4 ~ 5 : 증상 완화
async function checkImprovement(queryAsync, username, petname, diseaseid) {
  try {
    const results = await queryAsync(
      "SELECT * FROM userHistory where username = ? AND petname = ? AND diseaseid = ?",
      [username, petname, diseaseid]
    );

    let currentIndex = 3;

    for (let innerIndex = 0; innerIndex < results.length - 1; innerIndex++) {
      const temp = results[innerIndex].diseasepossibility;
      if (results[innerIndex + 1]?.diseasepossibility - temp >= 5) {
        currentIndex++;
      } else if (results[innerIndex + 1]?.diseasepossibility - temp >= 10) {
        currentIndex = currentIndex + 2;
      } else if (results[innerIndex + 1]?.diseasepossibility - temp === 0) {
        currentIndex = 3;
      } else if (results[innerIndex + 1]?.diseasepossibility - temp <= -5) {
        currentIndex--;
      } else {
        currentIndex = innerIndex - 2;
      }

      if (currentIndex <= 0) {
        currentIndex = 1;
      } else if (currentIndex >= 5) {
        currentIndex = 5;
      }
    }

    return currentIndex;
  } catch (error) {
    throw error;
  }
}

module.exports = new AI();
