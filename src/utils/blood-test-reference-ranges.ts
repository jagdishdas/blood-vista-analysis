
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

// LIVER FUNCTION TEST REFERENCE RANGES (International Units)
export const LIVER_REFERENCE_RANGES: Record<string, ReferenceRange> = {
  // ALT (Alanine Aminotransferase) in U/L
  alt: {
    male: { min: 7, max: 56 },      // 7-56 U/L
    female: { min: 7, max: 40 }     // 7-40 U/L
  },
  // AST (Aspartate Aminotransferase) in U/L
  ast: {
    male: { min: 10, max: 40 },     // 10-40 U/L
    female: { min: 10, max: 40 }
  },
  // ALP (Alkaline Phosphatase) in U/L
  alp: {
    male: { min: 44, max: 147 },    // 44-147 U/L
    female: { min: 44, max: 147 }
  },
  // Total Bilirubin in mg/dL
  totalBilirubin: {
    male: { min: 0.2, max: 1.0 },   // 0.2-1.0 mg/dL
    female: { min: 0.2, max: 1.0 }
  },
  // Direct Bilirubin in mg/dL
  directBilirubin: {
    male: { min: 0.0, max: 0.3 },   // 0.0-0.3 mg/dL
    female: { min: 0.0, max: 0.3 }
  },
  // Total Protein in g/dL
  totalProtein: {
    male: { min: 6.3, max: 8.2 },   // 6.3-8.2 g/dL
    female: { min: 6.3, max: 8.2 }
  },
  // Albumin in g/dL
  albumin: {
    male: { min: 3.5, max: 5.0 },   // 3.5-5.0 g/dL
    female: { min: 3.5, max: 5.0 }
  },
  // GGT (Gamma-Glutamyl Transferase) in U/L
  ggt: {
    male: { min: 9, max: 50 },      // 9-50 U/L
    female: { min: 9, max: 32 }     // 9-32 U/L
  }
};

// KIDNEY FUNCTION TEST REFERENCE RANGES (International Units)
export const KIDNEY_REFERENCE_RANGES: Record<string, ReferenceRange> = {
  // Serum Creatinine in mg/dL
  creatinine: {
    male: { min: 0.7, max: 1.3 },   // 0.7-1.3 mg/dL
    female: { min: 0.6, max: 1.1 }  // 0.6-1.1 mg/dL
  },
  // Blood Urea Nitrogen (BUN) in mg/dL
  bun: {
    male: { min: 6, max: 24 },      // 6-24 mg/dL
    female: { min: 6, max: 21 }     // 6-21 mg/dL
  },
  // eGFR (Estimated Glomerular Filtration Rate) in mL/min/1.73m²
  egfr: {
    male: { min: 90, max: 150 },    // >90 mL/min/1.73m² normal
    female: { min: 90, max: 150 }
  },
  // Uric Acid in mg/dL
  uricAcid: {
    male: { min: 3.4, max: 7.0 },   // 3.4-7.0 mg/dL
    female: { min: 2.4, max: 6.0 }  // 2.4-6.0 mg/dL
  },
  // Cystatin C in mg/L
  cystatinC: {
    male: { min: 0.53, max: 0.95 }, // 0.53-0.95 mg/L
    female: { min: 0.53, max: 0.95 }
  }
};

// CARDIAC MARKERS REFERENCE RANGES (International Units)
export const CARDIAC_REFERENCE_RANGES: Record<string, ReferenceRange> = {
  // Troponin I in ng/mL
  troponinI: {
    male: { min: 0.0, max: 0.04 },  // <0.04 ng/mL normal
    female: { min: 0.0, max: 0.04 }
  },
  // Troponin T in ng/mL
  troponinT: {
    male: { min: 0.0, max: 0.01 },  // <0.01 ng/mL normal
    female: { min: 0.0, max: 0.01 }
  },
  // CK-MB in ng/mL
  ckMb: {
    male: { min: 0.0, max: 6.3 },   // 0.0-6.3 ng/mL
    female: { min: 0.0, max: 4.3 }  // 0.0-4.3 ng/mL
  },
  // NT-proBNP in pg/mL (age-dependent)
  ntProBnp: {
    male: { min: 0, max: 125 },     // <125 pg/mL normal for <75 years
    female: { min: 0, max: 125 }
  },
  // Myoglobin in ng/mL
  myoglobin: {
    male: { min: 28, max: 72 },     // 28-72 ng/mL
    female: { min: 25, max: 58 }    // 25-58 ng/mL
  }
};

