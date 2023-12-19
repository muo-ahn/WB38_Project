var express = require("express");
var router = express.Router();
var template = require("../models/template.js");
// var result = require("./Main.js");

// const modulePath = "./NodeJS/AI_Module/helloworld.py";

// router.get("", function (req, res) {
//   var title = "ai 모듈 테스트";
//   var html = template.HTML(
//     title,
//     `
//     <form action="/ai/ai_process" method="post">
//     <h2>AI 모듈 테스트<h2>
//     <input class="btn" type="submit" value="ai test">
//     </form>
//     `,
//     ""
//   );
//   res.send(html);
// });

// router.post("/ai_process", function (req, res) {
//   const { spawn } = require("child_process");
//   const result = spawn("python", [modulePath, "name test", "age test"]);

//   result.stdout.on("data", function (data) {
//     res.send(data.toString());
//   });
// });

module.exports = router;
