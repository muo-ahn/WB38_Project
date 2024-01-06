const axios = require("axios");
const { parse } = require("dotenv");
const sharp = require("sharp");

class Triton {
  //고양이가 진찰 의뢰하면 cat binary 2 4 6 + bone까지 돌아야하고
  //개가 진찰 의뢰하면 dog multi 123456 + bone까지 다 돌아야함.
  async TritonRequest(imageData, petbreed, api, callback) {
    //triton server로 request
    try {
      const modelsArray = await ModelSelect(petbreed, api);
      const processedImageData = await preprocessImageData(
        imageData,
        modelsArray
      );

      if (!modelsArray) {
        return callback("Invalid petbreed or api");
      }
      const responses = [];
      await Promise.all(
        modelsArray.map(async (model) => {
          const tritonServerUrl = `http://localhost:8000/v2/models/${model}/infer`;

          try {
            const startTime = new Date();

            const response = await axios.post(
              tritonServerUrl,
              JSON.stringify(processedImageData),
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            const endTime = new Date();
            const elapsedTime = endTime - startTime;
            console.log(`Triton request ${model} ${elapsedTime}ms`);

            const result = response.data.outputs[0];
            result.model_name = response.data.model_name;

            responses.push(result);
          } catch (error) {
            console.error(
              `Error in Triton request for model ${model}: ${error}`
            );
            return callback(error);
          }
        })
      );

      console.log("Triton Output : " + responses);
      return callback(null, responses);
    } catch (error) {
      console.error("Error : " + error);
      return callback(error);
    }
  }

  //추론 데이터 정규화 및 후처리 작업
  async postprocessResponses(responses, callback) {
    // postprosessResult : 파싱 결과
    // 원하는 형태, [ [모델명_정상] [추론결과], [모델명_비정상] [추론결과] ]
    const postprosessResult = [];
    await responses.forEach((response) => {
      const diseaseid = getDiseaseID(response.model_name);
      if (diseaseid == "error") return callback(error);

      const dataResult = response.data;
      if (dataResult.length == 2) {
        //output dims가 2인 모델
        //dataResult[0] : 정상 확률, dataResult[1] : 비정상 확률
        dataResult.forEach((result, index) => {
          const totalResult = [];
          totalResult.modelName = `${diseaseid}`;
          totalResult.modelIndex = `${index}`;
          totalResult.possResult = `${result * 100}`;

          postprosessResult.push(totalResult);
        });
      } else if (dataResult.length == 7) {
        dataResult.forEach((result, index) => {
          const totalResult = [];
          totalResult.modelName = `${diseaseid}`;
          totalResult.modelIndex = `${index}`;
          totalResult.possResult = `${result * 100}`;

          postprosessResult.push(totalResult);
        });
      }
    });

    let parserResult = parseResult(postprosessResult);
    callback(null, parserResult);
  }
}

// 후처리된 추론 결과를 파싱
function parseResult(postData) {
  // 원하는 결과 값 :
  //  질병이 있는 경우 : [ [질환 코드], [질환 코드] ] , index가 0인 경우, 병
  //  질병이 없는 경우 : [ A7 ] 로 통일.
  let parseResult = [];

  postData.forEach((data) => {
    if (data.modelName == "dog136" || data.modelName == "dog456") {
      //개 모델
      if (data.possResult >= 60) {
        var temp = parseInt(data.modelIndex) + 1;
        parseResult.push(`a${temp}`);
        // rasa 질병 코드에 맞추어서 다시 맞추어야함.
      }
    } else {
      //고양이 모델
      if (data.possResult >= 60 || data.modelIndex == 0) {
        parseResult.push(data.modelName);
      }
    }
  });

  let returnVaule = parseResult;

  parseResult.forEach((result, index) => {
    if (parseResult[index + 1] == result) {
      //호출한 모델들의 추론 결과가 동일한 경우.
      returnVaule = [];
      returnVaule.push(result);
    }
  });

  return returnVaule;
}

//반환된 모델 이름으로 질병 코드 반환하는 내부 함수
function getDiseaseID(modelName) {
  const diseaseMap = {
    bones: "bones",
    cat_binary_A2: "A2",
    cat_binary_A4: "A4",
    cat_binary_A6: "A6",
    dog_multi_A1_A3_A6: "dog136",
    dog_multi_A4_A5_A6: "dog456",
  };

  return diseaseMap[modelName] || "error";
}

//필요한 모델만 호출하기 위한 내부 함수
function ModelSelect(petbreed, api) {
  const petModels = {
    dog: {
      skin: ["dog_multi_A1_A3_A6", "dog_multi_A4_A5_A6"],
      bone: "dog_bone",
      eye: "dog_eye",
      stomach: "dog_stomach",
    },
    cat: {
      skin: ["cat_binary_A2", "cat_binary_A4", "cat_binary_A6"],
      bone: "cat_bone",
      eye: "cat_eye",
      stomach: "cat_stomach",
    },
  };

  return api === "bones"
    ? ["bones"]
    : (petModels[petbreed] && petModels[petbreed][api]) || null;
}

//triton으로 넘기기 위해서 JSON 변환 전처리
async function preprocessImageData(imageData, modelsArray) {
  const floatArray = Array.from(new Uint8Array(imageData));

  return {
    inputs: [
      {
        name: await getModelInputName(modelsArray[0]),
        shape: await getModelInputShape(modelsArray[0]),
        datatype: "FP32",
        data: await getNormailizedArray(floatArray, modelsArray[0]),
      },
    ],
  };
}

async function getModelInputName(modelName) {
  return modelName === "bones" ? "input_layer" : "inception_resnet_v2_input";
}

async function getModelInputShape(modelName) {
  return modelName === "bones" ? [1, 256, 256, 3] : [1, 224, 224, 3];
}

async function getNormailizedArray(floatArray, modelName) {
  var resizedArray;

  if (modelName == "bone") {
    resizedArray = await resizeImage(floatArray, 256, 256);
    return resizedArray.map((value) => value / 255.0);
  } else {
    resizedArray = await resizeImage(floatArray, 224, 224);
    return resizedArray.map((value) => value / 223.0);
  }
}

// 이미지 resize
async function resizeImage(inputArray, outputWidth, outputHeight) {
  const buffer = Buffer.from(inputArray);
  try {
    const resizedBuffer = await sharp(buffer)
      .resize(outputWidth, outputHeight)
      .toBuffer();

    return Array.from(new Uint8Array(resizedBuffer));
  } catch (error) {
    throw error;
  }
}

module.exports = new Triton();
