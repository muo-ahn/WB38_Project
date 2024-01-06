const axios = require("axios");
const url = "http://192.168.137.54:4500/webhook";

class Rasa {
  rasaRequest(diseaseid) {
    const Code = diseaseid;
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

    axios
      .post(url, payload, { headers: { "Content-Type": "application/json" } })
      .then((response) => {
        // 'text' 키에 해당하는 값을 추출하고 출력합니다.
        const text = response.data.responses[0].text;
        //데이터 파싱
        const disease_text = text.split("\x07"); //\a으로 분리
        console.log("질병:" + disease_text[0] + "\n");
        console.log("원인:" + disease_text[1] + "\n");
        console.log("치료:" + disease_text[2] + "\n");
        console.log("추후관리:" + disease_text[3]);
      })
      .catch((error) => {
        console.error(error);
      });
  }
}

module.exports = new Rasa();
