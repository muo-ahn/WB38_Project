//ai.js

require("dotenv").config();
var express = require("express");
var router = express.Router();
var multer = require("multer");

const aiModule = require("../models/aiClass.js");

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./NodeJS/uploadFiles/"); //파일 저장 디렉토리
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

var upload = multer({
  storage: storage,
});

router.post("", function (req, res) {
  console.log("userHistory request");
  if (!req.body.user) res.status(401).json({ error: "잘못된 접근" });

  aiModule.getUserHistory(req.body.user, function (error, images, results) {
    if (error) throw res.status(401).json({ error: "History 검색 오류" });
    if (!results) return res.status(200);

    var userHistory = {
      username: results[0].username,
      history: [],
    };
    images.forEach((image, index) => {
      var history = {
        petname: results[index].petname,
        petbreed: results[index].petbreed,
        usertext: results[index].usertext,
        diseaseid: results[index].diseaseid,
        createdtime: results[index].createdtime,
        image: Buffer.from(image).toString("base64"),
      };
      userHistory.history.push(history);
    });

    return res.status(200).json({ userHistory });
  });
});

router.post("/upload", upload.single("file"), async function (req, res) {
  if (!req.body.username) res.status(401).json({ error: "잘못된 접근" });
  console.log("Request : ", req.body.username);

  try {
    const imageRequest = [];

    if (req.file.mimetype.startsWith("image/")) {
      imageRequest.push(req.file.path);
    } else if (req.file.mimetype.startsWith("video/")) {
      //프레임 추출 요청
      const videoFileName = req.files[0].originalname;
      const videoFilePath = path.join(
        __dirname,
        "..",
        "uploadFiles",
        videoFileName
      );
      await fastAPI.ExtractFrameRequest(
        videoFilePath,
        "extractimage",
        (error, frames) => {
          if (error) {
            return res.status(401).json({ error: "프레임 추출 실패" });
          }
          frames.forEach((extractedImage) => {
            imageRequest.push(extractedImage);
          });
        }
      );
    } else {
      if (!req.file || !req.file.mimetype) {
        return res.status(401).json({ error: "파일을 확인해주세요." });
      }
    }

    await new Promise((resolve, reject) => {
      aiModule.createUserHistory(
        req.body.username,
        imageRequest,
        req.body.petname,
        req.body.petbreed,
        req.body.api,
        req.body.usertext,
        function (error, rasaResult, imporvement, historyIDs) {
          if (error) {
            console.error("Error:", error);

            res.status(401).json({ error: error });
            reject(error);
          } else {
            var totalResults = {
              username: req.body.username,
              result: [],
            };

            rasaResult.forEach((data, index) => {
              let result = {
                historyID: historyIDs[index],
                aftercare: data[index].aftercare,
                cure: data[index].cure,
                diseaseName: data[index].diseaseName,
                reason: data[index].reason,
                possibility: data[index].possibility,
                imporvement: imporvement,
              };
              totalResults.result.push(result);
            });

            res.status(200).json(totalResults);
            resolve();
          }
        }
      );
    });
  } catch (e) {
    console.error(e);
  }
});

router.post("/delete", async function (req, res) {
  if (!req.body.user) return res.status(401).json({ error: "잘못된 접근" });

  const username = req.body.user;
  const historyid = req.body.historyid;

  aiModule.deleteUserHistory(username, historyid, (error, results) => {
    if (error) return res.status(401).json({ error: "히스토리 삭제 오류" });

    return res.status(200).json({ message: "히스토리 삭제 성공" });
  });
});

module.exports = router;
