
import { BloodTestParameter } from '@/types/blood-test.types';
import { getBloodTestReferenceRange, BLOOD_TEST_STANDARD_UNITS } from './blood-test-reference-ranges';

// LIPID PROFILE PARAMETERS
export const LIPID_PARAMETERS: Omit<BloodTestParameter, 'value' | 'referenceRange'>[] = [
  {
    id: 'totalCholesterol',
    nameEn: 'Total Cholesterol',
    nameUr: 'کل کولیسٹرول',
    unit: BLOOD_TEST_STANDARD_UNITS.totalCholesterol,
    category: 'lipid'
  },
  {
    id: 'ldlCholesterol',
    nameEn: 'LDL Cholesterol (Bad)',
    nameUr: 'ایل ڈی ایل کولیسٹرول (برا)',
    unit: BLOOD_TEST_STANDARD_UNITS.ldlCholesterol,
    category: 'lipid'
  },
  {
    id: 'hdlCholesterol',
    nameEn: 'HDL Cholesterol (Good)',
    nameUr: 'ایچ ڈی ایل کولیسٹرول (اچھا)',
    unit: BLOOD_TEST_STANDARD_UNITS.hdlCholesterol,
    category: 'lipid'
  },
  {
    id: 'triglycerides',
    nameEn: 'Triglycerides',
    nameUr: 'ٹرائگلیسرائیڈز',
    unit: BLOOD_TEST_STANDARD_UNITS.triglycerides,
    category: 'lipid'
  },
  {
    id: 'nonHdlCholesterol',
    nameEn: 'Non-HDL Cholesterol',
    nameUr: 'غیر ایچ ڈی ایل کولیسٹرول',
    unit: BLOOD_TEST_STANDARD_UNITS.nonHdlCholesterol,
    category: 'lipid'
  }
];

// GLUCOSE TEST PARAMETERS
export const GLUCOSE_PARAMETERS: Omit<BloodTestParameter, 'value' | 'referenceRange'>[] = [
  {
    id: 'fastingGlucose',
    nameEn: 'Fasting Glucose',
    nameUr: 'خالی پیٹ گلوکوز',
    unit: BLOOD_TEST_STANDARD_UNITS.fastingGlucose,
    category: 'glucose'
  },
  {
    id: 'randomGlucose',
    nameEn: 'Random/Postprandial Glucose',
    nameUr: 'بے ترتیب/کھانے کے بعد گلوکوز',
    unit: BLOOD_TEST_STANDARD_UNITS.randomGlucose,
    category: 'glucose'
  },
  {
    id: 'hba1c',
    nameEn: 'HbA1c (Glycated Hemoglobin)',
    nameUr: 'ایچ بی اے ون سی (گلائکیٹیڈ ہیموگلوبن)',
    unit: BLOOD_TEST_STANDARD_UNITS.hba1c,
    category: 'glucose'
  },
  {
    id: 'ogtt2h',
    nameEn: '2-Hour OGTT',
    nameUr: '2 گھنٹے او جی ٹی ٹی',
    unit: BLOOD_TEST_STANDARD_UNITS.ogtt2h,
    category: 'glucose'
  }
];

