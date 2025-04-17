
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
  // Comprehensive interpretations with medical context
  
  const interpretations: Record<string, { en: { normal: string; low: string; high: string }; ur: { normal: string; low: string; high: string } }> = {
    wbc: {
      en: {
        normal: "White blood cell count is normal, indicating a healthy immune response.",
        low: "Low white blood cell count (Leukopenia) may indicate bone marrow problems, autoimmune disorders, certain infections, or medication side effects. This can increase your risk of infections.",
        high: "High white blood cell count (Leukocytosis) suggests your body is fighting an infection or inflammation. It can also indicate a bone marrow disorder, an immune system disorder, or a reaction to medication."
      },
      ur: {
        normal: "سفید خون کے خلیات کی تعداد معمول کے مطابق ہے، جو ایک صحت مند مدافعتی ردعمل کی نشاندہی کرتی ہے۔",
        low: "سفید خون کے خلیات کی کم تعداد (لیوکوپینیا) بون میرو کے مسائل، آٹو امیون عوارض، کچھ انفیکشنز، یا دوائی کے سائڈ ایفیکٹس کی نشاندہی کر سکتی ہے۔ یہ انفیکشن کے خطرے کو بڑھا سکتی ہے۔",
        high: "سفید خون کے خلیات کی زیادہ تعداد (لیکوسائٹوسس) بتاتی ہے کہ آپ کا جسم انفیکشن یا سوزش سے لڑ رہا ہے۔ یہ بون میرو کی خرابی، مدافعتی نظام کی خرابی، یا دوائیوں کے ردعمل کی بھی نشاندہی کر سکتی ہے۔"
      }
    },
    rbc: {
      en: {
        normal: "Red blood cell count is within normal range, indicating good oxygen-carrying capacity.",
        low: "Low red blood cell count may indicate anemia, blood loss, nutritional deficiencies (iron, folate, or B12), or bone marrow disorders.",
        high: "High red blood cell count (Erythrocytosis) could indicate dehydration, lung disease, kidney disease, or polycythemia vera. It may increase risk of blood clots."
      },
      ur: {
        normal: "سرخ خون کے خلیات کی تعداد معمول کی حد میں ہے، جو آکسیجن لے جانے کی اچھی صلاحیت کی نشاندہی کرتی ہے۔",
        low: "سرخ خون کے خلیات کی کم تعداد خون کی کمی، خون کے ضیاع، غذائی کمی (آئرن، فولیٹ، یا بی12)، یا بون میرو کی خرابی کی نشاندہی کر سکتی ہے۔",
        high: "سرخ خون کے خلیات کی زیادہ تعداد (ایریتھروسائٹوسس) پانی کی کمی، پھیپھڑوں کی بیماری، گردے کی بیماری، یا پولی سائتھیمیا ویرا کو ظاہر کر سکتی ہے۔ یہ خون کے لوتھڑے بننے کے خطرے کو بڑھا سکتی ہے۔"
      }
    },
    hemoglobin: {
      en: {
        normal: "Hemoglobin level is normal, indicating good oxygen transport capacity.",
        low: "Low hemoglobin level indicates anemia which may cause fatigue, weakness, and shortness of breath. Causes include iron deficiency, blood loss, or chronic diseases.",
        high: "High hemoglobin level may be due to dehydration, lung disease, polycythemia, or living at high altitudes. This can increase blood viscosity."
      },
      ur: {
        normal: "ہیموگلوبن کی سطح معمول کے مطابق ہے، جو آکسیجن کی نقل و حمل کی اچھی صلاحیت کی نشاندہی کرتی ہے۔",
        low: "ہیموگلوبن کی کم سطح خون کی کمی کی نشاندہی کرتی ہے جس سے تھکاوٹ، کمزوری، اور سانس پھولنا ہو سکتا ہے۔ اس کی وجوہات میں آئرن کی کمی، خون کا ضیاع، یا دائمی بیماریاں شامل ہیں۔",
        high: "ہیموگلوبن کی زیادہ سطح پانی کی کمی، پھیپھڑوں کی بیماری، پولی سائتھیمیا، یا بلند ارتفاع پر رہنے کی وجہ سے ہو سکتی ہے۔ یہ خون کی چپچپاہٹ کو بڑھا سکتی ہے۔"
      }
    },
    hematocrit: {
      en: {
        normal: "Hematocrit value is normal, indicating appropriate red blood cell volume in blood.",
        low: "Low hematocrit suggests anemia or blood loss. This can cause fatigue and reduce oxygen delivery to tissues.",
        high: "High hematocrit may indicate dehydration, polycythemia vera, or certain lung and heart diseases that cause reduced blood oxygen."
      },
      ur: {
        normal: "ہیماٹوکرٹ کی قدر معمول کے مطابق ہے، جو خون میں سرخ خون کے خلیات کی مناسب مقدار کی نشاندہی کرتی ہے۔",
        low: "کم ہیماٹوکرٹ خون کی کمی یا خون کے ضیاع کی نشاندہی کرتا ہے۔ یہ تھکاوٹ کا سبب بن سکتا ہے اور بافتوں تک آکسیجن کی فراہمی کو کم کر سکتا ہے۔",
        high: "زیادہ ہیماٹوکرٹ پانی کی کمی، پولی سائتھیمیا ویرا، یا پھیپھڑوں اور دل کی کچھ بیماریوں کی نشاندہی کر سکتا ہے جو خون میں آکسیجن کی کمی کا سبب بنتی ہیں۔"
      }
    },
    platelets: {
      en: {
        normal: "Platelet count is normal, indicating proper blood clotting function.",
        low: "Low platelets (Thrombocytopenia) may increase risk of bleeding and bruising. Causes include immune disorders, medications, infections, or bone marrow problems.",
        high: "High platelets (Thrombocytosis) may increase risk of clot formation. This can be reactive due to inflammation or related to bone marrow disorders."
      },
      ur: {
        normal: "پلیٹلیٹس کی تعداد معمول کے مطابق ہے، جو خون کے جمنے کی مناسب فعالیت کی نشاندہی کرتی ہے۔",
        low: "کم پلیٹلیٹس (تھرومبوسائٹوپینیا) خون بہنے اور چوٹ لگنے کے خطرے کو بڑھا سکتی ہیں۔ اس کی وجوہات میں مدافعتی عوارض، دوائیاں، انفیکشنز، یا بون میرو کے مسائل شامل ہیں۔",
        high: "زیادہ پلیٹلیٹس (تھرومبوسائٹوسس) خون کے لوتھڑے بننے کے خطرے کو بڑھا سکتی ہیں۔ یہ سوزش کی وجہ سے ردعمل ہو سکتی ہے یا بون میرو کی خرابیوں سے متعلق ہو سکتی ہے۔"
      }
    },
    mcv: {
      en: {
        normal: "Mean Corpuscular Volume is normal, indicating red blood cells are of appropriate size.",
        low: "Low MCV (Microcytic) suggests iron deficiency anemia, thalassemia, or chronic disease.",
        high: "High MCV (Macrocytic) may indicate vitamin B12 or folate deficiency, liver disease, or alcoholism."
      },
      ur: {
        normal: "میان کارپسکولر والیوم معمول کے مطابق ہے، جو سرخ خون کے خلیات کے مناسب سائز کی نشاندہی کرتا ہے۔",
        low: "کم ایم سی وی (مائکروسیٹک) آئرن کی کمی سے خون کی کمی، تھیلیسیمیا، یا دائمی بیماری کا اشارہ کرتا ہے۔",
        high: "زیادہ ایم سی وی (میکروسیٹک) وٹامن بی12 یا فولیٹ کی کمی، جگر کی بیماری، یا شراب نوشی کی نشاندہی کر سکتا ہے۔"
      }
    },
    mch: {
      en: {
        normal: "Mean Corpuscular Hemoglobin is normal, indicating appropriate hemoglobin content in red blood cells.",
        low: "Low MCH suggests iron deficiency or thalassemia, resulting in less hemoglobin per red blood cell.",
        high: "High MCH is often seen with macrocytic anemia, related to B12 or folate deficiency."
      },
      ur: {
        normal: "میان کارپسکولر ہیموگلوبن معمول کے مطابق ہے، جو سرخ خون کے خلیات میں مناسب ہیموگلوبن مواد کی نشاندہی کرتا ہے۔",
        low: "کم ایم سی ایچ آئرن کی کمی یا تھیلیسیمیا کا اشارہ کرتا ہے، جس کے نتیجے میں ہر سرخ خون کے خلیے میں کم ہیموگلوبن ہوتا ہے۔",
        high: "زیادہ ایم سی ایچ اکثر میکروسیٹک انیمیا کے ساتھ دیکھا جاتا ہے، جو بی12 یا فولیٹ کی کمی سے متعلق ہے۔"
      }
    },
    mchc: {
      en: {
        normal: "MCHC is normal, indicating appropriate concentration of hemoglobin in red blood cells.",
        low: "Low MCHC suggests hypochromic anemia, often due to iron deficiency.",
        high: "High MCHC may indicate spherocytosis or other red blood cell membrane disorders."
      },
      ur: {
        normal: "ایم سی ایچ سی معمول کے مطابق ہے، جو سرخ خون کے خلیات میں ہیموگلوبن کی مناسب مقدار کی نشاندہی کرتا ہے۔",
        low: "کم ایم سی ایچ سی ہائپوکرومک انیمیا کا اشارہ کرتا ہے، جو اکثر آئرن کی کمی کی وجہ سے ہوتا ہے۔",
        high: "زیادہ ایم سی ایچ سی سفیروسائٹوسس یا سرخ خون کے خلیات کی جھلی کی دیگر خرابیوں کی نشاندہی کر سکتا ہے۔"
      }
    },
    neutrophils: {
      en: {
        normal: "Neutrophil percentage is normal, indicating appropriate immune function against bacterial infections.",
        low: "Low neutrophils (Neutropenia) may be due to viral infections, certain medications, or bone marrow disorders, increasing risk of bacterial infections.",
        high: "High neutrophils (Neutrophilia) suggest bacterial infection, inflammation, stress, or certain medications."
      },
      ur: {
        normal: "نیوٹروفل کی فیصد معمول کے مطابق ہے، جو بیکٹیریل انفیکشن کے خلاف مناسب مدافعتی فعالیت کی نشاندہی کرتی ہے۔",
        low: "کم نیوٹروفلز (نیوٹروپینیا) وائرل انفیکشن، کچھ ادویات، یا بون میرو کی خرابیوں کی وجہ سے ہو سکتی ہے، جس سے بیکٹیریل انفیکشن کا خطرہ بڑھ جاتا ہے۔",
        high: "زیادہ نیوٹروفلز (نیوٹروفیلیا) بیکٹیریل انفیکشن، سوزش، تناؤ، یا کچھ ادویات کی طرف اشارہ کرتے ہیں۔"
      }
    },
    lymphocytes: {
      en: {
        normal: "Lymphocyte percentage is normal, indicating proper immune function against viral infections.",
        low: "Low lymphocytes (Lymphopenia) may be due to infections, autoimmune disorders, or certain medications.",
        high: "High lymphocytes (Lymphocytosis) may indicate viral infection, certain bacterial infections, or lymphocytic leukemia."
      },
      ur: {
        normal: "لمفوسائٹ کی فیصد معمول کے مطابق ہے، جو وائرل انفیکشن کے خلاف مناسب مدافعتی فعالیت کی نشاندہی کرتی ہے۔",
        low: "کم لمفوسائٹس (لمفوپینیا) انفیکشن، آٹو امیون عوارض، یا کچھ ادویات کی وجہ سے ہو سکتی ہے۔",
        high: "زیادہ لمفوسائٹس (لمفوسائٹوسس) وائرل انفیکشن، کچھ بیکٹیریل انفیکشن، یا لمفوسیٹک لیوکیمیا کی نشاندہی کر سکتی ہے۔"
      }
    },
    monocytes: {
      en: {
        normal: "Monocyte percentage is normal, indicating proper function of this component of the immune system.",
        low: "Low monocytes are rare but may be associated with bone marrow disorders or certain medications.",
        high: "High monocytes (Monocytosis) may indicate chronic infection, autoimmune disorders, or certain blood disorders."
      },
      ur: {
        normal: "مونوسائٹ کی فیصد معمول کے مطابق ہے، جو مدافعتی نظام کے اس جزو کی مناسب فعالیت کی نشاندہی کرتی ہے۔",
        low: "کم مونوسائٹس نادر ہیں لیکن بون میرو کی خرابیوں یا کچھ ادویات سے منسلک ہو سکتی ہیں۔",
        high: "زیادہ مونوسائٹس (مونوسائٹوسس) دائمی انفیکشن، آٹو امیون عوارض، یا کچھ خون کی خرابیوں کی نشاندہی کر سکتی ہے۔"
      }
    },
    eosinophils: {
      en: {
        normal: "Eosinophil percentage is normal, indicating no significant allergic response or parasitic infection.",
        low: "Low eosinophils are typically not clinically significant.",
        high: "High eosinophils (Eosinophilia) may indicate allergic disorders, parasitic infections, or certain autoimmune conditions."
      },
      ur: {
        normal: "ایوسینوفل کی فیصد معمول کے مطابق ہے، جو کسی قابل ذکر الرجک ردعمل یا پیراسیٹک انفیکشن کی عدم موجودگی کی نشاندہی کرتی ہے۔",
        low: "کم ایوسینوفلز عام طور پر کلینیکل طور پر اہم نہیں ہوتے۔",
        high: "زیادہ ایوسینوفلز (ایوسینوفیلیا) الرجک عوارض، پیراسیٹک انفیکشن، یا کچھ آٹو امیون حالات کی نشاندہی کر سکتی ہے۔"
      }
    },
    basophils: {
      en: {
        normal: "Basophil percentage is normal.",
        low: "Low basophils are typically not clinically significant.",
        high: "High basophils (Basophilia) are rare but may be associated with certain inflammatory and allergic reactions or myeloproliferative disorders."
      },
      ur: {
        normal: "بیسوفل کی فیصد معمول کے مطابق ہے۔",
        low: "کم بیسوفلز عام طور پر کلینیکل طور پر اہم نہیں ہوتے۔",
        high: "زیادہ بیسوفلز (بیسوفیلیا) نادر ہیں لیکن کچھ سوزش اور الرجک ردعمل یا میلوپرولیفریٹو عوارض سے منسلک ہو سکتے ہیں۔"
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

// Analyze relationships between parameters to identify potential conditions
const analyzeRelationships = (results: CBCResult[]): { en: string; ur: string }[] => {
  const findings: { en: string; ur: string }[] = [];
  
  // Get results by parameter ID for easier access
  const resultMap = results.reduce((map, result) => {
    map[result.parameter.id] = result;
    return map;
  }, {} as Record<string, CBCResult>);
  
  // Check for anemia patterns
  if (resultMap.hemoglobin && resultMap.hemoglobin.status === 'low') {
    // Microcytic anemia (Iron deficiency)
    if (resultMap.mcv && resultMap.mcv.status === 'low') {
      findings.push({
        en: "The pattern of low hemoglobin with small red blood cells (low MCV) suggests microcytic anemia, commonly caused by iron deficiency.",
        ur: "ہیموگلوبن کی کمی کے ساتھ چھوٹے سرخ خون کے خلیات (کم ایم سی وی) کا پیٹرن مائکروسیٹک انیمیا کی طرف اشارہ کرتا ہے، جو عام طور پر آئرن کی کمی کی وجہ سے ہوتا ہے۔"
      });
    }
    
    // Macrocytic anemia (B12/Folate deficiency)
    if (resultMap.mcv && resultMap.mcv.status === 'high') {
      findings.push({
        en: "The pattern of low hemoglobin with large red blood cells (high MCV) suggests macrocytic anemia, which may be related to vitamin B12 or folate deficiency.",
        ur: "ہیموگلوبن کی کمی کے ساتھ بڑے سرخ خون کے خلیات (زیادہ ایم سی وی) کا پیٹرن میکروسیٹک انیمیا کی طرف اشارہ کرتا ہے، جو وٹامن بی 12 یا فولیٹ کی کمی سے متعلق ہو سکتا ہے۔"
      });
    }
    
    // Normocytic anemia (Chronic disease)
    if (resultMap.mcv && resultMap.mcv.status === 'normal') {
      findings.push({
        en: "The pattern of low hemoglobin with normal-sized red blood cells (normal MCV) suggests normocytic anemia, which can be associated with chronic diseases, kidney disease, or recent blood loss.",
        ur: "ہیموگلوبن کی کمی کے ساتھ معمول کے سائز کے سرخ خون کے خلیات (عام ایم سی وی) کا پیٹرن نارموسیٹک انیمیا کی طرف اشارہ کرتا ہے، جو دائمی بیماریوں، گردے کی بیماری، یا حالیہ خون کے ضیاع سے منسلک ہو سکتا ہے۔"
      });
    }
  }
  
  // Check for infection or inflammation
  if (resultMap.wbc && resultMap.wbc.status === 'high') {
    if (resultMap.neutrophils && resultMap.neutrophils.status === 'high') {
      findings.push({
        en: "Elevated white blood cells with high neutrophils suggests a bacterial infection or acute inflammation.",
        ur: "زیادہ سفید خون کے خلیات کے ساتھ زیادہ نیوٹروفلز بیکٹیریل انفیکشن یا شدید سوزش کی طرف اشارہ کرتے ہیں۔"
      });
    }
    
    if (resultMap.lymphocytes && resultMap.lymphocytes.status === 'high') {
      findings.push({
        en: "Elevated white blood cells with high lymphocytes suggests a viral infection or certain lymphoproliferative disorders.",
        ur: "زیادہ سفید خون کے خلیات کے ساتھ زیادہ لمفوسائٹس وائرل انفیکشن یا کچھ لمفوپرولیفریٹو عوارض کی طرف اشارہ کرتے ہیں۔"
      });
    }
    
    if (resultMap.eosinophils && resultMap.eosinophils.status === 'high') {
      findings.push({
        en: "Elevated eosinophils suggests an allergic reaction, parasitic infection, or certain autoimmune conditions.",
        ur: "زیادہ ایوسینوفلز الرجک ردعمل، پیراسیٹک انفیکشن، یا کچھ آٹو امیون حالات کی طرف اشارہ کرتے ہیں۔"
      });
    }
  }
  
  // Check for potential bleeding disorder
  if (resultMap.platelets && resultMap.platelets.status === 'low') {
    findings.push({
      en: "Low platelet count may increase the risk of bleeding or bruising.",
      ur: "پلیٹلیٹس کی کم تعداد خون بہنے یا چوٹ لگنے کے خطرے کو بڑھا سکتی ہے۔"
    });
  }
  
  // Check for polycythemia
  if (resultMap.rbc && resultMap.rbc.status === 'high' && 
      resultMap.hemoglobin && resultMap.hemoglobin.status === 'high' && 
      resultMap.hematocrit && resultMap.hematocrit.status === 'high') {
    findings.push({
      en: "The combination of elevated red blood cells, hemoglobin, and hematocrit may indicate polycythemia, which could be due to dehydration or a bone marrow disorder.",
      ur: "سرخ خون کے خلیات، ہیموگلوبن، اور ہیماٹوکرٹ کے بلند امتزاج سے پولی سائٹھیمیا کا پتہ چل سکتا ہے، جو پانی کی کمی یا بون میرو کی خرابی کی وجہ سے ہو سکتا ہے۔"
    });
  }
  
  return findings;
};

// Check for critical values that require immediate medical attention
const checkForCriticalValues = (results: CBCResult[]): { en: string; ur: string }[] => {
  const criticalAlerts: { en: string; ur: string }[] = [];
  
  for (const result of results) {
    const { parameter, status, deviation } = result;
    
    // Critical thresholds for common parameters
    switch (parameter.id) {
      case 'hemoglobin':
        if (status === 'low' && parseFloat(parameter.value) < 7.0) {
          criticalAlerts.push({
            en: "CRITICAL: Hemoglobin is severely low. This may require immediate medical attention.",
            ur: "انتباہ: ہیموگلوبن انتہائی کم ہے۔ اس کے لیے فوری طبی توجہ کی ضرورت ہو سکتی ہے۔"
          });
        }
        break;
      
      case 'wbc':
        if (status === 'low' && parseFloat(parameter.value) < 2.0) {
          criticalAlerts.push({
            en: "CRITICAL: White blood cell count is severely low, indicating a high risk of infection.",
            ur: "انتباہ: سفید خون کے خلیات کی تعداد انتہائی کم ہے، جو انفیکشن کے زیادہ خطرے کی نشاندہی کرتی ہے۔"
          });
        } else if (status === 'high' && parseFloat(parameter.value) > 30.0) {
          criticalAlerts.push({
            en: "CRITICAL: White blood cell count is extremely high, which may indicate a severe infection or blood disorder.",
            ur: "انتباہ: سفید خون کے خلیات کی تعداد انتہائی زیادہ ہے، جو شدید انفیکشن یا خون کی خرابی کی نشاندہی کر سکتی ہے۔"
          });
        }
        break;
      
      case 'platelets':
        if (status === 'low' && parseFloat(parameter.value) < 30.0) {
          criticalAlerts.push({
            en: "CRITICAL: Platelet count is dangerously low, indicating a high risk of bleeding.",
            ur: "انتباہ: پلیٹلیٹس کی تعداد خطرناک حد تک کم ہے، جو خون بہنے کے زیادہ خطرے کی نشاندہی کرتی ہے۔"
          });
        }
        break;
    }
  }
  
  return criticalAlerts;
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
  
  // Analyze relationships between parameters
  const relationshipFindings = analyzeRelationships(results);
  
  // Check for critical values
  const criticalAlerts = checkForCriticalValues(results);
  
  // Generic summary with relationship findings
  let enSummary = `Your CBC results show ${abnormalResults.length} abnormal values (${lowCount} low, ${highCount} high). `;
  let urSummary = `آپ کے سی بی سی کے نتائج ${abnormalResults.length} غیر معمولی اقدار دکھاتے ہیں (${lowCount} کم، ${highCount} زیادہ)۔ `;
  
  // Add critical alerts to the beginning if present
  if (criticalAlerts.length > 0) {
    enSummary = criticalAlerts.map(alert => alert.en).join(' ') + ' ' + enSummary;
    urSummary = criticalAlerts.map(alert => alert.ur).join(' ') + ' ' + urSummary;
  }
  
  // Add key relationship findings
  if (relationshipFindings.length > 0) {
    enSummary += relationshipFindings.map(finding => finding.en).join(' ');
    urSummary += relationshipFindings.map(finding => finding.ur).join(' ');
  } else {
    enSummary += "Please consult with a healthcare provider to interpret these findings.";
    urSummary += "ان نتائج کی تشریح کے لیے براہ کرم کسی ہیلتھ کیئر فراہم کنندہ سے مشورہ کریں۔";
  }
  
  return {
    en: enSummary,
    ur: urSummary
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