// INFLAMMATORY MARKERS REFERENCE RANGES (International Units)
export const INFLAMMATORY_REFERENCE_RANGES: Record<string, ReferenceRange> = {
  // C-Reactive Protein (CRP) in mg/L
  crp: {
    male: { min: 0.0, max: 3.0 },   // <3.0 mg/L normal
    female: { min: 0.0, max: 3.0 }
  },
  // ESR (Erythrocyte Sedimentation Rate) in mm/hr
  esr: {
    male: { min: 0, max: 15 },      // 0-15 mm/hr
    female: { min: 0, max: 20 }     // 0-20 mm/hr
  },
  // Procalcitonin in ng/mL
  procalcitonin: {
    male: { min: 0.0, max: 0.25 },  // <0.25 ng/mL normal
    female: { min: 0.0, max: 0.25 }
  },
  // Ferritin in ng/mL
  ferritin: {
    male: { min: 12, max: 300 },    // 12-300 ng/mL
    female: { min: 12, max: 150 }   // 12-150 ng/mL
  }
};

// ELECTROLYTES & MINERALS REFERENCE RANGES (International Units)
export const ELECTROLYTES_REFERENCE_RANGES: Record<string, ReferenceRange> = {
  // Sodium in mEq/L
  sodium: {
    male: { min: 136, max: 145 },   // 136-145 mEq/L
    female: { min: 136, max: 145 }
  },
  // Potassium in mEq/L
  potassium: {
    male: { min: 3.5, max: 5.1 },   // 3.5-5.1 mEq/L
    female: { min: 3.5, max: 5.1 }
  },
  // Chloride in mEq/L
  chloride: {
    male: { min: 98, max: 107 },    // 98-107 mEq/L
    female: { min: 98, max: 107 }
  },
  // Calcium (Total) in mg/dL
  calcium: {
    male: { min: 8.5, max: 10.2 },  // 8.5-10.2 mg/dL
    female: { min: 8.5, max: 10.2 }
  },
  // Magnesium in mg/dL
  magnesium: {
    male: { min: 1.7, max: 2.2 },   // 1.7-2.2 mg/dL
    female: { min: 1.7, max: 2.2 }
  },
  // Phosphorus in mg/dL
  phosphorus: {
    male: { min: 2.5, max: 4.5 },   // 2.5-4.5 mg/dL
    female: { min: 2.5, max: 4.5 }
  }
};

// VITAMINS & DEFICIENCIES REFERENCE RANGES (International Units)
export const VITAMINS_REFERENCE_RANGES: Record<string, ReferenceRange> = {
  // Vitamin B12 in pg/mL
  vitaminB12: {
    male: { min: 200, max: 900 },   // 200-900 pg/mL
    female: { min: 200, max: 900 }
  },
  // Folate in ng/mL
  folate: {
    male: { min: 2.7, max: 17.0 },  // 2.7-17.0 ng/mL
    female: { min: 2.7, max: 17.0 }
  },
  // Vitamin D (25-OH) in ng/mL
  vitaminD: {
    male: { min: 30, max: 100 },    // 30-100 ng/mL
    female: { min: 30, max: 100 }
  },
  // Iron in μg/dL
  iron: {
    male: { min: 65, max: 176 },    // 65-176 μg/dL
    female: { min: 50, max: 170 }   // 50-170 μg/dL
  },
  // TIBC (Total Iron Binding Capacity) in μg/dL
  tibc: {
    male: { min: 240, max: 450 },   // 240-450 μg/dL
    female: { min: 240, max: 450 }
  }
};

