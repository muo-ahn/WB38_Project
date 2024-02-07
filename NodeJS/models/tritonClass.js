//tritonClass.js

const axios = require("axios");
const DiseaseTable = require("./DiseaseTable.js");
const sharp = require("sharp");

const fastAPI = require("./fastAPI.js");

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

    //이미 질환을 가지고 있을 때, 입력된 nor만 빼주고 callback
    callback(null, parserResult);
  }
}

// 후처리된 추론 결과를 파싱
function parseResult(postData) {
  // 원하는 결과 값 :
  //  질병이 있는 경우 : [ { disease: 질환 코드, possResult: number }, ... ] , index가 0인 경우, 병
  //  질병이 없는 경우 : [ { disease: "nor", possResult: number } ]

  const detectedDiseases = [];

  postData.forEach((data) => {
    const modelPart = data.modelName.split("\x07");

    if (data.possResult >= 70) {
      const indexOffset =
        data.modelType === "multi" ? data.modelIndex : modelPart[1] - 1;

      let diseaseCode;
      switch (modelPart[0]) {
        case "skin":
          diseaseCode = DiseaseTable.getDiseaseByIndex(0, indexOffset);
          break;
        case "bones":
          if (data.modelIndex == 1) {
            diseaseCode = DiseaseTable.getDiseaseByIndex(1, indexOffset);
          }
          break;
        case "abdominal":
          if (data.modelIndex == 1) {
            diseaseCode = DiseaseTable.getDiseaseByIndex(2, indexOffset);
          }
          break;
        case "thoracic":
          if (data.modelIndex == 1) {
            diseaseCode = DiseaseTable.getDiseaseByIndex(3, indexOffset);
          }
          break;
        case "eye":
          if (data.modelIndex == 1) {
            diseaseCode = DiseaseTable.getDiseaseByIndex(4, indexOffset);
          }
          break;
        default:
          diseaseCode = "nor";
          break;
      }

      detectedDiseases.push({
        disease: diseaseCode,
        possResult: data.possResult,
      });
    }
  });

  if (detectedDiseases.length > 0) {
    return detectedDiseases;
  } else {
    return [{ disease: "nor", possResult: 0 }]; // You might want to set a default possResult value here
  }
}

//반환된 모델 이름으로 질병 코드 반환하는 내부 함수
function getDiseaseID(modelName) {
  const diseaseMap = {
    Mu02: "bones\x072",
    Mu04: "bones\x074",
    Mu05: "bones\x075",
    Mu06: "bones\x076",
    skin_cat: "skin\x07cat",
    skin_dog: "skin\x07dog",
    Ab01: "abdominal\x071",
    Ab04: "abdominal\x074",
    Ab05: "abdominal\x075",
    Ab09: "abdominal\x079",
    Ch01: "thoracic\x071",
    Ch02: "thoracic\x072",
    Ey07: "eye\x077",
    Ey08: "eye\x078",
    Ey10: "eye\x010",
  };

  return diseaseMap[modelName] || "error";
}

//필요한 모델만 호출하기 위한 내부 함수
function ModelSelect(petbreed, api) {
  const petModels = {
    dog: {
      skin: ["skin_dog"],
      eye: ["Ey07", "Ey08", "Ey10"],
      abdominal: ["Ab01", "Ab04", "Ab05", "Ab09"],
      thoarcic: ["Ch01", "Ch02"],
    },
    cat: {
      skin: ["skin_cat"],
      eye: ["Ey07", "Ey08", "Ey10"],
      abdominal: ["Ab01", "Ab04", "Ab05", "Ab09"],
      thoarcic: ["Ch01", "Ch02"],
    },
  };

  return api === "bones"
    ? ["Mu02", "Mu04", "Mu05", "Mu06"]
    : (petModels[petbreed] && petModels[petbreed][api]) || null;
}

//triton으로 넘기기 위해서 JSON 변환 전처리
async function preprocessImageData(imageData, modelsArray) {
  const data = await getNormalizedArray(imageData, modelsArray[0]);

  return {
    inputs: [
      {
        name: await getModelInputName(modelsArray[0]),
        shape: await getModelInputShape(modelsArray[0]),
        datatype: "FP32",
        data: data.processedData,
      },
    ],
  };
}

async function getModelInputName(modelName) {
  if (
    modelName == "bones" ||
    modelName == "Ab01" ||
    modelName == "Ab04" ||
    modelName == "Ab05" ||
    modelName == "Ab09" ||
    modelName == "Ch01" ||
    modelName == "Ch02" ||
    modelName == "Mu02" ||
    modelName == "Mu04" ||
    modelName == "Mu05" ||
    modelName == "Mu06"
  )
    return "input_layer";
  else return "inception_resnet_v2_input";
}

async function getModelInputShape(modelName) {
  if (
    modelName == "bones" ||
    modelName == "Ab01" ||
    modelName == "Ab04" ||
    modelName == "Ab05" ||
    modelName == "Ab09" ||
    modelName == "Ch01" ||
    modelName == "Ch02" ||
    modelName == "Mu02" ||
    modelName == "Mu04" ||
    modelName == "Mu05" ||
    modelName == "Mu06"
  )
    return [1, 256, 256, 3];
  else if (modelName == "skin_dog") return [1, 112, 112, 3];
  else return [1, 224, 224, 3];
}

async function getNormalizedArray(floatArray, modelName) {
  let resize;

  if (
    modelName == "bones" ||
    modelName == "Ab01" ||
    modelName == "Ab04" ||
    modelName == "Ab05" ||
    modelName == "Ab09" ||
    modelName == "Ch01" ||
    modelName == "Ch02" ||
    modelName == "Mu02" ||
    modelName == "Mu04" ||
    modelName == "Mu05" ||
    modelName == "Mu06"
  ) {
    resize = [256, 256];
  } else if (modelName == "skin_dog") {
    resize = [112, 112];
  } else {
    resize = [224, 224];
  }

  return await fastAPI.FastAPIRequest(floatArray, resize, "postprocess");
}

module.exports = new Triton();
