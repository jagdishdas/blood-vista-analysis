import { BloodTestFormData, BloodTestAnalysis, BloodTestResult } from '@/types/blood-test.types';
import { getBloodTestReferenceRange } from './blood-test-reference-ranges';

// Calculate status including critical levels for all test types
const getBloodTestStatus = (
  value: number, 
  min: number, 
  max: number, 
  parameterId: string
): 'normal' | 'low' | 'high' | 'critical-low' | 'critical-high' => {
  // Critical thresholds for all test parameters
  const criticalThresholds: Record<string, { criticalLow?: number; criticalHigh?: number }> = {
    // Glucose critical levels
    fastingGlucose: { criticalLow: 50, criticalHigh: 250 },
    randomGlucose: { criticalLow: 50, criticalHigh: 300 },
    hba1c: { criticalHigh: 10.0 },
    
    // Lipid critical levels
    totalCholesterol: { criticalHigh: 300 },
    ldlCholesterol: { criticalHigh: 190 },
    hdlCholesterol: { criticalLow: 25 },
    triglycerides: { criticalHigh: 500 },
    
    // Thyroid critical levels
    tsh: { criticalLow: 0.1, criticalHigh: 10.0 },
    freeT4: { criticalLow: 0.4, criticalHigh: 3.0 },
    freeT3: { criticalLow: 1.0, criticalHigh: 8.0 },
    
    // Liver critical levels
    alt: { criticalHigh: 200 },
    ast: { criticalHigh: 200 },
    totalBilirubin: { criticalHigh: 5.0 },
    
    // Kidney critical levels
    creatinine: { criticalHigh: 3.0 },
    bun: { criticalHigh: 100 },
    egfr: { criticalLow: 30 },
    
    // Cardiac critical levels
    troponinI: { criticalHigh: 0.4 },
    troponinT: { criticalHigh: 0.1 },
    
    // Inflammatory critical levels
    crp: { criticalHigh: 50 },
    esr: { criticalHigh: 100 },
    
    // Electrolytes critical levels
    sodium: { criticalLow: 125, criticalHigh: 155 },
    potassium: { criticalLow: 2.5, criticalHigh: 6.0 },
    calcium: { criticalLow: 7.0, criticalHigh: 12.0 },
    
    // Coagulation critical levels
    pt: { criticalHigh: 25 },
    inr: { criticalHigh: 4.0 },
    aptt: { criticalHigh: 60 }
  };

  const critical = criticalThresholds[parameterId];
  
  if (critical?.criticalLow && value < critical.criticalLow) return 'critical-low';
  if (critical?.criticalHigh && value > critical.criticalHigh) return 'critical-high';
  
  if (value < min) return 'low';
  if (value > max) return 'high';
  return 'normal';
};

// Calculate risk level based on deviation and parameter type
const calculateRiskLevel = (
  status: string, 
  deviation: number, 
  parameterId: string
): 'low' | 'moderate' | 'high' | 'critical' => {
  if (status.includes('critical')) return 'critical';
  
  const highRiskParameters = [
    'ldlCholesterol', 'triglycerides', 'hba1c', 'fastingGlucose',
    'troponinI', 'troponinT', 'creatinine', 'bun'
  ];
  const moderateDeviationThreshold = highRiskParameters.includes(parameterId) ? 20 : 30;
  
  if (Math.abs(deviation) > 50) return 'high';
  if (Math.abs(deviation) > moderateDeviationThreshold) return 'moderate';
  return 'low';
};

