// chat.js

require("dotenv").config({ path: "C:/Project/WB38_Project/NodeJS/.env" });

var express = require("express");
var router = express.Router();
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
  console.log("chat request");
  if (!req.body) res.status(401).json({ error: "잘못된 접근" });

  if (req.body.text) {
    const data = {
      text: req.body.text,
    };

    await rasaModule.rasaRequest(data, async (error, rasaResult) => {
      if (error) {
        const response = await callGpt35(req.body.text);
        if (response) {
          return res.status(200).json({ answer: response });
        } else {
          return res.status(401).json({ error: "gpt error" });
        }
      }

      return res.status(200).json({ answer: rasaResult });
    });
  } else {
    const data = {
      diseaseid: req.body.diseaseid,
      possibility: req.body.possibility,
      improvement: req.body.improvement,
    };

    await rasaModule.rasaRequest(data, async (error, rasaResult) => {
      if (error) return res.status(401).json({ error: error });

      const parsedText = rasaResult.split("\n");
      return res.status(200).json({ answer: parsedText });
    });
  }
});

module.exports = router;