// THYROID FUNCTION TEST PARAMETERS
export const THYROID_PARAMETERS: Omit<BloodTestParameter, 'value' | 'referenceRange'>[] = [
  {
    id: 'tsh',
    nameEn: 'TSH (Thyroid Stimulating Hormone)',
    nameUr: 'ٹی ایس ایچ (تھائرائیڈ محرک ہارمون)',
    unit: BLOOD_TEST_STANDARD_UNITS.tsh,
    category: 'thyroid'
  },
  {
    id: 'freeT4',
    nameEn: 'Free T4 (Thyroxine)',
    nameUr: 'فری ٹی 4 (تھائرآکسین)',
    unit: BLOOD_TEST_STANDARD_UNITS.freeT4,
    category: 'thyroid'
  },
  {
    id: 'freeT3',
    nameEn: 'Free T3 (Triiodothyronine)',
    nameUr: 'فری ٹی 3 (ٹرائی آیوڈوتھائرونین)',
    unit: BLOOD_TEST_STANDARD_UNITS.freeT3,
    category: 'thyroid'
  },
  {
    id: 'totalT4',
    nameEn: 'Total T4',
    nameUr: 'کل ٹی 4',
    unit: BLOOD_TEST_STANDARD_UNITS.totalT4,
    category: 'thyroid'
  },
  {
    id: 'totalT3',
    nameEn: 'Total T3',
    nameUr: 'کل ٹی 3',
    unit: BLOOD_TEST_STANDARD_UNITS.totalT3,
    category: 'thyroid'
  },
  {
    id: 'antiTPO',
    nameEn: 'Anti-TPO Antibodies',
    nameUr: 'اینٹی ٹی پی او اینٹی باڈیز',
    unit: BLOOD_TEST_STANDARD_UNITS.antiTPO,
    category: 'thyroid'
  }
];

// LIVER FUNCTION TEST PARAMETERS
export const LIVER_PARAMETERS: Omit<BloodTestParameter, 'value' | 'referenceRange'>[] = [
  {
    id: 'alt',
    nameEn: 'ALT (Alanine Aminotransferase)',
    nameUr: 'اے ایل ٹی (ایلانین امینوٹرانسفیریز)',
    unit: BLOOD_TEST_STANDARD_UNITS.alt,
    category: 'liver'
  },
  {
    id: 'ast',
    nameEn: 'AST (Aspartate Aminotransferase)',
    nameUr: 'اے ایس ٹی (اسپارٹیٹ امینوٹرانسفیریز)',
    unit: BLOOD_TEST_STANDARD_UNITS.ast,
    category: 'liver'
  },
  {
    id: 'alp',
    nameEn: 'ALP (Alkaline Phosphatase)',
    nameUr: 'اے ایل پی (الکلائن فاسفیٹیز)',
    unit: BLOOD_TEST_STANDARD_UNITS.alp,
    category: 'liver'
  },
  {
    id: 'totalBilirubin',
    nameEn: 'Total Bilirubin',
    nameUr: 'کل بلیروبن',
    unit: BLOOD_TEST_STANDARD_UNITS.totalBilirubin,
    category: 'liver'
  },
  {
    id: 'directBilirubin',
    nameEn: 'Direct Bilirubin',
    nameUr: 'ڈائریکٹ بلیروبن',
    unit: BLOOD_TEST_STANDARD_UNITS.directBilirubin,
    category: 'liver'
  },
  {
    id: 'totalProtein',
    nameEn: 'Total Protein',
    nameUr: 'کل پروٹین',
    unit: BLOOD_TEST_STANDARD_UNITS.totalProtein,
    category: 'liver'
  },
  {
    id: 'albumin',
    nameEn: 'Albumin',
    nameUr: 'البیومن',
    unit: BLOOD_TEST_STANDARD_UNITS.albumin,
    category: 'liver'
  },
  {
    id: 'ggt',
    nameEn: 'GGT (Gamma-Glutamyl Transferase)',
    nameUr: 'جی جی ٹی (گاما گلوٹامل ٹرانسفیریز)',
    unit: BLOOD_TEST_STANDARD_UNITS.ggt,
    category: 'liver'
  }
];

// KIDNEY FUNCTION TEST PARAMETERS
export const KIDNEY_PARAMETERS: Omit<BloodTestParameter, 'value' | 'referenceRange'>[] = [
  {
    id: 'creatinine',
    nameEn: 'Serum Creatinine',
    nameUr: 'سیرم کریٹینین',
    unit: BLOOD_TEST_STANDARD_UNITS.creatinine,
    category: 'kidney'
  },
  {
    id: 'bun',
    nameEn: 'BUN (Blood Urea Nitrogen)',
    nameUr: 'بی یو این (بلڈ یوریا نائٹروجن)',
    unit: BLOOD_TEST_STANDARD_UNITS.bun,
    category: 'kidney'
  },
  {
    id: 'egfr',
    nameEn: 'eGFR (Estimated GFR)',
    nameUr: 'ای جی ایف آر (تخمینی جی ایف آر)',
    unit: BLOOD_TEST_STANDARD_UNITS.egfr,
    category: 'kidney'
  },
  {
    id: 'uricAcid',
    nameEn: 'Uric Acid',
    nameUr: 'یورک ایسڈ',
    unit: BLOOD_TEST_STANDARD_UNITS.uricAcid,
    category: 'kidney'
  },
  {
    id: 'cystatinC',
    nameEn: 'Cystatin C',
    nameUr: 'سسٹاٹن سی',
    unit: BLOOD_TEST_STANDARD_UNITS.cystatinC,
    category: 'kidney'
  }
];

