
// Reference ranges based on WHO, NIH, and ASH guidelines
// Updated to match world standard exponential notation

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

// World standard reference ranges with proper exponential notation
export const CBC_REFERENCE_RANGES: Record<string, ReferenceRange> = {
  // WBC count in 10³/µL (thousands per microliter) - World Standard
  wbc: {
    male: { min: 4.5, max: 11.0 },
    female: { min: 4.5, max: 11.0 }
  },
  // RBC count in 10⁶/µL (millions per microliter) - World Standard  
  rbc: {
    male: { min: 4.5, max: 5.9 },
    female: { min: 4.0, max: 5.2 }
  },
  // Hemoglobin in g/dL - World Standard
  hemoglobin: {
    male: { min: 13.5, max: 17.5 },
    female: { min: 12.0, max: 15.5 }
  },
  // Hematocrit in % - World Standard
  hematocrit: {
    male: { min: 41.0, max: 50.0 },
    female: { min: 36.0, max: 46.0 }
  },
  // MCV in fL - World Standard
  mcv: {
    male: { min: 80.0, max: 100.0 },
    female: { min: 80.0, max: 100.0 }
  },
  // MCH in pg - World Standard
  mch: {
    male: { min: 27.0, max: 33.0 },
    female: { min: 27.0, max: 33.0 }
  },
  // MCHC in g/dL - World Standard
  mchc: {
    male: { min: 32.0, max: 36.0 },
    female: { min: 32.0, max: 36.0 }
  },
  // RDW in % - World Standard
  rdw: {
    male: { min: 11.5, max: 14.5 },
    female: { min: 11.5, max: 14.5 }
  },
  // Platelet count in 10³/µL (thousands per microliter) - World Standard
  platelets: {
    male: { min: 150.0, max: 450.0 },
    female: { min: 150.0, max: 450.0 }
  },
  // Differential counts in % - World Standard
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

// Adjust reference ranges by age
export const adjustReferenceRangeByAge = (
  range: { min: number, max: number }, 
  parameterId: string, 
  age: number
): { min: number, max: number } => {
  const adjustedRange = { ...range };
  
  if (age < 18) {
    switch (parameterId) {
      case 'wbc':
        // Children typically have higher WBC counts (10³/µL)
        adjustedRange.min = 5.0;
        adjustedRange.max = 15.0;
        break;
      case 'hemoglobin':
        // Adjust hemoglobin for children (g/dL)
        if (age < 6) {
          adjustedRange.min -= 1;
          adjustedRange.max -= 1;
        }
        break;
    }
  } else if (age > 65) {
    switch (parameterId) {
      case 'hemoglobin':
        // Slightly lower hemoglobin may be normal in elderly (g/dL)
        adjustedRange.min -= 0.5;
        break;
      case 'lymphocytes':
        // Lymphocyte percentages may be lower in elderly (%)
        adjustedRange.min -= 2.0;
        break;
    }
  }
  
  return adjustedRange;
};
