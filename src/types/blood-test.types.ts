
// Base interfaces that extend the current CBC types
export interface BloodTestParameter {
  id: string;
  nameEn: string;
  nameUr: string;
  value: string;
  unit: string;
  referenceRange: {
    min: number;
    max: number;
  };
  category: string;
}

export interface BloodTestFormData {
  patientName: string;
  patientAge: number;
  patientGender: 'male' | 'female' | '';
  testType: 'cbc' | 'lipid' | 'glucose' | 'thyroid';
  parameters: BloodTestParameter[];
}

export interface BloodTestResult {
  parameter: BloodTestParameter;
  status: 'normal' | 'low' | 'high' | 'critical-low' | 'critical-high';
  deviation: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  interpretation: {
    en: string;
    ur: string;
  };
  recommendations: {
    en: string[];
    ur: string[];
  };
}

export interface BloodTestAnalysis {
  testType: 'cbc' | 'lipid' | 'glucose' | 'thyroid';
  summary: {
    en: string;
    ur: string;
  };
  overallRisk: 'low' | 'moderate' | 'high' | 'critical';
  results: BloodTestResult[];
  relatedConditions: {
    en: string[];
    ur: string[];
  };
}

export interface ExtractedBloodTestData {
  patientName?: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | '';
  testType?: 'lipid' | 'glucose' | 'thyroid';
  parameters: {
    id: string;
    value: string;
    unit: string;
    referenceRange?: {
      min: number;
      max: number;
    };
  }[];
}

// Test type definitions
export type TestCategory = {
  id: 'cbc' | 'lipid' | 'glucose' | 'thyroid';
  nameEn: string;
  nameUr: string;
  description: {
    en: string;
    ur: string;
  };
  icon: string;
  color: string;
};