// CARDIAC MARKERS PARAMETERS
export const CARDIAC_PARAMETERS: Omit<BloodTestParameter, 'value' | 'referenceRange'>[] = [
  {
    id: 'troponinI',
    nameEn: 'Troponin I',
    nameUr: 'ٹروپونن آئی',
    unit: BLOOD_TEST_STANDARD_UNITS.troponinI,
    category: 'cardiac'
  },
  {
    id: 'troponinT',
    nameEn: 'Troponin T',
    nameUr: 'ٹروپونن ٹی',
    unit: BLOOD_TEST_STANDARD_UNITS.troponinT,
    category: 'cardiac'
  },
  {
    id: 'ckMb',
    nameEn: 'CK-MB',
    nameUr: 'سی کے ایم بی',
    unit: BLOOD_TEST_STANDARD_UNITS.ckMb,
    category: 'cardiac'
  },
  {
    id: 'ntProBnp',
    nameEn: 'NT-proBNP',
    nameUr: 'این ٹی پرو بی این پی',
    unit: BLOOD_TEST_STANDARD_UNITS.ntProBnp,
    category: 'cardiac'
  },
  {
    id: 'myoglobin',
    nameEn: 'Myoglobin',
    nameUr: 'مایوگلوبن',
    unit: BLOOD_TEST_STANDARD_UNITS.myoglobin,
    category: 'cardiac'
  }
];

// INFLAMMATORY MARKERS PARAMETERS
export const INFLAMMATORY_PARAMETERS: Omit<BloodTestParameter, 'value' | 'referenceRange'>[] = [
  {
    id: 'crp',
    nameEn: 'C-Reactive Protein (CRP)',
    nameUr: 'سی ری ایکٹو پروٹین (سی آر پی)',
    unit: BLOOD_TEST_STANDARD_UNITS.crp,
    category: 'inflammatory'
  },
  {
    id: 'esr',
    nameEn: 'ESR (Erythrocyte Sedimentation Rate)',
    nameUr: 'ای ایس آر (خون کے خلیات کی نیچے بیٹھنے کی رفتار)',
    unit: BLOOD_TEST_STANDARD_UNITS.esr,
    category: 'inflammatory'
  },
  {
    id: 'procalcitonin',
    nameEn: 'Procalcitonin',
    nameUr: 'پروکیلسیٹونن',
    unit: BLOOD_TEST_STANDARD_UNITS.procalcitonin,
    category: 'inflammatory'
  },
  {
    id: 'ferritin',
    nameEn: 'Ferritin',
    nameUr: 'فیریٹن',
    unit: BLOOD_TEST_STANDARD_UNITS.ferritin,
    category: 'inflammatory'
  }
];

