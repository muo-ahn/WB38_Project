var express = require("express");
var router = express.Router();
var template = require("./template.js");
var result = require("./Main.js");

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
  res.send("실행 중...");
});

module.exports = router;
