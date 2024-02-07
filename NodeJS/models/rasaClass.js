//rasaClass.js

require("dotenv").config({ path: "C:/Project/WB38_Project/NodeJS/.env" });

const axios = require("axios");

const rasa = axios.create({
  baseURL: process.env.Rasa_URL,
  timeout: 5000,
});

class Rasa {
  async rasaRequest(text, callback) {
    try {
      let data;
      if (text.text) {
        data = text.text;
      } else {
        data = `${text.diseaseid}, ${text.improvement}, ${text.possibility}`;
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