// HORMONAL TESTS REFERENCE RANGES (International Units)
export const HORMONAL_REFERENCE_RANGES: Record<string, ReferenceRange> = {
  // Cortisol (Morning) in μg/dL
  cortisol: {
    male: { min: 6.2, max: 19.4 },  // 6.2-19.4 μg/dL (AM)
    female: { min: 6.2, max: 19.4 }
  },
  // Testosterone (Total) in ng/dL
  testosterone: {
    male: { min: 264, max: 916 },   // 264-916 ng/dL
    female: { min: 15, max: 70 }    // 15-70 ng/dL
  },
  // Estradiol in pg/mL
  estradiol: {
    male: { min: 7, max: 42 },      // 7-42 pg/mL
    female: { min: 15, max: 350 }   // 15-350 pg/mL (varies by cycle)
  },
  // LH (Luteinizing Hormone) in mIU/mL
  lh: {
    male: { min: 1.7, max: 8.6 },   // 1.7-8.6 mIU/mL
    female: { min: 2.4, max: 12.6 } // 2.4-12.6 mIU/mL (follicular)
  },
  // FSH (Follicle Stimulating Hormone) in mIU/mL
  fsh: {
    male: { min: 1.5, max: 12.4 },  // 1.5-12.4 mIU/mL
    female: { min: 3.5, max: 12.5 } // 3.5-12.5 mIU/mL (follicular)
  },
  // Prolactin in ng/mL
  prolactin: {
    male: { min: 4.0, max: 15.2 },  // 4.0-15.2 ng/mL
    female: { min: 4.8, max: 23.3 } // 4.8-23.3 ng/mL (non-pregnant)
  }
};

// TUMOR MARKERS REFERENCE RANGES (International Units)
export const TUMOR_REFERENCE_RANGES: Record<string, ReferenceRange> = {
  // CEA (Carcinoembryonic Antigen) in ng/mL
  cea: {
    male: { min: 0.0, max: 3.0 },   // <3.0 ng/mL normal (non-smoker)
    female: { min: 0.0, max: 3.0 }
  },
  // AFP (Alpha-Fetoprotein) in ng/mL
  afp: {
    male: { min: 0.0, max: 8.5 },   // <8.5 ng/mL normal
    female: { min: 0.0, max: 8.5 }
  },
  // CA 19-9 in U/mL
  ca19_9: {
    male: { min: 0.0, max: 37.0 },  // <37.0 U/mL normal
    female: { min: 0.0, max: 37.0 }
  },
  // CA 125 in U/mL
  ca125: {
    male: { min: 0.0, max: 35.0 },  // <35.0 U/mL normal
    female: { min: 0.0, max: 35.0 }
  },
  // PSA (Prostate Specific Antigen) in ng/mL
  psa: {
    male: { min: 0.0, max: 4.0 },   // <4.0 ng/mL normal
    female: { min: 0.0, max: 0.0 }  // Not applicable
  }
};

// AUTOIMMUNE MARKERS REFERENCE RANGES (International Units)
export const AUTOIMMUNE_REFERENCE_RANGES: Record<string, ReferenceRange> = {
  // ANA (Antinuclear Antibodies) - Titer
  ana: {
    male: { min: 0, max: 80 },      // <1:80 negative
    female: { min: 0, max: 80 }
  },
  // RF (Rheumatoid Factor) in IU/mL
  rf: {
    male: { min: 0, max: 14 },      // <14 IU/mL normal
    female: { min: 0, max: 14 }
  },
  // Anti-CCP in U/mL
  antiCcp: {
    male: { min: 0, max: 20 },      // <20 U/mL negative
    female: { min: 0, max: 20 }
  },
  // Complement C3 in mg/dL
  c3: {
    male: { min: 90, max: 180 },    // 90-180 mg/dL
    female: { min: 90, max: 180 }
  },
  // Complement C4 in mg/dL
  c4: {
    male: { min: 10, max: 40 },     // 10-40 mg/dL
    female: { min: 10, max: 40 }
  }
};