// ELECTROLYTES & MINERALS PARAMETERS
export const ELECTROLYTES_PARAMETERS: Omit<BloodTestParameter, 'value' | 'referenceRange'>[] = [
  {
    id: 'sodium',
    nameEn: 'Sodium (Na+)',
    nameUr: 'سوڈیم (نا+)',
    unit: BLOOD_TEST_STANDARD_UNITS.sodium,
    category: 'electrolytes'
  },
  {
    id: 'potassium',
    nameEn: 'Potassium (K+)',
    nameUr: 'پوٹاشیم (کے+)',
    unit: BLOOD_TEST_STANDARD_UNITS.potassium,
    category: 'electrolytes'
  },
  {
    id: 'chloride',
    nameEn: 'Chloride (Cl-)',
    nameUr: 'کلورائیڈ (سی ایل-)',
    unit: BLOOD_TEST_STANDARD_UNITS.chloride,
    category: 'electrolytes'
  },
  {
    id: 'calcium',
    nameEn: 'Calcium (Total)',
    nameUr: 'کیلشیم (کل)',
    unit: BLOOD_TEST_STANDARD_UNITS.calcium,
    category: 'electrolytes'
  },
  {
    id: 'magnesium',
    nameEn: 'Magnesium',
    nameUr: 'میگنیشیم',
    unit: BLOOD_TEST_STANDARD_UNITS.magnesium,
    category: 'electrolytes'
  },
  {
    id: 'phosphorus',
    nameEn: 'Phosphorus',
    nameUr: 'فاسفورس',
    unit: BLOOD_TEST_STANDARD_UNITS.phosphorus,
    category: 'electrolytes'
  }
];

// VITAMINS & DEFICIENCIES PARAMETERS
export const VITAMINS_PARAMETERS: Omit<BloodTestParameter, 'value' | 'referenceRange'>[] = [
  {
    id: 'vitaminB12',
    nameEn: 'Vitamin B12',
    nameUr: 'وٹامن بی 12',
    unit: BLOOD_TEST_STANDARD_UNITS.vitaminB12,
    category: 'vitamins'
  },
  {
    id: 'folate',
    nameEn: 'Folate (Folic Acid)',
    nameUr: 'فولیٹ (فولک ایسڈ)',
    unit: BLOOD_TEST_STANDARD_UNITS.folate,
    category: 'vitamins'
  },
  {
    id: 'vitaminD',
    nameEn: 'Vitamin D (25-OH)',
    nameUr: 'وٹامن ڈی (25-OH)',
    unit: BLOOD_TEST_STANDARD_UNITS.vitaminD,
    category: 'vitamins'
  },
  {
    id: 'iron',
    nameEn: 'Iron (Serum)',
    nameUr: 'آئرن (سیرم)',
    unit: BLOOD_TEST_STANDARD_UNITS.iron,
    category: 'vitamins'
  },
  {
    id: 'tibc',
    nameEn: 'TIBC (Total Iron Binding Capacity)',
    nameUr: 'ٹی آئی بی سی (کل آئرن بائنڈنگ صلاحیت)',
    unit: BLOOD_TEST_STANDARD_UNITS.tibc,
    category: 'vitamins'
  }
];

// HORMONAL TESTS PARAMETERS
export const HORMONAL_PARAMETERS: Omit<BloodTestParameter, 'value' | 'referenceRange'>[] = [
  {
    id: 'cortisol',
    nameEn: 'Cortisol (Morning)',
    nameUr: 'کورٹیسول (صبح)',
    unit: BLOOD_TEST_STANDARD_UNITS.cortisol,
    category: 'hormonal'
  },
  {
    id: 'testosterone',
    nameEn: 'Testosterone (Total)',
    nameUr: 'ٹیسٹوسٹرون (کل)',
    unit: BLOOD_TEST_STANDARD_UNITS.testosterone,
    category: 'hormonal'
  },
  {
    id: 'estradiol',
    nameEn: 'Estradiol (E2)',
    nameUr: 'ایسٹراڈیول (ای 2)',
    unit: BLOOD_TEST_STANDARD_UNITS.estradiol,
    category: 'hormonal'
  },
  {
    id: 'lh',
    nameEn: 'LH (Luteinizing Hormone)',
    nameUr: 'ایل ایچ (لیوٹینائزنگ ہارمون)',
    unit: BLOOD_TEST_STANDARD_UNITS.lh,
    category: 'hormonal'
  },
  {
    id: 'fsh',
    nameEn: 'FSH (Follicle Stimulating Hormone)',
    nameUr: 'ایف ایس ایچ (فولیکل محرک ہارمون)',
    unit: BLOOD_TEST_STANDARD_UNITS.fsh,
    category: 'hormonal'
  },
  {
    id: 'prolactin',
    nameEn: 'Prolactin',
    nameUr: 'پرولیکٹن',
    unit: BLOOD_TEST_STANDARD_UNITS.prolactin,
    category: 'hormonal'
  }
];

