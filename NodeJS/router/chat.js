// chat.js

var express = require("express");
var router = express.Router();
const chatModule = require("../models/chatClass.js");

router.post("", async function (req, res) {
  if (!req.body) res.status(401).json({ error: "잘못된 접근" });

  const type1 = req.body.type1;
  const type2 = req.body.type2;
  const question = req.body.question;

  chatModule.getDBdata(type1, type2, question, async (error, results) => {
    if (error) res.status(401).json({ error: error });

    const answer = [];
    results.forEach((result) => {
      answer.push(result.RESULT);
    });
    res.status(200).json({ answer: answer });
  });
});

module.exports = router;
