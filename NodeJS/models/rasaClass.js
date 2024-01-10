//rasaClass.js

require("dotenv").config({ path: "C:/Project/WB38_Project/NodeJS/.env" });

const axios = require("axios");
const url = process.env.Rasa_URL;

class Rasa {
  async rasaRequest(diseaseid, callback) {
    try {
      await diseaseid.forEach((disease) => {
        requestRasa(disease, (error, rasaResponse) => {
          if (error) return callback(error);

          const parsedResult = parseResponseRasa(rasaResponse);
          callback(null, parsedResult);
        });
      });
    } catch (error) {
      console.error(error);
      callback(error);
    }
  }
}

function parseResponseRasa(response) {
  const resultTemp = [];

  //데이터 파싱
  const disease_text = response.split("\x07"); //\a으로 분리
  resultTemp.diseaseName = `${disease_text[0]}`;
  resultTemp.reason = `${disease_text[1]}`;
  resultTemp.cure = `${disease_text[2]}`;
  resultTemp.aftercare = `${disease_text[3]}`;

  return resultTemp;
}

async function requestRasa(code, callback) {
  const Code = code;
  const payload = {
    next_action: "action_hello_world",
    tracker: {
      sender_id: "user_id",
      slots: { disease_code: Code },
      latest_message: {
        intent: { name: "DiseaseCode_Test", confidence: 1.0 },
        entities: [{ entity: "disease_code", value: "mu01" }],
        text: "mu01",
        message_id: "1234",
        metadata: {},
      },
    },
  };

  await axios
    .post(url, payload, { headers: { "Content-Type": "application/json" } })
    .then((response) => {
      // 'text' 키에 해당하는 값을 추출하고 출력합니다.
      const text = response.data.responses[0].text;

      callback(null, text);
    })
    .catch((error) => {
      console.error(error);
      callback(error);
    });
}

module.exports = new Rasa();
