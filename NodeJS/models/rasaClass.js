//rasaClass.js

require("dotenv").config({ path: "C:/Project/WB38_Project/NodeJS/.env" });

const axios = require("axios");

const rasa = axios.create({
  baseURL: "http://localhost:5005",
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

      await requestRasa(data).then((responses) => {
        return callback(null, responses[0].text);
      });
    } catch (error) {
      return callback(error);
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
