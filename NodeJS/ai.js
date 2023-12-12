var express = require("express");
var router = express.Router();
var template = require("./template.js");

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
  let text = "";
  //1. child-process 모듈의 spawn
  const { spawn } = require("child_process");

  //2. spawn을 통해 python filename.py 명령어 실행
  const result = spawn("python", ["./NodeJS/AI_Module/helloworld.py"]);
  result.stdout.on("data", function (data) {
    text = data.toString();

    res.write("<div>test result : " + text + "</div>");
  });
});

module.exports = router;
