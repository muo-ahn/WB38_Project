// fastAPI.js

const axios = require("axios");

class FastAPI {
  async FastAPIRequest(imageData, resize) {
    try {
      const startTime = new Date();
      const FastAPIURL = `http://127.0.0.1:9000/${api}`;

      const response = await axios.post(
        FastAPIURL,
        { bytes_image: imageData, resize: resize },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const endTime = new Date();
      const elapsedTime = endTime - startTime;
      console.log(`FastAPI request ${elapsedTime}ms`);

      const result = response.data;
      return result;
    } catch (error) {
      console.error(`Error in FastAPI request: ${error}`);
      return error;
    }
  }
}

module.exports = new FastAPI();
