//aiClass.js

require("dotenv").config({ path: "C:/Project/WB38_Project/NodeJS/.env" });
const mysql = require("mysql");
const fs = require("fs").promises;
const util = require("util");

const tritonModule = require("./tritonClass.js");
const rasaModule = require("./rasaClass.js");
const { parse } = require("path");
const { error } = require("console");
const { find } = require("./userClass.js");

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

                  var historyid;
                  var improvement = 0;
                  for (const result of parseResult) {
                    if (result.disease) {
                      historyid = await insertuserHistory(
                        username,
                        imageData,
                        petname,
                        petbreed,
                        usertext,
                        result.disease,
                        result.possResult,
                        queryAsync
                      );

                      improvement = await checkImprovement(
                        queryAsync,
                        username,
                        petname,
                        result.disease
                      );
                    }

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

    console.log("live webcam processing");
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

                var historyid;
                var improvement = 0;
                for (const result of parseResult) {
                  if (result.disease || result.disease != "nor") {
                    if (result.disease == "nor") {
                      console.log("disease 정상");
                      return callback(null, parseResults);
                    } else {
                      historyid = await insertuserHistory(
                        username,
                        imageData,
                        petname,
                        petbreed,
                        usertext,
                        result.disease,
                        result.possResult,
                        queryAsync
                      );

                      improvement = await checkImprovement(
                        queryAsync,
                        username,
                        petname,
                        result.disease
                      );
                    }
                  }

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

  async getImprovement(username, petname, diseaseid, historyid, callback) {
    const queryAsync = this.queryAsync;

    const improvement = await checkImprovement(
      queryAsync,
      username,
      petname,
      diseaseid,
      historyid
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
async function checkImprovement(
  queryAsync,
  username,
  petname,
  diseaseid,
  historyid
) {
  try {
    const results = await queryAsync(
      "SELECT * FROM userHistory where username = ? AND petname = ? AND diseaseid = ?",
      [username, petname, diseaseid]
    );

    if (results.length == 1 || results.length == 0) {
      return 0;
    } else {
      let currentIndex = 3;
      if (!historyid) {
        //request 요청
        const temp = results[results.length - 1].diseasepossibility; //지금 들어온 거
        const temp2 = results[results.length - 2].diseasepossibility; //가장 최근 거

        if (temp - temp2 >= 10) currentIndex--;
        else if (temp - temp2 >= 5) currentIndex = currentIndex - 2;
        else if (temp - temp2 <= -5) currentIndex++;
        else if (temp - temp2 >= 10) currentIndex = currentIndex + 2;
        else currentIndex = 3;
      } else {
        //history 요청
        var temp;
        results.forEach((result) => {
          if (result.historyid == historyid) temp = result.diseasepossibility;
        });
        if (results[results.length - 1].diseasepossibility) {
          const temp2 = results[results.length - 1].diseasepossibility; //가장 최근 거

          if (temp - temp2 >= 10) currentIndex--;
          else if (temp - temp2 >= 5) currentIndex = currentIndex - 2;
          else if (temp - temp2 <= -5) currentIndex++;
          else if (temp - temp2 >= 10) currentIndex = currentIndex + 2;
          else currentIndex = 3;
        } else {
          currentIndex = 3;
        }
      }

      if (currentIndex <= 0) {
        currentIndex = 1;
      } else if (currentIndex >= 5) {
        currentIndex = 5;
      }

      console.log("호전성 : " + currentIndex);
      return currentIndex;
    }
  } catch (error) {
    throw error;
  }
}

module.exports = new AI();
