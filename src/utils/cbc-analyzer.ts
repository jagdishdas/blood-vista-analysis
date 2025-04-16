
import { CBCFormData, CBCAnalysis, CBCResult } from "../types/cbc.types";

// Calculate percentage deviation from the normal range
const calculateDeviation = (value: number, min: number, max: number): number => {
  if (value < min) {
    return ((value - min) / min) * 100;
  } else if (value > max) {
    return ((value - max) / max) * 100;
  }
  return 0;
};

// Get status based on value comparison with reference range
const getStatus = (value: number, min: number, max: number): 'normal' | 'low' | 'high' => {
  if (value < min) return 'low';
  if (value > max) return 'high';
  return 'normal';
};

// Generate interpretation for each parameter
const generateInterpretation = (parameter: string, status: 'normal' | 'low' | 'high', deviation: number): { en: string; ur: string } => {
  // Basic interpretations - in a production app these would be much more detailed and medically accurate
  
  const interpretations: Record<string, { en: { normal: string; low: string; high: string }; ur: { normal: string; low: string; high: string } }> = {
    wbc: {
      en: {
        normal: "White blood cell count is normal, indicating a healthy immune response.",
        low: "Low white blood cell count (Leukopenia) may indicate bone marrow problems, autoimmune disorders, or certain infections.",
        high: "High white blood cell count (Leukocytosis) suggests your body may be fighting an infection or inflammation."
      },
      ur: {
        normal: "سفید خون کے خلیات کی تعداد معمول کے مطابق ہے، جو ایک صحت مند مدافعتی ردعمل کی نشاندہی کرتی ہے۔",
        low: "سفید خون کے خلیات کی کم تعداد (لیوکوپینیا) بون میرو کے مسائل، آٹو امیون عوارض، یا کچھ انفیکشنز کی نشاندہی کر سکتی ہے۔",
        high: "سفید خون کے خلیات کی زیادہ تعداد (لیکوسائٹوسس) بتاتی ہے کہ آپ کا جسم انفیکشن یا سوزش سے لڑ رہا ہے۔"
      }
    },
    rbc: {
      en: {
        normal: "Red blood cell count is within normal range, indicating good oxygen-carrying capacity.",
        low: "Low red blood cell count may indicate anemia or blood loss.",
        high: "High red blood cell count (Erythrocytosis) could indicate dehydration, lung disease, or polycythemia vera."
      },
      ur: {
        normal: "سرخ خون کے خلیات کی تعداد معمول کی حد میں ہے، جو آکسیجن لے جانے کی اچھی صلاحیت کی نشاندہی کرتی ہے۔",
        low: "سرخ خون کے خلیات کی کم تعداد خون کی کمی یا خون کے ضیاع کی نشاندہی کر سکتی ہے۔",
        high: "سرخ خون کے خلیات کی زیادہ تعداد (ایریتھروسائٹوسس) پانی کی کمی، پھیپھڑوں کی بیماری، یا پولی سائتھیمیا ویرا کو ظاہر کر سکتی ہے۔"
      }
    },
    hemoglobin: {
      en: {
        normal: "Hemoglobin level is normal, indicating good oxygen transport capacity.",
        low: "Low hemoglobin level indicates anemia which may cause fatigue and weakness.",
        high: "High hemoglobin level may be due to dehydration, lung disease, or polycythemia."
      },
      ur: {
        normal: "ہیموگلوبن کی سطح معمول کے مطابق ہے، جو آکسیجن کی نقل و حمل کی اچھی صلاحیت کی نشاندہی کرتی ہے۔",
        low: "ہیموگلوبن کی کم سطح خون کی کمی کی نشاندہی کرتی ہے جس سے تھکاوٹ اور کمزوری ہو سکتی ہے۔",
        high: "ہیموگلوبن کی زیادہ سطح پانی کی کمی، پھیپھڑوں کی بیماری، یا پولی سائتھیمیا کی وجہ سے ہو سکتی ہے۔"
      }
    },
    hematocrit: {
      en: {
        normal: "Hematocrit value is normal, indicating appropriate red blood cell volume in blood.",
        low: "Low hematocrit suggests anemia or blood loss.",
        high: "High hematocrit may indicate dehydration or polycythemia vera."
      },
      ur: {
        normal: "ہیماٹوکرٹ کی قدر معمول کے مطابق ہے، جو خون میں سرخ خون کے خلیات کی مناسب مقدار کی نشاندہی کرتی ہے۔",
        low: "کم ہیماٹوکرٹ خون کی کمی یا خون کے ضیاع کی نشاندہی کرتا ہے۔",
        high: "زیادہ ہیماٹوکرٹ پانی کی کمی یا پولی سائتھیمیا ویرا کی نشاندہی کر سکتا ہے۔"
      }
    },
    platelets: {
      en: {
        normal: "Platelet count is normal, indicating proper blood clotting function.",
        low: "Low platelets (Thrombocytopenia) may increase risk of bleeding.",
        high: "High platelets (Thrombocytosis) may increase risk of clot formation."
      },
      ur: {
        normal: "پلیٹلیٹس کی تعداد معمول کے مطابق ہے، جو خون کے جمنے کی مناسب فعالیت کی نشاندہی کرتی ہے۔",
        low: "کم پلیٹلیٹس (تھرومبوسائٹوپینیا) خون بہنے کے خطرے کو بڑھا سکتی ہیں۔",
        high: "زیادہ پلیٹلیٹس (تھرومبوسائٹوسس) خون کے لوتھڑے بننے کے خطرے کو بڑھا سکتی ہیں۔"
      }
    }
  };

  // Default interpretation if specific parameter is not found
  const defaultInterp = {
    en: {
      normal: `${parameter} is within normal range.`,
      low: `${parameter} is below normal range.`,
      high: `${parameter} is above normal range.`
    },
    ur: {
      normal: `${parameter} معمول کی حد میں ہے۔`,
      low: `${parameter} معمول سے کم ہے۔`,
      high: `${parameter} معمول سے زیادہ ہے۔`
    }
  };

  const interp = interpretations[parameter] || defaultInterp;
  
  return {
    en: interp.en[status],
    ur: interp.ur[status]
  };
};

