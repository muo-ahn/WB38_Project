require("dotenv").config();
var express = require("express");
var router = express.Router();
var multer = require("multer");

const authCheck = require("../models/authCheck");
const template = require("../models/template");

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

router.get("", function (req, res) {
  var title = "파일 업로드";
  var html = template.HTML(
    title,
    `
      <form action="/file/file_process" method="post" enctype='multipart/form-data'>
      <p><input type="file" value="파일선택" name="uploadfile" multiple/></p>
      <input type="submit" value="파일업로드"/>
      </form>
      `,
    authCheck.statusUI(req, res)
  );
  res.send(html);
});

router.post("/file_process", upload.single("uploadfile"), function (req, res) {
  try {
    var postHTML = template.HTML(
      "파일 업로드 실패",
      `
      <script type="text/javascript">
      alert("파일을 선택해주세요.");
      document.location.href="/";
      </script>
      `,
      authCheck.statusUI(req, res)
    );

    if (req.file) {
      postHTML = template.HTML(
        "파일 업로드 성공",
        `
        <script type="text/javascript">
        alert("파일 업로드 성공.");
        document.location.href="/file/print";
        </script>
        `,
        authCheck.statusUI(req, res)
      );
    }

    res.send(postHTML);
  } catch (e) {
    console.dir(e);
  }
});

router.get("/print", function (req, res) {
  var image = req.file;
  console.log(image);
});

module.exports = router;
