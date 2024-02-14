// section.js

require("dotenv").config({ path: "C:/Project/WB38_Project/NodeJS/.env" });

var express = require("express");
var router = express.Router();
const sectionModule = require("../models/sectionClass.js");

router.post("", async (req, res) => {
  console.log("section request");
  if (!req.body) res.status(401).json({ error: "잘못된 접근" });
  const answer = [];

  try {
    sectionModule.getDBdata(
      req.body.type2,
      req.body.question,
      async (error, results) => {
        if (error) return res.status(401).json({ error: error });

        await results.forEach(async (result) => {
          if (result.QUESTION) answer.push(result.QUESTION);
          if (result.RESULT) answer.push(result.RESULT);
        });
        return res.status(200).json({ answer: answer });
      }
    );
  } catch (error) {
    return res.status(401).json({ error: error });
  }
});

module.exports = router;
