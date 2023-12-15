require("dotenv").config();
var express = require("express");
var router = express.Router();
var multer = require("multer");

const fileModule = require("../models/fileClass.js");
const loggedincheck = require("./middlewares.js");

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

  //template에 find로 찾아온 정보 같이 껴주기.
  fileModule.gethistoryid(req.username, function (error, images, historyids) {
    console.log(images);
    console.log(historyids);

    var imageHTML = "";
    images.forEach((image, index) => {
      imageHTML += `
      <img src="data:image/png;base64,${image}" 
      alt="Image ${index + 1}" />
      `;
    });

    var html = template.HTML(
      title,
      `
        <form action="/file/" method="post" enctype='multipart/form-data'>
        <p><input type="file" value="파일선택" name="uploadfile" multiple/></p>
        <input type="submit" value="파일업로드"/>
        </form>
        ${imageHTML} <!-- Display images here -->
        `,
      authCheck.statusUI(req, res)
    );
    res.send(html);
  });
});

//
router.post("/", upload.single("uploadfile"), function (req, res) {
  try {
    var postHTML;
    if (!req.file) {
      postHTML = template.HTML(
        "파일 업로드 실패",
        `
        <script type="text/javascript">
        alert("파일을 선택해주세요.");
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
      req.file,
      null,
      null,
      function (error, result) {
        if (error) {
          console.error("Error:", error);
          postHTML = template.HTML(
            "파일 업로드 실패",
            `
                <script type="text/javascript">
                alert("파일 업로드 실패.");
                document.location.href="/file";
                </script>
                `,
            authCheck.statusUI(req, res)
          );
        } else {
          console.log("File uploaded successfully");
          postHTML = template.HTML(
            "파일 업로드 성공",
            `
                <script type="text/javascript">
                alert("파일 업로드 성공.");
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