// Generate summary based on overall findings
const generateSummary = (results: CBCResult[]): { en: string; ur: string } => {
  const abnormalResults = results.filter(r => r.status !== 'normal');
  
  if (abnormalResults.length === 0) {
    return {
      en: "All CBC parameters are within normal ranges. No significant abnormalities detected.",
      ur: "سی بی سی کے تمام پیرامیٹرز معمول کی حدود میں ہیں۔ کوئی قابل ذکر غیر معمولی بات نہیں پائی گئی۔"
    };
  }
  
  // Count low and high values
  const lowCount = abnormalResults.filter(r => r.status === 'low').length;
  const highCount = abnormalResults.filter(r => r.status === 'high').length;
  
  // Check for specific patterns (simplified for this implementation)
  const hasLowRBC = results.find(r => r.parameter.id === 'rbc' && r.status === 'low');
  const hasLowHemoglobin = results.find(r => r.parameter.id === 'hemoglobin' && r.status === 'low');
  const hasLowHematocrit = results.find(r => r.parameter.id === 'hematocrit' && r.status === 'low');
  
  // Check for anemia pattern
  if (hasLowRBC && hasLowHemoglobin && hasLowHematocrit) {
    return {
      en: "Your CBC results suggest possible anemia. Low red blood cells, hemoglobin, and hematocrit were detected. Please consult with a healthcare provider for further evaluation.",
      ur: "آپ کے سی بی سی کے نتائج خون کی کمی کی طرف اشارہ کرتے ہیں۔ سرخ خون کے خلیات، ہیموگلوبن، اور ہیماٹوکرٹ کم پائے گئے ہیں۔ مزید جانچ کے لیے براہ کرم کسی ہیلتھ کیئر فراہم کنندہ سے مشورہ کریں۔"
    };
  }
  
  // Generic summary
  return {
    en: `Your CBC results show ${abnormalResults.length} abnormal values (${lowCount} low, ${highCount} high). Please consult with a healthcare provider to interpret these findings.`,
    ur: `آپ کے سی بی سی کے نتائج ${abnormalResults.length} غیر معمولی اقدار دکھاتے ہیں (${lowCount} کم، ${highCount} زیادہ)۔ ان نتائج کی تشریح کے لیے براہ کرم کسی ہیلتھ کیئر فراہم کنندہ سے مشورہ کریں۔`
  };
};

// Main analyzer function
export const analyzeCBC = (data: CBCFormData): CBCAnalysis => {
  const results: CBCResult[] = data.parameters
    .filter(param => param.value !== '') // Only analyze parameters with values
    .map(param => {
      const value = parseFloat(param.value);
      const { min, max } = param.referenceRange;
      const status = getStatus(value, min, max);
      const deviation = calculateDeviation(value, min, max);
      const interpretation = generateInterpretation(param.id, status, deviation);
      
      return {
        parameter: param,
        status,
        deviation,
        interpretation
      };
    });
  
  const summary = generateSummary(results);
  
  return {
    summary,
    results
  };
};
