
// International medical standard reference ranges for blood tests
// Based on WHO, AHA, ESC, and major medical laboratory standards

interface ReferenceRange {
  male: { min: number; max: number };
  female: { min: number; max: number };
}

interface AgeAdjustedRange {
  ageGroup: string;
  male: { min: number; max: number };
  female: { min: number; max: number };
}

// LIPID PROFILE REFERENCE RANGES (mg/dL - US Standard, most widely used)
export const LIPID_REFERENCE_RANGES: Record<string, ReferenceRange> = {
  // Total Cholesterol in mg/dL
  totalCholesterol: {
    male: { min: 125, max: 200 },   // <200 mg/dL desirable
    female: { min: 125, max: 200 }
  },
  // LDL Cholesterol in mg/dL  
  ldlCholesterol: {
    male: { min: 50, max: 100 },    // <100 mg/dL optimal
    female: { min: 50, max: 100 }
  },
  // HDL Cholesterol in mg/dL
  hdlCholesterol: {
    male: { min: 40, max: 80 },     // >40 mg/dL for men
    female: { min: 50, max: 80 }    // >50 mg/dL for women
  },
  // Triglycerides in mg/dL
  triglycerides: {
    male: { min: 50, max: 150 },    // <150 mg/dL normal
    female: { min: 50, max: 150 }
  },
  // Non-HDL Cholesterol in mg/dL
  nonHdlCholesterol: {
    male: { min: 80, max: 130 },    // <130 mg/dL optimal
    female: { min: 80, max: 130 }
  }
};

// GLUCOSE TEST REFERENCE RANGES (mg/dL - International Standard)
export const GLUCOSE_REFERENCE_RANGES: Record<string, ReferenceRange> = {
  // Fasting Glucose in mg/dL
  fastingGlucose: {
    male: { min: 70, max: 100 },    // 70-100 mg/dL normal
    female: { min: 70, max: 100 }
  },
  // Random/Postprandial Glucose in mg/dL
  randomGlucose: {
    male: { min: 70, max: 140 },    // <140 mg/dL normal (2hr post-meal)
    female: { min: 70, max: 140 }
  },
  // HbA1c in %
  hba1c: {
    male: { min: 4.0, max: 5.6 },   // <5.7% normal
    female: { min: 4.0, max: 5.6 }
  },
  // Oral Glucose Tolerance Test (2-hour) in mg/dL
  ogtt2h: {
    male: { min: 70, max: 140 },    // <140 mg/dL normal
    female: { min: 70, max: 140 }
  }
};

// THYROID FUNCTION TEST REFERENCE RANGES (International Units)
export const THYROID_REFERENCE_RANGES: Record<string, ReferenceRange> = {
  // TSH in mIU/L (milli-International Units per Liter)
  tsh: {
    male: { min: 0.4, max: 4.0 },   // 0.4-4.0 mIU/L
    female: { min: 0.4, max: 4.0 }
  },
  // Free T4 in ng/dL
  freeT4: {
    male: { min: 0.8, max: 1.8 },   // 0.8-1.8 ng/dL
    female: { min: 0.8, max: 1.8 }
  },
  // Free T3 in pg/mL
  freeT3: {
    male: { min: 2.3, max: 4.2 },   // 2.3-4.2 pg/mL
    female: { min: 2.3, max: 4.2 }
  },
  // Total T4 in μg/dL
  totalT4: {
    male: { min: 4.5, max: 12.0 },  // 4.5-12.0 μg/dL
    female: { min: 4.5, max: 12.0 }
  },
  // Total T3 in ng/dL
  totalT3: {
    male: { min: 80, max: 200 },    // 80-200 ng/dL
    female: { min: 80, max: 200 }
  },
  // Anti-TPO in IU/mL
  antiTPO: {
    male: { min: 0, max: 34 },      // <34 IU/mL normal
    female: { min: 0, max: 34 }
  }
};

// Age-specific adjustments for certain parameters
const LIPID_AGE_ADJUSTMENTS: Record<string, AgeAdjustedRange[]> = {
  totalCholesterol: [
    { ageGroup: '20-39', male: { min: 125, max: 200 }, female: { min: 125, max: 200 } },
    { ageGroup: '40-59', male: { min: 125, max: 220 }, female: { min: 125, max: 220 } },
    { ageGroup: '60+', male: { min: 125, max: 240 }, female: { min: 125, max: 240 } }
  ],
  hdlCholesterol: [
    { ageGroup: '20-39', male: { min: 40, max: 80 }, female: { min: 50, max: 80 } },
    { ageGroup: '40-59', male: { min: 35, max: 80 }, female: { min: 45, max: 80 } },
    { ageGroup: '60+', male: { min: 35, max: 80 }, female: { min: 45, max: 80 } }
  ]
};

const THYROID_AGE_ADJUSTMENTS: Record<string, AgeAdjustedRange[]> = {
  tsh: [
    { ageGroup: '18-39', male: { min: 0.4, max: 4.0 }, female: { min: 0.4, max: 4.0 } },
    { ageGroup: '40-59', male: { min: 0.5, max: 4.5 }, female: { min: 0.5, max: 4.5 } },
    { ageGroup: '60+', male: { min: 0.7, max: 5.0 }, female: { min: 0.7, max: 5.0 } }
  ]
};

// Main function to get reference range with age/gender adjustments
export const getBloodTestReferenceRange = (
  testType: 'lipid' | 'glucose' | 'thyroid',
  parameterId: string,
  gender: 'male' | 'female',
  age: number
): { min: number; max: number } => {
  let ranges: Record<string, ReferenceRange>;
  let ageAdjustments: Record<string, AgeAdjustedRange[]> | undefined;

  switch (testType) {
    case 'lipid':
      ranges = LIPID_REFERENCE_RANGES;
      ageAdjustments = LIPID_AGE_ADJUSTMENTS;
      break;
    case 'glucose':
      ranges = GLUCOSE_REFERENCE_RANGES;
      break;
    case 'thyroid':
      ranges = THYROID_REFERENCE_RANGES;
      ageAdjustments = THYROID_AGE_ADJUSTMENTS;
      break;
    default:
      return { min: 0, max: 0 };
  }

  if (!ranges[parameterId]) {
    return { min: 0, max: 0 };
  }

  // Check for age-specific adjustments
  if (ageAdjustments && ageAdjustments[parameterId]) {
    const ageGroup = age < 40 ? '20-39' : age < 60 ? '40-59' : '60+';
    const ageSpecificRange = ageAdjustments[parameterId].find(
      range => range.ageGroup === ageGroup || range.ageGroup.includes(age < 18 ? '18-39' : ageGroup)
    );
    
    if (ageSpecificRange) {
      return ageSpecificRange[gender];
    }
  }

  return ranges[parameterId][gender];
};

// World standard units mapping
export const BLOOD_TEST_STANDARD_UNITS = {
  // Lipid Profile
  totalCholesterol: 'mg/dL',
  ldlCholesterol: 'mg/dL', 
  hdlCholesterol: 'mg/dL',
  triglycerides: 'mg/dL',
  nonHdlCholesterol: 'mg/dL',
  
  // Glucose Tests
  fastingGlucose: 'mg/dL',
  randomGlucose: 'mg/dL',
  hba1c: '%',
  ogtt2h: 'mg/dL',
  
  // Thyroid Function
  tsh: 'mIU/L',
  freeT4: 'ng/dL',
  freeT3: 'pg/mL',
  totalT4: 'μg/dL',
  totalT3: 'ng/dL',
  antiTPO: 'IU/mL'
};
