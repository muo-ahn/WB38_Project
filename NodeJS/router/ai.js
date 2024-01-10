require("dotenv").config();
var express = require("express");
var router = express.Router();
var multer = require("multer");

const aiModule = require("../models/aiClass.js");
const loggedincheck = require("./middlewares.js");

const authCheck = require("../models/authCheck.js");
const template = require("../models/template.js");
const e = require("express");

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

router.get("", loggedincheck.isLoggedIn, function (req, res) {
  const width = 200;

  //template에 find로 찾아온 정보 같이 껴주기.
  aiModule.getUserHistory(req.user.username, function (error, images, results) {
    if (error) throw error;
    var imageHTML = "";

    images.forEach((image, index) => {
      imageHTML += `
        <div>
          <p class="text">${results[index].petname}</p>
          <p class="text">${results[index].usertext}</p>
          <p class="text">${results[index].diseaseid}</p>
          <img src="data:image/png;base64,${image}" 
          alt="Image ${index + 1}" 
          width="${width}"/>
        </div>
      `;
    });

    var html = template.HTML(
      "업로드 목록",
      `
        <form action="/ai/upload" method="get">
          <input class="btn" type="submit" value="업로드 요청"/>
        </form>
        ${imageHTML}
        `,
      authCheck.statusUI(req, res)
    );
    res.send(html);
  });
});

router.get("/upload", loggedincheck.isLoggedIn, function (req, res) {
  var html = template.HTML(
    "이미지 업로드",
    `
    <form action="/ai/upload" method="post" enctype='multipart/form-data'>
    <p><input type="file" value="이미지 선택" name="uploadfile" multiple/></p>
    <p><input type="text" value="반려동물 이름 입력" name="petname"/></p>
    <p>
      <select name="petbreed">
        <option value="dog">반려견</option>
        <option value="cat">반려묘</option>
      </select>
      <p>
      <select name="api">
        <option value="skin">피부</option>
        <option value="bones">근골격</option>
        <option value="abdominal">복부</option>
        <option value="thoarcic">흉부</option>
        <option value="eye">안구</option>
      </select>
    </p>
    <p><input type="text" value="상담 내용 입력" name="usertext"/></p>
    <input class="btn" type="submit" value="이미지 업로드"/>
    </form>
    `,
    authCheck.statusUI(req, res)
  );
  res.send(html);
});

router.post("/upload", upload.array("uploadfile", 2), function (req, res) {
  try {
    var postHTML;
    const areAllImages = req.files.every((file) =>
      file.mimetype.startsWith("image/")
    );

    if (!areAllImages || !req.files) {
      postHTML = template.HTML(
        "이미지 업로드 실패",
        `
        <script type="text/javascript">
        alert("입력 파일 확인.");
        document.location.href="/ai";
        </script>
        `,
        authCheck.statusUI(req, res)
      );
      res.send(postHTML);
      return;
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
          postHTML = template.HTML(
            "이미지 업로드 실패",
            `
                <script type="text/javascript">
                alert("이미지 업로드 실패.");
                document.location.href="/file";
                </script>
                `,
            authCheck.statusUI(req, res)
          );
          res.send(postHTML);
        } else {
          rasaResult.then((resolvedResult) => {
            const rasaResultString = JSON.stringify(resolvedResult);
            postHTML = template.HTML(
              "이미지 업로드 성공",
              `
                  <script type="text/javascript">
                  alert(${rasaResultString});
                  document.location.href="/ai";
                  </script>
                  `,
              authCheck.statusUI(req, res)
            );
            res.send(postHTML);
          });
        }
      }
    );
  } catch (e) {
    console.dir(e);
  }
});

module.exports = router;
