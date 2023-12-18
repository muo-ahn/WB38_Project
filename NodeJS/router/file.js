require("dotenv").config();
var express = require("express");
var router = express.Router();
var multer = require("multer");

const fileModule = require("../models/fileClass.js");
const loggedincheck = require("./middlewares.js");

const authCheck = require("../models/authCheck.js");
const template = require("../models/template.js");

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./NodeJS/uploadFiles/"); //파일 저장 디렉토리
  },
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
  var title = "이미지";

  //template에 find로 찾아온 정보 같이 껴주기.
  fileModule.getUserHistory(
    req.user.username,
    function (error, images, results) {
      if (error) throw error;
      var imageHTML = "";

      images.forEach((image, index) => {
        imageHTML += `
        <div>
          <p class="text">${results[index].petname}</p>
          <p class="text">${results[index].usertext}</p>
          <img src="data:image/png;base64,${image}" 
          alt="Image ${index + 1}" 
          width="${width}"/>
        </div>
      `;
      });

      var html = template.HTML(
        "업로드 목록",
        `
        <form action="/file/upload" method="get">
          <input type="submit" value="업로드 요청"/>
        </form>
        ${imageHTML}
        `,
        authCheck.statusUI(req, res)
      );
      res.send(html);
    }
  );
});

router.get("/upload", loggedincheck.isLoggedIn, function (req, res) {
  var html = template.HTML(
    "이미지 업로드",
    `
    <form action="/file/upload" method="post" enctype='multipart/form-data'>
    <p><input type="file" value="이미지 선택" name="uploadfile" multiple/></p>
    <p><input type="text" value="반려동물 이름 입력" name="petname"/></p>
    <p>
      <select name="petbreed">
        <option value="dog">반려견</option>
        <option value="cat">반려묘</option>
      </select>
    </p>
    <p><input type="text" value="상담 내용 입력" name="usertext"/></p>
    <input type="submit" value="이미지 업로드"/>
    </form>
    `,
    authCheck.statusUI(req, res)
  );
  res.send(html);
});

router.post("/upload", upload.array("uploadfile", 2), function (req, res) {
  try {
    var postHTML;
    if (!req.body.files) {
      postHTML = template.HTML(
        "이미지 업로드 실패",
        `
        <script type="text/javascript">
        alert("이미지를 선택해주세요.");
        document.location.href="/file";
        </script>
        `,
        authCheck.statusUI(req, res)
      );
      res.send(postHTML);
      return;
    }

    // db에 저장(create)
    fileModule.createUserHistory(
      req.user.username,
      req.files,
      req.body.petname,
      req.body.petbreed,
      req.body.usertext,
      function (error, historyid) {
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
        } else {
          console.log("File uploaded successfully");
          postHTML = template.HTML(
            "이미지 업로드 성공",
            `
                <script type="text/javascript">
                alert("이미지 업로드 성공.");
                document.location.href="/file";
                </script>
                `,
            authCheck.statusUI(req, res)
          );
        }

        res.send(postHTML);
      }
    );
  } catch (e) {
    console.dir(e);
  }
});

module.exports = router;
