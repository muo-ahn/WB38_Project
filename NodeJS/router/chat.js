// chat.js

require("dotenv").config({ path: "C:/Project/WB38_Project/NodeJS/.env" });

var express = require("express");
var router = express.Router();
const chatModule = require("../models/chatClass.js");
const rasaModule = require("../models//rasaClass.js");

const { OpenAI } = require("openai");

const callGpt35 = async (prompt) => {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("gpt35 error :", error);
  }
};

router.post("", async function (req, res) {
  if (!req.body) res.status(401).json({ error: "잘못된 접근" });

  if (req.body.text) {
    let diseaseid, possibility, improvement;
    req.body.diseaseid ? (diseaseid = req.body.diseaseid) : (diseaseid = 0);
    req.body.possibility
      ? (possibility = req.body.possibility)
      : (possibility = 0);
    req.body.improvement
      ? (improvement = req.body.improvement)
      : (improvement = 0);

    await rasaModule.rasaRequest(
      diseaseid,
      possibility,
      improvement,
      req.body.text,
      async (error, rasaResult) => {
        if (error) {
          const response = await callGpt35(req.body.text);
          if (response) {
            return res.status(200).json({ answer: response });
          } else {
            return res.status(401).json({ error: "gpt error" });
          }
        }

        return res.status(200).json({ answer: rasaResult });
      }
    );
  } else {
    chatModule.getDBdata(
      req.body.type1,
      req.body.type2,
      req.body.question,
      async (error, results) => {
        if (error) return res.status(401).json({ error: error });

        const answer = [];
        results.forEach((result) => {
          answer.push(result.RESULT);
        });
        return res.status(200).json({ answer: answer });
      }
    );
  }
});

module.exports = router;
