//tritonClass.js

const axios = require("axios");
const { parse } = require("dotenv");
const sharp = require("sharp");
const DiseaseTable = require("./DiseaseTable.js");

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
      if (diseaseid == "error") return callback("error");

      const dataResult = response.data;
      if (dataResult.length == 2) {
        // dims == 2 인 경우, [0] : 질환 확률, [1] : 정상 확률
        dataResult.forEach((result, index) => {
          const totalResult = [];
          totalResult.modelType = "two";
          totalResult.modelName = `${diseaseid}`;
          totalResult.modelIndex = `${index}`;
          totalResult.possResult = `${result * 100}`;

          postprosessResult.push(totalResult);
        });
      } else if (dataResult.length == 7) {
        dataResult.forEach((result, index) => {
          const totalResult = [];
          totalResult.modelType = "multi";
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
  //  질병이 없는 경우 : [ nor ] 로 통일.

  // dims == 2 인 경우, [0] : 질환 확률, [1] : 정상 확률
  const detectedDisease = new Set();
  postData.forEach((data) => {
    const modelPart = data.modelName.split("\x07");

    if (data.possResult >= 60) {
      const indexOffset =
        data.modelType === "multi" ? data.modelIndex - 1 : modelPart[2] - 1;

      switch (modelPart[0]) {
        case "skin":
          detectedDisease.add(DiseaseTable.getDiseaseByIndex(0, indexOffset));
          break;
        case "bones":
          detectedDisease.add(data.modelIndex === 0 ? "비정상" : "정상");
          break;
        case "abdominal":
          detectedDisease.add(DiseaseTable.getDiseaseByIndex(2, indexOffset));
          break;
        case "thoracic":
          detectedDisease.add(DiseaseTable.getDiseaseByIndex(3, indexOffset));
          break;
        case "eye":
          detectedDisease.add(DiseaseTable.getDiseaseByIndex(4, indexOffset));
          break;
        default:
          detectedDisease.add("nor");
          break;
      }
    }
  });

  return Array.from(detectedDisease);
}

//반환된 모델 이름으로 질병 코드 반환하는 내부 함수
function getDiseaseID(modelName) {
  const diseaseMap = {
    bones: "bones\x07",
    skin_cat: "skin\x07cat",
    skin_dog: "skin\x07dog",
    abdominal_ab01_3_1_train: "abdominal\x07multi\x071",
  };

  return diseaseMap[modelName] || "error";
}

//필요한 모델만 호출하기 위한 내부 함수
function ModelSelect(petbreed, api) {
  const petModels = {
    dog: {
      skin: ["skin_dog"],
      eye: ["eye_dog"],
      abdominal: ["abdominal_ab01_3_1_train"],
    },
    cat: {
      skin: ["skin_cat"],
      eye: ["eye_cat"],
      abdominal: ["abdominal_ab01_3_1_train"],
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
        data: await getNormalizedArray(floatArray, modelsArray[0]),
      },
    ],
  };
}

async function getModelInputName(modelName) {
  if (modelName == "bones" || modelName == "abdominal_ab01_3_1_train")
    return "input_layer";
  else return "inception_resnet_v2_input";
}

async function getModelInputShape(modelName) {
  if (modelName == "bones" || modelName == "abdominal_ab01_3_1_train")
    return [1, 256, 256, 3];
  else if (modelName == "skin_dog") return [1, 112, 112, 3];
  else return [1, 224, 224, 3];
}

async function getNormalizedArray(floatArray, modelName) {
  let outputWidth, outputHeight, mean, std;

  if (modelName == "bones") {
    outputWidth = 256;
    outputHeight = 256;
    mean = [0.485, 0.456, 0.406];
    std = [0.229, 0.224, 0.225];
  } else if (modelName == "skin_dog") {
    outputWidth = 112;
    outputHeight = 112;
    mean = [0.485, 0.456, 0.406];
    std = [0.229, 0.224, 0.225];
  } else {
    outputWidth = 224;
    outputHeight = 224;
    mean = [0.485, 0.456, 0.406];
    std = [0.229, 0.224, 0.225];
  }

  const resizedArray = await resizeImage(floatArray, outputWidth, outputHeight);
  const flatResizedArray = resizedArray.flat();

  const normalizedArray = flatResizedArray.map((value, index) => {
    const normalizedValue = (value - mean[index % 3]) / std[index % 3];
    return normalizedValue;
  });

  return normalizedArray;
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
