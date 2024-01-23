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

    res.status(200).json({ userHistory });
  });
});

router.post("/upload", upload.single("file"), async function (req, res) {
  if (!req.body.user) res.status(401).json({ error: "잘못된 접근" });

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
      if (!req.files) {
        return res.status(401).json({ error: "파일을 확인해주세요." });
      }
    }

    aiModule.createUserHistory(
      req.body.username,
      imageRequest,
      req.body.petname,
      req.body.petbreed,
      req.body.api,
      req.body.usertext,
      function (error, rasaResult) {
        if (error) {
          console.error("Error:", error);
          return res.status(401).json({ error: "파일 입력 실패" });
        } else {
          rasaResult.then((resolvedResult) => {
            return res.status(200).json({ result: resolvedResult });
          });
        }
      }
    );
  } catch (e) {
    console.dir(e);
  }
});

module.exports = router;
