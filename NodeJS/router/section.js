// section.js

require("dotenv").config({ path: "C:/Project/WB38_Project/NodeJS/.env" });

var express = require("express");
var router = express.Router();
const chatModule = require("../models/chatClass.js");

router.post("", async (req, res) => {
  console.log("section request");
  if (!req.body) res.status(401).json({ error: "잘못된 접근" });

  try {
    chatModule.getDBdata(
      req.body.type1,
      req.body.type2,
      req.body.question,
      async (error, results) => {
        if (error) return res.status(401).json({ error: error });

        const answer = [];
        results.forEach((result) => {
          answer.push(result.QUESTION);
        });
        return res.status(200).json({ answer: answer });
      }
    );
  } catch (error) {
    return res.status(401).json({ error: error });
  }
});

module.exports = router;