// COAGULATION STUDIES REFERENCE RANGES (International Units)
export const COAGULATION_REFERENCE_RANGES: Record<string, ReferenceRange> = {
  // PT (Prothrombin Time) in seconds
  pt: {
    male: { min: 9.5, max: 13.8 },  // 9.5-13.8 seconds
    female: { min: 9.5, max: 13.8 }
  },
  // INR (International Normalized Ratio)
  inr: {
    male: { min: 0.8, max: 1.1 },   // 0.8-1.1
    female: { min: 0.8, max: 1.1 }
  },
  // aPTT (Activated Partial Thromboplastin Time) in seconds
  aptt: {
    male: { min: 25, max: 35 },     // 25-35 seconds
    female: { min: 25, max: 35 }
  },
  // Fibrinogen in mg/dL
  fibrinogen: {
    male: { min: 200, max: 400 },   // 200-400 mg/dL
    female: { min: 200, max: 400 }
  },
  // D-Dimer in ng/mL FEU
  dDimer: {
    male: { min: 0, max: 500 },     // <500 ng/mL FEU normal
    female: { min: 0, max: 500 }
  }
};
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
  testType: 'lipid' | 'glucose' | 'thyroid' | 'liver' | 'kidney' | 'cardiac' | 'inflammatory' | 'electrolytes' | 'vitamins' | 'hormonal' | 'tumor' | 'autoimmune' | 'coagulation',
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
    case 'liver':
      ranges = LIVER_REFERENCE_RANGES;
      break;
    case 'kidney':
      ranges = KIDNEY_REFERENCE_RANGES;
      break;
    case 'cardiac':
      ranges = CARDIAC_REFERENCE_RANGES;
      break;
    case 'inflammatory':
      ranges = INFLAMMATORY_REFERENCE_RANGES;
      break;
    case 'electrolytes':
      ranges = ELECTROLYTES_REFERENCE_RANGES;
      break;
    case 'vitamins':
      ranges = VITAMINS_REFERENCE_RANGES;
      break;
    case 'hormonal':
      ranges = HORMONAL_REFERENCE_RANGES;
      break;
    case 'tumor':
      ranges = TUMOR_REFERENCE_RANGES;
      break;
    case 'autoimmune':
      ranges = AUTOIMMUNE_REFERENCE_RANGES;
      break;
    case 'coagulation':
      ranges = COAGULATION_REFERENCE_RANGES;
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
  antiTPO: 'IU/mL',
  
  // Liver Function Tests
  alt: 'U/L',
  ast: 'U/L',
  alp: 'U/L',
  totalBilirubin: 'mg/dL',
  directBilirubin: 'mg/dL',
  totalProtein: 'g/dL',
  albumin: 'g/dL',
  ggt: 'U/L',
  
  // Kidney Function Tests
  creatinine: 'mg/dL',
  bun: 'mg/dL',
  egfr: 'mL/min/1.73m²',
  uricAcid: 'mg/dL',
  cystatinC: 'mg/L',
  
  // Cardiac Markers
  troponinI: 'ng/mL',
  troponinT: 'ng/mL',
  ckMb: 'ng/mL',
  ntProBnp: 'pg/mL',
  myoglobin: 'ng/mL',
  
  // Inflammatory Markers
  crp: 'mg/L',
  esr: 'mm/hr',
  procalcitonin: 'ng/mL',
  ferritin: 'ng/mL',
  
  // Electrolytes & Minerals
  sodium: 'mEq/L',
  potassium: 'mEq/L',
  chloride: 'mEq/L',
  calcium: 'mg/dL',
  magnesium: 'mg/dL',
  phosphorus: 'mg/dL',
  
  // Vitamins & Deficiencies
  vitaminB12: 'pg/mL',
  folate: 'ng/mL',
  vitaminD: 'ng/mL',
  iron: 'μg/dL',
  tibc: 'μg/dL',
  
  // Hormonal Tests
  cortisol: 'μg/dL',
  testosterone: 'ng/dL',
  estradiol: 'pg/mL',
  lh: 'mIU/mL',
  fsh: 'mIU/mL',
  prolactin: 'ng/mL',
  
  // Tumor Markers
  cea: 'ng/mL',
  afp: 'ng/mL',
  ca19_9: 'U/mL',
  ca125: 'U/mL',
  psa: 'ng/mL',
  
  // Autoimmune Markers
  ana: 'Titer',
  rf: 'IU/mL',
  antiCcp: 'U/mL',
  c3: 'mg/dL',
  c4: 'mg/dL',
  
  // Coagulation Studies
  pt: 'seconds',
  inr: 'ratio',
  aptt: 'seconds',
  fibrinogen: 'mg/dL',
  dDimer: 'ng/mL FEU'
};
