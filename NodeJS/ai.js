var express = require("express");
var router = express.Router();
var template = require("./template.js");

const modulePath = "./NodeJS/AI_Module/helloworld.py";

router.get("", function (req, res) {
  var title = "ai 모듈 테스트";
  var html = template.HTML(
    title,
    `
    <form action="/ai/ai_process" method="post">
    <h2>AI 모듈 테스트<h2>
    <input class="btn" type="submit" value="ai test">
    </form>
    `,
    ""
  );
  res.send(html);
});

router.post("/ai_process", function (req, res) {
  //1. child-process 모듈의 spawn
  var { spawn } = require("child_process");

  //2. spawn을 통해 python filename.py 명령어 실행
  var result = spawn("python", [modulePath, "10", "20"]);
  result.stdout.on("data", function (data) {
    res.send("<div>test result : " + data.toString() + "</div>");
  });
});

module.exports = router;
