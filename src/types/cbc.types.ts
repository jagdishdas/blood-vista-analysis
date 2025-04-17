
export interface CBCParameter {
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

export interface CBCFormData {
  patientName: string;
  patientAge: number;
  patientGender: 'male' | 'female' | '';
  parameters: CBCParameter[];
}

export interface CBCResult {
  parameter: CBCParameter;
  status: 'normal' | 'low' | 'high';
  deviation: number;
  interpretation: {
    en: string;
    ur: string;
  };
}

export interface CBCAnalysis {
  summary: {
    en: string;
    ur: string;
  };
  results: CBCResult[];
}

export interface ExtractedCBCData {
  patientName?: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | '';
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

export interface OCRResult {
  text: string;
  confidence: number;
}