// TUMOR MARKERS PARAMETERS
export const TUMOR_PARAMETERS: Omit<BloodTestParameter, 'value' | 'referenceRange'>[] = [
  {
    id: 'cea',
    nameEn: 'CEA (Carcinoembryonic Antigen)',
    nameUr: 'سی ای اے (کارسینوایمبریونک اینٹیجن)',
    unit: BLOOD_TEST_STANDARD_UNITS.cea,
    category: 'tumor'
  },
  {
    id: 'afp',
    nameEn: 'AFP (Alpha-Fetoprotein)',
    nameUr: 'اے ایف پی (الفا فیٹوپروٹین)',
    unit: BLOOD_TEST_STANDARD_UNITS.afp,
    category: 'tumor'
  },
  {
    id: 'ca19_9',
    nameEn: 'CA 19-9',
    nameUr: 'سی اے 19-9',
    unit: BLOOD_TEST_STANDARD_UNITS.ca19_9,
    category: 'tumor'
  },
  {
    id: 'ca125',
    nameEn: 'CA 125',
    nameUr: 'سی اے 125',
    unit: BLOOD_TEST_STANDARD_UNITS.ca125,
    category: 'tumor'
  },
  {
    id: 'psa',
    nameEn: 'PSA (Prostate Specific Antigen)',
    nameUr: 'پی ایس اے (پروسٹیٹ مخصوص اینٹیجن)',
    unit: BLOOD_TEST_STANDARD_UNITS.psa,
    category: 'tumor'
  }
];

// AUTOIMMUNE MARKERS PARAMETERS
export const AUTOIMMUNE_PARAMETERS: Omit<BloodTestParameter, 'value' | 'referenceRange'>[] = [
  {
    id: 'ana',
    nameEn: 'ANA (Antinuclear Antibodies)',
    nameUr: 'اے این اے (اینٹی نیوکلیئر اینٹی باڈیز)',
    unit: BLOOD_TEST_STANDARD_UNITS.ana,
    category: 'autoimmune'
  },
  {
    id: 'rf',
    nameEn: 'RF (Rheumatoid Factor)',
    nameUr: 'آر ایف (ریومیٹائیڈ فیکٹر)',
    unit: BLOOD_TEST_STANDARD_UNITS.rf,
    category: 'autoimmune'
  },
  {
    id: 'antiCcp',
    nameEn: 'Anti-CCP Antibodies',
    nameUr: 'اینٹی سی سی پی اینٹی باڈیز',
    unit: BLOOD_TEST_STANDARD_UNITS.antiCcp,
    category: 'autoimmune'
  },
  {
    id: 'c3',
    nameEn: 'Complement C3',
    nameUr: 'کمپلیمنٹ سی 3',
    unit: BLOOD_TEST_STANDARD_UNITS.c3,
    category: 'autoimmune'
  },
  {
    id: 'c4',
    nameEn: 'Complement C4',
    nameUr: 'کمپلیمنٹ سی 4',
    unit: BLOOD_TEST_STANDARD_UNITS.c4,
    category: 'autoimmune'
  }
];

