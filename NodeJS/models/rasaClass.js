//rasaClass.js

require("dotenv").config({ path: "C:/Project/WB38_Project/NodeJS/.env" });

const axios = require("axios");
const { request } = require("express");

const rasa = axios.create({
  baseURL: process.env.Rasa_URL,
  timeout: 10000,
});

class Rasa {
  async rasaRequest(diseaseid, possibility, imporvement, text, callback) {
    try {
      const data = preprocessData(diseaseid, possibility, imporvement, text);

      const totalResult = [];
      await requestRasa(data).then((responses) => {
        for (const res of responses) {
          console.log(res.text);
          totalResult.push(res.text);
        }
        callback(null, totalResult);
      });
    } catch (error) {
      callback(error);
    }
  }
}

async function requestRasa(text, sender = "default") {
  try {
    const response = await rasa.post("/webhooks/rest/webhook", {
      message: text,
      sender: sender,
    });

    // Rasa 서버의 응답을 반환합니다.
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

async function preprocessData(diseaseid, possibility, imporvement, text) {
  if (!diseaseid) diseaseid = "nor";
  if (!possibility) possibility = 0;
  if (!imporvement) imporvement = 0;
  if (!text) text = "";

  return `${diseaseid}, ${possibility}, ${imporvement}, ${text}`;
}

module.exports = new Rasa();
