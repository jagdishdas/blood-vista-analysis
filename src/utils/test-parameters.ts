
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

// Function to get parameters by test type with reference ranges
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
export const getTestParameters = (testType: 'lipid' | 'glucose' | 'thyroid'): BloodTestParameter[] => {
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
      return [];
  }
  
  // Return parameters with default reference ranges (will be updated when gender/age is provided)
  return baseParameters.map(param => ({
    ...param,
    value: '',
    referenceRange: getBloodTestReferenceRange(testType, param.id, 'male', 25) // Default values
  }));
};
