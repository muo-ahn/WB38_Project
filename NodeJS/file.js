require("dotenv").config();
var express = require("express");
var router = express.Router();
var path = require("path");
var serveStatic = require("serve-static");
var multer = require("multer");

const template = require("./template");

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./NodeJS/uploadFiles/"); //파일 저장 디렉토리
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + "_" + file.originalname);
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
        `
  );
  res.send(html);
});

router.post("/file_process", upload.single("uploadfile"), function (req, res) {
  try {
    var file = req.file;

    var originalName = file.originalname;
    var fileName = file.filename;
    var mimeType = file.mimetype;
    var size = file.size;

    res.writeHead("200", { "Content-type": "text/html;charset=utf-8" });
    res.write("<h1>파일 업로드 성공</h1>");

    res.write("<hr/>");
    res.write("<div>원본파일명 : " + originalName + "</div>");
    res.write("<div>저장파일명 : " + fileName + "</div>");
    res.write("<div>MimeType : " + mimeType + "</div>");
    res.write("<div>파일크기 : " + size + "</div>");

    res.write("<a href=/main>메인화면</a>");

    res.send(`
    <script type="text/javascript">alert("파일업로드가 완료되었습니다.!");
    document.location.href="/";</script>
    `);
  } catch (e) {
    console.dir(e);
  }
});

module.exports = router;
