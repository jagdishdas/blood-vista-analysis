
// Reference ranges based on WHO, NIH, and ASH guidelines
// These are generalized and would need to be adjusted based on age, gender, and specific lab standards

interface ReferenceRange {
  male: {
    min: number;
    max: number;
  };
  female: {
    min: number;
    max: number;
  };
}

export const CBC_REFERENCE_RANGES: Record<string, ReferenceRange> = {
  wbc: {
    male: { min: 4.5, max: 11.0 },
    female: { min: 4.5, max: 11.0 }
  },
  rbc: {
    male: { min: 4.5, max: 5.9 },
    female: { min: 4.0, max: 5.2 }
  },
  hemoglobin: {
    male: { min: 13.5, max: 17.5 },
    female: { min: 12.0, max: 15.5 }
  },
  hematocrit: {
    male: { min: 41.0, max: 50.0 },
    female: { min: 36.0, max: 46.0 }
  },
  mcv: {
    male: { min: 80.0, max: 100.0 },
    female: { min: 80.0, max: 100.0 }
  },
  mch: {
    male: { min: 27.0, max: 33.0 },
    female: { min: 27.0, max: 33.0 }
  },
  mchc: {
    male: { min: 32.0, max: 36.0 },
    female: { min: 32.0, max: 36.0 }
  },
  platelets: {
    male: { min: 150.0, max: 450.0 },
    female: { min: 150.0, max: 450.0 }
  },
  neutrophils: {
    male: { min: 40.0, max: 70.0 },
    female: { min: 40.0, max: 70.0 }
  },
  lymphocytes: {
    male: { min: 20.0, max: 40.0 },
    female: { min: 20.0, max: 40.0 }
  },
  monocytes: {
    male: { min: 2.0, max: 8.0 },
    female: { min: 2.0, max: 8.0 }
  },
  eosinophils: {
    male: { min: 1.0, max: 6.0 },
    female: { min: 1.0, max: 6.0 }
  },
  basophils: {
    male: { min: 0.0, max: 1.0 },
    female: { min: 0.0, max: 1.0 }
  }
};

export const getParameterReferenceRange = (parameterId: string, gender: 'male' | 'female'): { min: number; max: number } => {
  if (!CBC_REFERENCE_RANGES[parameterId]) {
    return { min: 0, max: 0 };
  }
  
  return CBC_REFERENCE_RANGES[parameterId][gender];
};
