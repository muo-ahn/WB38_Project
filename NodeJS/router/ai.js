//ai.js

require("dotenv").config();
var express = require("express");
var router = express.Router();
var multer = require("multer");

const aiModule = require("../models/aiClass.js");
const loggedincheck = require("./middlewares.js");

var storage = multer.diskStorage({
  // destination: function (req, file, callback) {
  //   callback(null, "./NodeJS/uploadFiles/"); //파일 저장 디렉토리
  // },
  filename: function (req, file, callback) {
    callback(
      null,
      req.session.passport.user.username +
        "_" +
        Date.now() +
        "_" +
        file.originalname
    );
  },
});

var upload = multer({
  storage: storage,
});

router.post("", loggedincheck.isLoggedIn, function (req, res) {
  aiModule.getUserHistory(req.user.username, function (error, images, results) {
    if (error) throw res.status(401).json({ error: "History 검색 오류" });
    var userHistory = {
      username: results[0].username,
      history: [],
    };
    images.forEach((image, index) => {
      var history = {
        petname: results[index].petname,
        usertext: results[index].usertext,
        diseaseid: results[index].diseaseid,
        image: Buffer.from(image).toString("base64"),
      };
      userHistory.history.push(history);
    });

    res.status(200).json({ userHistory });
  });
});

// router.get("/upload", loggedincheck.isLoggedIn, function (req, res) {
//   var html = template.HTML(
//     "이미지 업로드",
//     `
//     <form action="/ai/upload" method="post" enctype='multipart/form-data'>
//     <p><input type="file" value="이미지 선택" name="uploadfile" multiple/></p>
//     <p><input type="text" value="반려동물 이름 입력" name="petname"/></p>
//     <p>
//       <select name="petbreed">
//         <option value="dog">반려견</option>
//         <option value="cat">반려묘</option>
//       </select>
//       <p>
//       <select name="api">
//         <option value="skin">피부</option>
//         <option value="bones">근골격</option>
//         <option value="abdominal">복부</option>
//         <option value="thoarcic">흉부</option>
//         <option value="eye">안구</option>
//       </select>
//     </p>
//     <p><input type="text" value="상담 내용 입력" name="usertext"/></p>
//     <input class="btn" type="submit" value="이미지 업로드"/>
//     </form>
//     `,
//     authCheck.statusUI(req, res)
//   );
//   res.send(html);
// });

router.post("/upload", upload.array("uploadfile", 1), function (req, res) {
  try {
    var postHTML;
    const areAllImages = req.files.every((file) =>
      file.mimetype.startsWith("image/")
    );

    if (!areAllImages || !req.files) {
      return res.status(401).json({ error: "이미지 파일을 확인해주세요." });
    }

    aiModule.createUserHistory(
      req.user.username,
      req.files,
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