// Generate interpretations for all test parameters
const generateBloodTestInterpretation = (
  parameterId: string, 
  status: string, 
  testType: 'lipid' | 'glucose' | 'thyroid' | 'liver' | 'kidney' | 'cardiac' | 'inflammatory' | 'electrolytes' | 'vitamins' | 'hormonal' | 'tumor' | 'autoimmune' | 'coagulation'
): { en: string; ur: string } => {
  // Comprehensive interpretations for all parameters
  const interpretations: Record<string, Record<string, { en: string; ur: string }>> = {
    totalCholesterol: {
      normal: {
        en: "Your total cholesterol is at healthy levels, reducing cardiovascular disease risk.",
        ur: "آپ کا کل کولیسٹرول صحت مند سطح پر ہے، جو دل کی بیماری کا خطرہ کم کرتا ہے۔"
      },
      high: {
        en: "Your total cholesterol is elevated, increasing heart disease risk. Dietary changes may help.",
        ur: "آپ کا کل کولیسٹرول بلند ہے، جو دل کی بیماری کا خطرہ بڑھاتا ہے۔ غذائی تبدیلیاں مدد کر سکتی ہیں۔"
      }
    },
    
    // Liver function interpretations
    alt: {
      normal: {
        en: "Your ALT level is normal, indicating healthy liver function.",
        ur: "آپ کا ALT کی سطح معمول کے مطابق ہے، جو صحت مند جگر کے کام کی نشاندہی کرتا ہے۔"
      },
      high: {
        en: "Your ALT is elevated, suggesting possible liver inflammation or damage. Further evaluation may be needed.",
        ur: "آپ کا ALT بلند ہے، جو ممکنہ جگر کی سوزش یا نقصان کی تجویز کرتا ہے۔ مزید جانچ کی ضرورت ہو سکتی ہے۔"
      }
    },
    
    ast: {
      normal: {
        en: "Your AST level is normal, indicating healthy liver and muscle function.",
        ur: "آپ کا AST کی سطح معمول کے مطابق ہے، جو صحت مند جگر اور پٹھوں کے کام کی نشاندہی کرتا ہے۔"
      },
      high: {
        en: "Your AST is elevated, which may indicate liver damage, muscle injury, or heart problems.",
        ur: "آپ کا AST بلند ہے، جو جگر کے نقصان، پٹھوں کی چوٹ، یا دل کے مسائل کی نشاندہی کر سکتا ہے۔"
      }
    },
    
    // Kidney function interpretations
    creatinine: {
      normal: {
        en: "Your creatinine level is normal, indicating good kidney function.",
        ur: "آپ کا کریٹینین کی سطح معمول کے مطابق ہے، جو گردوں کے اچھے کام کی نشاندہی کرتا ہے۔"
      },
      high: {
        en: "Your creatinine is elevated, suggesting reduced kidney function. Medical evaluation is recommended.",
        ur: "آپ کا کریٹینین بلند ہے، جو گردوں کے کم کام کی تجویز کرتا ہے۔ طبی جانچ کی سفارش کی جاتی ہے۔"
      }
    },
    
    // Cardiac markers
    troponinI: {
      normal: {
        en: "Your Troponin I is normal, indicating no recent heart muscle damage.",
        ur: "آپ کا ٹروپونن آئی معمول کے مطابق ہے، جو حالیہ دل کے پٹھے کے نقصان کی عدم موجودگی کی نشاندہی کرتا ہے۔"
      },
      high: {
        en: "Your Troponin I is elevated, indicating possible heart muscle damage. Immediate medical attention required.",
        ur: "آپ کا ٹروپونن آئی بلند ہے، جو ممکنہ دل کے پٹھے کے نقصان کی نشاندہی کرتا ہے۔ فوری طبی توجہ ضروری ہے۔"
      }
    },
    
    // Inflammatory markers
    crp: {
      normal: {
        en: "Your CRP level is normal, indicating low inflammation in your body.",
        ur: "آپ کا CRP کی سطح معمول کے مطابق ہے، جو آپ کے جسم میں کم سوزش کی نشاندہی کرتا ہے۔"
      },
      high: {
        en: "Your CRP is elevated, indicating inflammation in your body. This may suggest infection or chronic disease.",
        ur: "آپ کا CRP بلند ہے، جو آپ کے جسم میں سوزش کی نشاندہی کرتا ہے۔ یہ انفیکشن یا دائمی بیماری کی تجویز کر سکتا ہے۔"
      }
    }
  };

  const paramInterpretation = interpretations[parameterId];
  if (!paramInterpretation || !paramInterpretation[status]) {
    return {
      en: "Consult with your healthcare provider for interpretation of this result.",
      ur: "اس نتیجے کی تشریح کے لیے اپنے صحت کی دیکھ بھال فراہم کنندہ سے مشورہ کریں۔"
    };
  }

  return paramInterpretation[status];
};

