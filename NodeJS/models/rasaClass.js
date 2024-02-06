//rasaClass.js

require("dotenv").config({ path: "C:/Project/WB38_Project/NodeJS/.env" });

const axios = require("axios");
const { request } = require("express");

const rasa = axios.create({
  baseURL: process.env.Rasa_URL,
  timeout: 100000,
});

class Rasa {
  async rasaRequest(diseaseid, possibility, imporvement, text, callback) {
    try {
      let data;
      if (diseaseid == 0) {
        data = text;
      } else {
        data = `${diseaseid}, ${possibility}, ${imporvement}, ${text}`;
      }

      const totalResult = [];
      await requestRasa(data).then((responses) => {
        for (const res of responses) {
          console.log(res.text);
          totalResult.push(res.text);
        }
      });

      callback(null, totalResult);
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

    return response.data;
  } catch (error) {
    console.error(error);
  }
}

module.exports = new Rasa();
