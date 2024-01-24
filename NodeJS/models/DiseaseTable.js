//DiseaseTable.js

class DiseaseTable {
  constructor() {
    this.DiseaseTable = {
      // 피부 질환
      SKIN: {
        PSORIASIS: "sk01",
        DANDRUFF: "sk02",
        MELASMA: "sk03",
        ACNE: "sk04",
        ULCER: "sk05",
        NODULE: "sk06",
      },

      // 근골격
      MUSCULOSKELETAL: {
        SKELETAL_TUMOR: "mu01",
        LIMB_FRACTURE: "mu02",
        RIB_FRACTURE: "mu03",
        HIP_DISLOCATION: "mu04",
        PATELLAR_DISLOCATION: "mu05",
        ACL_RUPTURE: "mu06",
        INTERVERTEBRAL_DISC_DISEASE: "mu07",
      },

      // 복부
      ABDOMINAL: {
        LIVER: "ab01",
        HEPATOMEGALY: "ab02",
        ENLARGED_SPLEEN: "ab03",
        ABDOMINAL_TUMOR: "ab04",
        URINARY_STONE: "ab05",
        INTESTINAL_OBSTRUCTION: "ab06",
        ENLARGED_COLON: "ab07",
        HERNIA: "ab08",
        ASCITES: "ab09",
        POSTURE_ISSUE: "ab10",
      },

      // 흉부
      THORACIC: {
        CARDIOMEGALY: "ch01",
        ORGAN_PROLAPSE: "ch02",
        MEDIASTINAL_SHIFT: "ch03",
        THORACIC_TUMOR: "ch04",
        PNEUMOTHORAX: "ch05",
        DIAPHRAGMATIC_HERNIA: "ch06",
        POSTURE_ISSUE: "ch07",
      },

      // 안구 질환
      EYE: {
        ORBITAL_INFLAMMATION: "ey01",
        EYE_TUMOR: "ey02",
        INWARD_TURNING_EYELID: "ey03",
        UVEITIS: "ey04",
        PIGMENTARY_KERATITIS: "ey05",
        ULCERATIVE: "ey06",
        CORNEAL_DISEASE: "ey07",
        NUCLEAR_SCLEROSIS: "ey08",
        CONJUNCTIVITIS: "ey09",
        NON_ULCERATIVE_CORNEAL_DISEASE: "ey10",
        CATARACT: "ey11",
        VITREOUS_DEGENERATION: "ey12",
      },

      // 무증상
      ASYMPTOMATIC: "nor",
    };
  }

  getDiseaseByIndex(partIndex, diseaseIndex) {
    const partKeys = Object.keys(this.DiseaseTable);
    if (partIndex >= 0 && partIndex < partKeys.length) {
      const partKey = partKeys[partIndex];
      const diseaseKeys = Object.keys(this.DiseaseTable[partKey]);
      if (diseaseIndex >= 0 && diseaseIndex < diseaseKeys.length) {
        const diseaseKey = diseaseKeys[diseaseIndex];
        return this.DiseaseTable[partKey][diseaseKey];
      }
    }
    return null;
  }

  getDiseaseByValue(value) {
    for (const partKey of Object.keys(this.DiseaseTable)) {
      for (const diseaseKey of Object.keys(this.DiseaseTable[partKey])) {
        if (this.DiseaseTable[partKey][diseaseKey] === value) {
          return {
            part: partKey,
            disease: diseaseKey,
          };
        }
      }
    }

    return null;
  }
}

module.exports = new DiseaseTable();