// Generate recommendations for all parameters
const generateRecommendations = (
  parameterId: string, 
  status: string, 
  testType: 'lipid' | 'glucose' | 'thyroid' | 'liver' | 'kidney' | 'cardiac' | 'inflammatory' | 'electrolytes' | 'vitamins' | 'hormonal' | 'tumor' | 'autoimmune' | 'coagulation'
): { en: string[]; ur: string[] } => {
  // Comprehensive recommendations for all parameters
  const recommendations: Record<string, Record<string, { en: string[]; ur: string[] }>> = {
    // Lipid recommendations
    ldlCholesterol: {
      high: {
        en: [
          "Follow a heart-healthy diet low in saturated fats",
          "Increase physical activity to at least 150 minutes per week",
          "Consider statin therapy with your doctor",
          "Monitor cholesterol levels regularly"
        ],
        ur: [
          "دل کے لیے صحت مند غذا لیں جو سیچوریٹڈ چکنائی میں کم ہو",
          "جسمانی سرگرمی کو کم از کم 150 منٹ فی ہفتہ بڑھائیں",
          "اپنے ڈاکٹر کے ساتھ سٹیٹن تھراپی پر غور کریں",
          "کولیسٹرول کی سطح کی باقاعدگی سے نگرانی کریں"
        ]
      }
    },
    
    // Liver recommendations
    alt: {
      high: {
        en: [
          "Avoid alcohol and hepatotoxic medications",
          "Maintain a healthy weight",
          "Follow up with hepatologist if levels remain elevated",
          "Get vaccinated for Hepatitis A and B"
        ],
        ur: [
          "الکحل اور جگر کے لیے نقصان دہ دوائیوں سے بچیں",
          "صحت مند وزن برقرار رکھیں",
          "اگر سطح بلند رہے تو ہیپیٹولوجسٹ سے مشورہ کریں",
          "ہیپاٹائٹس اے اور بی کی ویکسینیشن کروائیں"
        ]
      }
    },
    
    // Kidney recommendations
    creatinine: {
      high: {
        en: [
          "Stay well hydrated with adequate water intake",
          "Control blood pressure and diabetes if present",
          "Avoid NSAIDs and nephrotoxic medications",
          "Follow up with nephrologist for further evaluation"
        ],
        ur: [
          "مناسب پانی پی کر اچھی طرح ہائیڈریٹ رہیں",
          "اگر موجود ہے تو بلڈ پریشر اور ذیابیطس کو کنٹرول کریں",
          "NSAIDs اور گردوں کے لیے نقصان دہ دوائیوں سے بچیں",
          "مزید جانچ کے لیے نیفرولوجسٹ سے مشورہ کریں"
        ]
      }
    }
  };

  const paramRecommendations = recommendations[parameterId];
  if (!paramRecommendations || !paramRecommendations[status]) {
    return {
      en: ["Consult with your healthcare provider for personalized recommendations"],
      ur: ["ذاتی سفارشات کے لیے اپنے صحت کی دیکھ بھال فراہم کنندہ سے مشورہ کریں"]
    };
  }

  return paramRecommendations[status];
};

// Main analyzer function - updated to handle all test types
export const analyzeBloodTest = (data: BloodTestFormData): BloodTestAnalysis => {
  const results: BloodTestResult[] = data.parameters
    .filter(param => param.value !== '')
    .map(param => {
      const value = parseFloat(param.value);
      const referenceRange = getBloodTestReferenceRange(
        data.testType as any,
        param.id,
        data.patientGender as 'male' | 'female',
        data.patientAge || 30
      );
      
      const { min, max } = referenceRange;
      const status = getBloodTestStatus(value, min, max, param.id);
      const deviation = value < min ? ((value - min) / min) * 100 : 
                       value > max ? ((value - max) / max) * 100 : 0;
      const riskLevel = calculateRiskLevel(status, deviation, param.id);
      const interpretation = generateBloodTestInterpretation(param.id, status, data.testType as any);
      const recommendations = generateRecommendations(param.id, status, data.testType as any);

      return {
        parameter: param,
        status: status as any,
        deviation,
        riskLevel,
        interpretation,
        recommendations
      };
    });

  // Calculate overall risk
  const riskLevels = results.map(r => r.riskLevel);
  const overallRisk = riskLevels.includes('critical') ? 'critical' :
                     riskLevels.includes('high') ? 'high' :
                     riskLevels.includes('moderate') ? 'moderate' : 'low';

  // Generate summary and related conditions
  const summary = generateTestSummary(results, data.testType);
  const relatedConditions = identifyRelatedConditions(results, data.testType);

  return {
    testType: data.testType,
    summary,
    overallRisk,
    results,
    relatedConditions
  };
};