// COAGULATION STUDIES PARAMETERS
export const COAGULATION_PARAMETERS: Omit<BloodTestParameter, 'value' | 'referenceRange'>[] = [
  {
    id: 'pt',
    nameEn: 'PT (Prothrombin Time)',
    nameUr: 'پی ٹی (پروتھرومبن ٹائم)',
    unit: BLOOD_TEST_STANDARD_UNITS.pt,
    category: 'coagulation'
  },
  {
    id: 'inr',
    nameEn: 'INR (International Normalized Ratio)',
    nameUr: 'آئی این آر (بین الاقوامی معیاری نسبت)',
    unit: BLOOD_TEST_STANDARD_UNITS.inr,
    category: 'coagulation'
  },
  {
    id: 'aptt',
    nameEn: 'aPTT (Activated Partial Thromboplastin Time)',
    nameUr: 'اے پی ٹی ٹی (ایکٹیویٹڈ پارشل تھرومبوپلاسٹن ٹائم)',
    unit: BLOOD_TEST_STANDARD_UNITS.aptt,
    category: 'coagulation'
  },
  {
    id: 'fibrinogen',
    nameEn: 'Fibrinogen',
    nameUr: 'فائبرینوجن',
    unit: BLOOD_TEST_STANDARD_UNITS.fibrinogen,
    category: 'coagulation'
  },
  {
    id: 'dDimer',
    nameEn: 'D-Dimer',
    nameUr: 'ڈی ڈائمر',
    unit: BLOOD_TEST_STANDARD_UNITS.dDimer,
    category: 'coagulation'
  }
];
export const getParametersByTestType = (
  testType: 'cbc' | 'lipid' | 'glucose' | 'thyroid',
  gender: 'male' | 'female',
  age: number
): BloodTestParameter[] => {
  let baseParameters: Omit<BloodTestParameter, 'value' | 'referenceRange'>[];
  
  switch (testType) {
    case 'lipid':
      baseParameters = LIPID_PARAMETERS;
      break;
    case 'glucose':  
      baseParameters = GLUCOSE_PARAMETERS;
      break;
    case 'thyroid':
      baseParameters = THYROID_PARAMETERS;
      break;
    default:
      return []; // CBC will be handled separately
  }
  
  return baseParameters.map(param => ({
    ...param,
    value: '',
    referenceRange: getBloodTestReferenceRange(
      testType as 'lipid' | 'glucose' | 'thyroid',
      param.id,
      gender,
      age
    )
  }));
};

// Updated function to return complete BloodTestParameter objects with default reference ranges
// Reference: International medical standards (Mayo Clinic, ABIM, KDIGO 2024, ATA 2024)
export const getTestParameters = (
  testType: 'lipid' | 'glucose' | 'thyroid' | 'liver' | 'kidney' | 'cardiac' | 'inflammatory' | 'electrolytes' | 'vitamins' | 'hormonal' | 'tumor' | 'autoimmune' | 'coagulation',
  gender: 'male' | 'female' = 'male',
  age: number = 30
): BloodTestParameter[] => {
  let baseParameters: Omit<BloodTestParameter, 'value' | 'referenceRange'>[];
  
  // Select parameters based on test type
  switch (testType) {
    case 'lipid':
      baseParameters = LIPID_PARAMETERS;
      break;
    case 'glucose':
      baseParameters = GLUCOSE_PARAMETERS;
      break;
    case 'thyroid':
      baseParameters = THYROID_PARAMETERS;
      break;
    case 'liver':
      baseParameters = LIVER_PARAMETERS;
      break;
    case 'kidney':
      baseParameters = KIDNEY_PARAMETERS;
      break;
    case 'cardiac':
      baseParameters = CARDIAC_PARAMETERS;
      break;
    case 'inflammatory':
      baseParameters = INFLAMMATORY_PARAMETERS;
      break;
    case 'electrolytes':
      baseParameters = ELECTROLYTES_PARAMETERS;
      break;
    case 'vitamins':
      baseParameters = VITAMINS_PARAMETERS;
      break;
    case 'hormonal':
      baseParameters = HORMONAL_PARAMETERS;
      break;
    case 'tumor':
      baseParameters = TUMOR_PARAMETERS;
      break;
    case 'autoimmune':
      baseParameters = AUTOIMMUNE_PARAMETERS;
      break;
    case 'coagulation':
      baseParameters = COAGULATION_PARAMETERS;
      break;
    default:
      baseParameters = [];
  }
  
  // Return parameters with accurate reference ranges based on gender and age
  return baseParameters.map(param => ({
    ...param,
    value: '',
    referenceRange: getBloodTestReferenceRange(testType, param.id, gender, age)
  }));
};