// Generate test-specific summary for all test types
const generateTestSummary = (results: BloodTestResult[], testType: string): { en: string; ur: string } => {
  const abnormalResults = results.filter(r => r.status !== 'normal');
  const criticalResults = results.filter(r => r.status.includes('critical'));
  
  if (criticalResults.length > 0) {
    return {
      en: `CRITICAL ALERT: ${criticalResults.length} parameters show critical values requiring immediate medical attention. Please contact your healthcare provider immediately.`,
      ur: `تشویشناک انتباہ: ${criticalResults.length} پیرامیٹرز میں تشویشناک قدریں ہیں جن کے لیے فوری طبی توجہ درکار ہے۔ براہ کرم فوری طور پر اپنے صحت کی دیکھ بھال فراہم کنندہ سے رابطہ کریں۔`
    };
  }
  
  if (abnormalResults.length === 0) {
    const testNames = {
      lipid: { en: "lipid profile", ur: "لپڈ پروفائل" },
      glucose: { en: "glucose tests", ur: "گلوکوز ٹیسٹس" },
      thyroid: { en: "thyroid function tests", ur: "تھائرائیڈ فنکشن ٹیسٹس" },
      liver: { en: "liver function tests", ur: "جگر کے فنکشن ٹیسٹس" },
      kidney: { en: "kidney function tests", ur: "گردے کے فنکشن ٹیسٹس" },
      cardiac: { en: "cardiac markers", ur: "دل کے مارکرز" },
      inflammatory: { en: "inflammatory markers", ur: "سوزش کے مارکرز" },
      electrolytes: { en: "electrolyte panel", ur: "الیکٹرولائٹ پینل" },
      vitamins: { en: "vitamin tests", ur: "وٹامن ٹیسٹس" },
      hormonal: { en: "hormone tests", ur: "ہارمون ٹیسٹس" },
      tumor: { en: "tumor markers", ur: "ٹیومر مارکرز" },
      autoimmune: { en: "autoimmune markers", ur: "خود کار قوت مدافعت کے مارکرز" },
      coagulation: { en: "coagulation studies", ur: "خون کے جمنے کے مطالعات" }
    };
    
    const testName = testNames[testType as keyof typeof testNames];
    return {
      en: `Excellent! All your ${testName?.en || 'test'} results are within normal ranges, indicating good health in this area.`,
      ur: `بہترین! آپ کے تمام ${testName?.ur || 'ٹیسٹ'} کے نتائج معمول کی حدود میں ہیں، جو اس علاقے میں اچھی صحت کی نشاندہی کرتے ہیں۔`
    };
  }
  
  return {
    en: `Your test results show ${abnormalResults.length} parameters outside normal ranges. Review the detailed analysis below and consult your healthcare provider for guidance.`,
    ur: `آپ کے ٹیسٹ کے نتائج ${abnormalResults.length} پیرامیٹرز کو معمول کی حدود سے باہر دکھاتے ہیں۔ نیچے تفصیلی تجزیہ دیکھیں اور رہنمائی کے لیے اپنے صحت کی دیکھ بھال فراہم کنندہ سے مشورہ کریں۔`
  };
};

// Identify related medical conditions for all test types
const identifyRelatedConditions = (results: BloodTestResult[], testType: string): { en: string[]; ur: string[] } => {
  const conditions = { en: [] as string[], ur: [] as string[] };
  
  // Add condition identification for all test types
  switch (testType) {
    case 'lipid':
      const highLDL = results.find(r => r.parameter.id === 'ldlCholesterol' && r.status === 'high');
      const lowHDL = results.find(r => r.parameter.id === 'hdlCholesterol' && r.status === 'low');
      const highTrig = results.find(r => r.parameter.id === 'triglycerides' && r.status === 'high');
      
      if (highLDL || lowHDL || highTrig) {
        conditions.en.push("Increased cardiovascular disease risk", "Potential metabolic syndrome");
        conditions.ur.push("دل کی بیماری کا بڑھا ہوا خطرہ", "ممکنہ میٹابولک سنڈروم");
      }
      break;
      
    case 'liver':
      const highALT = results.find(r => r.parameter.id === 'alt' && r.status === 'high');
      const highAST = results.find(r => r.parameter.id === 'ast' && r.status === 'high');
      
      if (highALT || highAST) {
        conditions.en.push("Possible hepatitis or liver inflammation", "Drug-induced liver injury risk");
        conditions.ur.push("ممکنہ ہیپاٹائٹس یا جگر کی سوزش", "دوا سے جگر کی چوٹ کا خطرہ");
      }
      break;
      
    case 'kidney':
      const highCreatinine = results.find(r => r.parameter.id === 'creatinine' && r.status === 'high');
      const lowEGFR = results.find(r => r.parameter.id === 'egfr' && r.status === 'low');
      
      if (highCreatinine || lowEGFR) {
        conditions.en.push("Chronic kidney disease risk", "Potential need for nephrology referral");
        conditions.ur.push("دائمی گردے کی بیماری کا خطرہ", "نیفرولوجی ریفرل کی ممکنہ ضرورت");
      }
      break;
      
    case 'cardiac':
      const highTroponin = results.find(r => (r.parameter.id === 'troponinI' || r.parameter.id === 'troponinT') 
                                            && (r.status === 'high' || r.status === 'critical-high'));
      
      if (highTroponin) {
        conditions.en.push("Acute myocardial infarction risk", "Urgent cardiology evaluation needed");
        conditions.ur.push("شدید دل کا دورہ پڑنے کا خطرہ", "فوری کارڈیولوجی جانچ ضروری");
      }
      break;
  }
  
  return conditions;
};
